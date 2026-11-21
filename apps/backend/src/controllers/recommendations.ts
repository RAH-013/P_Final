import type { RequestHandler } from "express";
import {
  getRecommendations as getRecommendationsService,
  getNextRecommendation as getNextRecommendationService,
  getRecommendationById as getRecommendationByIdService,
} from "../services/recommendations.js";

function getUserId(value: unknown): number {
  const userId = Number(value);

  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw Object.assign(new Error("Usuario no válido"), {
      status: 401,
    });
  }

  return userId;
}

export const getRecommendations: RequestHandler = async (req, res, next) => {
  try {
    const userId = getUserId(req.user?.sub);
    const recommendations = await getRecommendationsService(userId);

    res.status(200).json({
      success: true,
      message: "Recomendaciones obtenidas correctamente",
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

export const getNextRecommendation: RequestHandler = async (req, res, next) => {
  try {
    const userId = getUserId(req.user?.sub);
    const recommendation = await getNextRecommendationService(userId);

    res.status(201).json({
      success: true,
      message: "Nueva recomendación generada correctamente",
      data: recommendation,
    });
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

    res.status(200).json({
      success: true,
      message: "Recomendación obtenida correctamente",
      data: recommendation,
    });
  } catch (error) {
    next(error);
  }
};
