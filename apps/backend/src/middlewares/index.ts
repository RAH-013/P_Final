import express, { type Express } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import logger from "morgan";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = new Set([
  "http://localhost:8080",
  "http://127.0.0.1:5500",
]);

function corsMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  const origin = req.headers.origin;

  res.vary("Origin");

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
  }

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
}

export function setupMiddlewares(app: Express): void {
  app.use(corsMiddleware);
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(
    express.static(path.join(__dirname, "../../public"), {
      index: false,
    }),
  );
}
