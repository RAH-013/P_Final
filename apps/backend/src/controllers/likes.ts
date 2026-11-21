import type { Request, Response } from "express";
import { z } from "zod";
import { addLike, getUserLikes, removeLike } from "../services/likes.js";

const likeSchema = z.object({
  externalId: z.string().regex(/^tt\d+$/),
  mediaType: z.enum(["movie", "series"]),
});

const removeLikeSchema = z.object({
  externalId: z.string().regex(/^tt\d+$/),
  mediaType: z.enum(["movie", "series"]),
});

export async function getLikes(req: Request, res: Response) {
  const userId = Number(req.user!.sub);

  const likes = await getUserLikes(userId);

  return res.json({
    likes,
  });
}

export async function createLike(req: Request, res: Response) {
  const validation = likeSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: "Los datos del favorito no son válidos",
      detalles: validation.error.issues,
    });
  }

  const userId = Number(req.user!.sub);

  const like = await addLike(
    userId,
    validation.data.externalId,
    validation.data.mediaType,
  );

  return res.status(201).json({
    message: "Contenido agregado a tus favoritos",
    like,
  });
}

export async function deleteLike(req: Request, res: Response) {
  const validation = removeLikeSchema.safeParse({
    externalId: req.params.externalId,
    mediaType: req.params.mediaType,
  });

  if (!validation.success) {
    return res.status(400).json({
      error: "Los datos del favorito no son válidos",
      detalles: validation.error.issues,
    });
  }

  const userId = Number(req.user!.sub);

  const result = await removeLike(
    userId,
    validation.data.externalId,
    validation.data.mediaType,
  );

  return res.json(result);
}
