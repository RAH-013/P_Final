import type { Response } from "express";

export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: string;
  detalles: string[];
}

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
) {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    data,
  };

  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  statusCode: number,
  error: string,
  detalles: string[] = [],
) {
  const response: ErrorResponse = {
    success: false,
    error,
    detalles,
  };

  return res.status(statusCode).json(response);
}
