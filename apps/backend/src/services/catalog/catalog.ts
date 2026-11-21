import { getFeatured, getMetadata, searchTitles } from "./cinemeta.js";

import type {
  CatalogItem,
  CatalogResult,
  CatalogSearchResult,
  CinemetaMeta,
  MediaType,
  SearchFallback,
  SearchSuggestion,
} from "./types.js";

const SEARCH_FALLBACK_LIMIT = 20;
const FEATURED_LIMIT = 10;

function normalize(meta: CinemetaMeta): CatalogItem {
  const rating = Number(meta.imdbRating);
  const votes = Number(meta.imdbVotes?.replace(/,/g, ""));

  return {
    id: meta.id,
    type: meta.type,
    title: meta.name,
    synopsis: meta.description ?? null,
    poster: meta.poster ?? null,
    background: meta.background ?? null,
    releaseDate: meta.released ?? null,
    year: meta.year ?? null,
    runtime: meta.runtime ?? null,
    genres: meta.genres ?? [],
    rating: Number.isFinite(rating) ? rating : null,
    votes: Number.isFinite(votes) ? votes : null,
    director: meta.director ?? [],
    cast: meta.cast ?? [],
    country: meta.country ?? null,
    language: meta.language ?? null,
  };
}

function normalizeTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();
}

function toSuggestion(meta: CinemetaMeta): SearchSuggestion {
  return {
    id: meta.id,
    title: meta.name,
    type: meta.type,
    year: meta.year ?? null,
    country: meta.country ?? null,
  };
}

function toFallback(meta: CinemetaMeta): SearchFallback {
  return {
    id: meta.id,
    title: meta.name,
    poster: meta.poster ?? null,
    type: meta.type,
  };
}

function sortByRating(items: CinemetaMeta[]): CinemetaMeta[] {
  return [...items].sort((a, b) => {
    const ratingA = Number(a.imdbRating) || 0;
    const ratingB = Number(b.imdbRating) || 0;

    return ratingB - ratingA;
  });
}

function uniqueById(items: CinemetaMeta[]): CinemetaMeta[] {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

export async function searchCatalog(
  query: string,
): Promise<CatalogSearchResult> {
  const normalizedQuery = normalizeTitle(query);

  if (!normalizedQuery) {
    return {
      matches: [],
      suggestions: [],
    };
  }

  const searchResults = await Promise.all([
    searchTitles("movie", query),
    searchTitles("series", query),
  ]);

  const metas = uniqueById(searchResults.flat());

  const matches = metas
    .map((meta) => ({
      meta,
      title: normalizeTitle(meta.name),
    }))
    .filter(({ title }) => title.startsWith(normalizedQuery))
    .sort((a, b) => {
      const startsA = a.title.startsWith(normalizedQuery);
      const startsB = b.title.startsWith(normalizedQuery);

      if (startsA !== startsB) {
        return startsA ? -1 : 1;
      }

      return a.title.length - b.title.length;
    })
    .map(({ meta }) => meta)
    .map(toSuggestion);

  if (matches.length > 0) {
    return {
      matches,
      suggestions: [],
    };
  }

  const featuredResults = await Promise.all([
    getFeatured("movie"),
    getFeatured("series"),
  ]);

  const suggestions = sortByRating(uniqueById(featuredResults.flat()))
    .slice(0, SEARCH_FALLBACK_LIMIT)
    .map(toFallback);

  return {
    matches: [],
    suggestions,
  };
}

export async function getFeaturedCatalog(
  type: MediaType | "all" = "all",
): Promise<CatalogResult> {
  const types: MediaType[] = type === "all" ? ["movie", "series"] : [type];

  const results = await Promise.all(
    types.map((mediaType) => getFeatured(mediaType)),
  );

  const items = sortByRating(uniqueById(results.flat()))
    .slice(0, FEATURED_LIMIT)
    .map(normalize);

  return {
    items,
    total: items.length,
    type,
  };
}

export async function getCatalogMetadata(
  id: string,
  type: MediaType,
): Promise<CatalogItem | null> {
  const meta = await getMetadata(type, id);

  if (!meta || meta.id !== id || meta.type !== type) {
    return null;
  }

  return normalize(meta);
}
