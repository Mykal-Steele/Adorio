import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSinglePost, likePost, addComment } from "../api";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await getSinglePost(id); // Fetch the post
        console.log("Fetched post:", response);
        setPost(response);
        setError("");
      } catch (err) {
        setError("Failed to load post");
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleLike = async () => {
    try {
      const updatedPost = await likePost(id); // Like/unlike the post
      setPost(updatedPost); // Update the post state
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    console.log("Submitting comment:", commentText);

    try {
      const updatedPost = await addComment(id, commentText);
      setPost(updatedPost);
      setCommentText(""); // Clear the comment input
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  if (loading) return <div className="text-center p-8">Loading post...</div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (!post) return <div className="text-center p-8">Post not found</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">{post.title}</h2>
        <p className="text-gray-600 mb-6">{post.content}</p>

        <div className="text-sm text-gray-500 mb-6">
          <span className="font-medium">Posted by </span>
          <span className="text-gray-700 font-semibold">
            {post.user?.username || "Unknown author"}
          </span>

          {/* Like Button */}
          <div className="flex items-center mt-4">
            <button
              onClick={handleLike}
              className="flex items-center text-gray-600 hover:text-red-500"
            >
              <span className="mr-1">❤️</span>
              <span>{post.likes?.length || 0} Likes</span>
            </button>
          </div>

          {/* Comment Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Comments</h3>
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                rows="3"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Submit Comment
              </button>
            </form>

            {post.comments?.map((comment, index) => (
              <div key={index} className="mb-4">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">
                    {comment.user?.username || "Unknown user"}
                  </span>
                  <span className="ml-2">{comment.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
