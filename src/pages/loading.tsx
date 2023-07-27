import { createState } from '@hookstate/core';
import { CircularProgress } from '@mui/material';
import React, { useEffect } from 'react';
import axios from 'axios';
import { clientId, clientSecret } from '@/helpers/constants';
import { globalAccessToken, globalUser } from '@/helpers/state';

const firstMount = createState(true);

const Loading: React.FC = () => {
  const initialRun = async () => {
    const query = new URLSearchParams(location.search);
    const code = query.get('code');
    try {
      const {
        data: { access_token, refresh_token, expires_in },
      } = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: location.origin + '/loading',
      });
      globalAccessToken.set({
        token: access_token,
        expiresAt: Date.now() + expires_in * 1000,
      });
      const {
        data: { email, name, picture },
      } = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      );
      globalUser.set({
        name,
        email,
        picture,
        refreshToken: refresh_token,
      });
      location.href = location.origin;
    } catch (e: any) {
      const error = e?.response.data;
      location.href = `${location.origin}?error=${error.error}: ${error.error_description}`;
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (!query.get('scope')?.includes('drive.file')) {
      location.href =
        location.origin + '?error=You must allow the app to use Google Drive';
      return;
    }
    if (!firstMount.value) return;
    firstMount.set(false);
    initialRun();
  }, []);

  return (
    <main>
      <div className='w-full h-full absolute left-0 top-0 flex items-center justify-center flex-col gap-4'>
        <CircularProgress color='primary' />
        <p>Logging you in</p>
      </div>
    </main>
  );
};

export default Loading;
