import { PermMedia } from '@mui/icons-material';
import { useId } from '@mantine/hooks';
import classNames from 'classnames';
import React, { FC, useState } from 'react';
import { formatFileSize } from '@/helpers/format';

export interface FileInputProps {
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  maxSize?: number; // Per file in bytes
  types?: string[];
  accept?: string;
  onChange:
    | ((v: File) => void | Promise<void>)
    | ((v: FileList) => void | Promise<void>);
  icon?: FC;
}

export const FileInput: FC<FileInputProps> = ({
  label,
  description,
  placeholder = 'abc.jpg',
  disabled,
  required,
  multiple,
  maxSize,
  types,
  accept,
  onChange,
  icon = PermMedia,
}) => {
  const id = useId();
  const [fileName, setFileName] = useState<string | string[]>('');
  const [error, setError] = useState('');
  const Icon = icon;
  return (
    <div className='select-none min-w-[230px] flex-1'>
      <input
        className='hidden'
        type='file'
        id={id}
        required={required}
        accept={accept}
        onChange={(e) => {
          if (
            maxSize &&
            e.target.files &&
            Array.from(e.target.files).find(({ size }) => size > maxSize)
          ) {
            e.target.value = '';
            return setError(
              `${
                multiple ? 'All of your files' : 'Your file'
              } size must be under ${formatFileSize(maxSize)}`,
            );
          }
          if (
            types &&
            e.target.files &&
            Array.from(e.target.files).find(({ type }) => !types.includes(type))
          ) {
            e.target.value = '';
            return setError(
              `${
                multiple ? 'All of your files' : 'Your file'
              } must be of the following types: ${types.join(', ')}`,
            );
          }

          if (e.target.files?.length) {
            setFileName(
              multiple
                ? Array.from(e.target.files).map((file) => file.name)
                : e.target.files[0].name,
            );
            if (multiple) onChange(e.target.files as any);
            else onChange(e.target.files[0] as any);
            setError('');
            e.target.value = '';
          }
        }}
        multiple={multiple}
      />
      <label
        htmlFor={disabled ? undefined : id}
        className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      >
        <div
          className={classNames(
            'relative flex gap-2 p-[15px] shadow-sm sm:text-sm border border-black/[.23] dark:border-gray-600 dark:hover:border-white hover:border-black rounded-md',
            { 'bg-gray-100': disabled },
          )}
        >
          {label && (
            <p className='absolute block text-xs dark:text-white/70 text-black/60 -top-3 left-2 clip-contain before:w-full before:h-full before:-z-10 before:fixed before:inset-0 before:bg-gradient-to-br before:dark:from-gray-800 before:dark:to-purple-950 before:from-blue-50 before:to-blue-200 p-1'>
              {label}
              <span className='text-red-500'>{required && ' *'}</span>
            </p>
          )}
          <Icon className='w-5 text-gray-500 dark:text-white' />
          {(typeof fileName === 'string' ? (
            fileName
          ) : (
            <span className='truncate'>
              {fileName.length} Files: {fileName.join(', ')}
            </span>
          )) || <span className='text-gray-400'>{placeholder}</span>}
        </div>
        {(description || maxSize || types) && (
          <p className='text-gray-500 text-xs font-normal mb-1'>
            {description}{' '}
            {maxSize || types
              ? `(${maxSize ? `Must be under ${formatFileSize(maxSize)}` : ''}${
                  maxSize && types ? ' and ' : ''
                }${
                  types
                    ? (maxSize ? 'm' : 'M') +
                      `ust be of the following types: ${types.join(', ')}`
                    : ''
                })`
              : ''}
          </p>
        )}
      </label>
      {error && <p className='mt-2 text-red-600 text-sm'>{error}</p>}
    </div>
  );
};
