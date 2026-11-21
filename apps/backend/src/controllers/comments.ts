import type { Request, Response } from "express";
import { z } from "zod";
import {
  createComment as createCommentService,
  deleteComment as deleteCommentService,
  getComments as getCommentsService,
  updateComment as updateCommentService,
} from "../services/comments.js";

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

export async function getComments(req: Request, res: Response) {
  const validation = mediaSchema.safeParse({
    externalId: req.params.externalId,
    mediaType: req.params.mediaType,
  });

  if (!validation.success) {
    return res.status(400).json({
      error: "Los datos del contenido no son válidos",
      detalles: validation.error.issues,
    });
  }

  const comments = await getCommentsService(
    validation.data.externalId,
    validation.data.mediaType,
  );

  return res.json({
    comments,
  });
}

export async function createComment(req: Request, res: Response) {
  const validation = createCommentSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: "Los datos del comentario no son válidos",
      detalles: validation.error.issues,
    });
  }

  const userId = Number(req.user!.sub);

  const comment = await createCommentService(
    userId,
    validation.data.externalId,
    validation.data.mediaType,
    validation.data.content,
  );

  return res.status(201).json({
    message: "Comentario publicado",
    comment,
  });
}

export async function updateComment(req: Request, res: Response) {
  const idValidation = commentIdSchema.safeParse(req.params);
  const bodyValidation = updateCommentSchema.safeParse(req.body);

  if (!idValidation.success || !bodyValidation.success) {
    return res.status(400).json({
      error: "Los datos del comentario no son válidos",
      detalles: [
        ...(idValidation.success ? [] : idValidation.error.issues),
        ...(bodyValidation.success ? [] : bodyValidation.error.issues),
      ],
    });
  }

  const userId = Number(req.user!.sub);

  const comment = await updateCommentService(
    idValidation.data.id,
    userId,
    bodyValidation.data.content,
  );

  return res.json({
    message: "Comentario actualizado",
    comment,
  });
}

export async function deleteComment(req: Request, res: Response) {
  const validation = commentIdSchema.safeParse(req.params);

  if (!validation.success) {
    return res.status(400).json({
      error: "El ID del comentario no es válido",
      detalles: validation.error.issues,
    });
  }

  const userId = Number(req.user!.sub);
  const role = req.user!.role;

  const result = await deleteCommentService(validation.data.id, userId, role);

  return res.json(result);
}
