import express, { type Express } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import logger from "morgan";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function setupMiddlewares(app: Express): void {
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
