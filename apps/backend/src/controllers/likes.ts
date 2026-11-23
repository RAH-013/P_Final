import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

import {
  addLike,
  getUserLike,
  getUserLikes,
  removeLike,
} from "../services/likes.js";

import { sendSuccess } from "../utils/response.js";

const likeSchema = z.object({
  externalId: z.string().regex(/^tt\d+$/),
  mediaType: z.enum(["movie", "series"]),
});

const likeIdSchema = z.string().regex(/^[1-9]\d*$/);

export async function getLikes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = Number(req.user!.sub);
    const likes = await getUserLikes(userId);

    sendSuccess(res, 200, "Favoritos obtenidos correctamente", { likes });
  } catch (error) {
    next(error);
  }
}

export async function getLikeById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const validation = likeIdSchema.safeParse(req.params.id);

  if (!validation.success) {
    next(
      Object.assign(new Error("El ID del favorito no es válido"), {
        status: 400,
        detalles: validation.error.issues,
      }),
    );
    return;
  }

  try {
    const userId = Number(req.user!.sub);
    const like = await getUserLike(userId, Number(validation.data));

    sendSuccess(res, 200, "Favorito obtenido correctamente", { like });
  } catch (error) {
    next(error);
  }
}

export async function createLike(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const validation = likeSchema.safeParse(req.body);

  if (!validation.success) {
    next(
      Object.assign(new Error("Los datos del favorito no son válidos"), {
        status: 400,
        detalles: validation.error.issues,
      }),
    );
    return;
  }

  try {
    const userId = Number(req.user!.sub);

    const like = await addLike(
      userId,
      validation.data.externalId,
      validation.data.mediaType,
    );

    sendSuccess(res, 201, "Contenido agregado a tus favoritos", { like });
  } catch (error) {
    next(error);
  }
}

export async function deleteLike(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const validation = likeSchema.safeParse({
    externalId: req.params.externalId,
    mediaType: req.params.mediaType,
  });

  if (!validation.success) {
    next(
      Object.assign(new Error("Los datos del favorito no son válidos"), {
        status: 400,
        detalles: validation.error.issues,
      }),
    );
    return;
  }

  try {
    const userId = Number(req.user!.sub);

    const result = await removeLike(
      userId,
      validation.data.externalId,
      validation.data.mediaType,
    );

    sendSuccess(res, 200, result.message, result);
  } catch (error) {
    next(error);
  }
}
