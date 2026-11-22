import api from "../axios";
import type { CatalogItem, MediaType } from "../types";

export interface CatalogSearchParams {
  q: string;
}

export interface CatalogSearchMatch {
  id: string;
  title: string;
  type: MediaType;
  poster?: string | null;
}

export interface CatalogSearchResult {
  matches: CatalogSearchMatch[];
  suggestions: CatalogSearchMatch[];
}

export interface CatalogResult {
  items: CatalogItem[];
  total: number;
  type: MediaType | "all";
}

export interface CatalogDetailsParams {
  type?: MediaType;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

function unwrapResponse<T extends object>(response: T | ApiResponse<T>): T {
  return "data" in response ? response.data : response;
}

export async function searchCatalog(
  params: CatalogSearchParams,
  signal?: AbortSignal,
): Promise<CatalogSearchResult> {
  const { data } = await api.get<
    CatalogSearchResult | ApiResponse<CatalogSearchResult>
  >("/catalog/search", {
    params,
    signal,
  });

  return unwrapResponse(data);
}

export async function getFeaturedCatalog(
  type: MediaType | "all" = "all",
): Promise<CatalogResult> {
  const { data } = await api.get<CatalogResult | ApiResponse<CatalogResult>>(
    "/catalog/featured",
    {
      params: { type },
    },
  );

  return unwrapResponse(data);
}

export async function getCatalogDetails(
  id: string,
  params: CatalogDetailsParams,
): Promise<CatalogItem> {
  const { data } = await api.get<CatalogItem | ApiResponse<CatalogItem>>(
    `/catalog/${encodeURIComponent(id)}`,
    {
      params,
    },
  );

  return unwrapResponse(data);
}
