import api from "../axios";
import type {
  ApiResponse,
  Comment,
  MediaType,
  MessageResponse,
} from "../types";

export interface CreateCommentPayload {
  externalId: string;
  mediaType: MediaType;
  content: string;
}

export interface UpdateCommentPayload {
  content: string;
}

export interface CommentsResponse {
  comments: Comment[];
}

export interface CommentResponse {
  comment: Comment;
}

export interface CreateCommentResponse {
  id: number;
  comment: Comment;
}

export interface UpdateCommentResponse {
  comment: Comment;
}

export async function getAllComments(): Promise<CommentsResponse> {
  const { data } = await api.get<ApiResponse<CommentsResponse>>("/comments");

  return data.data;
}

export async function getCommentsByUser(
  userId: number,
): Promise<CommentsResponse> {
  const { data } = await api.get<ApiResponse<CommentsResponse>>(
    `/comments/user/${userId}`,
  );

  return data.data;
}

export async function getCommentsByMedia(
  mediaType: MediaType,
  externalId: string,
): Promise<CommentsResponse> {
  const { data } = await api.get<ApiResponse<CommentsResponse>>(
    `/comments/${mediaType}/${encodeURIComponent(externalId)}`,
  );

  return data.data;
}

export async function getCommentById(id: number): Promise<CommentResponse> {
  const { data } = await api.get<ApiResponse<CommentResponse>>(
    `/comments/${id}`,
  );

  return data.data;
}

export async function createComment(
  payload: CreateCommentPayload,
): Promise<CreateCommentResponse> {
  const { data } = await api.post<ApiResponse<CreateCommentResponse>>(
    "/comments",
    payload,
  );

  return data.data;
}

export async function updateComment(
  id: number,
  payload: UpdateCommentPayload,
): Promise<UpdateCommentResponse> {
  const { data } = await api.patch<ApiResponse<UpdateCommentResponse>>(
    `/comments/${id}`,
    payload,
  );

  return data.data;
}

export async function deleteComment(id: number): Promise<MessageResponse> {
  const { data } = await api.delete<ApiResponse<MessageResponse>>(
    `/comments/${id}`,
  );

  return data.data;
}
