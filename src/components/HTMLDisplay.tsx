import { sanitizeHTML } from '@/helpers/sanitizeHTML';
import React from 'react';

const HTMLDisplay: React.FC<{ children: string }> = ({ children }) => {
  return (
    <div
      className={children ? 'ql-snow ql-container' : 'w-full h-96 skeleton'}
      style={{ borderStyle: 'none' }}
    >
      <div
        className='ql-editor html-display'
        dangerouslySetInnerHTML={{
          __html: sanitizeHTML(children),
        }}
        style={{ minHeight: '0px', padding: '0px' }}
      ></div>
    </div>
  );
};

export default HTMLDisplay;
