import type {
  CinemetaManifest,
  CinemetaMeta,
  CinemetaResponse,
  MediaType,
} from "./types.js";

const BASE_URL = "https://v3-cinemeta.strem.io";
const REQUEST_TIMEOUT = 8000;

async function request<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        throw new Error(
          `Tiempo de espera agotado al consultar Cinemeta: ${path}`,
        );
      }

      throw new Error(`Error de conexión con Cinemeta: ${error.message}`);
    }

    throw new Error("No fue posible conectar con Cinemeta");
  }

  if (!response.ok) {
    throw new Error(`Cinemeta respondió con HTTP ${response.status}: ${path}`);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(`Cinemeta devolvió una respuesta JSON inválida: ${path}`);
  }
}

export async function searchTitles(
  type: MediaType,
  query: string,
): Promise<CinemetaMeta[]> {
  const search = encodeURIComponent(query.trim());
  const data = await request<CinemetaResponse>(
    `/catalog/${type}/top/search=${search}.json`,
  );

  return data.metas ?? [];
}

export async function getFeatured(type: MediaType): Promise<CinemetaMeta[]> {
  const data = await request<CinemetaResponse>(
    `/catalog/${type}/imdbRating.json`,
  );

  return data.metas ?? [];
}

export async function getMetadata(
  type: MediaType,
  id: string,
): Promise<CinemetaMeta | null> {
  const data = await request<CinemetaResponse>(
    `/meta/${type}/${encodeURIComponent(id)}.json`,
  );

  return data.meta ?? null;
}

export async function getGenres(): Promise<string[]> {
  const manifest = await request<CinemetaManifest>("/manifest.json");
  const genres = new Map<string, string>();

  for (const catalog of manifest.catalogs ?? []) {
    if (
      !["movie", "series"].includes(catalog.type) ||
      !["top", "imdbRating"].includes(catalog.id)
    ) {
      continue;
    }

    for (const genre of catalog.genres ?? []) {
      const normalized = genre.trim();

      if (normalized) {
        genres.set(normalized.toLocaleLowerCase(), normalized);
      }
    }
  }

  return [...genres.values()].sort((a, b) => a.localeCompare(b, "es"));
}
