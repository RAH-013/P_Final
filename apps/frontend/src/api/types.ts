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

export interface CommentUser {
  id: number;
  username: string;
  role: UserRole;
}

export interface Comment {
  id: number;
  userId: number;
  externalId: string;
  mediaType: MediaType;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user?: CommentUser | null;
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
  type: MediaType;
  title: string;
  synopsis: string | null;
  poster: string | null;
  background: string | null;
  releaseDate: string | null;
  year: number | null;
  runtime: string | null;
  genres: string[];
  rating: number | null;
  votes: number | null;
  director: string[];
  cast: string[];
  country: string | null;
  language: string | null;
  [key: string]: unknown;
}

export interface ExternalRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}

export type RecommendationSource = "gemini" | "fallback";

export interface Recommendation {
  id: number;
  userId: number;
  externalId: string;
  mediaType: MediaType;
  profileVersion: number;
  reason: string;
  score: number | null;
  source: RecommendationSource;
  modelName: string | null;
  createdAt: string;
  updatedAt: string;
  item: CatalogItem | null;
}
