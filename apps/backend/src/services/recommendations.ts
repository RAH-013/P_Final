import { env } from "../config/env.js";
import { User, UserGenre, LikedItem, Recommendation } from "../models/index.js";
import { getCatalogMetadata } from "./catalog/catalog.js";
import { getFeatured, searchTitles } from "./catalog/cinemeta.js";
import type { CatalogItem, MediaType } from "./catalog/types.js";

const GEMINI_TIMEOUT_MS = 12000;
const MAX_RECOMMENDATION_ATTEMPTS = 5;
const FALLBACK_CANDIDATE_LIMIT = 40;
const METADATA_CONCURRENCY = 10;

export type RecommendationType = MediaType | "all";

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

type GeminiProposal = {
  title: string;
  type: MediaType;
  reason: string;
  score: number;
};

type UserPreferences = {
  profileVersion: number;
  genres: string[];
  likedKeys: Set<string>;
};

type RankedCandidate = {
  item: CatalogItem;
  matchingGenres: string[];
  score: number;
};

export class RecommendationError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "RecommendationError";
  }
}

function itemKey(type: MediaType, id: string): string {
  return `${type}:${id}`;
}

function normalizeText(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("es-MX")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function normalizeGenre(genre: string): string {
  const normalized = normalizeText(genre);

  const aliases: Record<string, string> = {
    terror: "horror",
    accion: "action",
    aventura: "adventure",
    animacion: "animation",
    documental: "documentary",
    fantasia: "fantasy",
    historia: "history",
    misterio: "mystery",
    romance: "romance",
    "ciencia ficcion": "sci fi",
    "ficcion cientifica": "sci fi",
    suspenso: "thriller",
    deporte: "sport",
    guerra: "war",
    crimen: "crime",
    comedia: "comedy",
    drama: "drama",
    familiar: "family",
    musical: "musical",
    musica: "music",
  };

  return aliases[normalized] ?? normalized;
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(1, score));
}

function getMatchingGenres(
  item: CatalogItem,
  preferredGenres: string[],
): string[] {
  const preferences = new Set(preferredGenres.map(normalizeGenre));

  return item.genres.filter((genre) => preferences.has(normalizeGenre(genre)));
}

function isAllowedType(
  type: string,
  requestedType: RecommendationType,
): type is MediaType {
  if (type !== "movie" && type !== "series") {
    return false;
  }

  return requestedType === "all" || requestedType === type;
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

async function getUserPreferences(userId: number): Promise<UserPreferences> {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new RecommendationError("Usuario no encontrado", 404);
  }

  const [genres, likes] = await Promise.all([
    UserGenre.findAll({ where: { userId } }),
    LikedItem.findAll({ where: { userId } }),
  ]);

  return {
    profileVersion: user.profileVersion,
    genres: [
      ...new Set(genres.map((item) => item.genre.trim()).filter(Boolean)),
    ],
    likedKeys: new Set(
      likes.map((item) => itemKey(item.mediaType, item.externalId)),
    ),
  };
}

async function getExcludedTitles(
  userId: number,
  likedKeys: Set<string>,
): Promise<Set<string>> {
  const previousRecommendations = await Recommendation.findAll({
    where: { userId },
    attributes: ["externalId", "mediaType"],
  });

  return new Set([
    ...likedKeys,
    ...previousRecommendations.map((item) =>
      itemKey(item.mediaType, item.externalId),
    ),
  ]);
}

async function generateWithGemini(
  preferredGenres: string[],
  requestedType: RecommendationType,
  excludedKeys: Set<string>,
): Promise<GeminiProposal | null> {
  if (!env.GEMINI_API_KEY || !env.GEMINI_MODEL) {
    return null;
  }

  const prompt = [
    "Actúa como un experto en recomendaciones cinematográficas.",
    "Debes proponer UN título real de película o serie.",
    "No proporciones identificadores, únicamente el nombre del título.",
    "El título debe existir y ser localizable en Cinemeta.",
    "Prioriza estrictamente los géneros preferidos del usuario.",
    "No recomiendes títulos de otros géneros.",
    "Considera la calidad, popularidad y relevancia del título.",
    "No inventes títulos ni presentes títulos inexistentes como reales.",
    "La explicación debe estar en español y ser breve.",
    "Devuelve exclusivamente un JSON con esta estructura:",
    '{"title":"Nombre del título","type":"movie","reason":"Explicación","score":0.9}',
    `Géneros preferidos: ${JSON.stringify(preferredGenres)}`,
    `Tipo solicitado: ${requestedType}`,
    `Identificadores excluidos: ${JSON.stringify([...excludedKeys])}`,
    "No propongas títulos que correspondan a los identificadores excluidos.",
    "Si el tipo solicitado es movie, propone exclusivamente películas.",
    "Si el tipo solicitado es series, propone exclusivamente series.",
    "Si el tipo solicitado es all, puedes proponer una película o una serie.",
  ].join("\n");

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
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
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

    const result = JSON.parse(content) as GeminiProposal;

    if (
      typeof result.title !== "string" ||
      !result.title.trim() ||
      !isAllowedType(result.type, requestedType) ||
      typeof result.reason !== "string" ||
      !result.reason.trim() ||
      !Number.isFinite(result.score)
    ) {
      return null;
    }

    return {
      title: result.title.trim(),
      type: result.type,
      reason: result.reason.trim().slice(0, 2000),
      score: clampScore(result.score),
    };
  } catch {
    return null;
  }
}

async function findRecommendedTitle(
  proposal: GeminiProposal,
  preferredGenres: string[],
  excludedKeys: Set<string>,
): Promise<CatalogItem | null> {
  const searchResults = await searchTitles(proposal.type, proposal.title);

  const normalizedProposal = normalizeText(proposal.title);

  const matchingTitles = searchResults.filter((meta) => {
    if (meta.type !== proposal.type) {
      return false;
    }

    if (excludedKeys.has(itemKey(meta.type, meta.id))) {
      return false;
    }

    return normalizeText(meta.name) === normalizedProposal;
  });

  for (const meta of matchingTitles) {
    const item = await getCatalogMetadata(meta.id, proposal.type);

    if (!item) {
      continue;
    }

    if (excludedKeys.has(itemKey(item.type, item.id))) {
      continue;
    }

    if (
      preferredGenres.length > 0 &&
      getMatchingGenres(item, preferredGenres).length === 0
    ) {
      continue;
    }

    return item;
  }

  return null;
}

function rankFallbackCandidates(
  candidates: CatalogItem[],
  preferredGenres: string[],
): RankedCandidate[] {
  const maxVotes = Math.max(
    1,
    ...candidates.map((item) => Math.max(0, item.votes ?? 0)),
  );

  return candidates
    .map((item) => {
      const matchingGenres = getMatchingGenres(item, preferredGenres);

      const ratingScore =
        item.rating !== null ? clampScore(item.rating / 10) : 0;

      const popularityScore =
        Math.log1p(Math.max(0, item.votes ?? 0)) / Math.log1p(maxVotes);

      const score = clampScore(ratingScore * 0.4 + popularityScore * 0.6);

      return {
        item,
        matchingGenres,
        score,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (b.item.votes ?? 0) - (a.item.votes ?? 0);
    });
}

async function getFallbackCandidates(
  type: RecommendationType,
  preferredGenres: string[],
  excludedKeys: Set<string>,
): Promise<CatalogItem[]> {
  const types: MediaType[] = type === "all" ? ["movie", "series"] : [type];

  const featuredResults = await Promise.all(
    types.map((mediaType) => getFeatured(mediaType)),
  );

  const uniqueMetas = new Map<string, { id: string; type: MediaType }>();

  for (const metas of featuredResults) {
    for (const meta of metas) {
      if (
        !isAllowedType(meta.type, type) ||
        excludedKeys.has(itemKey(meta.type, meta.id))
      ) {
        continue;
      }

      uniqueMetas.set(itemKey(meta.type, meta.id), {
        id: meta.id,
        type: meta.type,
      });
    }
  }

  const availableMetas = [...uniqueMetas.values()].slice(
    0,
    FALLBACK_CANDIDATE_LIMIT,
  );

  const candidates: CatalogItem[] = [];

  for (
    let index = 0;
    index < availableMetas.length;
    index += METADATA_CONCURRENCY
  ) {
    const batch = availableMetas.slice(index, index + METADATA_CONCURRENCY);

    const results = await Promise.allSettled(
      batch.map((meta) => getCatalogMetadata(meta.id, meta.type)),
    );

    for (const result of results) {
      if (result.status !== "fulfilled" || !result.value) {
        continue;
      }

      const item = result.value;

      if (excludedKeys.has(itemKey(item.type, item.id))) {
        continue;
      }

      if (
        preferredGenres.length > 0 &&
        getMatchingGenres(item, preferredGenres).length === 0
      ) {
        continue;
      }

      candidates.push(item);
    }
  }

  return candidates;
}

async function generateFallbackRecommendation(
  type: RecommendationType,
  preferredGenres: string[],
  excludedKeys: Set<string>,
): Promise<{
  item: CatalogItem;
  reason: string;
  score: number;
} | null> {
  const candidates = await getFallbackCandidates(
    type,
    preferredGenres,
    excludedKeys,
  );

  const selected = rankFallbackCandidates(candidates, preferredGenres)[0];

  if (!selected) {
    return null;
  }

  const reason =
    selected.matchingGenres.length > 0
      ? `Coincide con tus preferencias de ${selected.matchingGenres.join(", ")} y destaca por su valoración y popularidad.`
      : "Destaca por su valoración y popularidad.";

  return {
    item: selected.item,
    reason,
    score: selected.score,
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
      try {
        const item = await getCatalogMetadata(
          recommendation.externalId,
          recommendation.mediaType,
        );

        return serializeRecommendation(recommendation, item);
      } catch {
        return serializeRecommendation(recommendation, null);
      }
    }),
  );
}

export async function getNextRecommendation(
  userId: number,
  type: RecommendationType = "all",
): Promise<RecommendationResult> {
  if (!["movie", "series", "all"].includes(type)) {
    throw new RecommendationError(
      "Tipo de contenido inválido. Utiliza movie, series o all.",
      400,
    );
  }

  const preferences = await getUserPreferences(userId);

  const excludedKeys = await getExcludedTitles(userId, preferences.likedKeys);

  let selected: CatalogItem | null = null;
  let reason = "";
  let score = 0;
  let source: "gemini" | "fallback" = "fallback";

  if (env.GEMINI_API_KEY && env.GEMINI_MODEL) {
    for (let attempt = 0; attempt < MAX_RECOMMENDATION_ATTEMPTS; attempt += 1) {
      const proposal = await generateWithGemini(
        preferences.genres,
        type,
        excludedKeys,
      );

      if (!proposal) {
        break;
      }

      const item = await findRecommendedTitle(
        proposal,
        preferences.genres,
        excludedKeys,
      );

      if (!item) {
        continue;
      }

      selected = item;
      reason = proposal.reason;
      score = proposal.score;
      source = "gemini";

      break;
    }
  }

  if (!selected) {
    const fallback = await generateFallbackRecommendation(
      type,
      preferences.genres,
      excludedKeys,
    );

    if (!fallback) {
      throw new RecommendationError(
        "No hay títulos disponibles que coincidan con tus géneros y que no hayas recibido anteriormente.",
        404,
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
    modelName: source === "gemini" ? env.GEMINI_MODEL : null,
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

  return serializeRecommendation(recommendation, item);
}
