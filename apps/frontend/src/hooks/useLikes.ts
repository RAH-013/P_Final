import { useCallback, useState } from "react";

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

  const { execute: executeList } = listRequest;
  const { execute: executeCreate } = createRequest;
  const { execute: executeDetail } = detailRequest;
  const { execute: executeDelete } = deleteRequest;

  const fetchLikes = useCallback(async () => {
    const response = await executeList();

    if (!Array.isArray(response?.likes)) {
      throw new Error("La respuesta de favoritos no tiene un formato válido.");
    }

    setLikes(response.likes);

    return response.likes;
  }, [executeList]);

  const addLike = useCallback(
    async (externalId: string, mediaType: MediaType) => {
      const response = await executeCreate({ externalId, mediaType });

      if (!response?.like || typeof response.like.id !== "number") {
        throw new Error("La API no devolvió el favorito creado correctamente.");
      }

      setLikes((current) => {
        const exists = current.some(
          (like) =>
            like.externalId === response.like.externalId &&
            like.mediaType === response.like.mediaType,
        );

        return exists
          ? current.map((like) =>
              like.externalId === response.like.externalId &&
              like.mediaType === response.like.mediaType
                ? response.like
                : like,
            )
          : [response.like, ...current];
      });

      return response;
    },
    [executeCreate],
  );

  const fetchLikeById = useCallback(
    async (id: number) => {
      const response = await executeDetail(id);

      if (!response?.like) {
        throw new Error("No se encontró el favorito solicitado.");
      }

      return response;
    },
    [executeDetail],
  );

  const removeLike = useCallback(
    async (mediaType: MediaType, externalId: string) => {
      const response = await executeDelete(mediaType, externalId);

      setLikes((current) =>
        current.filter(
          (like) =>
            like.externalId !== externalId || like.mediaType !== mediaType,
        ),
      );

      return response;
    },
    [executeDelete],
  );

  return {
    likes,
    fetchLikes,
    addLike,
    fetchLikeById,
    removeLike,
    loading: {
      list: listRequest.loading,
      create: createRequest.loading,
      detail: detailRequest.loading,
      delete: deleteRequest.loading,
    },
    error: {
      list: listRequest.error,
      create: createRequest.error,
      detail: detailRequest.error,
      delete: deleteRequest.error,
    },
  };
}
