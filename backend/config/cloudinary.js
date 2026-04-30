import cloudinary from 'cloudinary';
import { environment, isProduction } from './environment.js';
import ApiError from '../utils/ApiError.js';

const validateCloudinaryConfig = () => {
  const { name, key, secret } = environment.cloudinary;

  if (!name || !key || !secret) {
    const message = 'Cloudinary credentials are missing';
    if (isProduction) {
      throw ApiError.internalServerError(message);
    }
    console.warn(`${message}. Image uploads will be disabled.`);
    return false;
  }

  return true;
};

const configureCloudinary = () => {
  if (!validateCloudinaryConfig()) {
    return;
  }

  cloudinary.v2.config({
    cloud_name: environment.cloudinary.name,
    api_key: environment.cloudinary.key,
    api_secret: environment.cloudinary.secret,
  });
};

configureCloudinary();

export { configureCloudinary };
export default cloudinary;
