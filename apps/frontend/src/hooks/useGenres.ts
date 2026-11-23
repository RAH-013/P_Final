import { useCallback } from "react";
import {
  getAvailableGenres,
  getMyGenres,
  updateMyGenres,
} from "../api/services/genres";
import { useApiRequest } from "./useApiRequest";

function normalizeGenres(value: unknown): string[] {
  const genres = Array.isArray(value)
    ? value
    : value &&
        typeof value === "object" &&
        "genres" in value &&
        Array.isArray(value.genres)
      ? value.genres
      : [];

  return [
    ...new Set(
      genres
        .filter(
          (genre): genre is string =>
            typeof genre === "string" && genre.trim().length > 0,
        )
        .map((genre) => genre.trim()),
    ),
  ];
}

export function useGenres() {
  const availableRequest = useApiRequest(getAvailableGenres);
  const userRequest = useApiRequest(getMyGenres);
  const updateRequest = useApiRequest(updateMyGenres);

  const { execute: executeAvailable } = availableRequest;
  const { execute: executeUser } = userRequest;
  const { execute: executeUpdate } = updateRequest;

  const getGenres = useCallback(async () => {
    const [availableResponse, userResponse] = await Promise.all([
      executeAvailable(),
      executeUser(),
    ]);

    return {
      availableGenres: normalizeGenres(availableResponse.data?.genres),
      userGenres: normalizeGenres(userResponse.data),
    };
  }, [executeAvailable, executeUser]);

  const setUserGenres = useCallback(
    async (genres: string[]) => {
      const normalized = normalizeGenres(genres);

      if (normalized.length > 10) {
        throw new Error("Solo puedes seleccionar hasta 10 géneros.");
      }

      const response = await executeUpdate({ genres: normalized });

      return normalizeGenres(response.data);
    },
    [executeUpdate],
  );

  return {
    getGenres,
    setUserGenres,
    loading: availableRequest.loading || userRequest.loading,
    saving: updateRequest.loading,
    error: availableRequest.error ?? userRequest.error ?? updateRequest.error,
  };
}
