import { useCallback, useRef, useState } from "react";

import {
  createComment,
  deleteComment,
  getAllComments,
  getCommentById,
  getCommentsByMedia,
  getCommentsByUser,
  updateComment,
} from "../api/services/comments";

import type { Comment, MediaType } from "../api/types";
import { useApiRequest } from "./useApiRequest";

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const mediaRequestId = useRef(0);

  const {
    execute: executeList,
    loading: listLoading,
    error: listError,
  } = useApiRequest(getAllComments);

  const {
    execute: executeCreate,
    loading: createLoading,
    error: createError,
  } = useApiRequest(createComment);

  const {
    execute: executeMedia,
    loading: mediaLoading,
    error: mediaError,
  } = useApiRequest(getCommentsByMedia);

  const {
    execute: executeUser,
    loading: userLoading,
    error: userError,
  } = useApiRequest(getCommentsByUser);

  const {
    execute: executeDetail,
    loading: detailLoading,
    error: detailError,
  } = useApiRequest(getCommentById);

  const {
    execute: executeUpdate,
    loading: updateLoading,
    error: updateError,
  } = useApiRequest(updateComment);

  const {
    execute: executeDelete,
    loading: deleteLoading,
    error: deleteError,
  } = useApiRequest(deleteComment);

  const fetchAllComments = useCallback(async () => {
    const requestId = ++mediaRequestId.current;
    const response = await executeList();

    if (requestId === mediaRequestId.current) {
      setComments(response.comments);
    }

    return response.comments;
  }, [executeList]);

  const fetchCommentsByUser = useCallback(
    async (userId: number) => {
      const requestId = ++mediaRequestId.current;
      const response = await executeUser(userId);

      if (requestId === mediaRequestId.current) {
        setComments(response.comments);
      }

      return response.comments;
    },
    [executeUser],
  );

  const fetchCommentsByMedia = useCallback(
    async (mediaType: MediaType, externalId: string) => {
      const requestId = ++mediaRequestId.current;
      const response = await executeMedia(mediaType, externalId);

      if (requestId === mediaRequestId.current) {
        setComments(response.comments);
      }

      return response.comments;
    },
    [executeMedia],
  );

  const fetchCommentById = useCallback(
    (id: number) => executeDetail(id),
    [executeDetail],
  );

  const addComment = useCallback(
    async (externalId: string, mediaType: MediaType, content: string) => {
      const response = await executeCreate({
        externalId,
        mediaType,
        content,
      });

      setComments((current) => [
        response.comment,
        ...current.filter((comment) => comment.id !== response.comment.id),
      ]);

      return response;
    },
    [executeCreate],
  );

  const editComment = useCallback(
    async (id: number, content: string) => {
      const response = await executeUpdate(id, { content });

      setComments((current) =>
        current.map((comment) =>
          comment.id === id ? response.comment : comment,
        ),
      );

      return response;
    },
    [executeUpdate],
  );

  const removeComment = useCallback(
    async (id: number) => {
      const response = await executeDelete(id);

      setComments((current) => current.filter((comment) => comment.id !== id));

      return response;
    },
    [executeDelete],
  );

  return {
    comments,
    fetchAllComments,
    fetchCommentsByUser,
    fetchCommentsByMedia,
    fetchCommentById,
    addComment,
    editComment,
    removeComment,

    mediaLoading,
    mediaError,

    loading:
      listLoading ||
      createLoading ||
      mediaLoading ||
      userLoading ||
      detailLoading ||
      updateLoading ||
      deleteLoading,

    error:
      listError ??
      createError ??
      mediaError ??
      userError ??
      detailError ??
      updateError ??
      deleteError,
  };
}
