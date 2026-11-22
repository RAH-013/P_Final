export type MediaType = "movie" | "series";

export interface CinemetaMeta {
  id: string;
  type: MediaType;
  name: string;
  description?: string;
  poster?: string;
  background?: string;
  released?: string;
  year?: number;
  runtime?: string;
  genres?: string[];
  imdbRating?: string;
  imdbVotes?: string;
  director?: string[];
  cast?: string[];
  country?: string;
  language?: string;
}

export interface CinemetaResponse {
  meta?: CinemetaMeta;
  metas?: CinemetaMeta[];
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
}

export interface SearchSuggestion {
  id: string;
  title: string;
  type: MediaType;
  poster: string | null;
}

export interface SearchFallback {
  id: string;
  title: string;
  poster: string | null;
  type: MediaType;
}

export interface CatalogSearchResult {
  matches: SearchSuggestion[];
  suggestions: SearchFallback[];
}

export interface CatalogResult {
  items: CatalogItem[];
  total: number;
  type: MediaType | "all";
}
