import {
  deleteFile,
  getFile,
  paginateFiles,
  searchFiles,
  updateFileMetadata,
} from '@/helpers/drive';
import { globalUser } from '@/helpers/state';
import { Persistence } from '@hookstate/persistence';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Modal, error, wordDate } from '@richardx/components';
import MediaDialog, {
  MediaDialogFile,
  MediaDialogState,
} from '@/components/MediaDialog';
import MediaSlideshow from '@/components/MediaSlideshow';
import { folderMimeType } from '@/helpers/constants';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { useHookstate } from '@hookstate/core';

const HTMLDisplay = dynamic(() => import('@/components/HTMLDisplay'), {
  ssr: false,
  loading: () => <div className='w-full h-96 skeleton' />,
});

const Entry: React.FC = () => {
  const router = useRouter();
  const date = router.query.date as string | undefined;
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [gallery, setGallery] = useState<MediaDialogFile[]>([]);
  const [mediaDialog, setMediaDialog] = useState<MediaDialogState>({
    open: false,
    index: -1,
  });
  const [folderId, setFolderId] = useState('');
  const [htmlId, setHtmlId] = useState('');
  const [starred, setStarred] = useState(false);
  const [backDate, setBackDate] = useState('');
  const [nextDate, setNextDate] = useState('');
  const user = useHookstate(globalUser);

  const swapStarred = async () => {
    const results = await Promise.all([
      updateFileMetadata(folderId, {
        starred: !starred,
      }),
      updateFileMetadata(htmlId, {
        starred: !starred,
      }),
    ]);
    if (results.find((response) => !response)) return;
    setStarred(!starred);
  };

  const handleDelete = () => {
    setDeleting(true);
    (async () => {
      const result = await deleteFile(folderId);
      if (!result) return setDeleting(false);
      router.push('/');
    })();
  };

  useEffect(() => {
    globalUser.attach(Persistence('user'));
    if (!globalUser.email.value) router.push('/about');
  }, []);

  useEffect(() => {
    if (!date || !user.email.value) return;

    (async () => {
      const files = await searchFiles([{ name: date }]);
      if (!files) return;

      const folder = files.find(({ mimeType }) => mimeType === folderMimeType);
      if (!folder) {
        error('Entry not found');
        return router.push('/');
      }
      setFolderId(folder.id);
      setStarred(folder.starred);
      setTitle(folder.description);

      const handleHtml = async () => {
        const htmlFile = files.find(({ mimeType }) => mimeType === 'text/html');
        if (!htmlFile) return;
        setHtmlId(htmlFile.id);
        const html = await getFile(htmlFile.id).text();
        if (!html) return;

        const imagesInHtml = files.filter(
          ({ description, mimeType }) =>
            description !== 'gallery' &&
            mimeType !== folderMimeType &&
            mimeType !== 'text/html',
        );
        const urls = await Promise.all(
          imagesInHtml.map(async ({ id }) => ({
            id,
            url: URL.createObjectURL(await getFile(id).blob()),
          })),
        );
        setText(
          urls.reduce(
            (previousText, { id, url }) => previousText.replace(id, url),
            html,
          ),
        );
      };

      const handleGallery = async () => {
        setGallery(
          (
            await Promise.all(
              files
                .filter(({ description }) => description === 'gallery')
                .map(async ({ id, mimeType }) => {
                  const blob = await getFile(id).blob();
                  if (!blob) return;

                  return {
                    type: mimeType.split('/')[0] as 'image',
                    url: URL.createObjectURL(blob),
                  };
                }),
            )
          ).filter(Boolean) as any,
        );
      };

      await Promise.all([handleHtml(), handleGallery()]);
    })();

    (async () => {
      const year = +date.slice(0, 4);
      const month = +date.slice(4, 6);
      const nearestYear = month < 7 ? year - 1 : year + 1;
      const nearbyDates = await paginateFiles({
        matches: [
          { mimeType: folderMimeType, name: { contains: year.toString() } },
          {
            mimeType: folderMimeType,
            name: { contains: nearestYear.toString() },
          },
        ],
        order: 'ascending',
        pageSize: 1000,
      });
      if (!nearbyDates) return;
      while (nearbyDates.nextPageToken) {
        const nextPage = await paginateFiles({
          matches: [
            { mimeType: folderMimeType, name: { contains: year.toString() } },
            {
              mimeType: folderMimeType,
              name: { contains: nearestYear.toString() },
            },
          ],
          order: 'ascending',
          pageToken: nearbyDates.nextPageToken,
          pageSize: 1000,
        });
        if (!nextPage) return;
        nearbyDates.files.push(...nextPage.files);
        nearbyDates.nextPageToken = nextPage.nextPageToken;
      }

      const dateIndex = nearbyDates.files.findIndex(
        ({ name }) => name === date,
      );
      if (dateIndex === -1) return;
      setBackDate(nearbyDates.files[dateIndex - 1]?.name || '');
      setNextDate(nearbyDates.files[dateIndex + 1]?.name || '');
    })();

    return () => {
      gallery.forEach(({ url }) => URL.revokeObjectURL(url));
      text.match(/blob:[^'"]+/g)?.forEach(URL.revokeObjectURL);
    };
  }, [date, user.email.value]);

  return (
    <>
      <Head>
        <title>{`${date ? wordDate(date) : 'Entry'} | Daily Journal`}</title>
      </Head>
      <div className='flex flex-col md:flex-row justify-between gap-4'>
        {date ? (
          <h1 className='text-4xl text-center md:text-left'>
            {wordDate(date)} {title && '-'} {title}
          </h1>
        ) : (
          <div className='skeleton w-full h-12' />
        )}
        <div className='flex flex-col md:flex-row gap-4'>
          <div
            className={`h-12 w-12 mask mask-star cursor-pointer mx-auto ${
              starred ? 'bg-yellow-300' : 'bg-gray-500'
            }`}
            onClick={swapStarred}
          />
          <button
            className='btn btn-info'
            onClick={() => router.push('/entry/edit/' + date)}
          >
            Edit
          </button>
          <button
            className='btn btn-error'
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </button>
          <div className='flex gap-4'>
            <button
              className='btn btn-outline flex-1 md:w-24'
              disabled={!backDate}
              onClick={() => router.push('/entry/' + backDate)}
            >
              <AiOutlineLeft />
              Back
            </button>
            <button
              className='btn btn-outline flex-1 md:w-24'
              disabled={!nextDate}
              onClick={() => router.push('/entry/' + nextDate)}
            >
              Next
              <AiOutlineRight />
            </button>
          </div>
        </div>
      </div>
      <MediaSlideshow files={gallery} setState={setMediaDialog} />
      <HTMLDisplay>{text}</HTMLDisplay>
      <MediaDialog
        files={gallery}
        state={mediaDialog}
        setState={setMediaDialog}
      />
      <Modal
        open={confirmDelete}
        setOpen={setConfirmDelete}
        title='Are you sure you want to delete this entry?'
        actions={
          <>
            <button
              className='btn btn-error md:flex-none flex-1'
              onClick={handleDelete}
              disabled={deleting}
            >
              Yes
              {deleting && <span className='loading loading-spinner ml-2' />}
            </button>
            <button
              className='btn btn-info md:flex-none flex-1'
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
          </>
        }
      />
    </>
  );
};

export default Entry;
