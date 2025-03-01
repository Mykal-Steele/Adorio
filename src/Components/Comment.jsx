// src/components/Comment.jsx
import React from "react";

const Comment = ({ username, commentText }) => {
  return (
    <div className="bg-gray-100 p-3 rounded-md mb-3">
      <div className="font-semibold">{username}</div>
      <p className="text-gray-700">{commentText}</p>
    </div>
  );
};

export default Comment;
