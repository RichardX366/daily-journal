import { FileInput, FileInputProps } from './FileInput';
import React, { FC, useState } from 'react';
import { error } from '@/helpers/notification';
import type Compressor from 'compressorjs';
import { formatFileSize } from '@/helpers/format';

export interface MediaFile {
  blob: Blob;
  url: string;
}

export interface ImageInputProps
  extends Omit<FileInputProps, 'onChange' | 'icon'> {
  onChange: ((file: MediaFile[]) => any) | ((file: MediaFile) => any);
  dimensions?: 'round' | { width: number; height: number };
}

const compressImage = (
  file: File,
  options?: Compressor.Options,
): Promise<Blob> =>
  new Promise(
    async (res, rej) =>
      new (await import('compressorjs')).default(file, {
        ...options,
        quality: 0.5,
        strict: false,
        resize: 'cover',
        success: res as (file: Blob) => void,
        error: rej,
      }),
  );

const compressGif = async (
  file: File,
  size?: { width: number; height: number },
): Promise<Blob> => {
  // @ts-ignore
  const gifsicle = (await import('gifsicle-wasm-browser')).default;
  const url = URL.createObjectURL(file);
  const result = await gifsicle.run({
    input: [
      {
        file: url,
        name: '1.gif',
      },
    ],
    command: [
      `${
        size ? '--resize-touch ' + `${size.width}x${size.height}` : ''
      } --lossy=500 -O3 1.gif -o /out/out.gif`,
    ],
  });
  URL.revokeObjectURL(url);
  return result[0];
};

const compressHeic = async (file: File): Promise<Blob> => {
  const result = await (
    await import('heic2any')
  ).default({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.5,
  });
  return result as Blob;
};

export const MediaInput: FC<ImageInputProps> = (props) => {
  const [urls, setUrls] = useState<string[]>([]);

  return (
    <FileInput
      {...props}
      maxSize={undefined}
      accept='image/*,video/*,image/heic,image/heic-image'
      onChange={async (files: FileList) => {
        if (files instanceof File) files = [files] as any;
        if (files.length) {
          const newFiles = await Promise.all(
            Array.from(files).map(async (file) => {
              let newFile = file as Blob;
              if (file.type === 'image/gif') {
                newFile = await compressGif(
                  file,
                  props.dimensions === 'round'
                    ? { width: 512, height: 512 }
                    : props.dimensions,
                );
              } else if (file.type.includes('image/heic')) {
                newFile = await compressHeic(file);
              } else if (file.type.includes('image')) {
                newFile = await compressImage(
                  file,
                  props.dimensions === 'round'
                    ? {
                        width: 512,
                        height: 512,
                      }
                    : props.dimensions,
                );
              } else {
                newFile = file;
              }
              if (newFile.size > file.size) newFile = file;
              if (props.maxSize && newFile && newFile.size > props.maxSize) {
                error(
                  `This file is too large. The maximum size is ${formatFileSize(
                    props.maxSize,
                  )}`,
                );
                return;
              }
              return newFile;
            }),
          );
          if (newFiles.find((file) => !file)) return;
          urls.forEach((url) => URL.revokeObjectURL(url));
          const newValue: MediaFile[] = newFiles.map((file) => ({
            blob: file as Blob,
            url: URL.createObjectURL(file as Blob),
          }));
          setUrls(newValue.map(({ url }) => url));
          if (!props.multiple) {
            return props.onChange(newValue[0] as any);
          }
          props.onChange(newValue as any);
        }
      }}
    />
  );
};

export default MediaInput;
