import { folderMimeType } from './constants';
import a from './ky';

export const searchFiles = async (
  matches: { name?: string; mimeType?: string }[],
) => {
  const query = encodeURIComponent(
    matches
      .map(
        (file) =>
          `(${Object.entries(file)
            .map(([key, value]) => `${key}='${value}'`)
            .join(' and ')})`,
      )
      .join(' or '),
  );
  const files = await a.get(`drive/v3/files?q=${query}`).json<any>();
  if (!files) return;
  return files.files;
};

export const getRootFolderId = async () => {
  const files = await searchFiles([
    { name: 'Daily Journal', mimeType: folderMimeType },
  ]);
  if (!files) return;
  if (!files.length) {
    const rootFolder = await a
      .post(`drive/v3/files`, {
        json: {
          name: 'Daily Journal',
          mimeType: folderMimeType,
        },
      })
      .json<any>();
    if (!rootFolder) return;

    await uploadFile(
      new Blob(['[]'], { type: 'application/json' }),
      'image-ids.json',
      rootFolder.id,
    );
    await uploadFile(
      new Blob([''], { type: 'text/html' }),
      'template.html',
      rootFolder.id,
    );

    return rootFolder.id as string;
  } else {
    return files[0].id as string;
  }
};

export const createFolder = async (name: string, parent?: string) => {
  if (!parent) {
    parent = await getRootFolderId();
    if (!parent) return;
  }
  const folder = await a
    .post(`drive/v3/files`, {
      json: {
        name,
        mimeType: folderMimeType,
        parents: [parent],
      },
    })
    .json<any>();
  if (!folder) return;
  return folder.id as string;
};

export const uploadFile = async (file: Blob, name: string, parent?: string) => {
  if (!parent) {
    parent = await getRootFolderId();
    if (!parent) return;
  }

  const form = new FormData();
  form.append(
    'metadata',
    new Blob(
      [
        JSON.stringify({
          name,
          mimeType: file.type,
          parents: [parent],
        }),
      ],
      { type: 'application/json' },
    ),
  );
  form.append('file', file);

  const result = await a
    .post(`upload/drive/v3/files?uploadType=multipart&fields=id`, {
      body: form,
    })
    .json<any>();
  if (!result) return;

  return result.id as string;
};

export const fileListToMap = (files: { id: string; name: string }[]) =>
  Object.fromEntries(files.map(({ id, name }) => [name, id]));

export const getFile = (id: string) => a.get(`drive/v3/files/${id}?alt=media`);
