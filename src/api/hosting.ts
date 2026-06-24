import API, { request } from './index';

export type HostedFile = {
  _id: string;
  slug: string;
  originalFilename: string;
  size: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  userId?: { username: string; email: string } | string;
};

export const uploadHostedFile = (filename: string, content: string): Promise<HostedFile> =>
  request(API.post('/hosted', { filename, content }));

export const getMyHostedFiles = (): Promise<HostedFile[]> => request(API.get('/hosted'));

export const deleteHostedFile = (slug: string): Promise<void> =>
  request(API.delete(`/hosted/${slug}`));

export const getAllHostedFilesAdmin = (): Promise<HostedFile[]> => request(API.get('/hosted/all'));
