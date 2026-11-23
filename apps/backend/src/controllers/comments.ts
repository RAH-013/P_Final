import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

import {
  createComment as createCommentService,
  deleteComment as deleteCommentService,
  getAllComments as getAllCommentsService,
  getCommentById as getCommentByIdService,
  getCommentsByUser as getCommentsByUserService,
  getComments as getCommentsService,
  updateComment as updateCommentService,
} from "../services/comments.js";

import { sendSuccess } from "../utils/response.js";

const mediaSchema = z.object({
  externalId: z.string().regex(/^tt\d+$/),
  mediaType: z.enum(["movie", "series"]),
});

const createCommentSchema = mediaSchema.extend({
  content: z.string().trim().min(1).max(1000),
});

const updateCommentSchema = z.object({
  content: z.string().trim().min(1).max(1000),
});

const commentIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const userIdSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export async function getAllComments(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const comments = await getAllCommentsService();

    sendSuccess(res, 200, "Comentarios obtenidos correctamente", {
      comments,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCommentById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const validation = commentIdSchema.safeParse(req.params);

  if (!validation.success) {
    next(
      Object.assign(new Error("El ID del comentario no es válido"), {
        status: 400,
        detalles: validation.error.issues,
      }),
    );
    return;
  }

  try {
    const comment = await getCommentByIdService(validation.data.id);

    sendSuccess(res, 200, "Comentario obtenido correctamente", {
      comment,
    });
  } catch (error) {
    next(error);
  }
}

export async function getComments(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const validation = mediaSchema.safeParse({
    externalId: req.params.externalId,
    mediaType: req.params.mediaType,
  });

  if (!validation.success) {
    next(
      Object.assign(new Error("Los datos del contenido no son válidos"), {
        status: 400,
        detalles: validation.error.issues,
      }),
    );
    return;
  }

  try {
    const comments = await getCommentsService(
      validation.data.externalId,
      validation.data.mediaType,
    );

    sendSuccess(res, 200, "Comentarios obtenidos correctamente", {
      comments,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCommentsByUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const validation = userIdSchema.safeParse(req.params);

  if (!validation.success) {
    next(
      Object.assign(new Error("El ID del usuario no es válido"), {
        status: 400,
        detalles: validation.error.issues,
      }),
    );
    return;
  }

  try {
    const comments = await getCommentsByUserService(validation.data.userId);

    sendSuccess(res, 200, "Comentarios del usuario obtenidos correctamente", {
      comments,
    });
  } catch (error) {
    next(error);
  }
}

export async function createComment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const validation = createCommentSchema.safeParse(req.body);

  if (!validation.success) {
    next(
      Object.assign(new Error("Los datos del comentario no son válidos"), {
        status: 400,
        detalles: validation.error.issues,
      }),
    );
    return;
  }

  try {
    const userId = Number(req.user!.sub);

    const comment = await createCommentService(
      userId,
      validation.data.externalId,
      validation.data.mediaType,
      validation.data.content,
    );

    sendSuccess(res, 201, "Comentario publicado", {
      id: comment.id,
      comment,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateComment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const idValidation = commentIdSchema.safeParse(req.params);
  const bodyValidation = updateCommentSchema.safeParse(req.body);

  if (!idValidation.success || !bodyValidation.success) {
    next(
      Object.assign(new Error("Los datos del comentario no son válidos"), {
        status: 400,
        detalles: [
          ...(idValidation.success ? [] : idValidation.error.issues),
          ...(bodyValidation.success ? [] : bodyValidation.error.issues),
        ],
      }),
    );
    return;
  }

  try {
    const userId = Number(req.user!.sub);

    const comment = await updateCommentService(
      idValidation.data.id,
      userId,
      bodyValidation.data.content,
    );

    sendSuccess(res, 200, "Comentario actualizado", {
      comment,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteComment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const validation = commentIdSchema.safeParse(req.params);

  if (!validation.success) {
    next(
      Object.assign(new Error("El ID del comentario no es válido"), {
        status: 400,
        detalles: validation.error.issues,
      }),
    );
    return;
  }

  try {
    const userId = Number(req.user!.sub);
    const role = req.user!.role;

    const result = await deleteCommentService(validation.data.id, userId, role);

    sendSuccess(res, 200, result.message, result);
  } catch (error) {
    next(error);
  }
}
