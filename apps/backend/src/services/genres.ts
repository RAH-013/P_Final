import { sequelize } from "../config/db/connection.js";
import User from "../models/User.js";
import UserGenre from "../models/UserGenre.js";
import { getGenres } from "./catalog/cinemeta.js";

export class GenreError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "GenreError";
  }
}

interface UpdateGenresResult {
  genres: string[];
  updated: boolean;
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

  return [
    ...new Map(
      normalized.map((genre) => [genre.toLocaleLowerCase(), genre]),
    ).values(),
  ];
}

export async function getUserGenres(userId: number): Promise<string[]> {
  const genres = await UserGenre.findAll({
    where: { userId },
    attributes: ["genre"],
    order: [["genre", "ASC"]],
  });

  return genres.map(({ genre }) => genre);
}

export async function updateUserGenres(
  userId: number,
  genres: string[],
): Promise<UpdateGenresResult> {
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
      .map(({ genre }) => genre.toLocaleLowerCase())
      .sort();

    const next = normalizedGenres
      .map((genre) => genre.toLocaleLowerCase())
      .sort();

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

export function getAvailableGenres(): Promise<string[]> {
  return getGenres();
}
