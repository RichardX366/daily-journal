import { createState } from '@hookstate/core';

export const globalUser = createState({
  email: '',
  name: '',
  picture: '',
  refreshToken: '',
});
export const globalAccessToken = createState({ token: '', expiresAt: 0 });

export const errorState = createState({
  message: '',
  show: false,
});

export const successState = createState({
  message: '',
  show: false,
});

export const globalImageIds = createState<string[]>([]);

export const globalTemplate = createState('');
