import {
  errorState,
  globalAccessToken,
  globalUser,
  successState,
} from '@/helpers/state';
import { useHookstate } from '@hookstate/core';
import { Alert, Button, Dialog, DialogContent, Snackbar } from '@mui/material';
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
        <DialogContent>
          <Button color='error' onClick={logOut}>
            Log Out
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalLazyComponents;
