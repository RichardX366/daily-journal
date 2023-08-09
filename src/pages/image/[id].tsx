import MediaDialog from '@/components/MediaDialog';
import { folderMimeType } from '@/helpers/constants';
import { getFile, paginateFiles } from '@/helpers/drive';
import { globalUser } from '@/helpers/state';
import { useHookstate } from '@hookstate/core';
import { Persistence } from '@hookstate/persistence';
import {
  Input,
  Select,
  Table,
  unCamelCase,
  wordDate,
} from '@richardx/components';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

const Image: React.FC = () => {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<'ascending' | 'descending'>('descending');
  const [files, setFiles] = useState<{ url: string; date: string }[]>([]);
  const [nextPageToken, setNextPageToken] = useState('');
  const [mediaDialog, setMediaDialog] = useState({
    open: false,
    index: -1,
  });
  const user = useHookstate(globalUser);
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const search = async (concat = false) => {
    if (!id) return;

    const results = await paginateFiles({
      matches: [{ name: [{ contains: query }, { contains: `-${id}` }] }],
      order,
      pageToken: nextPageToken,
      pageSize: 50,
    });
    if (!results) return;
    const toAdd = await Promise.all(
      results.files.map(async (file) => ({
        date: file.name.replace('-' + id, ''),
        url: URL.createObjectURL(await getFile(file.id).blob()),
      })),
    );
    if (!concat) files.forEach(({ url }) => URL.revokeObjectURL(url));
    setFiles(concat ? files.concat(toAdd) : toAdd);
    setNextPageToken(results.nextPageToken || '');
  };

  useEffect(() => {
    globalUser.attach(Persistence('user'));
    if (!globalUser.email.value) router.push('/about');
  }, []);

  useEffect(() => {
    if (!user.email.value) return;
    search();
  }, [id, user.email.value]);

  useEffect(() => {
    if (
      nextPageToken &&
      mediaDialog.open &&
      files.length - mediaDialog.index < 21
    ) {
      search(true);
    }
  }, [mediaDialog]);

  return (
    <>
      <Head>
        <title>{`${
          id ? `Viewing ${unCamelCase(id)}` : 'Image'
        } | Daily Journal`}</title>
      </Head>
      <h1 className='text-3xl text-center md:text-left mb-2'>
        Viewing {unCamelCase(id || '')} Images
      </h1>
      <div className='flex flex-col md:flex-row gap-4'>
        <Input
          value={query}
          onChange={setQuery}
          onEnter={() => search()}
          label='Search'
          type='search'
          placeholder='Use YYYY-MM-DD or segments of it.'
        />
        <div className='w-auto md:w-64'>
          <Select
            value={order}
            onChange={({ value }) => setOrder(value as any)}
            data={[
              { label: 'Newest to Oldest', value: 'descending' },
              { label: 'Oldest to Newest', value: 'ascending' },
            ]}
            label='Order'
          />
        </div>
        <button className='btn btn-info normal-case' onClick={() => search()}>
          Search
        </button>
      </div>
      <InfiniteScroll
        loadMore={() => search(true)}
        hasMore={!!nextPageToken}
        loader={
          <div className='w-full flex justify-center pt-4'>
            <span className='loading loading-spinner w-10 h-10' />
          </div>
        }
      >
        <Table
          columns={['entry']}
          data={files.map((date, i) => ({
            entry: (
              <div className='flex justify-between flex-col md:flex-row gap-4 pb-4 md:pb-2 items-center'>
                <span>{wordDate(date.date)}</span>
                <img
                  src={date.url}
                  alt={date.date}
                  className='h-56 rounded-md cursor-pointer'
                  onClick={() => setMediaDialog({ open: true, index: i })}
                />
              </div>
            ),
          }))}
        />
      </InfiniteScroll>
      <MediaDialog
        state={mediaDialog}
        setState={setMediaDialog}
        files={files.map(({ url }) => ({ type: 'image', url }))}
      />
    </>
  );
};

export default Image;
