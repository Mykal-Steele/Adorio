import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getPosts } from "../api";
import PostCard from "../Components/PostCard";

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await getPosts();
        console.log("Response from getPosts:", response); // Log the entire response

        // Check if the response is an array
        if (Array.isArray(response)) {
          // Filter posts by the current user's ID
          const userPosts = response.filter(
            (post) => post.user?._id === user?._id
          );
          setPosts(userPosts);
        } else {
          console.error("Invalid response format or empty data:", response);
          setPosts([]); // Set posts to an empty array if the response is invalid
        }
      } catch (err) {
        console.error("Error fetching user posts:", err);
        setPosts([]); // Set posts to an empty array in case of an error
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user]);

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-md mx-auto p-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
            {user?.username}'s Profile
          </h1>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <svg
                className="animate-spin h-8 w-8 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
              >
                <PostCard
                  title={post.title}
                  content={post.content}
                  author={post.user?.username || "Unknown"}
                  likes={post.likes}
                  comments={post.comments}
                />
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
              <p className="text-gray-600">No posts found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
