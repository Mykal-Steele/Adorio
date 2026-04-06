import "server-only";
import { unstable_cache } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { REPUTATION_MULTIPLIER } from "@/lib/constants";
import type { ReputationEntry, SocialAttachment, SocialBoardData, SocialComment, SocialPost } from "@/lib/types";

type PostQueryResult = Prisma.PostGetPayload<{
  select: {
    id: true;
    content: true;
    createdAt: true;
    author: {
      select: { name: true };
    };
    attachments: {
      select: {
        id: true;
        name: true;
        mimeType: true;
        sizeBytes: true;
        isImage: true;
        isPdf: true;
      };
    };
    comments: {
      orderBy: { createdAt: "desc" };
      take: 200;
      select: {
        id: true;
        text: true;
        createdAt: true;
        parentId: true;
        author: {
          select: { name: true };
        };
        attachments: {
          select: {
            id: true;
            name: true;
            mimeType: true;
            sizeBytes: true;
            isImage: true;
            isPdf: true;
          };
        };
      };
    };
  };
}>;

type CommentQueryResult = PostQueryResult["comments"][number];

const toVoteValue = (value: number): -1 | 0 | 1 => {
  if (value > 0) {
    return 1;
  }

  if (value < 0) {
    return -1;
  }

  return 0;
};

const mapAttachment = (attachment: {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  isImage: boolean;
  isPdf: boolean;
}): SocialAttachment => ({
  id: attachment.id,
  name: attachment.name,
  mimeType: attachment.mimeType,
  sizeBytes: attachment.sizeBytes,
  isImage: attachment.isImage,
  isPdf: attachment.isPdf,
});

const collectReputationFromComments = (comments: SocialComment[], tracker: Map<string, number>) => {
  comments.forEach((comment) => {
    const current = tracker.get(comment.author) ?? 0;
    const earned = Math.max(comment.score, 0) * REPUTATION_MULTIPLIER.comment;
    tracker.set(comment.author, current + earned);

    if (comment.replies.length > 0) {
      collectReputationFromComments(comment.replies, tracker);
    }
  });
};

const buildReputationBoard = (
  posts: SocialPost[],
  viewerName: string | null,
): SocialBoardData => {
  const tracker = new Map<string, number>();

  posts.forEach((post) => {
    const current = tracker.get(post.author) ?? 0;
    const earned = Math.max(post.score, 0) * REPUTATION_MULTIPLIER.post;
    tracker.set(post.author, current + earned);

    if (post.comments.length > 0) {
      collectReputationFromComments(post.comments, tracker);
    }
  });

  const reputationBoard: ReputationEntry[] = Array.from(tracker.entries())
    .map(([author, points]) => ({ author, points }))
    .sort((a, b) => b.points - a.points);

  return {
    posts,
    reputationBoard,
    myReputation: reputationBoard.find((entry) => entry.author === viewerName)?.points ?? 0,
  };
};

const getSocialBoardDataUncached = async (
  viewerName: string | null,
): Promise<SocialBoardData> => {
  let posts: PostQueryResult[] = [];

  try {
    posts = await prisma.post.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: { name: true },
        },
        attachments: {
          select: {
            id: true,
            name: true,
            mimeType: true,
            sizeBytes: true,
            isImage: true,
            isPdf: true,
          },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          take: 200,
          select: {
            id: true,
            text: true,
            createdAt: true,
            parentId: true,
            author: {
              select: { name: true },
            },
            attachments: {
              select: {
                id: true,
                name: true,
                mimeType: true,
                sizeBytes: true,
                isImage: true,
                isPdf: true,
              },
            },
          },
        },
      },
    });
  } catch {
    return {
      posts: [],
      reputationBoard: [],
      myReputation: 0,
    };
  }

  const postIds = posts.map((post) => post.id);
  const commentIds = posts.flatMap((post) =>
    post.comments.map((comment) => comment.id),
  );

  const [postVoteSums, commentVoteSums] = await Promise.all([
    postIds.length > 0
      ? prisma.postVote.groupBy({
          by: ["postId"],
          where: {
            postId: {
              in: postIds,
            },
          },
          _sum: {
            value: true,
          },
        })
      : Promise.resolve([]),
    commentIds.length > 0
      ? prisma.commentVote.groupBy({
          by: ["commentId"],
          where: {
            commentId: {
              in: commentIds,
            },
          },
          _sum: {
            value: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const postScoreById = new Map(
    postVoteSums.map((item) => [item.postId, item._sum.value ?? 0]),
  );
  const commentScoreById = new Map(
    commentVoteSums.map((item) => [item.commentId, item._sum.value ?? 0]),
  );

  const buildCommentTreeWithScores = (
    comments: CommentQueryResult[],
  ): SocialComment[] => {
    const childrenByParent = new Map<string, CommentQueryResult[]>();

    comments.forEach((comment) => {
      if (!comment.parentId) {
        return;
      }

      const bucket = childrenByParent.get(comment.parentId) ?? [];
      bucket.push(comment);
      childrenByParent.set(comment.parentId, bucket);
    });

    const mapCommentNode = (comment: CommentQueryResult): SocialComment => {
      const directReplies = (childrenByParent.get(comment.id) ?? [])
        .slice()
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((reply) => mapCommentNode(reply));

      return {
        id: comment.id,
        author: comment.author.name,
        text: comment.text,
        createdAt: comment.createdAt.toISOString(),
        score: commentScoreById.get(comment.id) ?? 0,
        voteByMe: 0,
        attachments: comment.attachments.map((attachment) => mapAttachment(attachment)),
        replies: directReplies,
      };
    };

    return comments
      .filter((comment) => !comment.parentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((comment) => mapCommentNode(comment));
  };

  const mappedPosts: SocialPost[] = posts.map((post) => {
    return {
      id: post.id,
      author: post.author.name,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      score: postScoreById.get(post.id) ?? 0,
      voteByMe: 0,
      attachments: post.attachments.map((attachment) => mapAttachment(attachment)),
      comments: buildCommentTreeWithScores(post.comments),
    };
  });

  return buildReputationBoard(mappedPosts, viewerName);
};

const getAnonymousSocialBoardDataCached = unstable_cache(
  async () => getSocialBoardDataUncached(null),
  ["social-board-data"],
  {
    revalidate: 30,
    tags: ["social-board-data"],
  },
);

export const getSocialBoardData = async (): Promise<SocialBoardData> =>
  getAnonymousSocialBoardDataCached();

type SocialViewerVotes = {
  postVotes: Record<string, -1 | 0 | 1>;
  commentVotes: Record<string, -1 | 0 | 1>;
};

export const getSocialViewerVotes = async (
  viewerUserId: string,
): Promise<SocialViewerVotes> => {
  const [postVotes, commentVotes] = await Promise.all([
    prisma.postVote.findMany({
      where: { userId: viewerUserId },
      select: { postId: true, value: true },
    }),
    prisma.commentVote.findMany({
      where: { userId: viewerUserId },
      select: { commentId: true, value: true },
    }),
  ]);

  return {
    postVotes: Object.fromEntries(
      postVotes.map((vote) => [vote.postId, toVoteValue(vote.value)]),
    ),
    commentVotes: Object.fromEntries(
      commentVotes.map((vote) => [vote.commentId, toVoteValue(vote.value)]),
    ),
  };
};
