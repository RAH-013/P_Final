export type UserRole = "user" | "admin";

export type MediaType = "movie" | "series";

export interface User {
  id: number;
  username: string;
  role: UserRole;
  [key: string]: unknown;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MessageResponse {
  message: string;
}

export interface UsernameUpdateResponse extends MessageResponse {
  user: User;
  token: string;
}

export interface GenreResponse {
  success: boolean;
  message: string;
  data: string[];
}

export interface Like {
  id: number;
  externalId: string;
  mediaType: MediaType;
  createdAt: string;
}

export interface Comment {
  id: number;
  userId: number;
  externalId: string;
  mediaType: MediaType;
  content: string;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  error: string;
  detalles?: unknown;
}

export interface CatalogSearchParams {
  query: string;
  [key: string]: unknown;
}

export interface CatalogItem {
  id: string;
  title: string;
  type: MediaType;
  poster?: string | null;
  year?: string | number | null;
  rating?: number | string | null;
  genres?: string[];
  director?: string | string[];
  [key: string]: unknown;
}

export interface ExternalRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}
