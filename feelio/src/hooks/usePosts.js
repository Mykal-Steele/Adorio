// feelio/src/hooks/usePosts.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost, likePost, addComment, deletePost } from "../api/posts";

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation(createPost, {
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      console.error("Create post error:", error);
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation(likePost, {
    onMutate: async (postId) => {
      await queryClient.cancelQueries(["posts"]);

      const previousPosts = queryClient.getQueryData(["posts"]);

      queryClient.setQueryData(["posts"], (old) =>
        old.map((post) =>
          post._id === postId
            ? { ...post, likes: [...post.likes, "temp"], isLiked: true }
            : post
        )
      );

      return { previousPosts };
    },
    onError: (err, postId, context) => {
      queryClient.setQueryData(["posts"], context.previousPosts);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });
};

export const useAddComment = (postId) => {
  const queryClient = useQueryClient();

  return useMutation((comment) => addComment(postId, comment), {
    onSuccess: () => {
      queryClient.invalidateQueries(["post", postId]);
    },
  });
};
