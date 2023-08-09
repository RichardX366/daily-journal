import { globalImageIds, globalUser } from '@/helpers/state';
import { useHookstate } from '@hookstate/core';
import { Persistence } from '@hookstate/persistence';
import { unCamelCase } from '@richardx/components';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

const Images: React.FC = () => {
  const imageIds = useHookstate(globalImageIds);
  const router = useRouter();

  useEffect(() => {
    globalUser.attach(Persistence('user'));
    if (!globalUser.email.value) router.push('/about');
  }, []);

  return (
    <>
      <Head>
        <title>Images | Daily Journal</title>
      </Head>
      {imageIds.value.map((id) => (
        <Link href={`/image/${id}`} key={id}>
          <button className='btn btn-info normal-case w-full'>
            {unCamelCase(id)}
          </button>
        </Link>
      ))}
    </>
  );
};

export default Images;
