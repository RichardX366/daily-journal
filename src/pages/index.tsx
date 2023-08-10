import Head from 'next/head';
import { globalTemplate, globalUser } from '@/helpers/state';
import React, { useEffect, useState } from 'react';
import Quill from '@/components/Quill';
import { Persistence } from '@hookstate/persistence';
import { useRouter } from 'next/router';
import {
  dateInput,
  Input,
  MediaInput,
  MediaFile,
  error,
} from '@richardx/components';
import { createFolder, searchFiles, uploadFile } from '@/helpers/drive';
import { folderMimeType } from '@/helpers/constants';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import MediaDialog, { MediaDialogState } from '@/components/MediaDialog';
import MediaSlideshow from '@/components/MediaSlideshow';
import { useHookstate } from '@hookstate/core';

const Home: React.FC<{}> = () => {
  const [date, setDate] = useState(dateInput(new Date()));
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [mediaDialog, setMediaDialog] = useState<MediaDialogState>({
    open: false,
    index: -1,
  });
  const [saving, setSaving] = useState(false);
  const [existingEntry, setExistingEntry] = useState(false);
  const [showExistingEntry, setShowExistingEntry] = useState(false);
  const user = useHookstate(globalUser);
  const router = useRouter();

  const save = async () => {
    if (!text) return error('You need to have something in your journal entry');
    setSaving(true);

    const dateFolder = await createFolder({ name: date, description: title });
    if (!dateFolder) return setSaving(false);

    const handleMain = async () => {
      const images: HTMLImageElement[] = Array.from(
        document.querySelectorAll('.ql-editor img'),
      );
      const imageIds = await Promise.all(
        images.map(async ({ src, alt }) =>
          uploadFile(
            await fetch(src).then((res) => res.blob()),
            date,
            dateFolder,
            alt,
          ),
        ),
      );
      if (imageIds.find((id) => !id)) return;

      const newText = images.reduce((previousText, { src }, i) => {
        const id = imageIds[i] as string;
        return previousText.replace(src, id);
      }, text);

      const entry = await uploadFile(
        new Blob([newText], { type: 'text/html' }),
        date,
        dateFolder,
        title,
      );
      return entry;
    };
    const handleGallery = async () => {
      const uploads = await Promise.all(
        files.map(({ blob }) => uploadFile(blob, date, dateFolder, 'gallery')),
      );
      if (uploads.find((id) => !id)) return;
      return true;
    };

    const results = await Promise.all([handleMain(), handleGallery()]);
    if (results.find((result) => !result)) return setSaving(false);
    router.push('/entry/' + date);
  };

  useEffect(() => {
    globalUser.attach(Persistence('user'));
    if (!globalUser.email.value) router.push('/about');
    globalTemplate.attach(Persistence('template'));
    setText(globalTemplate.value);
  }, []);

  useEffect(() => {
    if (!date || !user.email.value) return;

    (async () => {
      const files = await searchFiles([
        { name: date, mimeType: folderMimeType },
      ]);
      if (!files) return;
      if (files.length) {
        setShowExistingEntry(true);
        setExistingEntry(true);
      } else {
        setShowExistingEntry(false);
        setExistingEntry(false);
      }
    })();
  }, [date, user.email.value]);

  return (
    <>
      <Head>
        <title>Daily Journal</title>
      </Head>
      <div className='flex flex-col md:flex-row gap-4'>
        <div className='flex-1'>
          <Input
            label='Date of Entry'
            type='date'
            value={date}
            onChange={setDate}
            max={dateInput(new Date())}
          />
        </div>
        <div className='flex-1'>
          <Input
            label='Title'
            value={title}
            onChange={setTitle}
            placeholder='Canada Trip Day 1'
            disabled={existingEntry}
          />
        </div>
        <div className='flex-1'>
          <MediaInput
            label='Upload'
            allowVideo
            multiple
            onChange={setFiles}
            disabled={existingEntry}
          />
        </div>
        <button
          className='btn btn-info'
          onClick={save}
          disabled={existingEntry || saving}
        >
          Save {saving && <span className='loading loading-spinner ml-2' />}
        </button>
      </div>
      <MediaSlideshow
        files={files.map(({ url, blob }) => ({
          url,
          type: blob.type.split('/')[0] as 'image',
        }))}
        setState={setMediaDialog}
      />
      <div className={existingEntry ? 'pointer-events-none' : ''}>
        <Quill value={text} onChange={setText} />
      </div>
      <MediaDialog
        state={mediaDialog}
        setState={setMediaDialog}
        files={files.map(({ url, blob }) => ({
          url,
          type: blob.type.split('/')[0] as 'image',
        }))}
      />
      <div
        className={`toast toast-start toast-top top-20 transition-opacity ${
          showExistingEntry ? '' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className='alert'>
          <div className='flex items-center gap-3'>
            <div className='flex-1'>
              <AiOutlineInfoCircle className='text-info w-5 h-5' />
            </div>
            <p className='dark:text-white whitespace-pre-wrap'>
              You already have an entry for this date. Would you like to go to
              it?
            </p>
          </div>
          <button
            className='btn btn-info btn-sm normal-case w-full'
            onClick={() => router.push('/entry/' + date)}
          >
            Go to Entry
          </button>
          <button
            className='btn btn-ghost btn-sm normal-case w-full'
            onClick={() => setShowExistingEntry(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
