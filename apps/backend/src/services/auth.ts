import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sign } from "../middlewares/auth.js";

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export function formatUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
}

export function generateToken(user: User): string {
  return sign({
    sub: String(user.id),
    username: user.username,
    role: user.role,
    ver: user.tokenVersion,
  });
}

export function validatePassword(password: string): void {
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    throw new AuthError(
      "La contraseña debe tener entre 8 y 72 bytes y al menos 8 caracteres",
      400,
    );
  }
}

export async function registerUser(username: string, password: string) {
  username = username?.trim().toLowerCase();

  if (!username || !password) {
    throw new AuthError("Usuario y contraseña son obligatorios", 400);
  }

  if (!/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
    throw new AuthError("El usuario debe tener entre 3 y 32 caracteres", 400);
  }

  validatePassword(password);

  const exists = await User.findOne({ where: { username } });

  if (exists) {
    throw new AuthError("El usuario ya está registrado", 409);
  }

  try {
    const user = await User.create({
      username,
      password: await bcrypt.hash(password, 12),
      role: "user",
    });

    return {
      user: formatUser(user),
      token: generateToken(user),
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "SequelizeUniqueConstraintError"
    ) {
      throw new AuthError("El usuario ya está registrado", 409);
    }

    throw error;
  }
}

export async function loginUser(username: string, password: string) {
  username = username?.trim().toLowerCase();

  if (!username || !password) {
    throw new AuthError("Usuario y contraseña son obligatorios", 400);
  }

  const user = await User.findOne({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AuthError("Usuario o contraseña incorrectos", 401);
  }

  return {
    user: formatUser(user),
    token: generateToken(user),
  };
}
