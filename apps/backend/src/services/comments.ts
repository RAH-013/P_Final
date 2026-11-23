import Comment, { type CommentMediaType } from "../models/Comment.js";
import User from "../models/User.js";
import { getCatalogMetadata } from "./catalog/catalog.js";

export class CommentError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "CommentError";
  }
}

const COMMENT_ATTRIBUTES = [
  "id",
  "userId",
  "externalId",
  "mediaType",
  "content",
  "createdAt",
  "updatedAt",
] as const;

const USER_ATTRIBUTES = ["id", "username"] as const;

const COMMENT_INCLUDE = [
  {
    model: User,
    as: "user",
    attributes: [...USER_ATTRIBUTES],
  },
];

function validateMedia(
  externalId: string,
  mediaType: string,
): asserts mediaType is CommentMediaType {
  if (!/^tt\d+$/.test(externalId)) {
    throw new CommentError("El ID del contenido no es válido", 400);
  }

  if (mediaType !== "movie" && mediaType !== "series") {
    throw new CommentError("El tipo debe ser movie o series", 400);
  }
}

function validateContent(content: string): string {
  if (typeof content !== "string") {
    throw new CommentError("El comentario debe ser un texto", 400);
  }

  const normalized = content.trim();

  if (!normalized) {
    throw new CommentError("El comentario no puede estar vacío", 400);
  }

  if (normalized.length > 1000) {
    throw new CommentError(
      "El comentario no puede superar los 1000 caracteres",
      400,
    );
  }

  return normalized;
}

export async function getAllComments() {
  return Comment.findAll({
    attributes: [...COMMENT_ATTRIBUTES],
    include: COMMENT_INCLUDE,
    order: [["createdAt", "DESC"]],
  });
}

export async function getCommentById(commentId: number) {
  if (!Number.isInteger(commentId) || commentId <= 0) {
    throw new CommentError("El ID del comentario no es válido", 400);
  }

  const comment = await Comment.findByPk(commentId, {
    attributes: [...COMMENT_ATTRIBUTES],
    include: COMMENT_INCLUDE,
  });

  if (!comment) {
    throw new CommentError("Comentario no encontrado", 404);
  }

  return comment;
}

export async function getComments(externalId: string, mediaType: string) {
  validateMedia(externalId, mediaType);

  return Comment.findAll({
    where: {
      externalId,
      mediaType,
    },
    attributes: [...COMMENT_ATTRIBUTES],
    include: COMMENT_INCLUDE,
    order: [["createdAt", "DESC"]],
  });
}

export async function getCommentsByUser(userId: number) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new CommentError("El ID del usuario no es válido", 400);
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw new CommentError("Usuario no encontrado", 404);
  }

  return Comment.findAll({
    where: { userId },
    attributes: [...COMMENT_ATTRIBUTES],
    include: COMMENT_INCLUDE,
    order: [["createdAt", "DESC"]],
  });
}

export async function createComment(
  userId: number,
  externalId: string,
  mediaType: string,
  content: string,
) {
  validateMedia(externalId, mediaType);

  const normalizedContent = validateContent(content);

  const metadata = await getCatalogMetadata(externalId, mediaType);

  if (!metadata) {
    throw new CommentError("La película o serie no existe", 404);
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw new CommentError("Usuario no encontrado", 404);
  }

  const comment = await Comment.create({
    userId,
    externalId,
    mediaType,
    content: normalizedContent,
  });

  return getCommentById(comment.id);
}

export async function updateComment(
  commentId: number,
  userId: number,
  content: string,
) {
  if (!Number.isInteger(commentId) || commentId <= 0) {
    throw new CommentError("El ID del comentario no es válido", 400);
  }

  const normalizedContent = validateContent(content);

  const comment = await Comment.findByPk(commentId);

  if (!comment) {
    throw new CommentError("Comentario no encontrado", 404);
  }

  if (comment.userId !== userId) {
    throw new CommentError(
      "No tienes permiso para modificar este comentario",
      403,
    );
  }

  comment.content = normalizedContent;

  await comment.save();

  return getCommentById(commentId);
}

export async function deleteComment(
  commentId: number,
  userId: number,
  role: string,
) {
  if (!Number.isInteger(commentId) || commentId <= 0) {
    throw new CommentError("El ID del comentario no es válido", 400);
  }

  const comment = await Comment.findByPk(commentId);

  if (!comment) {
    throw new CommentError("Comentario no encontrado", 404);
  }

  if (comment.userId !== userId && role !== "admin") {
    throw new CommentError(
      "No tienes permiso para eliminar este comentario",
      403,
    );
  }

  await comment.destroy();

  return {
    message: "Comentario eliminado",
  };
}
