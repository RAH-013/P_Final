import { Op } from "sequelize";
import { sequelize } from "../config/db/connection.js";
import User from "../models/User.js";
import UserGenre from "../models/UserGenre.js";

export class GenreError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "GenreError";
  }
}

function normalizeGenres(genres: string[]): string[] {
  if (!Array.isArray(genres)) {
    throw new GenreError("Los géneros deben ser una lista", 400);
  }

  const normalized = genres.map((genre) =>
    typeof genre === "string" ? genre.trim() : "",
  );

  if (normalized.some((genre) => !genre || genre.length > 64)) {
    throw new GenreError("Uno o más géneros no son válidos", 400);
  }

  return [...new Set(normalized.map((genre) => genre.toLowerCase()))];
}

export async function getUserGenres(userId: number) {
  const genres = await UserGenre.findAll({
    where: { userId },
    attributes: ["genre"],
    order: [["genre", "ASC"]],
  });

  return genres.map(({ genre }) => genre);
}

export async function updateUserGenres(userId: number, genres: string[]) {
  const normalizedGenres = normalizeGenres(genres);

  if (normalizedGenres.length > 10) {
    throw new GenreError("Puedes seleccionar hasta 10 géneros", 400);
  }

  return sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(userId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!user) {
      throw new GenreError("Usuario no encontrado", 404);
    }

    const currentGenres = await UserGenre.findAll({
      where: { userId },
      attributes: ["genre"],
      transaction,
    });

    const current = currentGenres
      .map(({ genre }) => genre.toLowerCase())
      .sort();

    const next = [...normalizedGenres].sort();

    const hasChanged =
      current.length !== next.length ||
      current.some((genre, index) => genre !== next[index]);

    if (!hasChanged) {
      return {
        genres: currentGenres.map(({ genre }) => genre),
        updated: false,
      };
    }

    await UserGenre.destroy({
      where: { userId },
      transaction,
    });

    if (normalizedGenres.length > 0) {
      await UserGenre.bulkCreate(
        normalizedGenres.map((genre) => ({
          userId,
          genre,
        })),
        { transaction },
      );
    }

    await user.increment("profileVersion", {
      by: 1,
      transaction,
    });

    return {
      genres: normalizedGenres,
      updated: true,
    };
  });
}
