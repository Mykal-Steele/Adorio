import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { environment } from '../config/environment.js';
import ApiError from './ApiError.js';

const { accountId, accessKeyId, secretAccessKey, bucket, publicUrl } = environment.r2;

export const r2Configured = Boolean(accountId && accessKeyId && secretAccessKey && bucket);

// R2's S3 API is region-agnostic ("auto"). The explicit checksum settings stop
// @aws-sdk v3 from scripting x-amz-checksum-* into a presigned PUT — a browser
// PUT can't compute those headers, so the signature would never match.
const client = r2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    })
  : null;

const requireClient = () => {
  if (!client) throw ApiError.internalServerError('File hosting is not configured');
  return client;
};

export const createUploadUrl = ({ key, contentType, expiresIn = 3600 }) => {
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  return getSignedUrl(requireClient(), command, { expiresIn });
};

export const headObject = (key) =>
  requireClient().send(new HeadObjectCommand({ Bucket: bucket, Key: key }));

export const deleteObject = (key) =>
  requireClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

export const publicUrlFor = (key) => `${publicUrl}/${key}`;
