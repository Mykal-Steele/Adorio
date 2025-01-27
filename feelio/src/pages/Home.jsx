import React, { useEffect, useState } from "react";
import { getPosts } from "../api";
import PostCard from "../Components/PostCard";

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await getPosts();
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Home</h1>
        <div className="max-w-2xl mx-auto">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              title={post.title}
              content={post.content}
              author={post.user?.username || "Unknown"}
              likes={post.likes}
              comments={post.comments}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;