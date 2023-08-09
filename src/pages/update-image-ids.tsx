import { searchFiles, updateFile } from '@/helpers/drive';
import { globalImageIds, globalUser } from '@/helpers/state';
import { Persistence } from '@hookstate/persistence';
import { Input, Table, error } from '@richardx/components';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const UpdateImageIds: React.FC = () => {
  const router = useRouter();
  const [imageIdsId, setImageIdsId] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [imageId, setImageId] = useState('');

  const save = async () => {
    setSaving(true);
    const result = await updateFile(
      imageIdsId,
      new Blob([JSON.stringify(imageIds)], { type: 'application/json' }),
    );
    if (!result) return;
    globalImageIds.set(imageIds);
    router.push('/');
  };

  const addImageId = () => {
    if (!imageId) return;
    if (imageId === 'gallery' || imageId === 'photos') {
      return error(`Sorry, you cannot use "${imageId}" as an ID`);
    }
    setImageIds([...imageIds, imageId]);
    setImageId('');
  };

  useEffect(() => {
    globalUser.attach(Persistence('user'));
    if (!globalUser.email.value) {
      router.push('/about');
      return;
    }
    globalImageIds.attach(Persistence('imageIds'));
    setImageIds(globalImageIds.value);

    searchFiles([
      { name: 'image-ids.json', mimeType: 'application/json' },
    ]).then(async (files) => {
      if (!files || !files.length) return;
      setImageIdsId(files[0].id);
    });
  }, []);

  return (
    <>
      <Head>
        <title>Update Image Ids | Daily Journal</title>
      </Head>

      <div className='flex flex-col md:flex-row justify-between gap-4'>
        <h1 className='text-4xl text-center md:text-left'>Update Image Ids</h1>
        <button className='btn btn-info' onClick={save} disabled={saving}>
          Save {saving && <span className='loading loading-spinner ml-2' />}
        </button>
      </div>
      <div className='flex gap-4 w-full'>
        <Input
          value={imageId}
          onChange={setImageId}
          label='Image ID'
          placeholder='me'
          onEnter={addImageId}
        />
        <button className='btn btn-success' onClick={addImageId}>
          Add
        </button>
      </div>
      <Table
        data={imageIds.map((id, i) => ({
          id,
          delete: (
            <button
              onClick={() =>
                setImageIds(imageIds.slice(0, i).concat(imageIds.slice(i + 1)))
              }
              className='btn btn-sm btn-error'
            >
              Delete
            </button>
          ),
        }))}
        columns={['id', { key: 'delete', title: '' }]}
      />
    </>
  );
};

export default UpdateImageIds;
