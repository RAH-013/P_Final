import type { ErrorRequestHandler } from "express";
import { sendError } from "../utils/response.js";
import { env } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const error = err as {
    status?: number;
    message?: string;
    stack?: string;
    type?: string;
  };

  if (error.type === "entity.parse.failed") {
    return sendError(
      res,
      400,
      "El cuerpo de la solicitud contiene JSON inválido",
      [],
    );
  }

  const status =
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status <= 599
      ? error.status
      : 500;

  const message =
    status === 500
      ? "Error interno del servidor"
      : error.message || "Error en la solicitud";

  const detalles =
    env.NODE_ENV === "development" && status === 500 && error.stack
      ? [error.stack]
      : [];

  if (status >= 500) {
    console.error(err);
  }

  return sendError(res, status, message, detalles);
};
