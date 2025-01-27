import React, { useEffect, useState } from 'react';
import { getPosts } from '../api'; // Import the API function

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Fetch posts when the component mounts
    const fetchPosts = async () => {
      try {
        const response = await getPosts(); // Make the API call to fetch posts
        setPosts(response.data); // Store the posts in state
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []); // Empty dependency array to run only on mount

  return (
    <div>
      <h1>Home</h1>
      <div>
        {posts.map((post) => (
          <div key={post._id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <p>Posted by: {post.user.username}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
