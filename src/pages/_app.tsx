import '@/styles/globals.css';
import 'react-quill/dist/quill.snow.css';
import '@/styles/quill.css';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import type { AppProps } from 'next/app';
import { useEffect, useMemo, useState } from 'react';
import {
  errorState,
  globalAccessToken,
  globalUser,
  successState,
} from '@/helpers/state';
import { Persistence } from '@hookstate/persistence';
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  Snackbar,
  ThemeProvider,
  useMediaQuery,
} from '@mui/material';
import getTheme from '@/helpers/theme';
import { createState, useHookstate } from '@hookstate/core';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { clientId, scopes } from '@/helpers/constants';
import GoogleIcon from '@mui/icons-material/Google';
import axios from 'axios';
import { useRouter } from 'next/router';

const firstMount = createState(true);

export default function App({ Component, pageProps }: AppProps) {
  const darkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(() => getTheme(darkMode), [darkMode]);

  const router = useRouter();

  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const error = useHookstate(errorState);
  const success = useHookstate(successState);
  const user = useHookstate(globalUser);

  const logIn = () => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${
      location.origin
    }/loading&scope=${scopes.join(
      ' ',
    )}&response_type=code&access_type=offline&include_granted_scopes=true&prompt=select_account`;

    location.href = url;
  };

  const logOut = () => {
    setShowProfileDialog(false);
    axios.post(
      `https://oauth2.googleapis.com/revoke?token=${user.refreshToken.value}`,
    );
    globalAccessToken.set({ token: '', expiresAt: 0 });
    user.set({
      name: '',
      email: '',
      picture: '',
      refreshToken: '',
    });
    if (location.pathname !== '/') {
      location.pathname = '/';
    }
  };

  const handleCloseError = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    error.show.set(false);
  };

  const handleCloseSuccess = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    success.show.set(false);
  };

  useEffect(() => {
    globalUser.attach(Persistence('user'));
    globalAccessToken.attach(Persistence('accessToken'));
  }, []);

  useEffect(() => {
    if (!firstMount.value) return;
    firstMount.set(false);

    (window as any).katex = katex;

    const initialError = new URLSearchParams(location.search).get('error');
    if (initialError) {
      error.set({ message: initialError, show: true });
    }
    const initialSuccess = new URLSearchParams(location.search).get('success');
    if (initialSuccess) {
      success.set({ message: initialSuccess, show: true });
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
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
            <Button
              variant='contained'
              startIcon={<GoogleIcon />}
              onClick={logIn}
            >
              Log in
            </Button>
          )}
        </div>
        <main className='pt-20'>
          <Component {...pageProps} />
        </main>
        <Snackbar
          open={error.show.value}
          autoHideDuration={5000}
          onClose={handleCloseError}
        >
          <Alert
            onClose={handleCloseError}
            severity='error'
            sx={{ width: '100%' }}
          >
            {error.message.value}
          </Alert>
        </Snackbar>
        <Snackbar
          open={success.show.value}
          autoHideDuration={5000}
          onClose={handleCloseSuccess}
        >
          <Alert
            onClose={handleCloseSuccess}
            severity='success'
            sx={{ width: '100%' }}
          >
            {success.message.value}
          </Alert>
        </Snackbar>
        <Dialog
          open={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
        >
          <DialogContent>
            <Button color='error' onClick={logOut}>
              Log Out
            </Button>
          </DialogContent>
        </Dialog>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
