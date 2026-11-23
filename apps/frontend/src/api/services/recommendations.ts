import api from "../axios";

import type { ApiResponse, Recommendation } from "../types";

export type RecommendationType = "movie" | "series" | "all";

export async function getPreviousRecommendations(): Promise<
  ApiResponse<Recommendation[]>
> {
  const { data } =
    await api.get<ApiResponse<Recommendation[]>>("/recommendations");

  return data;
}

export async function getNextRecommendation(
  type: RecommendationType = "all",
): Promise<ApiResponse<Recommendation>> {
  const { data } = await api.get<ApiResponse<Recommendation>>(
    "/recommendations/next",
    {
      params: { type },
    },
  );

  return data;
}

export async function getRecommendationById(
  id: number,
): Promise<ApiResponse<Recommendation>> {
  const { data } = await api.get<ApiResponse<Recommendation>>(
    `/recommendations/${id}`,
  );

  return data;
}
