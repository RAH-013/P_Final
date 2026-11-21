import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

import {
  getCatalogMetadata,
  getFeaturedCatalog,
  searchCatalog,
} from "../services/catalog/catalog.js";

import { sendSuccess } from "../utils/response.js";

const searchSchema = z.object({
  q: z.string().trim().min(1).max(100),
});

const featuredSchema = z.object({
  type: z.enum(["movie", "series", "all"]).default("all"),
});

const detailsSchema = z.object({
  id: z.string().regex(/^tt\d+$/),
  type: z.enum(["movie", "series"]),
});

function validationDetails(error: z.ZodError): string[] {
  return error.issues.map(
    (issue) => `${issue.path.join(".")}: ${issue.message}`,
  );
}

export async function search(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const validation = searchSchema.safeParse(req.query);

  if (!validation.success) {
    next(
      Object.assign(new Error("Parámetros de búsqueda inválidos"), {
        status: 400,
        detalles: validationDetails(validation.error),
      }),
    );
    return;
  }

  try {
    const result = await searchCatalog(validation.data.q);

    sendSuccess(res, 200, "Resultados obtenidos correctamente", result);
  } catch (error) {
    next(error);
  }
}

export async function featured(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const validation = featuredSchema.safeParse(req.query);

  if (!validation.success) {
    next(
      Object.assign(new Error("Parámetros de destacados inválidos"), {
        status: 400,
        detalles: validationDetails(validation.error),
      }),
    );
    return;
  }

  try {
    const result = await getFeaturedCatalog(validation.data.type);

    sendSuccess(res, 200, "Contenido destacado obtenido correctamente", result);
  } catch (error) {
    next(error);
  }
}

export async function details(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const validation = detailsSchema.safeParse({
    ...req.params,
    ...req.query,
  });

  if (!validation.success) {
    next(
      Object.assign(new Error("Parámetros de contenido inválidos"), {
        status: 400,
        detalles: validationDetails(validation.error),
      }),
    );
    return;
  }

  try {
    const item = await getCatalogMetadata(
      validation.data.id,
      validation.data.type,
    );

    if (!item) {
      next(
        Object.assign(new Error("Contenido no encontrado"), {
          status: 404,
        }),
      );
      return;
    }

    sendSuccess(res, 200, "Detalles obtenidos correctamente", item);
  } catch (error) {
    next(error);
  }
}
