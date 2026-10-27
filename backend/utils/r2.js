import {
  S3Client,
  CopyObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { environment } from '../config/environment.js';
import ApiError from './ApiError.js';

const { accountId, accessKeyId, secretAccessKey, bucket, publicUrl } = environment.r2;

// The public URL counts too: without it a served file would redirect to "undefined/key"
export const r2Configured = Boolean(
  accountId && accessKeyId && secretAccessKey && bucket && publicUrl,
);

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

// 409, not 500: the Cloudflare failover worker reads two 5xx in a row as the backend
// being down, and a host without R2 keys (like the Northflank copy) answers this every time.
const requireClient = () => {
  if (!client) {
    throw ApiError.conflict('File hosting is not set up on this server.', {
      code: 'HOSTING_NOT_CONFIGURED',
    });
  }
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

// Cloudflare caches files.adorio.space, and an object without Cache-Control is kept at the
// edge for two hours, so a deleted file would stay downloadable that long. Copying the
// object onto itself is how S3 (and R2) change an object's headers after upload. Keys are
// h/<slug>.<ext> with a [a-z0-9-] slug, so they need no escaping in CopySource.
export const OBJECT_CACHE_CONTROL = 'public, max-age=60';

export const setObjectCacheControl = (key, contentType) =>
  requireClient().send(
    new CopyObjectCommand({
      Bucket: bucket,
      Key: key,
      CopySource: `${bucket}/${key}`,
      MetadataDirective: 'REPLACE',
      ContentType: contentType,
      CacheControl: OBJECT_CACHE_CONTROL,
    }),
  );

export const publicUrlFor = (key) => `${publicUrl}/${key}`;
