import Head from 'next/head';
import { Button } from '@mui/material';
import { useHookstate } from '@hookstate/core';
import { globalUser } from '@/helpers/state';
import React, { useState } from 'react';
import a from '@/helpers/axios';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import QuillNoSSRWrapper from '@/components/Quill';
import { quillProps } from '@/helpers/constants';
import { sanitizeHTML } from '@/helpers/sanitizeHTML';

const Home: React.FC<{}> = () => {
  const user = useHookstate(globalUser);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [text, setText] = useState('');

  return (
    <>
      <Head>
        <title>Daily Journal</title>
      </Head>
      {user.name.value ? (
        <div className='p-4 pt-6 flex flex-col gap-4'>
          <div>
            <DatePicker label='Date of Entry' value={date} onChange={setDate} />
          </div>
          <QuillNoSSRWrapper {...quillProps} value={text} onChange={setText} />
          <div className='ql-snow ql-container' style={{ borderStyle: 'none' }}>
            <div
              className='ql-editor'
              dangerouslySetInnerHTML={{
                __html: sanitizeHTML(text),
              }}
              style={{ minHeight: '0px', padding: '0px' }}
            ></div>
          </div>
        </div>
      ) : (
        'about'
      )}
    </>
  );
};

export default Home;
