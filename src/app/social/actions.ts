"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CURRENT_VIEWER_NAME } from "@/lib/constants";
import {
  createCommentSchema,
  createPostSchema,
  voteCommentSchema,
  votePostSchema,
} from "@/lib/validators";

let cachedViewerId: string | null = null;

const ensureViewerId = async () => {
  if (cachedViewerId) {
    return cachedViewerId;
  }

  const viewer = await prisma.user.upsert({
    where: { name: CURRENT_VIEWER_NAME },
    update: {},
    create: { name: CURRENT_VIEWER_NAME },
    select: { id: true },
  });

  cachedViewerId = viewer.id;
  return viewer.id;
};

const refreshSocialRoute = () => {
  revalidateTag("social-board-data");
  revalidatePath("/social");
};

export const createPostAction = async (input: unknown) => {
  const parsed = createPostSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false as const, error: "Invalid post" };
  }

  try {
    const viewerId = await ensureViewerId();

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
    const viewerId = await ensureViewerId();

    await prisma.comment.create({
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
    });

    refreshSocialRoute();
    return { ok: true as const };
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
    const viewerId = await ensureViewerId();
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
    const viewerId = await ensureViewerId();
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
