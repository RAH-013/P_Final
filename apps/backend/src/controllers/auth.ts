import type { Request, Response, NextFunction } from "express";
import { AuthError, registerUser, loginUser } from "../services/auth.js";
import { sendSuccess } from "../utils/response.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { username, password } = req.body;

    const result = await registerUser(username, password);

    sendSuccess(res, 201, "Usuario registrado correctamente", result);
  } catch (error) {
    if (error instanceof AuthError) {
      next(Object.assign(error, { status: error.statusCode }));
      return;
    }

    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { username, password } = req.body;

    const result = await loginUser(username, password);

    sendSuccess(res, 200, "Inicio de sesión correcto", result);
  } catch (error) {
    if (error instanceof AuthError) {
      next(Object.assign(error, { status: error.statusCode }));
      return;
    }

    next(error);
  }
}
