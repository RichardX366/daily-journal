import a from './ky';

export const uploadFile = async ({
  file,
  parent,
}: {
  file: File;
  parent?: string;
}) => {
  if (!parent) {
    const foldersResult = await a
      .get(
        `drive/v3/files?q=name='Daily Journal' and mimeType='application/vnd.google-apps.folder'`,
      )
      .json<any>();
    if (!foldersResult) return;
    if (!foldersResult.files.length) {
      const rootFolder = await a
        .post(`drive/v3/files`, {
          json: {
            name: 'My Folder',
            mimeType: 'application/vnd.google-apps.folder',
          },
        })
        .json<any>();
      parent = rootFolder.id as string;
      // INIT
    } else {
      parent = foldersResult.files[0].id as string;
    }
  }
};
