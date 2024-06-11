import { useHotkeys } from '@mantine/hooks';
import { Modal } from '@richardx/components';
import React, { useState } from 'react';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { MediaFile } from './PhotoSelect';

export interface MediaDialogState {
  open: boolean;
  index: number;
}

const MediaDialog: React.FC<{
  state: MediaDialogState;
  setState: (v: MediaDialogState) => void;
  files: MediaFile[];
  setFiles?: (v: MediaFile[]) => void;
  drive?: boolean;
}> = ({ state, setState, files, setFiles, drive }) => {
  const [hd, setHD] = useState(false);

  const backMediaDialog = () => {
    setState({
      open: true,
      index: state.index - 1,
    });
    setHD(false);
  };

  const nextMediaDialog = () => {
    setState({
      open: true,
      index: state.index + 1,
    });
    setHD(false);
  };

  const deleteFile = () => {
    if (!setFiles) return;
    if (state.index === files.length - 1) {
      if (!state.index) {
        setState({ ...state, open: false });
        setTimeout(() => {
          setHD(false);
          setFiles(files.filter((_, i) => i !== state.index));
        }, 200);
        return;
      } else setState({ ...state, index: state.index - 1 });
    }
    setHD(false);
    setFiles(files.filter((_, i) => i !== state.index));
  };

  useHotkeys([
    ['ArrowLeft', () => state.open && state.index !== 0 && backMediaDialog()],
    [
      'ArrowRight',
      () => state.open && state.index !== files.length - 1 && nextMediaDialog(),
    ],
  ]);

  return (
    <Modal
      open={state.open}
      setOpen={(open) => {
        setState({ ...state, open });
        setTimeout(() => setHD(false), 200);
      }}
      actions={
        <div className='flex justify-between w-full'>
          <button
            className='btn btn-ghost'
            onClick={backMediaDialog}
            disabled={state.index === 0}
          >
            <AiOutlineLeft />
            Back
          </button>
          {setFiles && (
            <button className='btn btn-error' onClick={deleteFile}>
              Delete
            </button>
          )}
          <button
            className='btn btn-ghost'
            onClick={nextMediaDialog}
            disabled={state.index === files.length - 1}
          >
            Next
            <AiOutlineRight />
          </button>
        </div>
      }
    >
      <div className='flex justify-center max-h-[calc(100vh-13rem)] relative'>
        {!drive && hd === false ? (
          <img
            src={files[state.index]?.url}
            alt='media'
            className='object-contain rounded-md max-h-[calc(100vh-13rem)] cursor-pointer'
            onClick={() => setHD(true)}
          />
        ) : files[state.index]?.type === 'image' ? (
          <img
            src={files[state.index]?.url + (drive ? '' : '=d')}
            alt='image'
            className='object-contain rounded-md max-h-[calc(100vh-13rem)]'
          />
        ) : (
          <video
            src={files[state.index]?.url + (drive ? '' : '=dv')}
            className='rounded-md'
            controls
            autoPlay
          />
        )}
      </div>
    </Modal>
  );
};

export default MediaDialog;
