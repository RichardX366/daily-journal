import { folderMimeType } from './constants';
import a from './ky';

export interface FileMetadata {
  id: string;
  name: string;
  description: string;
  mimeType: string;
  starred: boolean;
}

const getQuery = (
  matches: {
    name?: string | { contains: string } | { not: string };
    mimeType?: string;
    parent?: string;
    starred?: boolean;
    query?: string;
  }[],
) =>
  encodeURIComponent(
    `(${matches
      .map(
        ({ name, mimeType, parent, starred, query }) =>
          `(${[
            name
              ? `name${
                  (name as any).contains
                    ? ' contains '
                    : (name as any).not
                    ? '!='
                    : '='
                }'${(name as any).contains || (name as any).not || name}'`
              : null,
            query ? `fullText contains '${query}'` : null,
            mimeType ? `mimeType='${mimeType}'` : null,
            parent ? `'${parent}' in parents` : null,
            starred === undefined ? null : `starred=${starred}`,
          ]
            .filter(Boolean)
            .join(' and ')})`,
      )
      .join(' or ')}) and trashed=false`,
  );

export const paginateFiles = async ({
  matches,
  pageToken,
  order = 'descending',
  pageSize = 30,
}: {
  matches?: {
    name?: string | { contains: string } | { not: string };
    mimeType?: string;
    query?: string;
    parent?: string;
    starred?: boolean;
  }[];
  order?: 'ascending' | 'descending';
  pageToken?: string;
  pageSize?: number;
}) => {
  const files = await a
    .get(
      `drive/v3/files?fields=nextPageToken,files(id,name,mimeType,starred,description)&pageSize=${pageSize}${
        matches ? '&q=' + getQuery(matches) : ''
      }${
        matches?.find(({ query }) => query)
          ? ''
          : '&orderBy=name' + (order === 'ascending' ? '' : ' desc')
      }${pageToken ? '&pageToken=' + pageToken : ''}`,
    )
    .json<any>();
  if (!files) return;
  return files as {
    nextPageToken?: string;
    files: FileMetadata[];
  };
};

export const searchFiles = async (
  matches: {
    name?: string | { contains: string } | { not: string };
    mimeType?: string;
    query?: string;
    parent?: string;
    starred?: boolean;
  }[],
  order: 'ascending' | 'descending' = 'descending',
) => {
  const files = await a
    .get(
      `drive/v3/files?pageSize=1000${
        matches?.find(({ query }) => query)
          ? ''
          : '&orderBy=name' + (order === 'ascending' ? '' : ' desc')
      }&fields=files(id,name,mimeType,starred,description)&q=${getQuery(
        matches,
      )}`,
    )
    .json<any>();
  if (!files) return;
  return files.files as FileMetadata[];
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

export const createFolder = async ({
  name,
  parent,
  description,
}: {
  name: string;
  description?: string;
  parent?: string;
}) => {
  if (!parent) {
    parent = await getRootFolderId();
    if (!parent) return;
  }
  const folder = await a
    .post(`drive/v3/files`, {
      json: {
        name,
        mimeType: folderMimeType,
        description,
        parents: [parent],
      },
    })
    .json<any>();
  if (!folder) return;
  return folder.id as string;
};

export const uploadFile = async (
  file: Blob,
  name: string,
  parent?: string,
  description?: string,
) => {
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
          description,
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

export const updateFile = async (
  id: string,
  newContent: Blob,
  newMetadata: Partial<Omit<FileMetadata, 'id'>> = {},
) => {
  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(newMetadata)], { type: 'application/json' }),
  );
  form.append('file', newContent);

  const result = await a
    .patch(`upload/drive/v3/files/${id}?uploadType=multipart&fields=id`, {
      body: form,
    })
    .json<any>();
  if (!result) return;

  return result.id as string;
};

export const updateFileMetadata = async (
  id: string,
  metadata: Partial<Omit<FileMetadata, 'id'>>,
) => {
  const result = await a
    .patch(`drive/v3/files/${id}`, {
      json: metadata,
    })
    .json<any>();
  if (!result) return;
  return result.id as string;
};

export const deleteFile = async (id: string) => {
  const result = await a.delete(`drive/v3/files/${id}`);
  if (!result.ok) return;
  return true;
};

export const fileListToMap = (files: { id: string; name: string }[]) =>
  Object.fromEntries(files.map(({ id, name }) => [name, id]));

export const getFile = (id: string) => a.get(`drive/v3/files/${id}?alt=media`);
