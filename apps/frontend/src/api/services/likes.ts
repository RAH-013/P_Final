import api from "../axios";
import type { ApiResponse, Like, MediaType, MessageResponse } from "../types";

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
  const { data } = await api.get<ApiResponse<LikesResponse>>("/likes");
  return data.data;
}

export async function createLike(
  payload: CreateLikePayload,
): Promise<CreateLikeResponse> {
  const { data } = await api.post<ApiResponse<CreateLikeResponse>>(
    "/likes",
    payload,
  );
  return data.data;
}

export async function getLikeById(id: number): Promise<LikeResponse> {
  const { data } = await api.get<ApiResponse<LikeResponse>>(`/likes/${id}`);
  return data.data;
}

export async function deleteLike(
  mediaType: MediaType,
  externalId: string,
): Promise<MessageResponse> {
  const { data } = await api.delete<ApiResponse<MessageResponse>>(
    `/likes/${mediaType}/${encodeURIComponent(externalId)}`,
  );
  return data.data;
}
