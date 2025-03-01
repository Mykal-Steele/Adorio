// feelio/src/components/ImageUploader.jsx
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { XMarkIcon } from "@heroicons/react/24/outline";

const ImageUploader = ({ image, setImage }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => setImage(reader.result);
        reader.readAsDataURL(file);
      }
    },
    [setImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 1,
  });

  return (
    <div className="space-y-4">
      {image ? (
        <div className="relative group">
          <img
            src={image}
            alt="Preview"
            className="rounded-lg w-full h-64 object-cover"
          />
          <button
            onClick={() => setImage(null)}
            className="absolute top-2 right-2 p-1 bg-gray-800/50 rounded-full hover:bg-gray-800 transition-colors"
            aria-label="Remove image"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
            }`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-500 dark:text-gray-400">
            {isDragActive ? "Drop image here" : "Drag image or click to upload"}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Recommended size: 1200x800 pixels
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
