import Head from 'next/head';
import { Button } from '@mui/material';
import { useHookstate } from '@hookstate/core';
import { globalUser } from '@/helpers/state';
import React, { useEffect, useState } from 'react';
import a from '@/helpers/axios';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import Quill from '@/components/Quill';
import { Persistence } from '@hookstate/persistence';

const Home: React.FC<{}> = () => {
  const user = useHookstate(globalUser);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [text, setText] = useState('');

  useEffect(() => {
    globalUser.attach(Persistence('user'));
    if (!user.email.value) location.pathname = '/about';
  }, [user]);

  return (
    <>
      <Head>
        <title>Daily Journal</title>
      </Head>
      <div className='p-4 pt-6 flex flex-col gap-4'>
        <div>
          <DatePicker label='Date of Entry' value={date} onChange={setDate} />
        </div>
        <Quill value={text} onChange={setText} />
      </div>
    </>
  );
};

export default Home;
