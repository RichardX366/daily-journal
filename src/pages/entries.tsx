import { folderMimeType } from '@/helpers/constants';
import { paginateFiles } from '@/helpers/drive';
import { globalUser } from '@/helpers/state';
import { Persistence } from '@hookstate/persistence';
import { Input, Select, Table, wordDate } from '@richardx/components';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

const Entries: React.FC = () => {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<'ascending' | 'descending'>('descending');
  const [method, setMethod] = useState<'title' | 'content'>('title');
  const [starred, setStarred] = useState('undefined');
  const [files, setFiles] = useState<
    { title: string; date: string; starred: boolean }[]
  >([]);
  const [nextPageToken, setNextPageToken] = useState('');
  const router = useRouter();

  const search = async (concat = false) => {
    const results = await paginateFiles({
      matches: [
        {
          query: query || undefined,
          starred: starred === 'undefined' ? undefined : JSON.parse(starred),
          mimeType: method === 'title' ? folderMimeType : 'text/html',
          name: { not: method === 'title' ? 'Daily Journal' : 'template.html' },
        },
      ],
      order,
      pageToken: nextPageToken,
    });
    if (!results) return;

    const toAdd = results.files.map(({ name, description, starred }) => ({
      title: description,
      date: name,
      starred,
    }));
    setFiles(concat ? files.concat(toAdd) : toAdd);
    setNextPageToken(results.nextPageToken || '');
  };

  useEffect(() => {
    globalUser.attach(Persistence('user'));
    if (!globalUser.email.value) {
      router.push('/about');
      return;
    }
    search();
  }, []);

  return (
    <>
      <Head>
        <title>Entries | Daily Journal</title>
      </Head>
      <div className='flex flex-col md:flex-row gap-4'>
        <Input
          value={query}
          onChange={setQuery}
          onEnter={() => search()}
          label='Search'
          type='search'
        />
        <div className='w-auto md:w-64'>
          <Select
            value={method}
            onChange={({ value }) => setMethod(value as any)}
            data={[
              { label: 'By Title', value: 'title' },
              { label: 'By Entry Content', value: 'content' },
            ]}
            label='Method'
          />
        </div>
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
        <div className='w-auto md:w-64'>
          <Select
            value={starred}
            onChange={({ value }) => setStarred(value)}
            data={[
              { label: 'Any', value: 'undefined' },
              { label: 'Starred', value: 'true' },
              { label: 'Not Starred', value: 'false' },
            ]}
            label='Starred'
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
          columns={['entry', { title: '', key: 'go' }]}
          data={files.map(({ title, date, starred }) => ({
            id: date,
            entry: (
              <span className='flex gap-2'>
                {wordDate(date)} {title && '-'} {title}{' '}
                {starred && (
                  <div className='mask mask-star w-6 h-6 bg-yellow-300' />
                )}
              </span>
            ),
            go: (
              <button
                className='btn btn-ghost btn-sm'
                onClick={() => router.push('/entry/' + date)}
              >
                Go
              </button>
            ),
          }))}
        />
      </InfiniteScroll>
    </>
  );
};

export default Entries;
