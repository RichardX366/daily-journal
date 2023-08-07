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
import { Modal, error, wordDate } from '@richardx/components';
import MediaDialog, {
  MediaDialogFile,
  MediaDialogState,
} from '@/components/MediaDialog';
import MediaSlideshow from '@/components/MediaSlideshow';
import { folderMimeType } from '@/helpers/constants';

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
  const [starred, setStarred] = useState(false);

  const swapStarred = async () => {
    await updateFileMetadata(folderId, {
      starred: !starred,
    });
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
    if (!date) return;
    globalUser.attach(Persistence('user'));
    if (!globalUser.email.value) router.push('/about');

    (async () => {
      const files = await searchFiles([
        { name: date + '-gallery' },
        { name: date, mimeType: 'text/html' },
        { name: date, mimeType: folderMimeType },
      ]);
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
        const html = await getFile(htmlFile.id).text();
        if (!html) return;

        setText(html);
      };

      const handleGallery = async () => {
        setGallery(
          (
            await Promise.all(
              files
                .filter(({ name }) => name === date + '-gallery')
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

    return () => gallery.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [date]);

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
