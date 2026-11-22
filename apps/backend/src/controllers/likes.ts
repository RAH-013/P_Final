import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  addLike,
  getUserLike,
  getUserLikes,
  removeLike,
} from "../services/likes.js";

const likeSchema = z.object({
  externalId: z.string().regex(/^tt\d+$/),
  mediaType: z.enum(["movie", "series"]),
});

const likeIdSchema = z.string().regex(/^[1-9]\d*$/);

export async function getLikes(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = Number(req.user!.sub);
    const likes = await getUserLikes(userId);

    return res.json({ likes });
  } catch (error) {
    return next(error);
  }
}

export async function getLikeById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const validation = likeIdSchema.safeParse(req.params.id);

    if (!validation.success) {
      return res.status(400).json({
        error: "El ID del favorito no es válido",
        detalles: validation.error.issues,
      });
    }

    const userId = Number(req.user!.sub);
    const like = await getUserLike(userId, Number(validation.data));

    return res.json({ like });
  } catch (error) {
    return next(error);
  }
}

export async function createLike(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
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
  } catch (error) {
    return next(error);
  }
}

export async function deleteLike(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const validation = likeSchema.safeParse({
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
  } catch (error) {
    return next(error);
  }
}
