import ky from 'ky';
import { globalAccessToken, globalUser } from './state';
import { error } from '@richardx/components';
import { clientId, clientSecret } from './constants';

const a = ky.extend({
  prefixUrl: 'https://www.googleapis.com',
  hooks: {
    beforeRequest: [
      async (request) => {
        if (globalAccessToken.token.value) {
          if (globalAccessToken.expiresAt.value - Date.now() < 60000) {
            await refreshAccessToken();
          }
          request.headers.set(
            'Authorization',
            `Bearer ${globalAccessToken.token.value}`,
          );
        }
        return request;
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (!response.ok) {
          error(await response.text());
          return new Response();
        }
        return response;
      },
    ],
  },
});

const refreshAccessToken = async () => {
  try {
    const { expires_in, access_token } = await ky
      .post('https://oauth2.googleapis.com/token', {
        json: {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: globalUser.value.refreshToken,
        },
      })
      .json<any>();

    globalAccessToken.set({
      token: access_token,
      expiresAt: Date.now() + expires_in * 1000,
    });
  } catch (e: any) {
    const err = e?.response.data;
    if (err.error === 'invalid_grant') {
      globalUser.set({
        email: '',
        name: '',
        picture: '',
        refreshToken: '',
      });
      globalAccessToken.set({ token: '', expiresAt: 0 });
      location.href = location.origin + '?error=Please log in again';
    }
  }
};

export default a;
