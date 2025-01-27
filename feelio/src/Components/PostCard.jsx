import React from "react";

const PostCard = ({ title, content, author, likes, comments }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h3 className="text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-700 mb-4">{content}</p>
      <div className="text-gray-500 text-sm mb-2">Posted by {author}</div>
      <div className="flex space-x-4 text-sm text-gray-600">
        <span>{likes.length} Likes</span>
        <span>{comments.length} Comments</span>
      </div>
    </div>
  );
};

export default PostCard;