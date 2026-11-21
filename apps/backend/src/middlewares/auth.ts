import jwt, { type SignOptions } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import User, { type UserRole } from "../models/User.js";

export interface AuthPayload {
  sub: string;
  username: string;
  role: UserRole;
  ver: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function sign(payload: AuthPayload): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ error: "JWT_SECRET is not configured" });
    return;
  }

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Missing token" });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as AuthPayload;

    if (
      typeof payload.sub !== "string" ||
      !Number.isSafeInteger(Number(payload.sub)) ||
      typeof payload.ver !== "number"
    ) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const user = await User.findByPk(Number(payload.sub));

    if (!user || user.tokenVersion !== payload.ver) {
      res.status(401).json({ error: "Session expired. Login again." });
      return;
    }

    req.user = {
      sub: String(user.id),
      username: user.username,
      role: user.role,
      ver: user.tokenVersion,
    };

    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
}
