import type { Request, Response, NextFunction } from "express";

import {
  updateUsername,
  updatePassword,
  deleteAccount,
  adminDeleteAccount,
  changeUserRole,
  getCurrentUser,
  getAllUsers,
} from "../services/users.js";

import { sendSuccess } from "../utils/response.js";

export async function changeUsername(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await updateUsername(req.user!.sub, req.body.username);

    sendSuccess(
      res,
      200,
      "Nombre de usuario actualizado correctamente",
      result,
    );
  } catch (error) {
    next(error);
  }
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await updatePassword(
      req.user!.sub,
      req.body.currentPassword,
      req.body.newPassword,
    );

    sendSuccess(res, 200, "Contraseña actualizada correctamente", result);
  } catch (error) {
    next(error);
  }
}

export async function removeAccount(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await deleteAccount(req.user!.sub, req.body.password);

    sendSuccess(res, 200, "Cuenta eliminada correctamente", result);
  } catch (error) {
    next(error);
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await getCurrentUser(req.user!.sub);

    const authorization = req.headers.authorization;
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!token) {
      next(
        Object.assign(new Error("Token de autenticación no válido"), {
          status: 401,
        }),
      );
      return;
    }

    sendSuccess(res, 200, "Información del usuario obtenida correctamente", {
      token,
      profile: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function adminRemoveAccount(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminDeleteAccount(req.user!.sub, req.params.id);

    sendSuccess(res, 200, "Cuenta eliminada correctamente", result);
  } catch (error) {
    next(error);
  }
}

export async function changeRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await changeUserRole(
      req.user!.sub,
      req.params.id,
      req.body.role,
    );

    sendSuccess(res, 200, "Rol actualizado correctamente", result);
  } catch (error) {
    next(error);
  }
}

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await getAllUsers(req.user!.sub);

    sendSuccess(res, 200, "Usuarios obtenidos correctamente", result);
  } catch (error) {
    next(error);
  }
}
