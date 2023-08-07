import { useHotkeys } from '@mantine/hooks';
import { Modal } from '@richardx/components';
import React from 'react';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';

export interface MediaDialogState {
  open: boolean;
  index: number;
}

export interface MediaDialogFile {
  url: string;
  type: 'image' | 'video';
  uploaded?: boolean;
  driveId?: string;
}

const MediaDialog: React.FC<{
  state: MediaDialogState;
  setState: (v: MediaDialogState) => void;
  files: MediaDialogFile[];
  setFiles?: (v: MediaDialogFile[]) => void;
}> = ({ state, setState, files, setFiles }) => {
  const backMediaDialog = () => {
    const newIndex = (state.index + files.length - 1) % files.length;
    setState({
      open: true,
      index: newIndex,
    });
  };

  const nextMediaDialog = () => {
    const newIndex = (state.index + 1) % files.length;
    setState({
      open: true,
      index: newIndex,
    });
  };

  const deleteFile = () => {
    if (!setFiles) return;
    if (state.index === files.length - 1) {
      if (!state.index) setState({ ...state, open: false });
      else setState({ ...state, index: state.index - 1 });
    }
    setFiles(files.filter((_, i) => i !== state.index));
  };

  useHotkeys([
    ['ArrowLeft', () => state.open && backMediaDialog()],
    ['ArrowRight', () => state.open && nextMediaDialog()],
  ]);

  return (
    <Modal
      open={state.open}
      setOpen={(open) => setState({ ...state, open })}
      actions={
        <div className='flex justify-between w-full'>
          <button className='btn btn-ghost' onClick={backMediaDialog}>
            <AiOutlineLeft />
            Back
          </button>
          {files[state.index]?.uploaded !== undefined && (
            <button className='btn btn-error' onClick={deleteFile}>
              Delete
            </button>
          )}
          <button className='btn btn-ghost' onClick={nextMediaDialog}>
            Next
            <AiOutlineRight />
          </button>
        </div>
      }
    >
      <div className='flex justify-center max-h-[calc(100vh-13rem)] relative'>
        {files[state.index]?.type === 'image' ? (
          <img
            src={files[state.index]?.url}
            alt='image'
            className='object-contain rounded-md max-h-[calc(100vh-13rem)]'
          />
        ) : (
          <video
            src={files[state.index]?.url}
            className='rounded-md'
            controls
            autoPlay
          />
        )}
        {files[state.index]?.uploaded && (
          <span className='badge absolute top-0 right-0 bg-green-500 text-white'>
            Uploaded
          </span>
        )}
      </div>
    </Modal>
  );
};

export default MediaDialog;
