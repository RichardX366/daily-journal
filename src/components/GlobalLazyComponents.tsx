import {
  errorState,
  globalAccessToken,
  globalUser,
  successState,
} from '@/helpers/state';
import { useHookstate } from '@hookstate/core';
import { Alert, Button, Dialog, DialogContent, Snackbar } from '@mui/material';
import { useRouter } from 'next/router';
import React from 'react';

interface Props {
  showProfileDialog: boolean;
  setShowProfileDialog: (v: boolean) => void;
}

const GlobalLazyComponents: React.FC<Props> = ({
  showProfileDialog,
  setShowProfileDialog,
}) => {
  const error = useHookstate(errorState);
  const success = useHookstate(successState);
  const router = useRouter();

  const logOut = () => {
    setShowProfileDialog(false);
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

  return (
    <>
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
        <DialogContent className='flex flex-col gap-2'>
          <Button
            color='primary'
            onClick={() => {
              setShowProfileDialog(false);
              router.push('/about');
            }}
          >
            About
          </Button>
          <Button color='error' onClick={logOut}>
            Log Out
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalLazyComponents;
