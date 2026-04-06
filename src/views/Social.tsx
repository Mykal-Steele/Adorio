"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowBigDown,
  ArrowBigUp,
  FileText,
  House,
  Loader2,
  MessageSquare,
  Paperclip,
  PenSquare,
  Search,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Separator } from "@/ui/separator";
import { Textarea } from "@/ui/textarea";
import type {
  SocialAttachment,
  SocialBoardData,
  SocialComment,
  SocialPost,
} from "@/lib/types";
import { createCommentSchema, createPostSchema } from "@/lib/validators";
import {
  createCommentAction,
  createPostAction,
  getAttachmentDataUrlAction,
  voteCommentAction,
  votePostAction,
} from "@/app/social/actions";
import {
  applySocialTheme,
  DEFAULT_SOCIAL_THEME,
  isValidSocialTheme,
  SOCIAL_THEME_OPTIONS,
} from "@/lib/theme";
import {
  fileToAttachment,
  readableSize,
  type ClientAttachmentInput,
} from "@/lib/attachmentUtils";
import { compressImage } from "@/lib/imageCompress";
import { authClient } from "@/lib/auth-client";

type SocialProps = {
  data: SocialBoardData;
};

type DraftState = {
  text: string;
  attachments: ClientAttachmentInput[];
};

type ViewerState = {
  attachment: SocialAttachment;
  postAuthor: string;
  postContent: string;
};

const formatTime = (isoDate: string) => {
  const date = new Date(isoDate);

  // Use UTC so server and client render the same initial text.
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
};

const actionGhostButtonClass =
  "inline-flex h-8 cursor-pointer items-center rounded-md px-3 text-xs font-medium text-social-ink/80 transition-colors hover:bg-social-accent/55";

const actionBorderButtonClass =
  "inline-flex h-8 cursor-pointer items-center gap-1 rounded-md border border-social-border bg-social-surface px-3 text-xs font-medium text-social-ink/85 transition-colors hover:bg-social-accent/55";

const postVoteBoxClass =
  "inline-flex h-8 items-center gap-1 rounded-md border border-social-border bg-social-surface px-2 text-social-ink";

const commentVoteBoxClass =
  "inline-flex h-8 items-center gap-1 rounded-full px-2 text-social-ink";

const initialsFor = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

const commentCount = (comments: SocialComment[]): number =>
  comments.reduce(
    (total, comment) => total + 1 + commentCount(comment.replies),
    0,
  );

const repliesCount = (comments: SocialComment[]): number =>
  comments.reduce(
    (total, comment) => total + 1 + repliesCount(comment.replies),
    0,
  );

const filterAndSortComments = (
  comments: SocialComment[],
  sortMode: "top" | "new" | "old",
  query: string,
): SocialComment[] => {
  const normalizedQuery = query.trim().toLowerCase();

  return comments
    .filter((comment) => {
      if (!normalizedQuery) {
        return true;
      }

      return `${comment.author} ${comment.text}`
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .slice()
    .sort((a, b) => {
      if (sortMode === "new") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      if (sortMode === "old") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      if (b.score === a.score) {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      return b.score - a.score;
    });
};

const makeTempId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

const toSocialAttachment = (
  attachment: ClientAttachmentInput,
): SocialAttachment => ({
  id: makeTempId("attachment"),
  name: attachment.name,
  mimeType: attachment.mimeType,
  sizeBytes: attachment.sizeBytes,
  dataUrl: attachment.dataUrl,
  isImage: attachment.mimeType.startsWith("image/"),
  isPdf: attachment.mimeType === "application/pdf",
});

const updateCommentTree = (
  comments: SocialComment[],
  commentId: string,
  updater: (comment: SocialComment) => SocialComment,
): SocialComment[] =>
  comments.map((comment) => {
    if (comment.id === commentId) {
      return updater(comment);
    }

    if (comment.replies.length === 0) {
      return comment;
    }

    return {
      ...comment,
      replies: updateCommentTree(comment.replies, commentId, updater),
    };
  });

const insertReply = (
  comments: SocialComment[],
  parentId: string,
  reply: SocialComment,
): SocialComment[] =>
  comments.map((comment) => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [reply, ...comment.replies],
      };
    }

    if (comment.replies.length === 0) {
      return comment;
    }

    return {
      ...comment,
      replies: insertReply(comment.replies, parentId, reply),
    };
  });

const removeCommentFromTree = (
  comments: SocialComment[],
  commentId: string,
): SocialComment[] =>
  comments
    .filter((comment) => comment.id !== commentId)
    .map((comment) => ({
      ...comment,
      replies: removeCommentFromTree(comment.replies, commentId),
    }));

const replaceCommentIdInTree = (
  comments: SocialComment[],
  tempId: string,
  realId: string,
): SocialComment[] =>
  comments.map((comment) => {
    const nextCommentId = comment.id === tempId ? realId : comment.id;

    return {
      ...comment,
      id: nextCommentId,
      replies: replaceCommentIdInTree(comment.replies, tempId, realId),
    };
  });

function AttachmentViewer({
  state,
  onClose,
}: {
  state: ViewerState | null;
  onClose: () => void;
}) {
  if (!state) {
    return null;
  }

  const { attachment, postAuthor, postContent } = state;
  const previewDataUrl = attachment.dataUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-social-ink/65 px-3 py-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[96vh] w-full max-w-5xl overflow-hidden rounded-xl bg-social-surface shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-social-ink/70">
              Attachment preview
            </p>
            <h3 className="text-lg font-semibold text-social-ink">
              {attachment.name}
            </h3>
            <p className="text-sm text-social-ink/75">
              From {postAuthor} · {readableSize(attachment.sizeBytes)}
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="max-h-[72vh] overflow-auto bg-social-accent/45 p-4">
          {attachment.isImage && previewDataUrl ? (
            <Image
              className="max-h-[68vh] w-full rounded-lg bg-social-surface object-contain"
              src={previewDataUrl}
              alt={attachment.name}
              width={1200}
              height={900}
              unoptimized
            />
          ) : null}

          {attachment.isPdf && previewDataUrl ? (
            <iframe
              className="h-[72vh] w-full rounded-lg bg-social-surface"
              title={`PDF preview ${attachment.name}`}
              src={`${previewDataUrl}#view=FitH&toolbar=1&navpanes=0`}
            />
          ) : null}

          {!previewDataUrl || (!attachment.isImage && !attachment.isPdf) ? (
            <div className="rounded-lg bg-social-surface p-5 text-social-ink/80">
              {!previewDataUrl
                ? "Preview is still loading. Please wait a moment."
                : "Preview is not available for this file type. Download is available below."}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="truncate text-sm text-social-ink/80">
            {postContent || "No post text provided."}
          </p>
          {previewDataUrl ? (
            <Button asChild>
              <a href={previewDataUrl} download={attachment.name}>
                Download file
              </a>
            </Button>
          ) : (
            <Button disabled>Preparing file...</Button>
          )}
        </div>
      </div>
    </div>
  );
}

const AttachmentTile = ({
  attachment,
  isLoading,
  onOpen,
  onPrefetch,
}: {
  attachment: SocialAttachment;
  isLoading: boolean;
  onOpen: (attachment: SocialAttachment) => void;
  onPrefetch: (attachment: SocialAttachment) => void;
}) => (
  <button
    type="button"
    className="group relative w-full self-start cursor-pointer overflow-hidden rounded-md border border-social-border bg-social-surface text-left transition-colors hover:bg-social-accent/35"
    onClick={() => onOpen(attachment)}
    onMouseEnter={() => onPrefetch(attachment)}
    onFocus={() => onPrefetch(attachment)}
  >
    {isLoading ? (
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-social-page-bg/65">
        <Loader2 size={18} className="animate-spin text-social-ink/75" />
      </div>
    ) : null}

    {attachment.isImage && attachment.dataUrl ? (
      <Image
        className="max-h-105 w-full bg-social-page-bg object-contain"
        src={attachment.dataUrl}
        alt={attachment.name}
        width={1200}
        height={900}
        unoptimized
        onError={(event) => {
          event.currentTarget.style.opacity = "0.4";
        }}
      />
    ) : (
      <div className="flex items-start justify-between gap-2 p-3">
        <div>
          <p className="line-clamp-1 text-sm font-medium text-social-ink">
            {attachment.name}
          </p>
          <p className="text-xs text-social-ink/70">
            {readableSize(attachment.sizeBytes)}
          </p>
        </div>
        <Badge className="mt-0.5 bg-social-accent/55 text-social-ink transition-colors group-hover:bg-social-accent">
          {attachment.isImage ? "Image" : attachment.isPdf ? "PDF" : "File"}
        </Badge>
      </div>
    )}
  </button>
);

function CommentItem({
  postId,
  comment,
  level = 0,
  collapsedByComment,
  toggleReplies,
  getReplyDraft,
  updateReplyDraft,
  addReplyAttachment,
  removeReplyAttachment,
  submitReply,
  voteComment,
  openAttachment,
  pendingReplyByComment,
  resolveAttachment,
  isAttachmentLoading,
  prefetchAttachment,
  canInteract,
}: {
  postId: string;
  comment: SocialComment;
  level?: number;
  collapsedByComment: Record<string, boolean>;
  toggleReplies: (commentId: string) => void;
  getReplyDraft: (commentId: string) => DraftState;
  updateReplyDraft: (commentId: string, draft: DraftState) => void;
  addReplyAttachment: (
    commentId: string,
    files: FileList | null,
  ) => Promise<void>;
  removeReplyAttachment: (commentId: string, index: number) => void;
  submitReply: (postId: string, parentId: string) => void;
  voteComment: (commentId: string, value: -1 | 1) => void;
  openAttachment: (attachment: SocialAttachment) => void;
  pendingReplyByComment: Record<string, boolean>;
  resolveAttachment: (attachment: SocialAttachment) => SocialAttachment;
  isAttachmentLoading: (attachmentId: string) => boolean;
  prefetchAttachment: (attachment: SocialAttachment) => void;
  canInteract: boolean;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const hasReplies = comment.replies.length > 0;
  const isCollapsed = collapsedByComment[comment.id] ?? true;
  const draft = getReplyDraft(comment.id);
  const hiddenRepliesCount = repliesCount(comment.replies);

  return (
    <div className="py-3 pl-0">
      <div className="flex items-start gap-3">
        {/* Vertical line and avatar get margin for nested levels */}
        <div
          className={
            level > 0
              ? "flex flex-col items-center ml-4 w-6"
              : "flex flex-col items-center w-12"
          }
        >
          {level > 0 && <div className="h-full w-px bg-social-border/60" />}
          <Avatar
            size="sm"
            className="mt-0.5 border-social-avatar-border bg-social-avatar-bg"
          >
            <AvatarFallback>{initialsFor(comment.author)}</AvatarFallback>
          </Avatar>
        </div>

        <div className={level > 0 ? "min-w-0 flex-1 pl-2" : "min-w-0 flex-1"}>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm font-semibold text-social-ink">
              {comment.author}
            </p>
            <p className="text-xs text-social-ink/65">
              {formatTime(comment.createdAt)}
            </p>
          </div>
          {/* Keep layout stable even when comment text is empty. */}
          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-social-ink min-h-[1.5em]">
            {comment.text || (
              <span className="text-social-ink/40">(No text)</span>
            )}
          </p>
          {/* Attachments and content */}
          <div className={level > 0 ? "mt-2" : "mt-3 ml-0"}>
            {" "}
            {/* More indent for nested */}
            {comment.attachments.length > 0 ? (
              <div className="mt-2 grid auto-rows-min grid-cols-1 content-start gap-2 sm:grid-cols-2">
                {comment.attachments.map((attachment) => (
                  <AttachmentTile
                    key={attachment.id}
                    attachment={resolveAttachment(attachment)}
                    isLoading={isAttachmentLoading(attachment.id)}
                    onOpen={openAttachment}
                    onPrefetch={prefetchAttachment}
                  />
                ))}
              </div>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2 pl-0">
              <div className={commentVoteBoxClass + " pl-0"}>
                <button
                  type="button"
                  className={`inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors ${
                    comment.voteByMe === 1
                      ? "bg-social-accent"
                      : "hover:bg-social-accent"
                  }`}
                  onClick={() => voteComment(comment.id, 1)}
                  aria-label="Upvote comment"
                >
                  <ArrowBigUp size={14} />
                </button>
                <span className="min-w-5 text-center text-xs font-semibold">
                  {comment.score}
                </span>
                <button
                  type="button"
                  className={`inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors ${
                    comment.voteByMe === -1
                      ? "bg-social-danger-soft"
                      : "hover:bg-social-accent"
                  }`}
                  onClick={() => voteComment(comment.id, -1)}
                  aria-label="Downvote comment"
                >
                  <ArrowBigDown size={14} />
                </button>
              </div>

              <button
                type="button"
                className={actionGhostButtonClass}
                onClick={() => setShowReplyForm((value) => !value)}
              >
                Reply
              </button>

              {hasReplies ? (
                <button
                  type="button"
                  className={`${actionGhostButtonClass} h-8 rounded-full px-3`}
                  onClick={() => toggleReplies(comment.id)}
                >
                  {isCollapsed
                    ? `View more replies (${hiddenRepliesCount})`
                    : "Hide replies"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {showReplyForm ? (
        <div className="mt-2 grid gap-2 pl-11 w-full">
          <Textarea
            value={draft.text}
            onChange={(event) =>
              updateReplyDraft(comment.id, {
                ...draft,
                text: event.target.value,
              })
            }
            placeholder="Write a reply"
            className="min-h-22.5 text-left w-full resize-y"
            suppressHydrationWarning
          />
          <div className="flex items-center gap-2 mt-1">
            <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-social-border bg-social-surface px-2 text-xs text-social-ink transition-colors hover:bg-social-accent/55">
              <Paperclip size={14} />
              Attach
              <input
                className="hidden"
                type="file"
                multiple
                onChange={(event) => {
                  void addReplyAttachment(comment.id, event.target.files);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            <Button
              type="button"
              className="h-8 px-2 text-xs"
              disabled={
                !canInteract ||
                pendingReplyByComment[comment.id] ||
                (!draft.text.trim() && draft.attachments.length === 0)
              }
              onClick={() => submitReply(postId, comment.id)}
            >
              {pendingReplyByComment[comment.id] ? "Sending..." : "Send reply"}
            </Button>
          </div>
          {draft.attachments.length > 0 ? (
            <div className="grid gap-1">
              {draft.attachments.map((attachment, index) => (
                <div
                  key={`${attachment.name}-${index}`}
                  className="flex items-center justify-between rounded-md bg-social-surface px-2 py-1"
                >
                  <span className="truncate text-xs text-social-ink/80">
                    {attachment.name}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    onClick={() => removeReplyAttachment(comment.id, index)}
                  >
                    <X size={11} />
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {hasReplies && !isCollapsed ? (
        <div
          className={
            level === 0
              ? "mt-3 ml-4 border-l-2 border-social-border/80 pl-4"
              : "mt-2 ml-12 border-l border-social-border/60 pl-6"
          }
        >
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              postId={postId}
              comment={reply}
              level={level + 1}
              collapsedByComment={collapsedByComment}
              toggleReplies={toggleReplies}
              getReplyDraft={getReplyDraft}
              updateReplyDraft={updateReplyDraft}
              addReplyAttachment={addReplyAttachment}
              removeReplyAttachment={removeReplyAttachment}
              submitReply={submitReply}
              voteComment={voteComment}
              openAttachment={openAttachment}
              pendingReplyByComment={pendingReplyByComment}
              resolveAttachment={resolveAttachment}
              isAttachmentLoading={isAttachmentLoading}
              prefetchAttachment={prefetchAttachment}
              canInteract={canInteract}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Social({ data }: SocialProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [pendingCommentByPost, setPendingCommentByPost] = useState<
    Record<string, boolean>
  >({});
  const [pendingReplyByComment, setPendingReplyByComment] = useState<
    Record<string, boolean>
  >({});
  const [attachmentDataUrlById, setAttachmentDataUrlById] = useState<
    Record<string, string>
  >({});
  const [loadingAttachmentById, setLoadingAttachmentById] = useState<
    Record<string, boolean>
  >({});
  const attachmentRequestByIdRef = useRef<
    Record<string, Promise<string | null>>
  >({});
  const optimisticCommentResolutionRef = useRef<
    Record<string, Promise<string | null>>
  >({});
  const resolvedOptimisticCommentIdRef = useRef<Record<string, string>>({});
  const [posts, setPosts] = useState<SocialPost[]>(data.posts);
  const [draftText, setDraftText] = useState("");
  const [draftAttachments, setDraftAttachments] = useState<
    ClientAttachmentInput[]
  >([]);
  const [commentDraftByPost, setCommentDraftByPost] = useState<
    Record<string, DraftState>
  >({});
  const [replyDraftByComment, setReplyDraftByComment] = useState<
    Record<string, DraftState>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [postFilter, setPostFilter] = useState<"all" | "top">("all");
  const [expandedByPost, setExpandedByPost] = useState<Record<string, boolean>>(
    {},
  );
  const [collapsedByComment, setCollapsedByComment] = useState<
    Record<string, boolean>
  >({});
  const [commentSortByPost, setCommentSortByPost] = useState<
    Record<string, "top" | "new" | "old">
  >({});
  const [commentSearchByPost, setCommentSearchByPost] = useState<
    Record<string, string>
  >({});
  const [viewerState, setViewerState] = useState<ViewerState | null>(null);
  const { theme, setTheme } = useTheme();

  const socialTheme = isValidSocialTheme(theme) ? theme : DEFAULT_SOCIAL_THEME;

  const visiblePosts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return posts
      .filter((post) => (postFilter === "top" ? post.score > 0 : true))
      .filter((post) => {
        if (!normalizedQuery) {
          return true;
        }

        const postMatch = `${post.author} ${post.content}`
          .toLowerCase()
          .includes(normalizedQuery);

        if (postMatch) {
          return true;
        }

        const checkComments = (comments: SocialComment[]): boolean =>
          comments.some((comment) => {
            if (
              `${comment.author} ${comment.text}`
                .toLowerCase()
                .includes(normalizedQuery)
            ) {
              return true;
            }

            return checkComments(comment.replies);
          });

        return checkComments(post.comments);
      });
  }, [posts, postFilter, searchQuery]);

  const handleFiles = async (
    files: FileList | null,
  ): Promise<ClientAttachmentInput[]> => {
    if (!files || files.length === 0) {
      return [];
    }
    // Compress images before converting to attachment
    const processed = await Promise.all(
      Array.from(files).map(async (file) => {
        if (file.type.startsWith("image/")) {
          const compressed = await compressImage(file, 1, 1920);
          return fileToAttachment(compressed);
        }
        return fileToAttachment(file);
      }),
    );
    return processed;
  };

  const getPostDraft = (postId: string): DraftState =>
    commentDraftByPost[postId] ?? { text: "", attachments: [] };

  const getReplyDraft = (commentId: string): DraftState =>
    replyDraftByComment[commentId] ?? { text: "", attachments: [] };

  const toggleReplies = (commentId: string) => {
    setCollapsedByComment((current) => ({
      ...current,
      [commentId]: !(current[commentId] ?? true),
    }));
  };

  const togglePostComments = (postId: string) => {
    setExpandedByPost((current) => ({
      ...current,
      [postId]: !(current[postId] ?? false),
    }));
  };

  const getResolvedAttachment = (attachment: SocialAttachment) => {
    const resolvedDataUrl =
      attachment.dataUrl ?? attachmentDataUrlById[attachment.id];
    if (!resolvedDataUrl) {
      return attachment;
    }

    return {
      ...attachment,
      dataUrl: resolvedDataUrl,
    };
  };

  const ensureAttachmentDataUrl = async (attachment: SocialAttachment) => {
    const cachedDataUrl =
      attachment.dataUrl ?? attachmentDataUrlById[attachment.id];
    if (cachedDataUrl) {
      return cachedDataUrl;
    }

    const inFlight = attachmentRequestByIdRef.current[attachment.id];
    if (inFlight) {
      return inFlight;
    }

    const requestPromise = (async () => {
      setLoadingAttachmentById((current) => ({
        ...current,
        [attachment.id]: true,
      }));

      try {
        const result = await getAttachmentDataUrlAction({
          attachmentId: attachment.id,
        });

        if (!result.ok) {
          setActionError(result.error);
          return null;
        }

        setAttachmentDataUrlById((current) => ({
          ...current,
          [attachment.id]: result.dataUrl,
        }));

        return result.dataUrl;
      } finally {
        setLoadingAttachmentById((current) => ({
          ...current,
          [attachment.id]: false,
        }));
        delete attachmentRequestByIdRef.current[attachment.id];
      }
    })();

    attachmentRequestByIdRef.current[attachment.id] = requestPromise;
    return requestPromise;
  };

  const prefetchAttachment = (attachment: SocialAttachment) => {
    if (attachment.dataUrl || attachmentDataUrlById[attachment.id]) {
      return;
    }

    void ensureAttachmentDataUrl(attachment);
  };

  const openViewer = async (post: SocialPost, attachment: SocialAttachment) => {
    const resolvedAttachment = getResolvedAttachment(attachment);

    if (resolvedAttachment.dataUrl) {
      setViewerState({
        attachment: resolvedAttachment,
        postAuthor: post.author,
        postContent: post.content,
      });
      return;
    }

    const dataUrl = await ensureAttachmentDataUrl(attachment);
    if (!dataUrl) {
      return;
    }

    setViewerState({
      attachment: { ...attachment, dataUrl },
      postAuthor: post.author,
      postContent: post.content,
    });
  };

  const createOptimisticPost = (): SocialPost => ({
    id: makeTempId("post"),
    author: "You",
    content: draftText.trim(),
    createdAt: new Date().toISOString(),
    score: 0,
    voteByMe: 0,
    attachments: draftAttachments.map(toSocialAttachment),
    comments: [],
  });

  const handleCreatePost = async () => {
    if (!session?.user?.id) {
      setActionError("Please sign in to post.");
      return;
    }

    const parsed = createPostSchema.safeParse({
      content: draftText,
      attachments: draftAttachments,
    });

    if (!parsed.success) {
      setActionError("Post is invalid. Check text and attachments.");
      return;
    }

    const optimisticPost = createOptimisticPost();

    setPosts((current) => [optimisticPost, ...current]);
    setDraftText("");
    setDraftAttachments([]);
    setActionError(null);

    setIsPosting(true);
    const result = await createPostAction(parsed.data);

    if (!result.ok) {
      setPosts((current) =>
        current.filter((post) => post.id !== optimisticPost.id),
      );
      setActionError(result.error);
      setIsPosting(false);
      return;
    }

    setIsPosting(false);
    router.refresh();
  };

  const handleVotePost = (postId: string, value: -1 | 1) => {
    if (!session?.user?.id) {
      setActionError("Please sign in to vote.");
      return;
    }

    setPosts((current) =>
      current.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const nextVote = post.voteByMe === value ? 0 : value;
        return {
          ...post,
          voteByMe: nextVote,
          score: post.score + (nextVote - post.voteByMe),
        };
      }),
    );

    void (async () => {
      const result = await votePostAction({ postId, value });

      if (!result.ok) {
        setActionError(result.error);
        router.refresh();
      }
    })();
  };

  const handleVoteComment = (commentId: string, value: -1 | 1) => {
    if (!session?.user?.id) {
      setActionError("Please sign in to vote.");
      return;
    }

    setPosts((current) =>
      current.map((post) => ({
        ...post,
        comments: updateCommentTree(post.comments, commentId, (comment) => {
          const nextVote = comment.voteByMe === value ? 0 : value;
          return {
            ...comment,
            voteByMe: nextVote,
            score: comment.score + (nextVote - comment.voteByMe),
          };
        }),
      })),
    );

    void (async () => {
      const result = await voteCommentAction({ commentId, value });

      if (!result.ok) {
        setActionError(result.error);
        router.refresh();
      }
    })();
  };

  const createOptimisticComment = (
    text: string,
    attachments: ClientAttachmentInput[],
  ): SocialComment => ({
    id: makeTempId("comment"),
    author: "You",
    text: text.trim(),
    createdAt: new Date().toISOString(),
    score: 0,
    voteByMe: 0,
    attachments: attachments.map(toSocialAttachment),
    replies: [],
  });

  const handleCreateComment = async (postId: string) => {
    if (!session?.user?.id) {
      setActionError("Please sign in to comment.");
      return;
    }

    const draft = getPostDraft(postId);
    const parsed = createCommentSchema.safeParse({
      postId,
      text: draft.text,
      attachments: draft.attachments,
    });

    if (!parsed.success) {
      setActionError("Comment is invalid. Check text and attachments.");
      return;
    }

    const optimisticComment = createOptimisticComment(
      draft.text,
      draft.attachments,
    );

    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? { ...post, comments: [optimisticComment, ...post.comments] }
          : post,
      ),
    );

    setCommentDraftByPost((current) => ({
      ...current,
      [postId]: { text: "", attachments: [] },
    }));

    setExpandedByPost((current) => ({ ...current, [postId]: true }));
    setActionError(null);

    setPendingCommentByPost((current) => ({
      ...current,
      [postId]: true,
    }));

    const resolvePromise = (async () => {
      const result = await createCommentAction(parsed.data);

      if (!result.ok) {
        return null;
      }

      return result.commentId;
    })();

    optimisticCommentResolutionRef.current[optimisticComment.id] =
      resolvePromise;

    const createdCommentId = await resolvePromise;
    delete optimisticCommentResolutionRef.current[optimisticComment.id];

    if (createdCommentId) {
      resolvedOptimisticCommentIdRef.current[optimisticComment.id] =
        createdCommentId;
    }

    const result = createdCommentId
      ? { ok: true as const, commentId: createdCommentId }
      : { ok: false as const, error: "Internal server error" };

    if (!result.ok) {
      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.filter(
                  (comment) => comment.id !== optimisticComment.id,
                ),
              }
            : post,
        ),
      );
      setActionError(result.error);
      setPendingCommentByPost((current) => ({
        ...current,
        [postId]: false,
      }));
      return;
    }

    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: replaceCommentIdInTree(
                post.comments,
                optimisticComment.id,
                result.commentId,
              ),
            }
          : post,
      ),
    );

    setPendingCommentByPost((current) => ({
      ...current,
      [postId]: false,
    }));
    router.refresh();
  };

  const handleCreateReply = async (postId: string, parentId: string) => {
    if (!session?.user?.id) {
      setActionError("Please sign in to reply.");
      return;
    }

    const mappedParentId = resolvedOptimisticCommentIdRef.current[parentId];
    const unresolvedOptimisticParent =
      parentId.startsWith("comment-") &&
      optimisticCommentResolutionRef.current[parentId];

    let resolvedParentId = mappedParentId ?? parentId;

    if (unresolvedOptimisticParent) {
      const realId = await unresolvedOptimisticParent;

      if (!realId) {
        setActionError("Reply is still syncing. Try again in a moment.");
        return;
      }

      resolvedParentId = realId;
    }

    const draft = getReplyDraft(parentId);
    const parsed = createCommentSchema.safeParse({
      postId,
      parentId: resolvedParentId,
      text: draft.text,
      attachments: draft.attachments,
    });

    if (!parsed.success) {
      setActionError("Reply is invalid. Check text and attachments.");
      return;
    }

    const optimisticReply = createOptimisticComment(
      draft.text,
      draft.attachments,
    );

    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: insertReply(
                post.comments,
                resolvedParentId,
                optimisticReply,
              ),
            }
          : post,
      ),
    );

    setCollapsedByComment((current) => ({
      ...current,
      [resolvedParentId]: false,
    }));

    setReplyDraftByComment((current) => ({
      ...current,
      [parentId]: { text: "", attachments: [] },
    }));

    setActionError(null);

    setPendingReplyByComment((current) => ({
      ...current,
      [parentId]: true,
    }));

    const result = await createCommentAction(parsed.data);

    if (!result.ok) {
      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: removeCommentFromTree(
                  post.comments,
                  optimisticReply.id,
                ),
              }
            : post,
        ),
      );
      setActionError(result.error);
      setPendingReplyByComment((current) => ({
        ...current,
        [parentId]: false,
      }));
      return;
    }

    resolvedOptimisticCommentIdRef.current[optimisticReply.id] =
      result.commentId;

    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: replaceCommentIdInTree(
                post.comments,
                optimisticReply.id,
                result.commentId,
              ),
            }
          : post,
      ),
    );

    setPendingReplyByComment((current) => ({
      ...current,
      [parentId]: false,
    }));
    router.refresh();
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-social-page-bg text-social-ink">
      <div className="pointer-events-none absolute -left-32 -top-16 h-72 w-72 rounded-full bg-social-border/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-24 h-80 w-80 rounded-full bg-social-border/22 blur-3xl" />

      <div className="relative mx-auto max-w-350 px-4 py-6 md:px-6 md:py-8">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-social-ink/70">
              Community board
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-[2.7rem]">
              Share files, stories, and useful wins
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-social-ink/80 md:text-[15px]">
              Built for text, photos, PDFs, and docs. People earn reputation
              when their posts and comments help the community.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:self-center md:justify-end">
            {session?.user ? (
              <Button
                type="button"
                variant="outline"
                className="h-9 bg-social-surface text-social-ink hover:bg-social-accent/55"
                onClick={async () => {
                  await authClient.signOut();
                  router.refresh();
                }}
              >
                Sign out
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-9 bg-social-surface text-social-ink hover:bg-social-accent/55"
                onClick={() => {
                  window.location.href = "/social/auth";
                }}
              >
                Sign in
              </Button>
            )}

            <div className="inline-flex rounded-md bg-social-surface p-1">
              {SOCIAL_THEME_OPTIONS.map((themeOption) => (
                <button
                  key={themeOption.id}
                  type="button"
                  onClick={() => applySocialTheme(setTheme, themeOption.id)}
                  className={`cursor-pointer rounded px-2 py-1 text-xs font-medium transition-colors ${
                    socialTheme === themeOption.id
                      ? "bg-social-accent text-social-ink"
                      : "text-social-ink/75 hover:bg-social-accent/45"
                  }`}
                >
                  {themeOption.label}
                </button>
              ))}
            </div>

            <Button
              asChild
              variant="outline"
              size="icon-sm"
              className="h-9 w-9 bg-social-surface text-social-ink hover:bg-social-accent/55"
            >
              <Link href="/" aria-label="Back to home">
                <House size={16} />
              </Link>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
          <aside className="grid h-fit gap-4 lg:sticky lg:top-4">
            <Card className="bg-social-surface shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Your reputation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-social-border bg-social-surface p-4 flex flex-col items-center justify-center min-h-25">
                  <p
                    className="text-3xl font-bold tracking-tight text-social-ink leading-tight flex items-center justify-center mb-1"
                    style={{ minHeight: "2.5em" }}
                  >
                    {data.myReputation}
                  </p>
                  <p className="text-xs text-social-ink/75 text-center mb-1">
                    Reputation points earned from positive reactions.
                  </p>
                </div>
                <Separator className="my-4 bg-social-border" />
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-social-ink/70">
                  Top contributors
                </p>
                <div className="grid gap-2">
                  {data.reputationBoard.slice(0, 5).map((entry, index) => (
                    <div
                      key={entry.author}
                      className="flex items-center justify-between rounded-lg bg-social-surface px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-social-ink">
                          {index + 1}.
                        </p>
                        <Avatar
                          size="sm"
                          className="border-social-avatar-border bg-social-avatar-bg"
                        >
                          <AvatarFallback>
                            {initialsFor(entry.author)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium text-social-ink">
                          {entry.author}
                        </p>
                      </div>
                      <Badge className="bg-social-accent/55 text-social-ink">
                        {entry.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          <section className="grid gap-4" aria-label="Post feed">
            <Card className="bg-social-surface shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <PenSquare size={16} />
                  Start a post
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Textarea
                    id="new-post-text"
                    className="min-h-29.5 bg-social-surface"
                    value={draftText}
                    onChange={(event) => setDraftText(event.target.value)}
                    placeholder="Share something useful: text update, photo, PDF, or any file."
                    suppressHydrationWarning
                  />

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-social-surface px-3 py-2 text-sm font-medium text-social-ink transition-colors hover:bg-social-accent/45">
                      <Paperclip size={14} />
                      Add attachments
                      <input
                        className="hidden"
                        type="file"
                        multiple
                        onChange={async (event) => {
                          const inputEl = event.currentTarget;
                          const parsed = await handleFiles(event.target.files);
                          setDraftAttachments((current) => [
                            ...current,
                            ...parsed,
                          ]);
                          inputEl.value = "";
                        }}
                      />
                    </label>

                    <Button
                      className="bg-social-ink text-social-accent hover:bg-social-ink-strong"
                      type="button"
                      onClick={handleCreatePost}
                      disabled={
                        !session?.user?.id ||
                        isPosting ||
                        (!draftText.trim() && draftAttachments.length === 0)
                      }
                    >
                      {isPosting ? "Publishing..." : "Publish"}
                    </Button>
                  </div>

                  {draftAttachments.length > 0 ? (
                    <div className="grid gap-2">
                      <p className="text-xs font-medium text-social-ink/75">
                        {draftAttachments.length} file(s) attached
                      </p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {draftAttachments.map((attachment, index) => (
                          <div
                            key={`${attachment.name}-${attachment.sizeBytes}-${index}`}
                            className="group relative rounded-md bg-social-surface p-2"
                          >
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-xs"
                              className="absolute right-1 top-1"
                              aria-label="Remove attachment from post draft"
                              onClick={() =>
                                setDraftAttachments((current) =>
                                  current.filter(
                                    (_, currentIndex) => currentIndex !== index,
                                  ),
                                )
                              }
                            >
                              <X size={11} />
                            </Button>

                            {attachment.mimeType.startsWith("image/") ? (
                              <Image
                                aria-label="Remove attachment from reply draft"
                                className="aspect-4/3 w-full rounded object-cover"
                                src={attachment.dataUrl}
                                alt={attachment.name}
                                width={800}
                                height={600}
                                unoptimized
                              />
                            ) : (
                              <div className="flex aspect-4/3 w-full items-center justify-center rounded bg-social-accent/40 text-social-ink/80">
                                {attachment.mimeType === "application/pdf" ? (
                                  <FileText size={18} />
                                ) : (
                                  <Paperclip size={18} />
                                )}
                              </div>
                            )}

                            <p className="mt-1 truncate text-xs text-social-ink/90">
                              {attachment.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            {actionError ? (
              <Card className="bg-social-surface shadow-sm">
                <CardContent className="pt-5 text-sm text-social-ink/80">
                  {actionError}
                </CardContent>
              </Card>
            ) : null}

            {visiblePosts.map((post) => {
              const postDraft = getPostDraft(post.id);
              const isCommentsOpen = expandedByPost[post.id] ?? false;
              const postCommentCount = commentCount(post.comments);
              const commentSortMode = commentSortByPost[post.id] ?? "top";
              const commentSearch = commentSearchByPost[post.id] ?? "";
              const visibleComments = filterAndSortComments(
                post.comments,
                commentSortMode,
                commentSearch,
              );

              return (
                <Card
                  key={post.id}
                  className="bg-social-surface transition-shadow hover:shadow-social-card-hover"
                >
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="border-social-avatar-border bg-social-avatar-bg">
                        <AvatarFallback>
                          {initialsFor(post.author)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-social-ink">
                          {post.author}
                        </p>
                        <p className="text-xs text-social-ink/70">
                          {formatTime(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    {post.content ? (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-social-ink">
                        {post.content}
                      </p>
                    ) : null}

                    {post.attachments.length > 0 ? (
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {post.attachments.map((attachment) => (
                          <AttachmentTile
                            key={attachment.id}
                            attachment={getResolvedAttachment(attachment)}
                            isLoading={!!loadingAttachmentById[attachment.id]}
                            onOpen={(item) => openViewer(post, item)}
                            onPrefetch={prefetchAttachment}
                          />
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-social-border pt-3">
                      <div className={postVoteBoxClass}>
                        <button
                          type="button"
                          className={`inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors ${
                            post.voteByMe === 1
                              ? "bg-social-accent"
                              : "hover:bg-social-accent/65"
                          }`}
                          onClick={() => handleVotePost(post.id, 1)}
                          aria-label="Upvote post"
                        >
                          <ArrowBigUp size={16} />
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold">
                          {post.score}
                        </span>
                        <button
                          type="button"
                          className={`inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors ${
                            post.voteByMe === -1
                              ? "bg-social-danger-soft"
                              : "hover:bg-social-accent/65"
                          }`}
                          onClick={() => handleVotePost(post.id, -1)}
                          aria-label="Downvote post"
                        >
                          <ArrowBigDown size={16} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className={actionBorderButtonClass}
                        onClick={() => togglePostComments(post.id)}
                        aria-expanded={isCommentsOpen}
                      >
                        <MessageSquare size={14} />
                        {isCommentsOpen ? "Hide" : "Comments"} (
                        {postCommentCount})
                      </button>
                    </div>

                    {isCommentsOpen ? (
                      <div className="mt-4 grid gap-3">
                        <div className="grid gap-2 rounded-md bg-social-surface p-3">
                          <Textarea
                            value={postDraft.text}
                            onChange={(event) =>
                              setCommentDraftByPost((current) => ({
                                ...current,
                                [post.id]: {
                                  text: event.target.value,
                                  attachments:
                                    current[post.id]?.attachments ?? [],
                                },
                              }))
                            }
                            className="min-h-22.5 text-left w-full resize-y"
                            placeholder="Write a comment"
                            suppressHydrationWarning
                          />
                          <div className="flex items-center gap-2 mt-1">
                            <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md border border-social-border bg-social-surface px-2 text-xs text-social-ink transition-colors hover:bg-social-accent/55">
                              <Paperclip size={14} />
                              Attach
                              <input
                                type="file"
                                className="hidden"
                                multiple
                                onChange={async (event) => {
                                  const inputEl = event.currentTarget;
                                  const files = await handleFiles(
                                    event.target.files,
                                  );
                                  setCommentDraftByPost((current) => {
                                    const existing = current[post.id] ?? {
                                      text: "",
                                      attachments: [],
                                    };
                                    return {
                                      ...current,
                                      [post.id]: {
                                        text: existing.text,
                                        attachments: [
                                          ...existing.attachments,
                                          ...files,
                                        ],
                                      },
                                    };
                                  });
                                  inputEl.value = "";
                                }}
                              />
                            </label>
                            <Button
                              type="button"
                              className="h-8 px-2 text-xs"
                              disabled={
                                !session?.user?.id ||
                                pendingCommentByPost[post.id] ||
                                (!postDraft.text.trim() &&
                                  postDraft.attachments.length === 0)
                              }
                              onClick={() => handleCreateComment(post.id)}
                            >
                              {pendingCommentByPost[post.id]
                                ? "Sending..."
                                : "Comment"}
                            </Button>
                          </div>
                          {/* Attachment preview below textbox, like post composer */}
                            {postDraft.attachments.length > 0 ? (
                            <div className="grid gap-2">
                              <p className="text-xs font-medium text-social-ink/75">
                                {postDraft.attachments.length} file(s) attached
                              </p>
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {postDraft.attachments.map(
                                  (attachment, index) => (
                                    <div
                                      key={`${attachment.name}-${attachment.sizeBytes}-${index}`}
                                      className="group relative rounded-md bg-social-surface p-2"
                                    >
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon-xs"
                                        className="absolute right-1 top-1"
                                        aria-label="Remove attachment from comment draft"
                                        onClick={() =>
                                          setCommentDraftByPost((current) => {
                                            const existing = current[
                                              post.id
                                            ] ?? {
                                              text: "",
                                              attachments: [],
                                            };
                                            return {
                                              ...current,
                                              [post.id]: {
                                                text: existing.text,
                                                attachments:
                                                  existing.attachments.filter(
                                                    (_, currentIndex) =>
                                                      currentIndex !== index,
                                                  ),
                                              },
                                            };
                                          })
                                        }
                                      >
                                        <X size={11} />
                                      </Button>

                                      {attachment.mimeType?.startsWith(
                                        "image/",
                                      ) ? (
                                        <Image
                                          className="aspect-4/3 w-full rounded object-cover"
                                          src={attachment.dataUrl}
                                          alt={attachment.name}
                                          width={800}
                                          height={600}
                                          unoptimized
                                        />
                                      ) : (
                                        <div className="flex aspect-4/3 w-full items-center justify-center rounded bg-social-accent/40 text-social-ink/80">
                                          {attachment.mimeType ===
                                          "application/pdf" ? (
                                            <FileText size={18} />
                                          ) : (
                                            <Paperclip size={18} />
                                          )}
                                        </div>
                                      )}

                                      <p className="mt-1 truncate text-xs text-social-ink/90">
                                        {attachment.name}
                                      </p>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        {post.comments.length > 0 ? (
                          <div className="grid gap-3">
                            <div className="flex flex-col gap-2 rounded-xl bg-social-page-bg/60 p-2 sm:flex-row sm:items-center sm:justify-between">
                              <label className="relative block w-full sm:max-w-75">
                                <Search
                                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-social-ink/65"
                                  size={14}
                                />
                                <Input
                                  value={commentSearch}
                                  onChange={(event) =>
                                    setCommentSearchByPost((current) => ({
                                      ...current,
                                      [post.id]: event.target.value,
                                    }))
                                  }
                                  className="h-8 pl-8 text-xs"
                                  placeholder="Search comments"
                                  suppressHydrationWarning
                                />
                              </label>

                              <div className="inline-flex rounded-full bg-social-surface p-1">
                                {[
                                  { id: "top", label: "Top" },
                                  { id: "new", label: "Newest" },
                                  { id: "old", label: "Oldest" },
                                ].map((option) => (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() =>
                                      setCommentSortByPost((current) => ({
                                        ...current,
                                        [post.id]: option.id as
                                          | "top"
                                          | "new"
                                          | "old",
                                      }))
                                    }
                                    className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                      commentSortMode === option.id
                                        ? "bg-social-accent text-social-ink"
                                        : "text-social-ink/75 hover:bg-social-accent/55"
                                    }`}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {visibleComments.length > 0 ? (
                              <div className="divide-y divide-social-border/70">
                                {visibleComments.map((comment) => (
                                  <CommentItem
                                    key={comment.id}
                                    postId={post.id}
                                    comment={comment}
                                    collapsedByComment={collapsedByComment}
                                    toggleReplies={toggleReplies}
                                    getReplyDraft={getReplyDraft}
                                    updateReplyDraft={(commentId, draft) =>
                                      setReplyDraftByComment((current) => ({
                                        ...current,
                                        [commentId]: draft,
                                      }))
                                    }
                                    addReplyAttachment={async (
                                      commentId,
                                      files,
                                    ) => {
                                      const parsed = await handleFiles(files);
                                      setReplyDraftByComment((current) => {
                                        const existing = current[commentId] ?? {
                                          text: "",
                                          attachments: [],
                                        };
                                        return {
                                          ...current,
                                          [commentId]: {
                                            text: existing.text,
                                            attachments: [
                                              ...existing.attachments,
                                              ...parsed,
                                            ],
                                          },
                                        };
                                      });
                                    }}
                                    removeReplyAttachment={(commentId, index) =>
                                      setReplyDraftByComment((current) => {
                                        const existing = current[commentId] ?? {
                                          text: "",
                                          attachments: [],
                                        };
                                        return {
                                          ...current,
                                          [commentId]: {
                                            text: existing.text,
                                            attachments:
                                              existing.attachments.filter(
                                                (_, i) => i !== index,
                                              ),
                                          },
                                        };
                                      })
                                    }
                                    submitReply={handleCreateReply}
                                    voteComment={handleVoteComment}
                                    openAttachment={(attachment) =>
                                      openViewer(post, attachment)
                                    }
                                    pendingReplyByComment={
                                      pendingReplyByComment
                                    }
                                    resolveAttachment={getResolvedAttachment}
                                    isAttachmentLoading={(attachmentId) =>
                                      !!loadingAttachmentById[attachmentId]
                                    }
                                    prefetchAttachment={prefetchAttachment}
                                    canInteract={!!session?.user?.id}
                                  />
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-social-ink/70">
                                No comments match your search.
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <aside className="grid h-fit gap-4 lg:sticky lg:top-4">
            <Card className="bg-social-surface shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Find posts</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <label className="relative block">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-social-ink/70"
                    size={15}
                  />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="pl-9"
                    placeholder="Search author, text, or comments"
                    suppressHydrationWarning
                  />
                </label>

                <div className="grid gap-2">
                  <Button
                    variant={postFilter === "all" ? "default" : "outline"}
                    className={
                      postFilter === "all"
                        ? "bg-social-ink text-social-accent hover:bg-social-ink-strong"
                        : ""
                    }
                    onClick={() => setPostFilter("all")}
                  >
                    All posts
                  </Button>
                  <Button
                    variant={postFilter === "top" ? "default" : "outline"}
                    className={
                      postFilter === "top"
                        ? "bg-social-ink text-social-accent hover:bg-social-ink-strong"
                        : ""
                    }
                    onClick={() => setPostFilter("top")}
                  >
                    Top scored
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <AttachmentViewer
        state={viewerState}
        onClose={() => setViewerState(null)}
      />
    </section>
  );
}
