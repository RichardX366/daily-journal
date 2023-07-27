import { sanitizeHTML } from '@/helpers/sanitizeHTML';
import React from 'react';

const HTMLDisplay: React.FC<{ children: string }> = ({ children }) => {
  return (
    <div className='ql-snow ql-container' style={{ borderStyle: 'none' }}>
      <div
        className='ql-editor'
        dangerouslySetInnerHTML={{
          __html: sanitizeHTML(children),
        }}
        style={{ minHeight: '0px', padding: '0px' }}
      ></div>
    </div>
  );
};

export default HTMLDisplay;
