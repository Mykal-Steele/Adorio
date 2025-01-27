import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getPosts } from "../api";
import PostCard from "../Components/PostCard";

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await getPosts();
        setPosts(response.data.filter((post) => post.user._id === user._id));
      } catch (err) {
        console.error("Error fetching user posts:", err);
      }
    };
    fetchUserPosts();
  }, [user]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{user?.username}'s Profile</h1>
      <div>
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post._id}
              title={post.title}
              content={post.content}
              author={post.user.username}
              likes={post.likes}
              comments={post.comments}
            />
          ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;