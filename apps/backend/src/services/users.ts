import bcrypt from "bcryptjs";
import { UniqueConstraintError } from "sequelize";

import { User, type UserRole } from "../models/User.js";

function throwError(message: string, status: number): never {
  throw Object.assign(new Error(message), { status });
}

function validateId(id: number | string): number {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throwError("Identificador de usuario inválido", 400);
  }

  return parsedId;
}

function validateUsername(username: unknown): string {
  if (typeof username !== "string") {
    throwError("El nombre de usuario es obligatorio", 400);
  }

  const normalized = username.trim().toLowerCase();

  if (!/^[a-zA-Z0-9_]{3,32}$/.test(normalized)) {
    throwError(
      "El nombre de usuario debe tener entre 3 y 32 caracteres y solo puede contener letras, números y guiones bajos",
      400,
    );
  }

  return normalized;
}

function validatePassword(password: unknown, field: string): string {
  if (
    typeof password !== "string" ||
    Buffer.byteLength(password, "utf8") < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    throwError(`${field} debe tener entre 8 y 72 bytes`, 400);
  }

  return password;
}

async function getUser(id: number | string): Promise<User> {
  const userId = validateId(id);
  const user = await User.findByPk(userId);

  if (!user) {
    throwError("Usuario no encontrado", 404);
  }

  return user;
}

async function verifyPassword(user: User, password: string): Promise<void> {
  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    throwError("La contraseña actual es incorrecta", 401);
  }
}

async function verifyAdmin(adminId: number | string): Promise<User> {
  const admin = await getUser(adminId);

  if (admin.role !== "admin") {
    throwError("No tienes permisos para realizar esta operación", 403);
  }

  return admin;
}

export async function updateUsername(
  userId: number | string,
  username: string,
) {
  const user = await getUser(userId);
  const normalized = validateUsername(username);

  if (user.username === normalized) {
    throwError("El nombre de usuario ya está en uso", 409);
  }

  const existingUser = await User.findOne({
    where: { username: normalized },
  });

  if (existingUser) {
    throwError("El nombre de usuario ya está en uso", 409);
  }

  user.username = normalized;

  try {
    await user.save();
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throwError("El nombre de usuario ya está en uso", 409);
    }

    throw error;
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
}

export async function updatePassword(
  userId: number | string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await getUser(userId);

  validatePassword(currentPassword, "La contraseña actual");
  validatePassword(newPassword, "La nueva contraseña");

  await verifyPassword(user, currentPassword);

  if (currentPassword === newPassword) {
    throwError("La nueva contraseña debe ser diferente de la actual", 400);
  }

  user.password = await bcrypt.hash(newPassword, 12);
  user.tokenVersion += 1;

  await user.save();

  return {
    message: "Contraseña actualizada correctamente",
  };
}

export async function deleteAccount(userId: number | string, password: string) {
  const user = await getUser(userId);

  validatePassword(password, "La contraseña");

  await verifyPassword(user, password);

  await user.destroy();

  return {
    message: "Cuenta eliminada correctamente",
  };
}

export async function adminDeleteAccount(
  adminId: number | string,
  targetUserId: number | string,
) {
  await verifyAdmin(adminId);

  const target = await getUser(targetUserId);

  if (target.id === Number(adminId)) {
    throwError(
      "No puedes eliminar tu propia cuenta mediante esta operación",
      400,
    );
  }

  await target.destroy();

  return {
    message: "Cuenta eliminada correctamente",
    user: {
      id: target.id,
      username: target.username,
    },
  };
}

export async function changeUserRole(
  adminId: number | string,
  targetUserId: number | string,
  role: UserRole,
) {
  await verifyAdmin(adminId);

  const target = await getUser(targetUserId);

  if (target.id === Number(adminId)) {
    throwError("No puedes cambiar tu propio rol", 400);
  }

  if (role !== "admin" && role !== "user") {
    throwError("El rol especificado no es válido", 400);
  }

  if (target.role === role) {
    throwError("La cuenta ya tiene ese rol", 409);
  }

  target.role = role;
  target.tokenVersion += 1;

  await target.save();

  return {
    message: "Rol actualizado correctamente",
    user: {
      id: target.id,
      username: target.username,
      role: target.role,
    },
  };
}

export async function getCurrentUser(userId: number | string) {
  const user = await getUser(userId);

  return {
    username: user.username,
  };
}
