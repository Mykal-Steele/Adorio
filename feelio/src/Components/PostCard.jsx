//feelio\src\Components\PostCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const PostCard = ({ id, title, content, author, likes, comments }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/posts/${id}`);
  };

  return (
    <div
      className="bg-white shadow-md rounded-lg p-6 mb-6 transition-transform hover:scale-[1.01] cursor-pointer"
      onClick={handleClick}
    >
      <h3 className="text-2xl font-bold mb-2 text-gray-800 line-clamp-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-4 line-clamp-3">{content}</p>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-500">
        <div className="flex items-center">
          <span className="font-medium">Posted by </span>
          <span
            className="ml-1 text-gray-700 font-semibold truncate max-w-[150px]"
            title={author}
          >
            {author}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="mr-1">❤️</span>
            <span>{likes?.length || 0}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">💬</span>
            <span>{comments?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
