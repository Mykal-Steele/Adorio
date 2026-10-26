'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useAppSelector } from '../../store/hooks';
import { getPosts, likePost } from '../../api';
import PostCard from '../Home/components/PostCard';
import PostSkeleton from '../Home/components/PostSkeleton';
import PostColumns from '../Home/components/PostColumns';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import { isAbortError } from '../../utils/errorHandling';
import PaperTornEdge from '../../components/PaperTornEdge';

const Profile = () => {
  const { user } = useAppSelector((state) => state.user);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const handleLike = async (postId: string, shouldBeLiked: boolean) => {
    try {
      const updatedPost = await likePost(postId, shouldBeLiked);

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: updatedPost.likes } : post,
        ),
      );

      return updatedPost;
    } catch (err) {
      console.error('Error liking post:', err);
      throw err;
    }
  };

  const handleCommentAdded = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post._id === updatedPost._id ? updatedPost : post)),
    );
  };

  const fetchUserPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getPosts(page);
      const newPosts = response.posts || [];

      const userPosts = newPosts.filter((post) => post.user?._id === user?._id);

      setPosts((prev) => (page === 1 ? userPosts : [...prev, ...userPosts]));
      setHasMore(response.hasMore);
    } catch (err) {
      if (!isAbortError(err)) {
        setError(err instanceof Error ? err.message : 'failed to fetch user posts');
      }
    } finally {
      setLoading(false);
    }
  }, [page, user]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  const [lastPostRef] = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: () => setPage((prev) => prev + 1),
  });

  const firstLoad = loading && page === 1;

  if (error) {
    return (
      <div className="paper-theme flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md rounded-[3px] border border-[#8d3a33] bg-[#f3ded9] p-5 shadow-[3px_4px_0_rgba(60,44,24,.18)]">
          <p className="font-paper-mono text-xs uppercase tracking-[.14em] text-[#8d3a33]">
            Something went wrong
          </p>
          <p className="mt-2 text-sm text-[#7a2f29]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-theme min-h-screen">
      <PaperTornEdge />

      <section className="relative -mt-4 bg-[var(--paper-hero)] px-4 pb-12 pt-12 sm:-mt-6 sm:px-8 sm:pb-14 sm:pt-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-7">
            <div className="max-w-[54ch]">
              <p className="mb-3 font-paper-mono text-xs uppercase tracking-[.2em] text-[var(--paper-muted-2)]">
                your corner of the wall
              </p>
              <h1 className="font-paper-serif text-[clamp(38px,6vw,58px)] font-bold leading-[1.02] tracking-[-.02em]">
                {user?.username}&apos;s posts
              </h1>
              <p className="mt-3.5 text-[17px] leading-[1.62] text-[var(--paper-muted)]">
                Everything you&apos;ve pinned up so far, newest first. Post something from the
                social feed and it lands here.
              </p>
            </div>
            {/* Always in the layout so it can't push the page down when the count arrives.
                On phones it wraps onto its own line, so popping in would move everything. */}
            <p
              className={`relative whitespace-nowrap rounded-[2px] bg-[var(--paper-yellow)] px-[18px] py-3 font-paper-sans font-bold text-lg leading-none rotate-[2deg] shadow-[1px_3px_9px_rgba(60,44,24,.22)] ${firstLoad ? 'invisible' : ''}`}
            >
              {posts.length}
              {hasMore ? '+' : ''} posts
            </p>
          </div>
        </div>
      </section>

      <main className="px-4 pb-20 pt-9 sm:px-8 sm:pb-24 sm:pt-12">
        <div className="mx-auto max-w-5xl">
          {firstLoad ? (
            <PostSkeleton count={3} />
          ) : (
            // Same fixed columns as the social feed, so the next page only adds to the
            // bottom and nothing already on screen moves
            <PostColumns
              posts={posts}
              renderPost={(post, index) => (
                <PostCard
                  {...post}
                  index={index}
                  currentUserId={user?._id}
                  currentUsername={user?.username}
                  onLike={handleLike}
                  onCommentAdded={handleCommentAdded}
                />
              )}
            />
          )}

          {/* Below the grid, not on the last post, so it keeps loading even when a page of
              the feed has none of your posts */}
          <div ref={lastPostRef} aria-hidden="true" />

          {loading && page > 1 && (
            <div className="mt-8">
              <PostSkeleton count={1} />
            </div>
          )}

          {!loading && !hasMore && posts.length === 0 && (
            <div className="mx-auto mt-[clamp(40px,5vw,64px)] max-w-md text-center">
              <p className="font-paper-sans text-lg text-[var(--paper-muted)]">No posts yet.</p>
              <p className="mt-2 text-[15px] text-[var(--paper-muted)]">
                Posts you make on the social feed show up here.
              </p>
            </div>
          )}

          {!loading && !hasMore && posts.length > 0 && (
            <p className="mx-auto mt-[clamp(40px,5vw,64px)] text-center font-paper-sans text-lg text-[var(--paper-muted)]">
              You&apos;ve reached the end.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
