import '@/styles/globals.css';
import 'react-quill/dist/quill.snow.css';
import '@/styles/quill.css';
import 'katex/dist/katex.min.css';
import '@/styles/mui.css';
import '@/styles/splide.css';
import '@splidejs/react-splide/css';
import type { AppProps } from 'next/app';
import { useEffect, useMemo, useState } from 'react';
import { globalAccessToken, globalUser } from '@/helpers/state';
import { Persistence } from '@hookstate/persistence';
import { Button, ThemeProvider, useMediaQuery } from '@mui/material';
import getTheme from '@/helpers/theme';
import { createState, useHookstate } from '@hookstate/core';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { clientId, scopes } from '@/helpers/constants';
import { Google } from '@mui/icons-material';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { error, success } from '@/helpers/notification';

const firstMount = createState(true);

const LazyComponents = dynamic(import('@/components/GlobalLazyComponents'));

export default function App({ Component, pageProps }: AppProps) {
  const darkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(() => getTheme(darkMode), [darkMode]);

  const router = useRouter();

  const user = useHookstate(globalUser);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const logIn = () => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${
      location.origin
    }/loading&scope=${scopes.join(
      ' ',
    )}&response_type=code&access_type=offline&include_granted_scopes=true&prompt=select_account`;

    location.href = url;
  };

  useEffect(() => {
    globalUser.attach(Persistence('user'));
    globalAccessToken.attach(Persistence('accessToken'));
  }, []);

  useEffect(() => {
    if (!firstMount.value) return;
    firstMount.set(false);

    const initialError = new URLSearchParams(location.search).get('error');
    if (initialError) error(initialError);
    const initialSuccess = new URLSearchParams(location.search).get('success');
    if (initialSuccess) success(initialSuccess);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Head>
          <meta
            name='description'
            content='An app that lets you keep a daily journal of your life stored on Google Drive.'
          />
        </Head>
        <div className='fixed z-10 left-0 top-0 w-full p-4 dark:bg-slate-900 bg-slate-300 border-b dark:border-b-slate-500 border-b-slate-900 flex justify-between gap-2 items-center h-20'>
          <h2
            className='text-xl cursor-pointer whitespace-nowrap'
            onClick={() => router.push('/')}
          >
            Daily Journal
          </h2>
          {user.email.value ? (
            <button
              onClick={() => setShowProfileDialog(true)}
              className='p-2 rounded-md flex gap-2 items-center cursor-pointer bg-transparent text-left hover:bg-black/10 hover:dark:bg-white/10 transition-colors'
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
            </button>
          ) : (
            <Button variant='contained' startIcon={<Google />} onClick={logIn}>
              Log in
            </Button>
          )}
        </div>
        <main className='pt-20'>
          <Component {...pageProps} />
        </main>
        <LazyComponents
          setShowProfileDialog={setShowProfileDialog}
          showProfileDialog={showProfileDialog}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
