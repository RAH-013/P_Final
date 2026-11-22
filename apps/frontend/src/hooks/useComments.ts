import { useState } from "react";

import {
  createComment,
  deleteComment,
  getAllComments,
  getCommentById,
  getCommentsByMedia,
  updateComment,
} from "../api/services/comments";

import type { Comment, MediaType } from "../api/types";
import { useApiRequest } from "./useApiRequest";

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);

  const listRequest = useApiRequest(getAllComments);
  const createRequest = useApiRequest(createComment);
  const mediaRequest = useApiRequest(getCommentsByMedia);
  const detailRequest = useApiRequest(getCommentById);
  const updateRequest = useApiRequest(updateComment);
  const deleteRequest = useApiRequest(deleteComment);

  const fetchAllComments = async () => {
    const response = await listRequest.execute();
    setComments(response.comments);
    return response.comments;
  };

  const addComment = async (
    externalId: string,
    mediaType: MediaType,
    content: string,
  ) => {
    const response = await createRequest.execute({
      externalId,
      mediaType,
      content,
    });

    setComments((current) => [
      response.comment,
      ...current.filter((comment) => comment.id !== response.comment.id),
    ]);

    return response;
  };

  const fetchCommentsByMedia = async (
    mediaType: MediaType,
    externalId: string,
  ) => {
    const response = await mediaRequest.execute(mediaType, externalId);
    setComments(response.comments);
    return response.comments;
  };

  const fetchCommentById = async (id: number) => {
    return detailRequest.execute(id);
  };

  const editComment = async (id: number, content: string) => {
    const response = await updateRequest.execute(id, { content });

    setComments((current) =>
      current.map((comment) =>
        comment.id === id ? response.comment : comment,
      ),
    );

    return response;
  };

  const removeComment = async (id: number) => {
    const response = await deleteRequest.execute(id);

    setComments((current) => current.filter((comment) => comment.id !== id));

    return response;
  };

  return {
    comments,
    fetchAllComments,
    addComment,
    fetchCommentsByMedia,
    fetchCommentById,
    editComment,
    removeComment,
    loading:
      listRequest.loading ||
      createRequest.loading ||
      mediaRequest.loading ||
      detailRequest.loading ||
      updateRequest.loading ||
      deleteRequest.loading,
    error:
      listRequest.error ??
      createRequest.error ??
      mediaRequest.error ??
      detailRequest.error ??
      updateRequest.error ??
      deleteRequest.error,
  };
}
