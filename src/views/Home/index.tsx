'use client';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { getPosts, createPost, likePost } from '../../api';
import PostCard from './components/PostCard';
import PostSkeleton from './components/PostSkeleton';
import { useAppSelector } from '../../store/hooks';
import { ExclamationTriangleIcon, CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import { debounce } from 'lodash';
import { isAbortError } from '../../utils/errorHandling';
import { TITLE_CHARACTER_LIMIT } from './constants/title';
import { POSTS_PAGE_SIZE } from './constants/feed';
import PaperTornEdge from '../../components/PaperTornEdge';

const ErrorToast = ({ error, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="fixed left-2 right-2 top-2 z-50 sm:left-auto sm:right-4 sm:top-4"
  >
    <div className="flex max-w-md items-start gap-3 rounded-[3px] border border-[var(--paper-ink)] bg-[var(--paper-cream)] p-4 shadow-[3px_4px_0_var(--paper-ink)]">
      <ExclamationTriangleIcon className="h-6 w-6 shrink-0 text-[#8d3a33]" />
      <div>
        <h3 className="font-paper-mono text-xs uppercase tracking-[.14em] text-[#8d3a33]">
          {error.status} error
        </h3>
        <p className="mt-1 text-sm text-[var(--paper-muted)]">{error.message}</p>
        <button
          onClick={onDismiss}
          className="mt-2 text-sm font-medium text-[var(--paper-accent)] hover:text-[var(--paper-ink)]"
          aria-label="Dismiss error message"
        >
          Dismiss
        </button>
      </div>
    </div>
  </motion.div>
);

const ComposeCard = ({
  title,
  content,
  isCreating,
  imagePreview,
  fileInputRef,
  onTitleChange,
  onContentChange,
  onImageChange,
  onRemoveImage,
  onSubmit,
}) => (
  <section
    aria-labelledby="compose-h"
    className="relative mt-[clamp(34px,4vw,48px)] rotate-[-0.3deg] rounded-[3px] bg-[var(--paper-cream)] p-[clamp(22px,3vw,34px)] shadow-[0_14px_26px_-14px_rgba(60,44,24,.3),0_2px_0_rgba(60,44,24,.1)]"
  >
    <span
      aria-hidden="true"
      className="absolute -top-3 left-7 h-[26px] w-24 rotate-[-3.5deg] border-x border-dashed border-[rgba(60,44,24,.3)] bg-[rgba(242,199,68,.7)] shadow-[0_1px_3px_rgba(60,44,24,.2)]"
    />
    <div className="flex flex-wrap items-baseline gap-3">
      <h2 id="compose-h" className="font-paper-serif text-[27px] font-bold">
        Create a post
      </h2>
      <span className="font-paper-hand text-xl text-[var(--paper-accent)]">
        &larr; ship it, then write it up
      </span>
    </div>

    <form onSubmit={onSubmit}>
      <label className="mt-[22px] block">
        <span className="mb-1.5 block font-paper-mono text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
          Title
        </span>
        <input
          value={title}
          onChange={onTitleChange}
          placeholder="Give it a headline"
          maxLength={TITLE_CHARACTER_LIMIT}
          disabled={isCreating}
          required
          className="w-full border-b-[1.5px] border-[rgba(60,44,24,.4)] bg-transparent px-0.5 py-2 font-paper-serif text-xl outline-none focus:border-[var(--paper-accent-strong)]"
        />
        <span className="mt-1 block text-right font-paper-mono text-[10px] text-[var(--paper-muted-2)]">
          {title.length}/{TITLE_CHARACTER_LIMIT}
        </span>
      </label>

      <label className="mt-6 block">
        <span className="mb-2 block font-paper-mono text-[11px] uppercase tracking-[.16em] text-[var(--paper-muted-2)]">
          The story
        </span>
        <textarea
          value={content}
          onChange={onContentChange}
          rows={4}
          placeholder="What did you build, break, or fix today?"
          disabled={isCreating}
          required
          className="paper-ruled w-full resize-y px-0.5 py-1 text-base leading-8 outline-none"
        />
      </label>

      <div className="mt-[22px] flex flex-wrap items-center justify-between gap-4">
        <label className="flex cursor-pointer items-center gap-[9px] rounded-full border-[1.5px] border-dashed border-[rgba(60,44,24,.5)] px-4 py-2.5 text-sm font-medium transition-colors hover:border-[var(--paper-accent-strong)] hover:bg-[var(--paper-yellow-soft)]">
          <CameraIcon className="h-4 w-4" />
          Clip in a screenshot
          <input
            ref={fileInputRef}
            type="file"
            onChange={onImageChange}
            className="hidden"
            accept="image/*"
            disabled={isCreating}
          />
        </label>

        <button
          type="submit"
          disabled={isCreating}
          className="rotate-[1deg] rounded-[4px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-[30px] py-3 font-paper-mono text-sm font-bold uppercase tracking-[.16em] shadow-[3px_4px_0_var(--paper-ink)] transition-transform hover:-translate-y-px disabled:opacity-60"
        >
          {isCreating ? 'Pinning...' : 'Pin it up'}
        </button>
      </div>

      {imagePreview && (
        <div className="relative mt-4 inline-block rotate-[-0.7deg] bg-[#f1e7d3] p-[10px] shadow-[0_2px_0_rgba(60,44,24,.12)]">
          {/* imagePreview is always either '' or a same-origin blob: URL from
              URL.createObjectURL() in handleImageChange below — never user-supplied text */}
          <img
            src={imagePreview} // lgtm[js/xss-through-dom] -- browser-generated blob: URL, not DOM text
            alt="Selected upload preview"
            className="h-48 max-w-full rounded-[1px] object-cover"
          />
          <button
            type="button"
            onClick={onRemoveImage}
            className="absolute -right-2 -top-2 rounded-full border border-[var(--paper-ink)] bg-[var(--paper-cream)] p-1 shadow-[1px_2px_0_var(--paper-ink)]"
            aria-label="Remove selected image"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </form>
  </section>
);

const GuestPrompt = () => (
  <section className="mt-[clamp(34px,4vw,48px)] rotate-[-0.3deg] rounded-[3px] bg-[var(--paper-cream)] p-[clamp(22px,3vw,34px)] text-center shadow-[0_14px_26px_-14px_rgba(60,44,24,.3),0_2px_0_rgba(60,44,24,.1)]">
    <p className="font-paper-serif text-xl font-bold">Want to pin something up?</p>
    <p className="mt-2 text-[var(--paper-muted)]">
      <Link
        href="/login"
        className="font-medium text-[var(--paper-accent)] hover:text-[var(--paper-ink)]"
      >
        Log in
      </Link>{' '}
      or{' '}
      <Link
        href="/register"
        className="font-medium text-[var(--paper-accent)] hover:text-[var(--paper-ink)]"
      >
        create an account
      </Link>{' '}
      to post to the wall.
    </p>
  </section>
);

const Home = ({ initialPosts = [], initialHasMore = true }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(initialPosts.length === 0);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAppSelector((state) => state.user);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [hasMore, setHasMore] = useState(initialHasMore);
  // `page` tracks the last loaded page (page 1 comes from SSR). Infinite scroll
  // increments it to load the next page, so it always starts at 1.
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [filter, setFilter] = useState<'all' | 'photos'>('all');
  // Prevent hydration mismatch: user-dependent UI only renders after client mount
  const [mounted, setMounted] = useState(false);

  const abortControllerRef = useRef(new AbortController());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLike = async (postId, shouldBeLiked) => {
    try {
      const response = await likePost(postId, shouldBeLiked);

      if (response && response._id && Array.isArray(response.likes)) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post._id === response._id ? { ...post, likes: response.likes } : post,
          ),
        );
      }
      return response;
    } catch (err) {
      if (!err.message?.includes('cancelled') && !err.cancelled) {
        // Propagate to PostCard so it can revert optimistic state and show the right message
        throw err;
      }
    }
  };

  const fetchPosts = useCallback(async () => {
    abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      const response = await getPosts(
        page,
        POSTS_PAGE_SIZE,
        abortControllerRef.current.signal,
        filter === 'photos',
      );
      const newPosts = response.posts || [];
      setPosts((prev) => (page === 1 ? newPosts : [...prev, ...newPosts]));
      setHasMore(response.hasMore);
    } catch (err) {
      if (!isAbortError(err)) {
        setError({
          message: err.message || 'failed to fetch posts',
          status: err.statusCode || 'error',
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, [page, filter]);

  // SSR already rendered page 1 — don't refetch it on mount or posts 4..N
  // get skipped/overwritten by a mismatched page/limit. The next fetch is
  // page 2 via infinite scroll. If SSR failed (no initial posts), fetch page 1.
  const hasHydratedInitialPage = useRef(initialPosts.length > 0);
  useEffect(() => {
    if (hasHydratedInitialPage.current) {
      hasHydratedInitialPage.current = false;
      return;
    }
    fetchPosts();
  }, [fetchPosts]);

  // Switching filters queries a different set on the backend now (see fetchPosts),
  // so the existing page needs to be thrown away and pagination restarted from
  // page 1 for it — otherwise switching to Photos would either show a stale mix
  // of results or try to append page 2 of the new filter onto page 1 of the old one.
  const isFirstFilterRender = useRef(true);
  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [filter]);

  useEffect(() => {
    return () => {
      abortControllerRef.current.abort();
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      abortControllerRef.current = new AbortController();
      setPosts([]);
      setPage(1);
      setHasMore(true);
      setLoading(true);
      setError(null);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  const loadMoreStateRef = useRef({ loading, isFetchingMore, hasMore });

  useEffect(() => {
    loadMoreStateRef.current = { loading, isFetchingMore, hasMore };
  }, [loading, isFetchingMore, hasMore]);

  const handleLoadMore = useMemo(
    () =>
      debounce(() => {
        const s = loadMoreStateRef.current;
        if (!s.loading && !s.isFetchingMore && s.hasMore) {
          setIsFetchingMore(true);
          setPage((prevPage) => prevPage + 1);
        }
      }, 200),
    [],
  );

  const [lastPostRef] = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: handleLoadMore,
  });

  const optimizeImage = async (file) => {
    if (file.size <= 1024 * 1024) return file;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    return new Promise((resolve) => {
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > 1200) {
          height = (height * 1200) / width;
          width = 1200;
        }

        canvas.width = width;
        canvas.height = height;
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          },
          'image/jpeg',
          0.85,
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e) => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const file = e.target.files[0];
    if (file) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (validImageTypes.includes(file.type)) {
        const optimizedImage = await optimizeImage(file);
        setImage(optimizedImage);
        const objectUrl = URL.createObjectURL(optimizedImage);
        setImagePreview(objectUrl);
      } else {
        setError({
          message: 'Invalid file type. Please upload an image (JPEG or PNG).',
          status: 'Error',
        });
      }
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview('');
    // Reset the native input too, or reselecting the same file won't fire onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const validatePostInput = () => {
    if (!title.trim()) {
      setError({ message: 'Title is required', status: 'Error' });
      return false;
    }

    if (title.length > TITLE_CHARACTER_LIMIT) {
      setError({
        message: `Title exceeds maximum limit of ${TITLE_CHARACTER_LIMIT} characters`,
        status: 'Error',
      });
      return false;
    }

    if (!content.trim()) {
      setError({ message: 'Content is required', status: 'Error' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePostInput()) return;

    setIsCreating(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image instanceof File) {
        formData.append('image', image);
      }

      const response = await createPost(formData);
      setPosts((prev) => [
        {
          ...response,
          user: { _id: user._id, username: user.username },
          image: response.image || null,
        },
        ...prev,
      ]);
      setTitle('');
      setContent('');
      setImage(null);
      setImagePreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      if (!isAbortError(err)) {
        setError({
          message: err.message || 'failed to fetch data',
          status: err.statusCode || 'error',
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Two fixed columns instead of a CSS multi-column layout: a native `column-width`
  // rebalances its entire contents from scratch whenever the total content changes,
  // which visibly moves already-rendered posts into a different column every time
  // a new page loads. Assigning each post to a column by its own stable index means
  // a newly loaded post only ever appends to the end of a column — it never moves
  // one that's already on screen.
  const postColumns = useMemo(() => {
    const columns: { post: (typeof posts)[number]; index: number }[][] = [[], []];
    posts.forEach((post, index) => {
      columns[index % 2].push({ post, index });
    });
    return columns;
  }, [posts]);

  const countLabel =
    filter === 'photos' ? `${posts.length} with photos` : `${posts.length} posts on the wall`;

  const newTodayCount = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return posts.filter((p) => new Date(p.createdAt) >= startOfToday).length;
  }, [posts]);

  return (
    <div className="paper-theme min-h-screen">
      <AnimatePresence>
        {error && <ErrorToast error={error} onDismiss={() => setError(null)} />}
      </AnimatePresence>

      <PaperTornEdge />

      {/* -mt pulls this section's background up to underlap the tear above it, so the
          transparent valleys reveal this hero tan instead of the page's base tan showing
          through before any content has scrolled underneath. */}
      <section className="relative -mt-4 bg-[var(--paper-hero)] px-4 pb-14 pt-12 sm:-mt-6 sm:px-8 sm:pb-20 sm:pt-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-end justify-between gap-7">
            <div className="max-w-[54ch]">
              <p className="mb-3 font-paper-mono text-xs uppercase tracking-[.2em] text-[var(--paper-muted-2)]">
                Adorio community &middot; social feed
              </p>
              <h1 className="font-paper-serif text-[clamp(40px,6.4vw,64px)] font-bold leading-[1.02] tracking-[-.02em]">
                Recent posts
              </h1>
              <p className="mt-3.5 text-[17px] leading-[1.62] text-[var(--paper-muted)]">
                A place to share what you&apos;re building, breaking, and fixing. Post an update,
                drop a screenshot, or just say hi.
              </p>
            </div>
            {mounted && newTodayCount > 0 && (
              <p className="relative whitespace-nowrap rounded-[2px] bg-[var(--paper-yellow)] px-[18px] py-3 font-paper-hand text-2xl leading-none rotate-[2deg] shadow-[1px_3px_9px_rgba(60,44,24,.22)]">
                {newTodayCount} new today
              </p>
            )}
          </div>

          {mounted &&
            (user ? (
              <ComposeCard
                title={title}
                content={content}
                isCreating={isCreating}
                imagePreview={imagePreview}
                fileInputRef={fileInputRef}
                onTitleChange={(e) => setTitle(e.target.value)}
                onContentChange={(e) => setContent(e.target.value)}
                onImageChange={handleImageChange}
                onRemoveImage={handleRemoveImage}
                onSubmit={handleSubmit}
              />
            ) : (
              <GuestPrompt />
            ))}
        </div>

        <svg
          viewBox="0 0 1200 22"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
          className="absolute inset-x-0 -bottom-px block h-[22px] w-full"
        >
          <path
            fill="#e5d8c0"
            d="M0,22 H1200 V9 L1174,15 L1150,7 L1126,17 L1100,10 L1076,18 L1050,8 L1024,16 L1000,9 L974,19 L948,11 L924,6 L898,15 L872,9 L846,18 L820,12 L796,7 L770,16 L744,10 L718,19 L692,13 L668,7 L642,15 L616,9 L590,18 L564,11 L540,6 L514,16 L488,10 L462,19 L436,12 L412,7 L386,15 L360,9 L334,17 L308,11 L284,6 L258,16 L232,10 L206,18 L180,13 L156,7 L130,15 L104,9 L78,17 L52,11 L26,6 L0,14 Z"
          />
        </svg>
      </section>

      <main id="feed" className="px-4 pb-20 pt-9 sm:px-8 sm:pb-24 sm:pt-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-end gap-1.5 pl-1.5">
            <button
              onClick={() => setFilter('all')}
              aria-pressed={filter === 'all'}
              className={`relative rounded-t-[10px] border border-b-0 px-[22px] pb-3 pt-[11px] text-[15px] font-bold rotate-[-0.8deg] ${
                filter === 'all'
                  ? 'border-[rgba(60,44,24,.28)] bg-[var(--paper-cream)]'
                  : 'border-[rgba(60,44,24,.22)] bg-[#ecdfc8] text-[var(--paper-muted)]'
              }`}
            >
              {filter === 'all' && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-[7px] left-[11px] right-[11px] h-[9px] rounded-[2px_6px_3px_7px] bg-[var(--paper-yellow)]"
                />
              )}
              <span className="relative">All posts</span>
            </button>
            <button
              onClick={() => setFilter('photos')}
              aria-pressed={filter === 'photos'}
              className={`relative rounded-t-[10px] border border-b-0 px-5 pb-2.5 pt-[9px] text-[15px] font-medium rotate-[1deg] ${
                filter === 'photos'
                  ? 'border-[rgba(60,44,24,.28)] bg-[var(--paper-cream)] font-bold'
                  : 'border-[rgba(60,44,24,.22)] bg-[#ecdfc8] text-[var(--paper-muted)]'
              }`}
            >
              {filter === 'photos' && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-[7px] left-[11px] right-[11px] h-[9px] rounded-[2px_6px_3px_7px] bg-[var(--paper-yellow)]"
                />
              )}
              <span className="relative">Photos</span>
            </button>
            <p className="mb-1.5 ml-auto font-paper-mono text-xs uppercase tracking-[.12em] text-[var(--paper-muted-2)]">
              {countLabel}
            </p>
          </div>
          <div aria-hidden="true" className="paper-dashed-rule h-0.5" />

          {loading && posts.length === 0 ? (
            <div className="mt-[clamp(34px,4vw,50px)]">
              <PostSkeleton count={3} />
            </div>
          ) : (
            <div className="mt-[clamp(34px,4vw,50px)] grid grid-cols-1 gap-x-[clamp(24px,3vw,38px)] sm:grid-cols-2">
              {postColumns.map((column, columnIndex) => (
                <div key={columnIndex}>
                  {column.map(({ post, index }) => (
                    <PostCard
                      key={post._id}
                      {...post}
                      index={index}
                      currentUserId={user?._id}
                      currentUsername={user?.username}
                      onLike={handleLike}
                      onCommentAdded={(updatedPost) => {
                        setPosts((prevPosts) =>
                          prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p)),
                        );
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          <div ref={lastPostRef} aria-hidden="true" />

          {isFetchingMore && (
            <div className="mt-8 [column-gap:clamp(24px,3vw,38px)] [column-width:22rem]">
              <PostSkeleton count={2} />
            </div>
          )}

          {!loading && !hasMore && posts.length > 0 && (
            <p className="mx-auto mt-[clamp(40px,5vw,64px)] text-center font-paper-hand text-2xl text-[var(--paper-muted)]">
              that&apos;s everything for now, check back later
            </p>
          )}

          {!loading && posts.length === 0 && !error && (
            <div className="py-16 text-center">
              <p className="font-paper-hand text-2xl text-[var(--paper-muted)]">
                No posts yet. Be the first to pin one up!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
