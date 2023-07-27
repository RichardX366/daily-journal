import dynamic from 'next/dynamic';
import React from 'react';

const QuillNoSSRWrapper = dynamic(import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
});

export default QuillNoSSRWrapper;
