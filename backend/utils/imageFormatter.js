import cloudinary from '../config/cloudinary.js';

const cloudinaryConfig = cloudinary?.v2?.config?.() || {};
const cloudinaryReady = Boolean(cloudinaryConfig.cloud_name);

const DISPLAY_TRANSFORMATION = [
  { width: 1200, height: 1200, crop: 'limit' },
  { fetch_format: 'auto' },
  { quality: 'auto:good' },
];

const THUMBNAIL_TRANSFORMATION = [
  { width: 480, height: 480, crop: 'fill', gravity: 'auto' },
  { fetch_format: 'auto' },
  { quality: 'auto:eco' },
];

const toIsoString = (value) => {
  if (!value) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const ensureNumber = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const number = Number(value);
  return Number.isNaN(number) ? undefined : number;
};

const parseVersionFromUrl = (url) => {
  if (typeof url !== 'string') {
    return undefined;
  }

  const versionMatch = url.match(/\/v(\d+)\//);
  return versionMatch ? ensureNumber(versionMatch[1]) : undefined;
};

const derivePublicIdFromUrl = (url) => {
  if (typeof url !== 'string') {
    return undefined;
  }

  const uploadSegment = '/image/upload/';
  const uploadIndex = url.indexOf(uploadSegment);
  if (uploadIndex === -1) {
    return undefined;
  }

  const pathAfterUpload = url.slice(uploadIndex + uploadSegment.length);
  const withoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
  return withoutVersion.replace(/\.[^/.]+$/, '');
};

const buildCloudinaryUrl = (publicId, version, transformation) => {
  if (!cloudinaryReady || !publicId) {
    return undefined;
  }

  const options = { secure: true };

  if (version) {
    options.version = version;
  }

  if (transformation) {
    options.transformation = transformation;
  }

  try {
    return cloudinary.v2.url(publicId, options);
  } catch (error) {
    return undefined;
  }
};

const normalizePublicId = (image) =>
  image?.publicId ||
  image?.public_id ||
  derivePublicIdFromUrl(
    image?.secureUrl || image?.secure_url || image?.url || image?.path
  );

const resolveBaseUrl = (image) =>
  image?.secureUrl || image?.secure_url || image?.url || image?.path;

const resolveVersion = (image) =>
  ensureNumber(
    image?.version ||
      image?.versionId ||
      image?.version_id ||
      parseVersionFromUrl(resolveBaseUrl(image))
  );

const resolveOptimizedUrl = (publicId, version, fallbackUrl) =>
  buildCloudinaryUrl(publicId, version, DISPLAY_TRANSFORMATION) || fallbackUrl;

const resolveThumbnailUrl = (publicId, version, fallbackUrl) =>
  buildCloudinaryUrl(publicId, version, THUMBNAIL_TRANSFORMATION) ||
  fallbackUrl;

export const extractUploadedImageMetadata = (file) => {
  if (!file) {
    return null;
  }

  const version =
    ensureNumber(file.version) ||
    parseVersionFromUrl(file.secure_url || file.path || file.url);

  return {
    assetId: file.asset_id,
    publicId: file.public_id || file.filename,
    version,
    signature: file.signature,
    format: file.format,
    resourceType: file.resource_type,
    type: file.type,
    bytes: ensureNumber(file.bytes),
    width: ensureNumber(file.width),
    height: ensureNumber(file.height),
    secureUrl: file.secure_url || file.path || file.url,
    url: file.secure_url || file.path || file.url,
    thumbnailUrl: undefined,
    originalFilename: file.originalname,
    createdAt: file.created_at ? new Date(file.created_at) : new Date(),
  };
};

export const formatImageForResponse = (image) => {
  if (!image) {
    return null;
  }

  const publicId = normalizePublicId(image);
  const baseUrl = resolveBaseUrl(image);

  if (!publicId && !baseUrl) {
    return null;
  }

  const version = resolveVersion(image);
  const secureUrl = baseUrl || buildCloudinaryUrl(publicId, version);
  const optimizedUrl = resolveOptimizedUrl(publicId, version, secureUrl);
  const thumbnailUrl = resolveThumbnailUrl(publicId, version, optimizedUrl);

  return {
    assetId: image.assetId || image.asset_id,
    publicId,
    version,
    format: image.format,
    resourceType: image.resourceType || image.resource_type,
    type: image.type,
    bytes: ensureNumber(image.bytes),
    width: ensureNumber(image.width),
    height: ensureNumber(image.height),
    url: optimizedUrl || secureUrl,
    secureUrl: secureUrl || optimizedUrl,
    thumbnailUrl,
    originalFilename: image.originalFilename || image.original_filename,
    createdAt: toIsoString(image.createdAt || image.created_at),
  };
};

export const normalizeExistingImage = (image) => {
  const formatted = formatImageForResponse(image);
  return (
    formatted || (resolveBaseUrl(image) ? { url: resolveBaseUrl(image) } : null)
  );
};
