import Head from 'next/head';
import { useHookstate } from '@hookstate/core';
import { globalUser } from '@/helpers/state';
import React, { useEffect, useState } from 'react';
import a from '@/helpers/ky';
import Quill from '@/components/Quill';
import { Persistence } from '@hookstate/persistence';
import MediaInput, { MediaFile } from '@/components/MediaInput';
import {
  AiFillCaretRight,
  AiOutlineLeft,
  AiOutlineRight,
} from 'react-icons/ai';
import { useHotkeys } from '@mantine/hooks';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { useRouter } from 'next/router';
import { dateInput, Input, Modal } from '@richardx/components';

interface MediaDialog {
  type: 'image' | 'video';
  url: string;
  open: boolean;
  index: number;
}

const Home: React.FC<{}> = () => {
  const user = useHookstate(globalUser);
  const [date, setDate] = useState(dateInput(new Date()));
  const [text, setText] = useState('');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [mediaDialog, setMediaDialog] = useState<MediaDialog>({
    type: 'image',
    url: '',
    open: false,
    index: -1,
  });
  const router = useRouter();

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

  const save = async () => {
    const result = await a
      .post(`/drive/v3/files`, {
        json: {
          name: 'My Folder',
          mimeType: 'application/vnd.google-apps.folder',
        },
      })
      .json();
    console.log(result);
  };

  useHotkeys([
    ['ArrowLeft', () => mediaDialog.open && backMediaDialog()],
    ['ArrowRight', () => mediaDialog.open && nextMediaDialog()],
  ]);

  useEffect(() => {
    globalUser.attach(Persistence('user'));
    if (!user.email.value) router.push('/about');
  }, [user]);

  return (
    <>
      <Head>
        <title>Daily Journal</title>
      </Head>
      <div className='p-4 pt-6 flex flex-col gap-4'>
        <div className='flex flex-col md:flex-row gap-4'>
          <div className='flex-1'>
            <Input
              label='Date of Entry'
              type='date'
              value={date}
              onChange={setDate}
            />
          </div>
          <MediaInput label='Upload' multiple onChange={setFiles} />
          <button className='btn btn-info' onClick={save}>
            Save
          </button>
        </div>
        {files.length ? (
          <Splide
            options={{
              rewind: true,
              autoWidth: true,
              focus: 'center',
              wheel: true,
              start: 0,
            }}
            onMounted={(splide) =>
              setTimeout(() => {
                splide.go('>');
                splide.go('<');
              }, 50)
            }
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
                      <AiFillCaretRight className='w-8 h-8 bg-white/30 dark:bg-black/30 rounded-full' />
                    </div>
                  </div>
                )}
              </SplideSlide>
            ))}
          </Splide>
        ) : null}
        <Quill value={text} onChange={setText} />
      </div>
      <Modal
        open={mediaDialog.open}
        setOpen={(open) => setMediaDialog({ ...mediaDialog, open })}
        actions={
          <div className='flex justify-between w-full'>
            <button className='btn btn-ghost' onClick={backMediaDialog}>
              <AiOutlineLeft />
              Back
            </button>
            <button className='btn btn-ghost' onClick={nextMediaDialog}>
              Next
              <AiOutlineRight />
            </button>
          </div>
        }
      >
        {mediaDialog.type === 'image' ? (
          <img src={mediaDialog.url} alt='image' className='object-contain' />
        ) : (
          <video src={mediaDialog.url} controls autoPlay />
        )}
      </Modal>
    </>
  );
};

export default Home;
