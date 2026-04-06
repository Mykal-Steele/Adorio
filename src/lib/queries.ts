import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CURRENT_VIEWER_NAME, REPUTATION_MULTIPLIER } from "@/lib/constants";
import type { ReputationEntry, SocialAttachment, SocialBoardData, SocialComment, SocialPost } from "@/lib/types";

type PostQueryResult = Prisma.PostGetPayload<{
  include: {
    author: true;
    attachments: true;
    votes: {
      include: {
        user: {
          select: { name: true };
        };
      };
    };
    comments: {
      orderBy: { createdAt: "desc" };
      include: {
        attachments: true;
        author: true;
        votes: {
          include: {
            user: {
              select: { name: true };
            };
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
  dataUrl: string;
  isImage: boolean;
  isPdf: boolean;
}): SocialAttachment => ({
  id: attachment.id,
  name: attachment.name,
  mimeType: attachment.mimeType,
  sizeBytes: attachment.sizeBytes,
  dataUrl: attachment.dataUrl,
  isImage: attachment.isImage,
  isPdf: attachment.isPdf,
});

const buildCommentTree = (comments: CommentQueryResult[], viewerName: string): SocialComment[] => {
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
    const score = comment.votes.reduce((total, vote) => total + vote.value, 0);
    const voteByMe = toVoteValue(comment.votes.find((vote) => vote.user.name === viewerName)?.value ?? 0);
    const directReplies = (childrenByParent.get(comment.id) ?? [])
      .slice()
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((reply) => mapCommentNode(reply));

    return {
      id: comment.id,
      author: comment.author.name,
      text: comment.text,
      createdAt: comment.createdAt.toISOString(),
      score,
      voteByMe,
      attachments: comment.attachments.map((attachment) => mapAttachment(attachment)),
      replies: directReplies,
    };
  };

  return comments
    .filter((comment) => !comment.parentId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((comment) => mapCommentNode(comment));
};

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

const buildReputationBoard = (posts: SocialPost[], viewerName: string): SocialBoardData => {
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

export const getSocialBoardData = async (viewerName = CURRENT_VIEWER_NAME): Promise<SocialBoardData> => {
  let posts: PostQueryResult[] = [];

  try {
    posts = await prisma.post.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        author: true,
        attachments: true,
        votes: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            attachments: true,
            author: true,
            votes: {
              include: {
                user: {
                  select: { name: true },
                },
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

  const mappedPosts: SocialPost[] = posts.map((post) => {
    const score = post.votes.reduce((total, vote) => total + vote.value, 0);
    const voteByMe = toVoteValue(post.votes.find((vote) => vote.user.name === viewerName)?.value ?? 0);

    return {
      id: post.id,
      author: post.author.name,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      score,
      voteByMe,
      attachments: post.attachments.map((attachment) => mapAttachment(attachment)),
      comments: buildCommentTree(post.comments, viewerName),
    };
  });

  return buildReputationBoard(mappedPosts, viewerName);
};
