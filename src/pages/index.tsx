import Head from 'next/head';
import { useHookstate } from '@hookstate/core';
import { globalTemplate, globalUser } from '@/helpers/state';
import React, { useEffect, useState } from 'react';
import Quill from '@/components/Quill';
import { Persistence } from '@hookstate/persistence';
import {
  AiFillCaretRight,
  AiOutlineLeft,
  AiOutlineRight,
} from 'react-icons/ai';
import { useHotkeys } from '@mantine/hooks';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { useRouter } from 'next/router';
import {
  dateInput,
  Input,
  Modal,
  MediaInput,
  MediaFile,
} from '@richardx/components';
import { searchFiles, uploadFile } from '@/helpers/drive';
import { folderMimeType } from '@/helpers/constants';

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
    const result = await uploadFile(
      new Blob(['fileContent'], { type: 'text/plain' }),
      'test.txt',
    );
    if (!result) return;
    console.log(result);
  };

  useHotkeys([
    ['ArrowLeft', () => mediaDialog.open && backMediaDialog()],
    ['ArrowRight', () => mediaDialog.open && nextMediaDialog()],
  ]);

  useEffect(() => {
    globalUser.attach(Persistence('user'));
    if (!user.email.value) router.push('/about');
    globalTemplate.attach(Persistence('template'));
    setText(globalTemplate.value);

    (async () => {
      const files = await searchFiles([
        { name: date, mimeType: folderMimeType },
      ]);
      if (!files) return;
      if (files.length) router.push('/entry/' + files[0].id);
    })();
  }, []);

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
          <div className='flex-1'>
            <MediaInput
              label='Upload'
              allowVideo
              multiple
              onChange={setFiles}
            />
          </div>
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
        <div className='flex justify-center max-h-[calc(100vh-13rem)]'>
          {mediaDialog.type === 'image' ? (
            <img
              src={mediaDialog.url}
              alt='image'
              className='object-contain max-h-[calc(100vh-13rem)]'
            />
          ) : (
            <video src={mediaDialog.url} controls autoPlay />
          )}
        </div>
      </Modal>
    </>
  );
};

export default Home;
