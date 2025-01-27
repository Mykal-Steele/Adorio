import React, { useEffect, useState } from 'react';
import { getPosts } from '../api'; // Import the API function

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await getPosts(token); // Pass token here
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);
  

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
