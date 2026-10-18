import API, { request } from './index';

export const MAX_HOSTED_FILE_BYTES = 100 * 1024 * 1024;

export type HostedFile = {
  _id: string;
  slug: string;
  originalFilename: string;
  contentType: string;
  size: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  userId?: { username: string; email: string } | string;
};

type PresignResponse = { slug: string; uploadUrl: string; publicUrl: string };

export type HostedUsage = {
  usedBytes: number;
  limitBytes: number;
  remainingBytes: number;
  turnstileSiteKey: string | null;
};

export const presignHostedUpload = (
  filename: string,
  contentType: string,
  size: number,
  turnstileToken?: string,
): Promise<PresignResponse> =>
  request(API.post('/hosted/presign', { filename, contentType, size, turnstileToken }));

export const confirmHostedUpload = (slug: string): Promise<HostedFile> =>
  request(API.post('/hosted/confirm', { slug }));

export const getMyHostedFiles = (): Promise<HostedFile[]> => request(API.get('/hosted'));

export const getHostedUsage = (): Promise<HostedUsage> => request(API.get('/hosted/usage'));

export const deleteHostedFile = (slug: string): Promise<void> =>
  request(API.delete(`/hosted/${slug}`));

export const getAllHostedFilesAdmin = (): Promise<HostedFile[]> => request(API.get('/hosted/all'));
