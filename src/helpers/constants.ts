export const scopes = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/drive.file',
];

export const clientId =
  '208531646888-r1tsc6gptem0b2juihb0n4q49ieptr4u.apps.googleusercontent.com';

export const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;

export const folderMimeType = 'application/vnd.google-apps.folder';
