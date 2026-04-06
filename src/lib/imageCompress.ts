// This file is required for next/image to work in non-Next.js projects, but is not needed for Next.js apps.
// We will use browser image compression for uploads.
import imageCompression from 'browser-image-compression';

export async function compressImage(file: File, maxSizeMB = 1, maxWidthOrHeight = 1920) {
  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
  };
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch {
    // fallback to original file if compression fails
    return file;
  }
}
