import type { ErrorRequestHandler } from "express";
import { sendError } from "../utils/response.js";
import { env } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status =
    typeof err.status === "number" && err.status >= 400 && err.status <= 599
      ? err.status
      : 500;

  const message =
    status === 500
      ? "Error interno del servidor"
      : err.message || "Error en la solicitud";

  const detalles =
    env.NODE_ENV === "development" && err.stack ? [err.stack] : [];

  console.error(err);

  sendError(res, status, message, detalles);
};
