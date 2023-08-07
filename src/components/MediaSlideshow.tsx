import { Splide, SplideSlide } from '@splidejs/react-splide';
import React, { useEffect, useRef } from 'react';
import { MediaDialogFile, MediaDialogState } from './MediaDialog';
import { AiFillCaretRight } from 'react-icons/ai';

const MediaSlideshow: React.FC<{
  files: MediaDialogFile[];
  setState: (v: MediaDialogState) => void;
}> = ({ files, setState }) => {
  const splideRef = useRef<Splide>(null);

  useEffect(() => {
    setTimeout(() => {
      splideRef.current?.go(0);
      splideRef.current?.go('>');
      splideRef.current?.go('<');
    }, 50);
  }, [files]);

  return (
    <Splide
      options={{
        rewind: true,
        autoWidth: true,
        focus: 'center',
        wheel: true,
        start: 0,
      }}
      aria-label='Media'
      className='md:px-16 h-48'
      ref={splideRef}
    >
      {files.map((file, i) => (
        <SplideSlide
          key={file.url}
          className='px-2 relative cursor-pointer'
          onClick={() =>
            setState({
              open: true,
              index: i,
            })
          }
        >
          {file.type === 'image' ? (
            <img className='h-48 rounded-md' src={file.url} alt='image' />
          ) : (
            <>
              <video className='h-48 rounded-md' src={file.url} />
              <div className='absolute inset-0 flex justify-center items-center'>
                <AiFillCaretRight className='w-8 h-8 bg-white/30 dark:bg-black/30 rounded-full' />
              </div>
            </>
          )}
          {file.uploaded && (
            <span className='badge absolute top-0 right-2 bg-green-500 text-white rounded-md'>
              Uploaded
            </span>
          )}
        </SplideSlide>
      ))}
    </Splide>
  );
};

export default MediaSlideshow;
