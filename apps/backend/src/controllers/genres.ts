import type { Request, Response } from "express";
import { z } from "zod";
import { getUserGenres, updateUserGenres } from "../services/genres.js";

const genresSchema = z.object({
  genres: z.array(z.string().trim().min(1).max(64)).max(10),
});

export async function getGenres(req: Request, res: Response) {
  const userId = Number(req.user!.sub);

  const genres = await getUserGenres(userId);

  return res.json({
    genres,
  });
}

export async function updateGenres(req: Request, res: Response) {
  const validation = genresSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: "Los géneros proporcionados no son válidos",
      detalles: validation.error.issues,
    });
  }

  const userId = Number(req.user!.sub);

  const result = await updateUserGenres(userId, validation.data.genres);

  return res.json({
    message: "Preferencias actualizadas",
    ...result,
  });
}
