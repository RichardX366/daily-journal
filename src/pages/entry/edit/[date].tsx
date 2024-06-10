import {
  FileMetadata,
  deleteFile,
  getFile,
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
import { Input, dateInput, error, wordDate } from '@richardx/components';
import MediaDialog, { MediaDialogState } from '@/components/MediaDialog';
import MediaSlideshow from '@/components/MediaSlideshow';
import { folderMimeType } from '@/helpers/constants';
import Quill from '@/components/Quill';
import { getPhotos } from '@/helpers/photos';
import PhotoSelect, { MediaFile } from '@/components/PhotoSelect';

const Entry: React.FC = () => {
  const router = useRouter();
  const date = router.query.date as string | undefined;
  const [folderId, setFolderId] = useState('');
  const [htmlId, setHtmlId] = useState('');
  const [galleryId, setGalleryId] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [gallery, setGallery] = useState<MediaFile[]>([]);
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
      const imageRemoval = await Promise.all(
        filesOnDrive
          .filter(({ mimeType }) => mimeType.includes('image/'))
          .map(({ id }) => deleteFile(id)),
      );
      if (imageRemoval.findIndex((result) => !result) !== -1) return;
      const imageIds = await Promise.all(
        images.map(async ({ src, alt }) =>
          uploadFile(
            await fetch(src).then((res) => res.blob()),
            date,
            folderId,
            { properties: { type: alt } },
          ),
        ),
      );
      if (imageIds.find((id) => !id)) return;

      const newText = images.reduce((previousText, { src }, i) => {
        const id = imageIds[i] as string;
        return previousText.replace(src, id);
      }, text);

      const entry = await updateFile(
        htmlId,
        new Blob([newText], { type: 'text/html' }),
        { description: title },
      );
      return entry;
    };

    const handleGallery = async () => {
      const text = gallery.map(({ id }) => id).join('\n');
      const upload = await updateFile(
        galleryId,
        new Blob([text], { type: 'text/plain' }),
      );
      return upload;
    };

    const results = await Promise.all([
      handleMain(),
      handleGallery(),
      updateFileMetadata(folderId, { description: title }),
    ]);
    if (results.findIndex((result) => !result) !== -1) return setSaving(false);
    router.push('/entry/' + date);
  };

  useEffect(() => {
    if (!date) return;
    globalUser.attach(Persistence('user'));
    if (!globalUser.email.value) {
      router.push('/about');
      return;
    }

    (async () => {
      const files = await searchFiles([{ name: date }]);
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

        const imagesInHtml = files.filter(
          ({ mimeType }) =>
            !mimeType.includes('text/') && mimeType !== folderMimeType,
        );
        const urls = await Promise.all(
          imagesInHtml.map(async ({ id }) => ({
            id,
            url: URL.createObjectURL(await getFile(id).blob()),
          })),
        );

        document.querySelector('.ql-editor')!.innerHTML = urls.reduce(
          (previousText, { id, url }) => previousText.replace(id, url),
          html,
        );
      };

      const handleGallery = async () => {
        const itemsFile = files.find(
          ({ mimeType }) => mimeType === 'text/plain',
        );
        if (!itemsFile) return;
        setGalleryId(itemsFile.id);
        const items = await getFile(itemsFile.id).text();
        if (!items) return;
        const photos = await getPhotos(items.split('\n'));
        if (!photos?.length) return;
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
      text.match(/blob:[^'"]+/g)?.forEach(URL.revokeObjectURL);
    };
  }, [date]);

  return (
    <>
      <Head>
        <title>{`Edit ${
          date ? wordDate(date) : 'Entry'
        } | Daily Journal`}</title>
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
        <PhotoSelect
          onUpload={(newFiles) =>
            setGallery([
              ...gallery,
              ...newFiles.filter(
                ({ id }) => gallery.findIndex((file) => file.id === id) === -1,
              ),
            ])
          }
          initialDate={date}
        />
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
