import {
  FileMetadata,
  deleteFile,
  getFile,
  idToUrl,
  searchFiles,
  updateFile,
  updateFileMetadata,
  uploadFile,
} from '@/helpers/drive';
import { globalUser } from '@/helpers/state';
import { Persistence } from '@hookstate/persistence';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Input, MediaInput, error, wordDate } from '@richardx/components';
import MediaDialog, {
  MediaDialogFile,
  MediaDialogState,
} from '@/components/MediaDialog';
import MediaSlideshow from '@/components/MediaSlideshow';
import { folderMimeType } from '@/helpers/constants';
import Quill from '@/components/Quill';

const Entry: React.FC = () => {
  const router = useRouter();
  const date = router.query.date as string | undefined;
  const [folderId, setFolderId] = useState('');
  const [htmlId, setHtmlId] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [gallery, setGallery] = useState<MediaDialogFile[]>([]);
  const [mediaDialog, setMediaDialog] = useState<MediaDialogState>({
    open: false,
    index: -1,
  });
  const [filesOnDrive, setFilesOnDrive] = useState<FileMetadata[]>([]);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!date) return;
    if (!text) return error('You need to have something in your journal entry');
    setSaving(true);
    const images: HTMLImageElement[] = Array.from(
      document.querySelectorAll('.ql-editor img'),
    );

    const handleMain = async () => {
      const imageIds = await Promise.all(
        images
          .filter(({ src }) => src.includes('blob:'))
          .map(async ({ src, alt }) =>
            uploadFile(
              await fetch(src).then((res) => res.blob()),
              `${date}-${alt}`,
              folderId,
            ),
          ),
      );
      if (imageIds.find((id) => !id)) return;

      const newText = images
        .filter(({ src }) => src.includes('blob:'))
        .reduce((previousText, { src, alt }, i) => {
          const id = imageIds[i] as string;
          return previousText.replace(src, idToUrl(id)).replace(alt, id);
        }, text);

      const entry = await updateFile(
        htmlId,
        new Blob([newText], { type: 'text/html' }),
      );
      return entry;
    };

    const handleGallery = async () => {
      const uploads = await Promise.all(
        gallery
          .filter(({ uploaded }) => !uploaded)
          .map(async ({ url }) =>
            uploadFile(
              await fetch(url).then((res) => res.blob()),
              date + '-gallery',
              folderId,
            ),
          ),
      );
      if (uploads.find((id) => !id)) return;
      return true;
    };

    const handleDeleteUnused = async () => {
      const unusedFiles = filesOnDrive.filter(
        ({ mimeType, id }) =>
          mimeType !== folderMimeType &&
          mimeType !== 'text/html' &&
          !gallery.find(({ driveId }) => driveId === id) &&
          !images.find(({ src }) => src === idToUrl(id)),
      );
      const responses = await Promise.all(
        unusedFiles.map(({ id }) => deleteFile(id)),
      );
      if (responses.find((response) => !response)) return;
      return true;
    };

    const results = await Promise.all([
      handleMain(),
      handleGallery(),
      handleDeleteUnused(),
      updateFileMetadata(folderId, { description: title }),
    ]);
    if (results.find((result) => !result)) return setSaving(false);
    router.push('/entry/' + date);
  };

  useEffect(() => {
    if (!date) return;
    globalUser.attach(Persistence('user'));
    if (!globalUser.email.value) router.push('/about');

    (async () => {
      const files = await searchFiles([{ name: { contains: date } }]);
      if (!files) return;

      const folder = files.find(({ mimeType }) => mimeType === folderMimeType);
      if (!folder) {
        error('Entry not found');
        return router.push('/');
      }
      setFolderId(folder.id);
      setTitle(folder.description);
      setFilesOnDrive(files);

      const handleHtml = async () => {
        const htmlFile = files.find(({ mimeType }) => mimeType === 'text/html');
        if (!htmlFile) return;
        setHtmlId(htmlFile.id);
        const html = await getFile(htmlFile.id).text();
        if (!html) return;

        document.querySelector('.ql-editor')!.innerHTML = html;
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
                    uploaded: true,
                    driveId: id,
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
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='flex-1'>
          <Input
            label='Date of Entry'
            type='date'
            value={date || ''}
            onChange={() => {}}
            disabled
          />
        </div>
        <div className='flex-1'>
          <Input
            label='Title'
            value={title}
            onChange={setTitle}
            placeholder='Canada Trip Day 1'
          />
        </div>
        <div className='flex-1'>
          <MediaInput
            label='Upload'
            allowVideo
            multiple
            onChange={(files, e) => {
              setGallery([
                ...gallery,
                ...files.map(({ url, blob }) => ({
                  url,
                  type: blob.type.split('/')[0] as 'image',
                  uploaded: false,
                })),
              ]);
              e.target.value = '';
            }}
          />
        </div>
        <button className='btn btn-info' onClick={save} disabled={saving}>
          Save {saving && <span className='loading loading-spinner ml-2' />}
        </button>
      </div>
      <MediaSlideshow files={gallery} setState={setMediaDialog} />
      <Quill value={text} onChange={setText} />
      <MediaDialog
        files={gallery}
        setFiles={setGallery}
        state={mediaDialog}
        setState={setMediaDialog}
      />
    </>
  );
};

export default Entry;
