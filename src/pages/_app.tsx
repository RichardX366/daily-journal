import '@/styles/globals.css';
import '@richardx/components/dist/styles.css';
import 'react-quill/dist/quill.snow.css';
import '@/styles/quill.css';
import 'katex/dist/katex.min.css';
import '@/styles/splide.css';
import '@splidejs/react-splide/css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import {
  globalAccessToken,
  globalImageIds,
  globalImageScale,
  globalTemplate,
  globalUser,
} from '@/helpers/state';
import { Persistence } from '@hookstate/persistence';
import { useHookstate } from '@hookstate/core';
import { clientId, scopes } from '@/helpers/constants';
import { BsGoogle } from 'react-icons/bs';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  Modal,
  Notifications,
  Range,
  Select,
  error,
  info,
  success,
  warn,
} from '@richardx/components';
import {
  fileListToMap,
  getFile,
  getRootFolderId,
  searchFiles,
} from '@/helpers/drive';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const user = useHookstate(globalUser);
  const imageScale = useHookstate(globalImageScale);
  const imageIds = useHookstate(globalImageIds);

  const logIn = () => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${
      location.origin
    }/loading&scope=${scopes.join(
      ' ',
    )}&response_type=code&access_type=offline&include_granted_scopes=true&prompt=consent`;

    router.push(url);
  };

  const logOut = () => {
    fetch(
      `https://oauth2.googleapis.com/revoke?token=${globalUser.refreshToken.value}`,
      { method: 'POST' },
    );
    globalAccessToken.set({ token: '', expiresAt: 0 });
    globalUser.set({
      name: '',
      email: '',
      picture: '',
      refreshToken: '',
    });

    router.push('/about');
  };

  useEffect(() => {
    globalUser.attach(Persistence('user'));
    globalAccessToken.attach(Persistence('accessToken'));
    globalImageIds.attach(Persistence('imageIds'));
    globalTemplate.attach(Persistence('template'));

    const search = new URLSearchParams(location.search);

    const initialError = search.get('error');
    if (initialError) error(initialError);
    const initialSuccess = search.get('success');
    if (initialSuccess) success(initialSuccess);
    const initialWarning = search.get('warning');
    if (initialWarning) warn(initialWarning);
    const initialInfo = search.get('info');
    if (initialInfo) info(initialInfo);

    if (!user.email.value) return;
    (async () => {
      const files = await searchFiles([
        { name: 'image-ids.json', mimeType: 'application/json' },
        { name: 'template.html', mimeType: 'text/html' },
      ]);
      if (!files) return;
      if (!files.length) return getRootFolderId();

      const [imageIds, template] = await Promise.all([
        getFile(fileListToMap(files)['image-ids.json']).json<any>(),
        getFile(fileListToMap(files)['template.html']).text(),
      ]);

      globalImageIds.set(imageIds);
      globalTemplate.set(template);
    })();
  }, []);

  return (
    <>
      <Head>
        <meta
          name='description'
          content='An app that lets you keep a daily journal of your life stored on Google Drive.'
        />
      </Head>
      <div className='fixed z-10 left-0 top-0 w-full p-4 dark:bg-slate-900 bg-slate-300 border-b dark:border-b-slate-500 border-b-slate-900 flex justify-between gap-2 items-center h-20'>
        <Link href='/' className='text-3xl whitespace-nowrap'>
          Daily Journal
        </Link>
        {user.email.value ? (
          <div className='dropdown dropdown-end'>
            <label
              tabIndex={0}
              className='p-2 select-none rounded-md flex gap-2 items-center cursor-pointer bg-transparent text-left hover:bg-black/10 hover:dark:bg-white/10 transition-colors'
            >
              <img
                alt='Profile'
                src={user.picture.value}
                className='w-8 h-8 rounded-full shadow shadow-black dark:shadow-white'
              />
              <div>
                <p className='truncate'>{user.name.value}</p>
                <p className='text-xs dark:text-gray-400 text-gray-600 truncate'>
                  {user.email.value}
                </p>
              </div>
            </label>
            <ul
              tabIndex={0}
              className='p-2 border border-gray-300 dark:border-gray-500 shadow-md shadow-black/50 dark:shadow-white/50 menu dropdown-content bg-white dark:bg-gray-900 rounded-md w-52'
            >
              <li>
                <Link href='/about'>About</Link>
              </li>
              <li>
                <Link href='/entries'>Entries</Link>
              </li>
              <li>
                <Link href='/update-image-ids'>Update Image Ids</Link>
              </li>
              <li>
                <Link href='/update-template'>Update Template</Link>
              </li>
              <li>
                <button
                  className='text-red-500 hover:text-red-500 hover:dark:text-red-600'
                  onClick={logOut}
                >
                  Log Out
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <button className='btn btn-info' onClick={logIn}>
            <BsGoogle />
            Log in
          </button>
        )}
      </div>
      <main className='pt-24 p-4 flex flex-col gap-4'>
        <Component {...pageProps} />
      </main>
      <Modal
        open={imageScale.show.value}
        setOpen={(open) => {
          imageScale.show.set(open);
          imageScale.onSubmit.value([undefined, '']);
        }}
        title='Scale and Name Image'
        actions={
          <button
            className='btn btn-info'
            onClick={() => {
              imageScale.show.set(false);
              imageScale.onSubmit.value([
                imageScale.width.value,
                imageScale.name.value,
              ]);
            }}
          >
            Save
          </button>
        }
      >
        <Select
          data={[
            { value: 'photo', label: 'None' },
            ...imageIds.value.map((id) => ({ value: id, label: id })),
          ]}
          label='Image Name'
          description='You can edit these options in your settings'
          value={imageScale.name.value}
          onChange={({ value }) => imageScale.name.set(value)}
        />
        <div className='md:min-w-[80vw] w-full my-2'>
          <Range
            min={100}
            max={1500}
            value={imageScale.width.value}
            onChange={imageScale.width.set}
            label='Width (px)'
            description={`Current: ${imageScale.width.value}px`}
          />
        </div>
        {imageScale.url.value ? (
          <img
            className='mx-auto'
            src={imageScale.url.value}
            alt={imageScale.name.value}
            style={{ width: `${imageScale.width.value}px` }}
          />
        ) : (
          <div className='w-full flex justify-center'>
            <span
              className='loading loading-spinner'
              style={{ width: `${imageScale.width.value}px` }}
            />
          </div>
        )}
      </Modal>
      <Notifications className='top-20' />
    </>
  );
}
