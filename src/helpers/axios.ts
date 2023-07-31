import axios from 'axios';
import { globalAccessToken, globalUser } from './state';
import { error } from './notification';
import { clientId, clientSecret } from './constants';

const a = axios.create({
  baseURL: 'https://www.googleapis.com',
});

const refreshAccessToken = async () => {
  try {
    const {
      data: { expires_in, access_token },
    } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: globalUser.value.refreshToken,
    });

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

a.interceptors.request.use(async (request) => {
  if (globalAccessToken.token.value) {
    if (globalAccessToken.expiresAt.value - Date.now() < 60000) {
      await refreshAccessToken();
    }
    request.headers.Authorization = `Bearer ${globalAccessToken.token.value}`;
  }
  return request;
});

a.interceptors.response.use(
  (response) => response,
  (response) => {
    error(response);
    return {};
  },
);

export default a;
