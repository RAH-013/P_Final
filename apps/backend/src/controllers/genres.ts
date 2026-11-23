import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

import {
  getAvailableGenres,
  getUserGenres,
  updateUserGenres,
} from "../services/genres.js";

import { sendSuccess } from "../utils/response.js";

const genresSchema = z.object({
  genres: z.array(z.string().trim().min(1).max(64)).max(10),
});

export async function getAvailableGenresController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const genres = await getAvailableGenres();

    sendSuccess(res, 200, "Géneros disponibles obtenidos correctamente", {
      genres,
      total: genres.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function getGenres(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = Number(req.user!.sub);
    const genres = await getUserGenres(userId);

    sendSuccess(res, 200, "Preferencias obtenidas correctamente", {
      genres,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateGenres(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const validation = genresSchema.safeParse(req.body);

  if (!validation.success) {
    next(
      Object.assign(new Error("Los géneros proporcionados no son válidos"), {
        status: 422,
        detalles: validation.error.issues,
      }),
    );
    return;
  }

  try {
    const userId = Number(req.user!.sub);
    const result = await updateUserGenres(userId, validation.data.genres);

    sendSuccess(res, 200, "Preferencias actualizadas", result);
  } catch (error) {
    next(error);
  }
}
