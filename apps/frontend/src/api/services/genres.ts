import api from "../axios";
import type { GenreResponse } from "../types";

export interface UpdateGenresPayload {
  genres: string[];
}

export async function getMyGenres(): Promise<GenreResponse> {
  const { data } = await api.get<GenreResponse>("/genres/me");
  return data;
}

export async function updateMyGenres(
  payload: UpdateGenresPayload,
): Promise<GenreResponse> {
  const { data } = await api.put<GenreResponse>("/genres/me", payload);

  return data;
}
