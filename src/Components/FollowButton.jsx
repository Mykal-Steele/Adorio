import React from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { addFollower, removeFollower } from "../redux/userSlice";

const FollowButton = ({ userId, isFollowing }) => {
  const dispatch = useDispatch();

  const handleFollow = async () => {
    try {
      await axios.post(`/api/users/follow/${userId}`);
      if (isFollowing) {
        dispatch(removeFollower(userId));
      } else {
        dispatch(addFollower(userId));
      }
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      onClick={handleFollow}
      className={`px-4 py-2 rounded-full ${
        isFollowing
          ? "bg-gray-800 hover:bg-gray-700"
          : "bg-purple-600 hover:bg-purple-700"
      } text-white transition-colors`}
    >
      {isFollowing ? "Following" : "Follow"}
    </motion.button>
  );
};

export default FollowButton;
