import React from "react";
import { motion } from "framer-motion";
import moment from "moment";
import { ADMIN_AVATAR_URL } from "../constants";

// header component for showing who posted - tried to make it look clean
const AuthorHeader = ({ user, createdAt, isAdmin }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative bg-gradient-to-r from-purple-500 to-blue-500 p-0.5 rounded-full"
        >
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center overflow-hidden">
            {isAdmin ? (
              <img
                src={ADMIN_AVATAR_URL}
                alt="Admin Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              // using first letter for normal users cuz i'm too lazy to add profile pics yet
              <span className="text-xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>
        </motion.div>
        <div>
          <p className="font-medium text-gray-100">{user?.username}</p>
          <p className="text-sm text-gray-400">
            {moment.utc(createdAt).local().fromNow()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthorHeader;
