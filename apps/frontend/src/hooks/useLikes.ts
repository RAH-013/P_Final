import { useState } from "react";

import {
  createLike,
  deleteLike,
  getLikeById,
  getLikes,
} from "../api/services/likes";

import type { Like, MediaType } from "../api/types";
import { useApiRequest } from "./useApiRequest";

export function useLikes() {
  const [likes, setLikes] = useState<Like[]>([]);

  const listRequest = useApiRequest(getLikes);
  const createRequest = useApiRequest(createLike);
  const detailRequest = useApiRequest(getLikeById);
  const deleteRequest = useApiRequest(deleteLike);

  const fetchLikes = async () => {
    const response = await listRequest.execute();
    setLikes(response.likes);
    return response.likes;
  };

  const addLike = async (externalId: string, mediaType: MediaType) => {
    const response = await createRequest.execute({
      externalId,
      mediaType,
    });

    setLikes((current) => [
      response.like,
      ...current.filter((like) => like.id !== response.like.id),
    ]);

    return response;
  };

  const fetchLikeById = async (id: number) => {
    return detailRequest.execute(id);
  };

  const removeLike = async (mediaType: MediaType, externalId: string) => {
    const response = await deleteRequest.execute(mediaType, externalId);

    setLikes((current) =>
      current.filter(
        (like) =>
          like.externalId !== externalId || like.mediaType !== mediaType,
      ),
    );

    return response;
  };

  return {
    likes,
    fetchLikes,
    addLike,
    fetchLikeById,
    removeLike,
    loading:
      listRequest.loading ||
      createRequest.loading ||
      detailRequest.loading ||
      deleteRequest.loading,
    error:
      listRequest.error ??
      createRequest.error ??
      detailRequest.error ??
      deleteRequest.error,
  };
}
