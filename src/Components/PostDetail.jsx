import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSinglePost, likePost, addComment } from "../api";
import { fetchUserData } from "../api";
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import moment from "moment"; // For timestamp formatting

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [userLiked, setUserLiked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCommenting, setIsCommenting] = useState(false); // For comment submission loading state

  // Fetch the current user's data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await fetchUserData();
        setCurrentUser(user);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch the post and check if the current user has liked it
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await getSinglePost(id);
        console.log("Fetched post:", response);
        setPost(response);

        if (currentUser) {
          const isLiked = response.likes.some(
            (like) => like._id === currentUser._id
          );
          setUserLiked(isLiked);
        }

        setError("");
      } catch (err) {
        setError("Failed to load post");
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchPost();
    }
  }, [id, currentUser]);

  const handleLike = async () => {
    try {
      const updatedPost = await likePost(id);
      setPost(updatedPost);

      if (currentUser) {
        const isLiked = updatedPost.likes.some(
          (like) => like._id === currentUser._id
        );
        setUserLiked(isLiked);
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsCommenting(true);
    try {
      const updatedPost = await addComment(id, commentText);
      setPost(updatedPost);
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsCommenting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading post...
      </div>
    );
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (!post) return <div className="text-center p-8">Post not found</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header with Back Button */}
        <div className="p-4 border-b dark:border-gray-700 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </button>
          <h2 className="text-xl font-bold ml-2 dark:text-white">Post</h2>
        </div>

        {/* Post Content */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-700 dark:text-gray-300">
                {post.user?.username?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="ml-3">
              <h3 className="font-semibold dark:text-white">
                {post.user?.username || "Unknown author"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {moment(post.createdAt).fromNow()}
              </p>
            </div>
          </div>

          <p className="text-gray-800 dark:text-gray-200 mb-6">
            {post.content}
          </p>

          {/* Like and Comment Buttons */}
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleLike}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-red-500"
            >
              {userLiked ? (
                <HeartIconSolid className="h-6 w-6 text-red-500" />
              ) : (
                <HeartIcon className="h-6 w-6" />
              )}
              <span className="ml-1">{post.likes?.length || 0}</span>
            </button>
            <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-500">
              <ChatBubbleOvalLeftIcon className="h-6 w-6" />
              <span className="ml-1">{post.comments?.length || 0}</span>
            </button>
          </div>

          {/* Comment Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Comments
            </h3>
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg mb-2 dark:bg-gray-800 dark:text-white"
                rows="3"
              />
              <button
                type="submit"
                disabled={isCommenting}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isCommenting ? "Submitting..." : "Submit Comment"}
              </button>
            </form>

            {post.comments?.map((comment, index) => (
              <div key={index} className="mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-700 dark:text-gray-300">
                      {comment.user?.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="ml-3">
                    <span className="font-medium dark:text-white">
                      {comment.user?.username || "Unknown user"}
                    </span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {comment.text}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 ml-11">
                  {moment(comment.createdAt).fromNow()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
