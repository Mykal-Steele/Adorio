// feelio/src/components/PostEditor.jsx
import React, { useState } from "react";
import ReactQuill from "react-quill";
import { useCreatePost } from "../hooks/usePosts";
import ImageUploader from "./ImageUploader";
import Modal from "./Modal";

const PostEditor = ({ isOpen, onClose }) => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const { mutate: createPost } = useCreatePost();

  const handleSubmit = () => {
    createPost({ title, content, tags: tags.split(","), image });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Post">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
        />

        <ImageUploader image={image} setImage={setImage} />

        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={{
            toolbar: [
              ["bold", "italic", "underline"],
              ["blockquote", "code-block"],
              [{ header: 1 }, { header: 2 }],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link", "image"],
              ["clean"],
            ],
          }}
          className="h-48 mb-4 dark:text-white"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Publish
        </button>
      </div>
    </Modal>
  );
};

export default PostEditor;
