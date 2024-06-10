import { Splide, SplideSlide } from '@splidejs/react-splide';
import React, { useEffect, useRef } from 'react';
import { MediaDialogState } from './MediaDialog';
import { MediaFile } from './PhotoSelect';

const MediaSlideshow: React.FC<{
  files: MediaFile[];
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
          <img className='h-48 rounded-md' src={file.url} alt='image' />
        </SplideSlide>
      ))}
    </Splide>
  );
};

export default MediaSlideshow;
