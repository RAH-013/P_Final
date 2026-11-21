import type { CinemetaMeta, CinemetaResponse, MediaType } from "./types.js";

const BASE_URL = "https://v3-cinemeta.strem.io";
const REQUEST_TIMEOUT = 10000;

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
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error("Tiempo de espera agotado al consultar Cinemeta");
    }

    throw new Error("No fue posible conectar con Cinemeta");
  }

  if (!response.ok) {
    throw new Error(`Cinemeta respondió con HTTP ${response.status}`);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new Error("Cinemeta devolvió una respuesta inválida");
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
