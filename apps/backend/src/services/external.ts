import { env } from "../config/env.js";

export class ExternalError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ExternalError";
  }
}

const REQUEST_TIMEOUT = 8000;
const MAX_ATTEMPTS = 2;

type ExternalRequest = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
};

function getExternalUrl(path: string): string {
  if (!env.EXTERNO_URL) {
    throw new ExternalError("La integración externa no está configurada", 503);
  }

  return `${env.EXTERNO_URL.replace(/\/+$/, "")}${path}`;
}

async function requestExternal(
  options: ExternalRequest,
): Promise<{ status: number; data: unknown }> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(options.url, {
        method: options.method,
        headers: options.headers,
        body: options.body,
        signal: controller.signal,
      });

      const text = await response.text();

      let data: unknown;

      try {
        data = JSON.parse(text);
      } catch {
        throw new ExternalError(
          "El servicio externo devolvió una respuesta JSON inválida",
          502,
        );
      }

      if (
        (response.status === 429 || response.status >= 500) &&
        attempt < MAX_ATTEMPTS
      ) {
        const retryAfter = Number(response.headers.get("retry-after"));
        const delay =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? Math.min(retryAfter * 1000, 2000)
            : 250;

        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return {
        status: response.status,
        data,
      };
    } catch (error) {
      if (error instanceof ExternalError) {
        throw error;
      }

      lastError = error;

      if (error instanceof Error && error.name === "AbortError") {
        throw new ExternalError(
          "El servicio externo excedió el tiempo de espera",
          504,
        );
      }

      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        continue;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new ExternalError(
    "No fue posible comunicarse con el servicio externo",
    502,
    lastError instanceof Error ? lastError.message : undefined,
  );
}

export async function forwardExternalRequest(
  method: string,
  path: string,
  headers: Record<string, string | undefined>,
  body?: unknown,
) {
  const url = getExternalUrl(path);

  const forwardedHeaders: Record<string, string> = {};

  for (const header of [
    "content-type",
    "authorization",
    "x-goog-api-key",
    "accept",
    "idempotency-key",
  ]) {
    const value = headers[header];

    if (value) {
      forwardedHeaders[header] = value;
    }
  }

  const result = await requestExternal({
    method,
    url,
    headers: forwardedHeaders,
    body:
      body === undefined || method === "GET" || method === "HEAD"
        ? undefined
        : JSON.stringify(body),
  });

  return result;
}
