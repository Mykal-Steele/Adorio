"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createCommentSchema,
  createPostSchema,
  voteCommentSchema,
  votePostSchema,
} from "@/lib/validators";

const getSessionUserId = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.id ?? null;
};

const refreshSocialRoute = () => {
  revalidateTag("social-board-data");
  revalidatePath("/social");
};

const attachmentDataRequestSchema = z.object({
  attachmentId: z.string().cuid(),
});

export const getAttachmentDataUrlAction = async (input: unknown) => {
  const parsed = attachmentDataRequestSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: "Invalid attachment id" };
  }

  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: parsed.data.attachmentId },
      select: { dataUrl: true },
    });

    if (!attachment) {
      return { ok: false as const, error: "Attachment not found" };
    }

    return { ok: true as const, dataUrl: attachment.dataUrl };
  } catch (error) {
    console.error(error);
    return { ok: false as const, error: "Internal server error" };
  }
};

export const createPostAction = async (input: unknown) => {
  const parsed = createPostSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: "Invalid post" };
  }

  try {
    const viewerId = await getSessionUserId();

    if (!viewerId) {
      return { ok: false as const, error: "Please sign in to post." };
    }

    await prisma.post.create({
      data: {
        content: parsed.data.content,
        authorId: viewerId,
        attachments: {
          create: parsed.data.attachments.map((a) => ({
            name: a.name,
            mimeType: a.mimeType,
            sizeBytes: a.sizeBytes,
            dataUrl: a.dataUrl,
            isImage: a.mimeType.startsWith("image/"),
            isPdf: a.mimeType === "application/pdf",
          })),
        },
      },
    });

    refreshSocialRoute();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return { ok: false as const, error: "Internal server error" };
  }
};

export const createCommentAction = async (input: unknown) => {
  const parsed = createCommentSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: "Invalid comment" };
  }

  try {
    const viewerId = await getSessionUserId();

    if (!viewerId) {
      return { ok: false as const, error: "Please sign in to comment." };
    }

    const createdComment = await prisma.comment.create({
      data: {
        text: parsed.data.text,
        authorId: viewerId,
        postId: parsed.data.postId,
        parentId: parsed.data.parentId,
        attachments: {
          create: parsed.data.attachments.map((a) => ({
            name: a.name,
            mimeType: a.mimeType,
            sizeBytes: a.sizeBytes,
            dataUrl: a.dataUrl,
            isImage: a.mimeType.startsWith("image/"),
            isPdf: a.mimeType === "application/pdf",
          })),
        },
      },
      select: {
        id: true,
      },
    });

    refreshSocialRoute();
    return { ok: true as const, commentId: createdComment.id };
  } catch (error) {
    console.error(error);
    return { ok: false as const, error: "Internal server error" };
  }
};

export const votePostAction = async (input: unknown) => {
  const parsed = votePostSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: "Invalid vote" };
  }

  try {
    const viewerId = await getSessionUserId();

    if (!viewerId) {
      return { ok: false as const, error: "Please sign in to vote." };
    }

    const existing = await prisma.postVote.findUnique({
      where: {
        postId_userId: {
          postId: parsed.data.postId,
          userId: viewerId,
        },
      },
    });

    if (existing) {
      if (existing.value === parsed.data.value) {
        await prisma.postVote.delete({ where: { id: existing.id } });
      } else {
        await prisma.postVote.update({
          where: { id: existing.id },
          data: { value: parsed.data.value },
        });
      }
    } else {
      await prisma.postVote.create({
        data: {
          postId: parsed.data.postId,
          userId: viewerId,
          value: parsed.data.value,
        },
      });
    }

    refreshSocialRoute();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return { ok: false as const, error: "Internal server error" };
  }
};

export const voteCommentAction = async (input: unknown) => {
  const parsed = voteCommentSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: "Invalid vote" };
  }

  try {
    const viewerId = await getSessionUserId();

    if (!viewerId) {
      return { ok: false as const, error: "Please sign in to vote." };
    }

    const existing = await prisma.commentVote.findUnique({
      where: {
        commentId_userId: {
          commentId: parsed.data.commentId,
          userId: viewerId,
        },
      },
    });

    if (existing) {
      if (existing.value === parsed.data.value) {
        await prisma.commentVote.delete({ where: { id: existing.id } });
      } else {
        await prisma.commentVote.update({
          where: { id: existing.id },
          data: { value: parsed.data.value },
        });
      }
    } else {
      await prisma.commentVote.create({
        data: {
          commentId: parsed.data.commentId,
          userId: viewerId,
          value: parsed.data.value,
        },
      });
    }

    refreshSocialRoute();
    return { ok: true as const };
  } catch (error) {
    console.error(error);
    return { ok: false as const, error: "Internal server error" };
  }
};
