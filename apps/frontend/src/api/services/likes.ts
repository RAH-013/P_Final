import api from "../axios";
import type { Like, MediaType, MessageResponse } from "../types";

export interface CreateLikePayload {
  externalId: string;
  mediaType: MediaType;
}

export interface LikesResponse {
  likes: Like[];
}

export interface LikeResponse {
  like: Like;
}

export interface CreateLikeResponse extends MessageResponse {
  like: Like;
}

export async function getLikes(): Promise<LikesResponse> {
  const { data } = await api.get<LikesResponse>("/likes");
  return data;
}

export async function createLike(
  payload: CreateLikePayload,
): Promise<CreateLikeResponse> {
  const { data } = await api.post<CreateLikeResponse>("/likes", payload);

  return data;
}

export async function getLikeById(id: number): Promise<LikeResponse> {
  const { data } = await api.get<LikeResponse>(`/likes/${id}`);
  return data;
}

export async function deleteLike(
  mediaType: MediaType,
  externalId: string,
): Promise<MessageResponse> {
  const { data } = await api.delete<MessageResponse>(
    `/likes/${mediaType}/${encodeURIComponent(externalId)}`,
  );

  return data;
}
