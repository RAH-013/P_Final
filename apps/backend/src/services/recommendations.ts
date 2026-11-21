import { Op } from "sequelize";
import { env } from "../config/env.js";
import { User, UserGenre, LikedItem, Recommendation } from "../models/index.js";
import { getCatalogMetadata, getFeaturedCatalog } from "./catalog/catalog.js";
import type { CatalogItem, MediaType } from "./catalog/types.js";

const GEMINI_TIMEOUT_MS = 8000;
const CANDIDATE_LIMIT = 20;

type RecommendationResult = {
  id: number;
  userId: number;
  externalId: string;
  mediaType: MediaType;
  profileVersion: number;
  reason: string;
  score: number | null;
  source: "gemini" | "fallback";
  modelName: string | null;
  createdAt: Date;
  updatedAt: Date;
  item: CatalogItem | null;
};

type GeminiResult = {
  id: string;
  reason: string;
  score: number;
};

type Candidate = CatalogItem;

export class RecommendationError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "RecommendationError";
  }
}

function itemKey(mediaType: MediaType, externalId: string): string {
  return `${mediaType}:${externalId}`;
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(1, score));
}

function getStaticRecommendation(
  candidates: Candidate[],
  preferredGenres: string[],
): { item: Candidate; reason: string; score: number } | null {
  if (candidates.length === 0) {
    return null;
  }

  const preferences = new Set(
    preferredGenres.map((genre) => genre.toLocaleLowerCase()),
  );

  const ranked = candidates
    .map((item) => {
      const matchingGenres = item.genres.filter((genre) =>
        preferences.has(genre.toLocaleLowerCase()),
      );

      const genreScore =
        preferences.size > 0 ? matchingGenres.length / preferences.size : 0;

      const ratingScore = item.rating
        ? Math.max(0, Math.min(1, item.rating / 10))
        : 0;

      const score = clampScore(
        preferences.size > 0
          ? genreScore * 0.7 + ratingScore * 0.3
          : ratingScore,
      );

      return {
        item,
        matchingGenres,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  const selected = ranked[0];

  const reason =
    selected.matchingGenres.length > 0
      ? `Esta recomendación coincide con tus preferencias de ${selected.matchingGenres.join(", ")}.`
      : "Esta película o serie destaca por su valoración y puede ser una buena opción para descubrir.";

  return {
    item: selected.item,
    reason,
    score: selected.score,
  };
}

async function generateWithGemini(
  candidates: Candidate[],
  preferredGenres: string[],
): Promise<GeminiResult | null> {
  if (!env.GEMINI_API_KEY || !env.GEMINI_MODEL || candidates.length === 0) {
    return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: [
                    "Selecciona la película o serie más adecuada para este usuario.",
                    "Utiliza exclusivamente los identificadores de los candidatos proporcionados.",
                    "La explicación debe estar en español y ser breve.",
                    "Devuelve únicamente un JSON con esta estructura:",
                    '{"id":"identificador","reason":"explicación","score":0.85}',
                    `Géneros preferidos: ${JSON.stringify(preferredGenres)}`,
                    `Candidatos: ${JSON.stringify(
                      candidates.map((item) => ({
                        id: item.id,
                        type: item.type,
                        title: item.title,
                        synopsis: item.synopsis,
                        genres: item.genres,
                        rating: item.rating,
                        year: item.year,
                      })),
                    )}`,
                  ].join("\n"),
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.4,
          },
        }),
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    const content = data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? "")
      .join("");

    if (!content) {
      return null;
    }

    const result = JSON.parse(content) as GeminiResult;

    if (
      typeof result.id !== "string" ||
      typeof result.reason !== "string" ||
      !Number.isFinite(result.score)
    ) {
      return null;
    }

    if (!candidates.some((item) => item.id === result.id)) {
      return null;
    }

    return {
      id: result.id,
      reason: result.reason.slice(0, 2000),
      score: clampScore(result.score),
    };
  } catch {
    return null;
  }
}

async function getUserPreferences(userId: number): Promise<{
  profileVersion: number;
  genres: string[];
  likedKeys: Set<string>;
}> {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new RecommendationError("Usuario no encontrado", 404);
  }

  const [genres, likes] = await Promise.all([
    UserGenre.findAll({
      where: { userId },
    }),
    LikedItem.findAll({
      where: { userId },
    }),
  ]);

  if (genres.length === 0) {
    throw new RecommendationError(
      "Debes configurar tus géneros preferidos antes de obtener recomendaciones",
      400,
    );
  }

  return {
    profileVersion: user.profileVersion,
    genres: genres.map((item) => item.genre),
    likedKeys: new Set(
      likes.map((item) => itemKey(item.mediaType, item.externalId)),
    ),
  };
}

async function getAvailableCandidates(
  userId: number,
  likedKeys: Set<string>,
): Promise<Candidate[]> {
  const [movies, series, previousRecommendations] = await Promise.all([
    getFeaturedCatalog("movie"),
    getFeaturedCatalog("series"),
    Recommendation.findAll({
      where: { userId },
      attributes: ["externalId", "mediaType"],
    }),
  ]);

  const excludedKeys = new Set([
    ...likedKeys,
    ...previousRecommendations.map((item) =>
      itemKey(item.mediaType, item.externalId),
    ),
  ]);

  return [...movies.items, ...series.items]
    .filter((item) => !excludedKeys.has(itemKey(item.type, item.id)))
    .slice(0, CANDIDATE_LIMIT);
}

function serializeRecommendation(
  recommendation: Recommendation,
  item: CatalogItem | null,
): RecommendationResult {
  return {
    id: recommendation.id,
    userId: recommendation.userId,
    externalId: recommendation.externalId,
    mediaType: recommendation.mediaType,
    profileVersion: recommendation.profileVersion,
    reason: recommendation.reason,
    score: recommendation.score,
    source: recommendation.source,
    modelName: recommendation.modelName,
    createdAt: recommendation.createdAt,
    updatedAt: recommendation.updatedAt,
    item,
  };
}

export async function getRecommendations(
  userId: number,
): Promise<RecommendationResult[]> {
  const { likedKeys } = await getUserPreferences(userId);

  const recommendations = await Recommendation.findAll({
    where: { userId },
    order: [["createdAt", "DESC"]],
  });

  const available = recommendations.filter(
    (recommendation) =>
      !likedKeys.has(
        itemKey(recommendation.mediaType, recommendation.externalId),
      ),
  );

  return Promise.all(
    available.map(async (recommendation) => {
      const item = await getCatalogMetadata(
        recommendation.externalId,
        recommendation.mediaType,
      );

      return serializeRecommendation(recommendation, item);
    }),
  );
}

export async function getNextRecommendation(
  userId: number,
): Promise<RecommendationResult> {
  const preferences = await getUserPreferences(userId);

  const candidates = await getAvailableCandidates(
    userId,
    preferences.likedKeys,
  );

  if (candidates.length === 0) {
    throw new RecommendationError(
      "No hay más recomendaciones disponibles por el momento",
      404,
    );
  }

  const geminiResult = await generateWithGemini(candidates, preferences.genres);

  let selected: Candidate;
  let reason: string;
  let score: number;
  let source: "gemini" | "fallback";

  if (geminiResult) {
    selected = candidates.find((item) => item.id === geminiResult.id)!;

    reason = geminiResult.reason;
    score = geminiResult.score;
    source = "gemini";
  } else {
    const fallback = getStaticRecommendation(candidates, preferences.genres);

    if (!fallback) {
      throw new RecommendationError(
        "No fue posible generar una recomendación",
        503,
      );
    }

    selected = fallback.item;
    reason = fallback.reason;
    score = fallback.score;
    source = "fallback";
  }

  const recommendation = await Recommendation.create({
    userId,
    externalId: selected.id,
    mediaType: selected.type,
    profileVersion: preferences.profileVersion,
    reason,
    score,
    source,
    modelName: source === "gemini" ? env.GEMINI_MODEL! : null,
  });

  return serializeRecommendation(recommendation, selected);
}

export async function getRecommendationById(
  userId: number,
  recommendationId: number,
): Promise<RecommendationResult> {
  if (!Number.isInteger(recommendationId) || recommendationId < 1) {
    throw new RecommendationError(
      "Identificador de recomendación inválido",
      400,
    );
  }

  const recommendation = await Recommendation.findOne({
    where: {
      id: recommendationId,
      userId,
    },
  });

  if (!recommendation) {
    throw new RecommendationError("Recomendación no encontrada", 404);
  }

  const item = await getCatalogMetadata(
    recommendation.externalId,
    recommendation.mediaType,
  );

  if (!item) {
    throw new RecommendationError(
      "No fue posible recuperar los datos del título recomendado",
      404,
    );
  }

  if (recommendation.source === "fallback" && env.GEMINI_API_KEY) {
    const { genres } = await getUserPreferences(userId);
    const result = await generateWithGemini([item], genres);

    if (result) {
      await recommendation.update({
        reason: result.reason,
        score: result.score,
        source: "gemini",
        modelName: env.GEMINI_MODEL ?? null,
      });
    }
  }

  return serializeRecommendation(recommendation, item);
}
