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
          content='An app that lets you keep a daily journal of your life stored on Google Drive. Get started with one click!'
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
                <Link href='/images'>View Images</Link>
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
          <button className='gsi-material-button' onClick={logIn}>
            <div className='gsi-material-button-state'></div>
            <div className='gsi-material-button-content-wrapper'>
              <div className='gsi-material-button-icon'>
                <svg
                  version='1.1'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 48 48'
                  style={{ display: 'block' }}
                >
                  <path
                    fill='#EA4335'
                    d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'
                  ></path>
                  <path
                    fill='#4285F4'
                    d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'
                  ></path>
                  <path
                    fill='#FBBC05'
                    d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'
                  ></path>
                  <path
                    fill='#34A853'
                    d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'
                  ></path>
                  <path fill='none' d='M0 0h48v48H0z'></path>
                </svg>
              </div>
              <span className='gsi-material-button-contents'>Sign in</span>
            </div>
          </button>
        )}
      </div>
      <main
        className={`flex flex-col ${
          router.pathname === '/about' ? 'pt-20' : 'pt-24 p-4 gap-4'
        }`}
      >
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
