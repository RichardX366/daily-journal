import { globalImageIds } from '@/helpers/state';
import { useHookstate } from '@hookstate/core';
import { unCamelCase } from '@richardx/components';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

const Images: React.FC = () => {
  const imageIds = useHookstate(globalImageIds);

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
