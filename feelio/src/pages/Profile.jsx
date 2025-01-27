import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';  // Import useSelector and useDispatch from redux
import { getPosts } from '../api'; // Import the API function to get posts

const Profile = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.user);  // Get user data and token from Redux store
  const [posts, setPosts] = useState([]);  // State to hold posts

  // Fetch posts when component mounts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user || !token) return;  // If no user or token, exit early

      try {
        const response = await getPosts(token); // Pass the token to fetch posts from backend
        setPosts(response.data.filter(post => post.user._id === user._id)); // Filter posts by the logged-in user
      } catch (err) {
        console.error("Error fetching user posts:", err);
      }
    };

    fetchUserPosts();
  }, [user, token]);  // Re-fetch posts if user or token changes

  return (
    <div>
      {user ? (
        <>
          <h1>{user.username}'s Profile</h1>
          <div>
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post._id}>
                  <h2>{post.title}</h2>
                  <p>{post.content}</p>
                </div>
              ))
            ) : (
              <p>No posts found.</p>
            )}
          </div>
        </>
      ) : (
        <p>You are not logged in.</p>
      )}
    </div>
  );
};

export default Profile;
