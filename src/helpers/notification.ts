import { errorState, successState } from './state';

export const error = (err: any) => {
  const message =
    typeof err === 'string'
      ? err
      : (typeof err?.response?.data === 'object'
          ? JSON.stringify(err?.response?.data)
          : err?.response?.data) ||
        err?.message?.toString() ||
        'Error';
  errorState.set({ message, show: true });
};

export const success = (message: string) => {
  successState.set({ message, show: true });
};
