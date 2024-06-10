import { searchPhotos } from '@/helpers/photos';
import { Input, Modal, dateInput, wordDate } from '@richardx/components';
import React, { useEffect, useState } from 'react';
import { BsCheck } from 'react-icons/bs';
import InfiniteScroll from 'react-infinite-scroller';

export interface MediaFile {
  id: string;
  url: string;
  date: string;
  type: 'image' | 'video';
}

const PhotoSelect: React.FC<{
  onUpload: (selected: MediaFile[]) => void | Promise<void>;
  disabled?: boolean;
  initialDate?: string;
}> = ({ onUpload, disabled, initialDate }) => {
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<MediaFile[]>([]);
  const [date, setDate] = useState(initialDate || dateInput(new Date()));
  const [selected, setSelected] = useState<string[]>([]);
  const [nextPageToken, setNextPageToken] = useState('');

  const loadMore = async () => {
    const results = await searchPhotos({ date, pageToken: nextPageToken });
    if (!results) return;
    setPhotos(
      photos.concat(
        results.mediaItems?.map((item: any) => ({
          id: item.id,
          url: item.baseUrl,
          date: dateInput(item.mediaMetadata.creationTime),
          type: item.mimeType.startsWith('image') ? 'image' : 'video',
        })),
      ),
    );
    setNextPageToken(results.nextPageToken || '');
  };

  useEffect(() => {
    (async () => {
      const results = await searchPhotos({ date });
      if (!results) return;
      setSelected([]);
      setPhotos(
        results.mediaItems?.map((item: any) => ({
          id: item.id,
          url: item.baseUrl,
          date: dateInput(item.mediaMetadata.creationTime),
          type: item.mimeType.startsWith('image') ? 'image' : 'video',
        })) || [],
      );
      setNextPageToken(results.nextPageToken || '');
    })();
  }, [date]);

  useEffect(() => {
    if (initialDate && date !== initialDate) setDate(initialDate);
  }, [initialDate]);

  const displayPhotos = () => {
    const dates = photos.reduce((acc, photo) => {
      if (!acc.includes(photo.date)) acc.push(photo.date);
      return acc;
    }, [] as string[]);

    return dates.length ? (
      <div className='overflow-y-auto max-h-[calc(100vh-25em)] mt-4'>
        <InfiniteScroll
          loadMore={loadMore}
          hasMore={!!nextPageToken}
          loader={
            <div className='w-full flex justify-center pt-4'>
              <span className='loading loading-spinner w-10 h-10' />
            </div>
          }
          useWindow={false}
        >
          {dates.map((date) => (
            <div key={date}>
              <p
                className='text-2xl mt-4 cursor-pointer'
                onClick={() => {
                  const currentPhotos = photos
                    .filter((photo) => photo.date === date)
                    .map(({ id }) => id);
                  const allSelected =
                    currentPhotos.findIndex((id) => !selected.includes(id)) ===
                    -1;
                  if (allSelected) {
                    setSelected(
                      selected.filter((id) => !currentPhotos.includes(id)),
                    );
                  } else {
                    setSelected([
                      ...selected,
                      ...currentPhotos.filter((id) => !selected.includes(id)),
                    ]);
                  }
                }}
              >
                {wordDate(date)}
              </p>
              {
                <div className='grid grid-cols-2 md:grid-cols-6 gap-4 mt-4'>
                  {photos
                    .filter((photo) => photo.date === date)
                    .map((photo) => (
                      <div key={photo.id} className='relative'>
                        <img
                          src={photo.url}
                          alt='Image'
                          className='w-full aspect-square object-cover'
                        />
                        <div
                          className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer transition-opacity ${
                            selected.includes(photo.id)
                              ? 'opacity-100'
                              : 'opacity-0'
                          }`}
                          onClick={() => {
                            if (selected.includes(photo.id)) {
                              setSelected(
                                selected.filter((id) => id !== photo.id),
                              );
                            } else {
                              setSelected([...selected, photo.id]);
                            }
                          }}
                        >
                          <BsCheck className='text-white w-8 h-8' />
                          Selected
                        </div>
                      </div>
                    ))}
                </div>
              }
            </div>
          ))}
        </InfiniteScroll>
      </div>
    ) : (
      <p className='text-center mt-4 text-lg'>
        There are no photos from this day!
      </p>
    );
  };

  return (
    <>
      <button
        className='btn btn-success'
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        Upload Media
      </button>
      <Modal
        open={open}
        setOpen={setOpen}
        actions={
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
            <button className='btn btn-neutral' onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button
              className='btn btn-info'
              onClick={() => {
                setOpen(false);
                setSelected([]);
                onUpload(photos.filter(({ id }) => selected.includes(id)));
              }}
            >
              Upload
            </button>
          </div>
        }
        title='Upload Images/Videos'
      >
        <Input
          onChange={setDate}
          value={date}
          type='date'
          max={dateInput(new Date())}
          label='Date'
        />
        {displayPhotos()}
        <p className='text-center mt-4 text-lg font-medium'>
          {selected.length} Selected
        </p>
      </Modal>
    </>
  );
};

export default PhotoSelect;
