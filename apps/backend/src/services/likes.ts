import { sequelize } from "../config/db/connection.js";
import LikedItem, { type LikedMediaType } from "../models/LikedItem.js";
import User from "../models/User.js";
import { getCatalogMetadata } from "./catalog/catalog.js";

export class LikeError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "LikeError";
  }
}

function validateMedia(
  externalId: string,
  mediaType: string,
): asserts mediaType is LikedMediaType {
  if (!/^tt\d+$/.test(externalId)) {
    throw new LikeError("El ID del contenido no es válido", 400);
  }

  if (mediaType !== "movie" && mediaType !== "series") {
    throw new LikeError("El tipo debe ser movie o series", 400);
  }
}

export async function getUserLikes(userId: number) {
  return LikedItem.findAll({
    where: { userId },
    attributes: ["id", "externalId", "mediaType", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
}

export async function addLike(
  userId: number,
  externalId: string,
  mediaType: string,
) {
  validateMedia(externalId, mediaType);

  const metadata = await getCatalogMetadata(externalId, mediaType);

  if (!metadata) {
    throw new LikeError("La película o serie no existe", 404);
  }

  return sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(userId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!user) {
      throw new LikeError("Usuario no encontrado", 404);
    }

    const existing = await LikedItem.findOne({
      where: {
        userId,
        externalId,
        mediaType,
      },
      transaction,
    });

    if (existing) {
      throw new LikeError("Este contenido ya está en tus favoritos", 409);
    }

    const like = await LikedItem.create(
      {
        userId,
        externalId,
        mediaType,
      },
      { transaction },
    );

    await user.increment("profileVersion", {
      by: 1,
      transaction,
    });

    return like;
  });
}

export async function removeLike(
  userId: number,
  externalId: string,
  mediaType: string,
) {
  validateMedia(externalId, mediaType);

  return sequelize.transaction(async (transaction) => {
    const user = await User.findByPk(userId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!user) {
      throw new LikeError("Usuario no encontrado", 404);
    }

    const deleted = await LikedItem.destroy({
      where: {
        userId,
        externalId,
        mediaType,
      },
      transaction,
    });

    if (!deleted) {
      throw new LikeError("El contenido no está en tus favoritos", 404);
    }

    await user.increment("profileVersion", {
      by: 1,
      transaction,
    });

    return {
      message: "Contenido eliminado de tus favoritos",
    };
  });
}
