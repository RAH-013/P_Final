import type { Request, Response, NextFunction } from "express";
import { forwardExternalRequest } from "../services/external.js";

export async function proxyExternal(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const headers: Record<string, string | undefined> = {};

    for (const [key, value] of Object.entries(req.headers)) {
      headers[key] = Array.isArray(value) ? value[0] : value;
    }

    const result = await forwardExternalRequest(
      req.method,
      req.originalUrl,
      headers,
      req.body,
    );

    res.status(result.status).json(result.data);
  } catch (error) {
    next(error);
  }
}
