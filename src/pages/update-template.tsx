import Quill from '@/components/Quill';
import { searchFiles, updateFile } from '@/helpers/drive';
import { globalTemplate, globalUser } from '@/helpers/state';
import { Persistence } from '@hookstate/persistence';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const UpdateTemplate: React.FC = () => {
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const router = useRouter();

  const save = async () => {
    setSaving(true);
    const result = await updateFile(
      templateId,
      new Blob([text], { type: 'text/html' }),
    );
    if (!result) return;
    globalTemplate.set(text);
    router.push('/');
  };

  useEffect(() => {
    globalUser.attach(Persistence('user'));
    if (!globalUser.email.value) {
      router.push('/about');
      return;
    }
    globalTemplate.attach(Persistence('template'));
    setText(globalTemplate.value);

    searchFiles([{ name: 'template.html', mimeType: 'text/html' }]).then(
      async (files) => {
        if (!files || !files.length) return;
        setTemplateId(files[0].id);
      },
    );
  }, []);

  return (
    <>
      <Head>
        <title>Update Template | Daily Journal</title>
      </Head>

      <div className='flex flex-col md:flex-row justify-between gap-4'>
        <h1 className='text-4xl text-center md:text-left'>Update Template</h1>
        <button className='btn btn-info' onClick={save} disabled={saving}>
          Save {saving && <span className='loading loading-spinner ml-2' />}
        </button>
      </div>
      <Quill value={text} onChange={setText} />
    </>
  );
};

export default UpdateTemplate;
