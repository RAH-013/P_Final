import api from "../axios";
import type { Comment, MediaType, MessageResponse } from "../types";

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
  message: string;
  comment: Comment;
}

export interface UpdateCommentResponse extends MessageResponse {
  comment: Comment;
}

export async function getAllComments(): Promise<CommentsResponse> {
  const { data } = await api.get<CommentsResponse>("/comments");
  return data;
}

export async function createComment(
  payload: CreateCommentPayload,
): Promise<CreateCommentResponse> {
  const { data } = await api.post<CreateCommentResponse>("/comments", payload);

  return data;
}

export async function getCommentsByMedia(
  mediaType: MediaType,
  externalId: string,
): Promise<CommentsResponse> {
  const { data } = await api.get<CommentsResponse>(
    `/comments/${mediaType}/${encodeURIComponent(externalId)}`,
  );

  return data;
}

export async function getCommentById(id: number): Promise<CommentResponse> {
  const { data } = await api.get<CommentResponse>(`/comments/${id}`);
  return data;
}

export async function updateComment(
  id: number,
  payload: UpdateCommentPayload,
): Promise<UpdateCommentResponse> {
  const { data } = await api.patch<UpdateCommentResponse>(
    `/comments/${id}`,
    payload,
  );

  return data;
}

export async function deleteComment(id: number): Promise<MessageResponse> {
  const { data } = await api.delete<MessageResponse>(`/comments/${id}`);

  return data;
}
