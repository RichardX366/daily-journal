import Head from 'next/head';
import { Button } from '@mui/material';
import { useHookstate } from '@hookstate/core';
import { globalUser } from '@/helpers/state';
import React, { useEffect, useState } from 'react';
import a from '@/helpers/axios';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import Quill from '@/components/Quill';
import { Persistence } from '@hookstate/persistence';
import MediaInput, { MediaFile } from '@/components/MediaInput';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { PlayArrow, ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import dynamic from 'next/dynamic';
import { useHotkeys } from '@mantine/hooks';

const Dialog = dynamic(import('@mui/material').then(({ Dialog }) => Dialog));
const DialogContent = dynamic(
  import('@mui/material').then(({ DialogContent }) => DialogContent),
);
const DialogActions = dynamic(
  import('@mui/material').then(({ DialogActions }) => DialogActions),
);

interface MediaDialog {
  type: 'image' | 'video';
  url: string;
  open: boolean;
  index: number;
}

const Home: React.FC<{}> = () => {
  const user = useHookstate(globalUser);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [text, setText] = useState('');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [mediaDialog, setMediaDialog] = useState<MediaDialog>({
    type: 'image',
    url: '',
    open: false,
    index: -1,
  });

  const backMediaDialog = () => {
    const newIndex = (mediaDialog.index + files.length - 1) % files.length;
    setMediaDialog({
      open: true,
      type: files[newIndex].blob.type.includes('image') ? 'image' : 'video',
      index: newIndex,
      url: files[newIndex].url,
    });
  };

  const nextMediaDialog = () => {
    const newIndex = (mediaDialog.index + 1) % files.length;
    setMediaDialog({
      open: true,
      type: files[newIndex].blob.type.includes('image') ? 'image' : 'video',
      index: newIndex,
      url: files[newIndex].url,
    });
  };

  useHotkeys([
    ['ArrowLeft', () => mediaDialog.open && backMediaDialog()],
    ['ArrowRight', () => mediaDialog.open && nextMediaDialog()],
  ]);

  useEffect(() => {
    globalUser.attach(Persistence('user'));
    if (!user.email.value) location.pathname = '/about';
  }, [user]);

  return (
    <>
      <Head>
        <title>Daily Journal</title>
      </Head>
      <div className='p-4 pt-6 flex flex-col gap-4'>
        <div className='flex flex-col md:flex-row gap-4'>
          <DatePicker
            className='flex-1'
            label='Date of Entry'
            value={date}
            onChange={setDate}
          />
          <MediaInput label='Upload' multiple onChange={setFiles} />
        </div>
        {files.length ? (
          <Splide
            options={{ rewind: true, autoWidth: true, focus: 'center' }}
            aria-label='Media'
            className='md:px-16'
          >
            {files.map((file, i) => (
              <SplideSlide key={file.url} className='px-2'>
                {file.blob.type.includes('image') ? (
                  <img
                    className='h-48 rounded-md cursor-pointer'
                    src={file.url}
                    alt='image'
                    onClick={() =>
                      setMediaDialog({
                        open: true,
                        type: 'image',
                        url: file.url,
                        index: i,
                      })
                    }
                  />
                ) : (
                  <div
                    className='relative cursor-pointer'
                    onClick={() =>
                      setMediaDialog({
                        open: true,
                        type: 'video',
                        url: file.url,
                        index: i,
                      })
                    }
                  >
                    <video className='h-48 rounded-md' src={file.url} />
                    <div className='absolute inset-0 flex justify-center items-center'>
                      <PlayArrow className='w-8 h-8 bg-black/30 rounded-full' />
                    </div>
                  </div>
                )}
              </SplideSlide>
            ))}
          </Splide>
        ) : null}
        <Quill value={text} onChange={setText} />
      </div>
      <Dialog
        open={mediaDialog.open}
        onClose={() => setMediaDialog({ ...mediaDialog, open: false })}
      >
        <DialogContent className='flex'>
          {mediaDialog.type === 'image' ? (
            <img src={mediaDialog.url} alt='image' />
          ) : (
            <video src={mediaDialog.url} controls autoPlay />
          )}
        </DialogContent>
        <DialogActions className='flex justify-between px-6 pb-4'>
          <Button startIcon={<ArrowBackIos />} onClick={backMediaDialog}>
            Back
          </Button>
          <Button onClick={nextMediaDialog} endIcon={<ArrowForwardIos />}>
            Next
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Home;
