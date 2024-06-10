import { googlePhotos } from './ky';

export const searchPhotos = async ({
  pageToken,
  date,
}: {
  pageToken?: string;
  date?: string;
}) => {
  const body: any = {
    pageSize: 100,
  };
  if (pageToken) body.pageToken = pageToken;
  if (date) {
    const [year, month, day] = date.split('-');
    body.filters = {
      dateFilter: {
        dates: [
          {
            day,
            month,
            year,
          },
        ],
      },
    };
  }
  const photos = await googlePhotos
    .post('mediaItems:search', {
      json: body,
    })
    .json<any>();
  if (!photos) return;
  return photos;
};

export const getPhotos = async (ids: string[]) => {
  const batches = new Array(Math.ceil(ids.length / 50))
    .fill(0)
    .map((_, i) => ids.slice(i * 50, (i + 1) * 50));
  const requests = await Promise.all(
    batches.map((batch) =>
      googlePhotos
        .get('mediaItems:batchGet', {
          searchParams: batch.map((id) => ['mediaItemIds', id]),
        })
        .json<any>(),
    ),
  );
  if (
    requests.findIndex((request) => !request?.mediaItemResults?.length) !== -1
  ) {
    return;
  }
  return requests
    .map((request) =>
      request.mediaItemResults.map(({ mediaItem }: any) => mediaItem),
    )
    .flat();
};
