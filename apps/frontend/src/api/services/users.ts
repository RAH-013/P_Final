import api from "../axios";
import type {
  ApiResponse,
  MessageResponse,
  User,
  UserRole,
  UsernameUpdateResponse,
} from "../types";

export interface UpdateUsernamePayload {
  username: string;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountPayload {
  password: string;
}

export interface UpdateUserRolePayload {
  role: UserRole;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUser(value: unknown): value is User {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.username === "string" &&
    (value.role === "user" || value.role === "admin")
  );
}

function unwrapResponse<T>(response: unknown): T {
  if (isRecord(response) && "data" in response) {
    return response.data as T;
  }

  return response as T;
}

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[] | ApiResponse<User[]>>("/users");
  return unwrapResponse<User[]>(data);
}

export async function getMyProfile(): Promise<User> {
  const { data } = await api.get<unknown>("/users/me");
  const response = unwrapResponse<unknown>(data);

  if (isUser(response)) {
    return response;
  }

  if (isRecord(response) && isUser(response.profile)) {
    return response.profile;
  }

  throw new Error("La respuesta del perfil tiene un formato inválido.");
}

export async function deleteMyAccount(
  payload: DeleteAccountPayload,
): Promise<MessageResponse> {
  const { data } = await api.delete<
    MessageResponse | ApiResponse<MessageResponse>
  >("/users/me", { data: payload });

  return unwrapResponse<MessageResponse>(data);
}

export async function updateMyUsername(
  payload: UpdateUsernamePayload,
): Promise<UsernameUpdateResponse> {
  const { data } = await api.patch<
    UsernameUpdateResponse | ApiResponse<UsernameUpdateResponse>
  >("/users/me/username", payload);

  return unwrapResponse<UsernameUpdateResponse>(data);
}

export async function updateMyPassword(
  payload: UpdatePasswordPayload,
): Promise<MessageResponse> {
  const { data } = await api.patch<
    MessageResponse | ApiResponse<MessageResponse>
  >("/users/me/password", payload);

  return unwrapResponse<MessageResponse>(data);
}

export async function deleteUser(id: number): Promise<MessageResponse> {
  const { data } = await api.delete<
    MessageResponse | ApiResponse<MessageResponse>
  >(`/users/${id}`);

  return unwrapResponse<MessageResponse>(data);
}

export async function updateUserRole(
  id: number,
  payload: UpdateUserRolePayload,
): Promise<MessageResponse> {
  const { data } = await api.patch<
    MessageResponse | ApiResponse<MessageResponse>
  >(`/users/${id}/role`, payload);

  return unwrapResponse<MessageResponse>(data);
}
