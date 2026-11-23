import type { RequestHandler } from "express";

import {
  getRecommendations as getRecommendationsService,
  getNextRecommendation as getNextRecommendationService,
  getRecommendationById as getRecommendationByIdService,
} from "../services/recommendations.js";

import type { RecommendationType } from "../services/recommendations.js";
import { RecommendationError } from "../services/recommendations.js";

import { sendSuccess } from "../utils/response.js";

function getUserId(value: unknown): number {
  const userId = Number(value);

  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw Object.assign(new Error("Usuario no válido"), {
      status: 401,
    });
  }

  return userId;
}

function getRecommendationType(value: unknown): RecommendationType {
  if (value === undefined) {
    return "all";
  }

  if (
    typeof value !== "string" ||
    !["movie", "series", "all"].includes(value)
  ) {
    throw new RecommendationError(
      "Tipo de contenido inválido. Utiliza movie, series o all.",
      400,
    );
  }

  return value as RecommendationType;
}

export const getRecommendations: RequestHandler = async (req, res, next) => {
  try {
    const userId = getUserId(req.user?.sub);
    const recommendations = await getRecommendationsService(userId);

    sendSuccess(
      res,
      200,
      "Recomendaciones obtenidas correctamente",
      recommendations,
    );
  } catch (error) {
    next(error);
  }
};

export const getNextRecommendation: RequestHandler = async (req, res, next) => {
  try {
    const userId = getUserId(req.user?.sub);
    const type = getRecommendationType(req.query.type);

    const recommendation = await getNextRecommendationService(userId, type);

    sendSuccess(
      res,
      201,
      "Nueva recomendación generada correctamente",
      recommendation,
    );
  } catch (error) {
    next(error);
  }
};

export const getRecommendationById: RequestHandler = async (req, res, next) => {
  try {
    const userId = getUserId(req.user?.sub);

    const recommendation = await getRecommendationByIdService(
      userId,
      Number(req.params.id),
    );

    sendSuccess(
      res,
      200,
      "Recomendación obtenida correctamente",
      recommendation,
    );
  } catch (error) {
    next(error);
  }
};
