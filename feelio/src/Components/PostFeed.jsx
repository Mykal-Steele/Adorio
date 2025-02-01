import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PostCard from "./PostCard";
import SkeletonLoader from "./SkeletonLoader";
import { getPosts } from "../api/posts";
import useSocket from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";

const PostFeed = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  useSocket({
    likeUpdate: (data) => {
      queryClient.setQueryData(["posts"], (oldPosts) => {
        return oldPosts.map((post) => {
          if (post._id === data.postId) {
            return {
              ...post,
              likes: data.likes,
              likeCount: data.likes.length,
              isLiked: data.likes.includes(user?._id),
            };
          }
          return post;
        });
      });
    },
    newComment: (commentData) => {
      queryClient.setQueryData(["posts"], (oldPosts) => {
        return oldPosts.map((post) => {
          if (post._id === commentData.postId) {
            return {
              ...post,
              comments: [commentData, ...post.comments],
              commentCount: post.commentCount + 1,
            };
          }
          return post;
        });
      });
    },
  });

  if (isLoading) return <SkeletonLoader count={3} />;
  if (error) return <div>Error loading posts</div>;

  return (
    <div className="space-y-6">
      {posts?.map((post) => (
        <PostCard
          key={post._id}
          post={{
            ...post,
            isLiked: post.likes.includes(user?._id),
            likeCount: post.likes.length,
            commentCount: post.comments.length,
          }}
        />
      ))}
    </div>
  );
};

export default PostFeed;
