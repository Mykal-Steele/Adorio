// src/components/PostCard.jsx
import React from 'react';

const PostCard = ({ title, content, author }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{content}</p>
      <div className="text-gray-400 text-sm">Posted by {author}</div>
    </div>
  );
};

export default PostCard;
