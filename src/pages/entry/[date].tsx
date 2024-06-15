import {
  deleteFile,
  getFile,
  searchFiles,
  updateFileMetadata,
} from '@/helpers/drive';
import { globalUser } from '@/helpers/state';
import { Persistence } from '@hookstate/persistence';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Modal, dateInput, error, wordDate } from '@richardx/components';
import MediaDialog, { MediaDialogState } from '@/components/MediaDialog';
import MediaSlideshow from '@/components/MediaSlideshow';
import { folderMimeType } from '@/helpers/constants';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { useHookstate } from '@hookstate/core';
import { MediaFile } from '@/components/PhotoSelect';
import { getPhotos } from '@/helpers/photos';

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
  const [gallery, setGallery] = useState<MediaFile[]>([]);
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
    if (results.findIndex((response) => !response) !== -1) return;
    setStarred(!starred);
  };

  const handleDelete = () => {
    setDeleting(true);
    (async () => {
      const requests = await Promise.all([
        deleteFile(folderId),
        (async () => {
          let backFolder = '';
          let nextFolder = '';
          const query = [];
          if (backDate) {
            query.push({ name: backDate, mimeType: folderMimeType });
          }
          if (nextDate) {
            query.push({ name: nextDate, mimeType: folderMimeType });
          }
          const result = await searchFiles(query);
          if (!result) return;
          if (backDate) {
            backFolder = result.find(({ name }) => name === backDate)?.id || '';
          }
          if (nextDate) {
            nextFolder = result.find(({ name }) => name === nextDate)?.id || '';
          }
          const updates = await Promise.all([
            backFolder
              ? updateFileMetadata(backFolder, {
                  properties: { next: nextDate },
                })
              : true,
            nextFolder
              ? updateFileMetadata(nextFolder, {
                  properties: { previous: backDate },
                })
              : true,
          ]);
          if (updates.findIndex((update) => !update) !== -1) return;
          return true;
        })(),
      ]);
      if (requests.findIndex((request) => !request) !== -1) {
        return setDeleting(false);
      }
      router.push('/');
    })();
  };

  useEffect(() => {
    globalUser.attach(Persistence('user'));
    if (!globalUser.email.value) router.push('/about');
  }, []);

  useEffect(() => {
    if (!date || !user.email.value) return;
    setText('');
    setGallery([]);
    let mounted = true;

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
      setBackDate(folder.properties.previous);
      setNextDate(folder.properties.next);

      const handleHtml = async () => {
        const htmlFile = files.find(({ mimeType }) => mimeType === 'text/html');
        if (!htmlFile) return;
        setHtmlId(htmlFile.id);
        const html = await getFile(htmlFile.id).text();
        if (!html) return;
        if (!mounted) return;
        setText(html);

        const imagesInHtml = files.filter(
          ({ mimeType }) =>
            !mimeType.includes('text/') && mimeType !== folderMimeType,
        );
        const blobs = await Promise.all(
          imagesInHtml.map(({ id }) => getFile(id).blob()),
        );
        if (!mounted) return;
        const urls = imagesInHtml.map(({ id }, i) => ({
          id,
          url: URL.createObjectURL(blobs[i]),
        }));
        if (location.pathname.split('/')[2] !== date) {
          urls.forEach(({ url }) => URL.revokeObjectURL(url));
          return;
        }
        setText(
          urls.reduce(
            (previousText, { id, url }) => previousText.replace(id, url),
            html,
          ),
        );
      };

      const handleGallery = async () => {
        const itemsFile = files.find(
          ({ mimeType }) => mimeType === 'text/plain',
        );
        if (!itemsFile) return;
        const items = await getFile(itemsFile.id).text();
        if (!items) return;
        const photos = await getPhotos(items.split('\n'));
        if (!photos?.length) return;
        if (!mounted) return;
        setGallery(
          photos.map(({ id, baseUrl, mediaMetadata, mimeType }: any) => ({
            id,
            url: baseUrl,
            date: dateInput(mediaMetadata.creationTime),
            type: mimeType.startsWith('image') ? 'image' : 'video',
          })),
        );
      };

      await Promise.all([handleHtml(), handleGallery()]);
    })();

    return () => {
      mounted = false;
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
