import api from "../axios";

export async function getPreviousRecommendations(): Promise<unknown> {
  const { data } = await api.get("/recommendations");
  return data;
}

export async function getNextRecommendation(): Promise<unknown> {
  const { data } = await api.get("/recommendations/next");
  return data;
}

export async function getRecommendationById(id: number): Promise<unknown> {
  const { data } = await api.get(`/recommendations/${id}`);
  return data;
}
