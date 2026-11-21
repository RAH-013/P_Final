import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    PORT: z.coerce.number().int().min(1).max(65535),

    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),

    MYSQL_HOST: z.string().min(1),
    MYSQL_PORT: z.coerce.number().int().min(1).max(65535),
    MYSQL_USER: z.string().min(1),
    MYSQL_PASSWORD: z.string(),
    MYSQL_DATABASE: z.string().min(1),

    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default("1d"),

    CORS_ORIGINS: z
      .string()
      .default("*")
      .transform((value) =>
        value === "*"
          ? ["*"]
          : value
              .split(",")
              .map((origin) => origin.trim())
              .filter(Boolean),
      ),

    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().optional(),
  })
  .transform((data) => ({
    ...data,
    GEMINI_MODEL: data.GEMINI_API_KEY
      ? data.GEMINI_MODEL || "gemini-2.5-flash"
      : undefined,
  }));

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Error en las variables de entorno:");
  console.error(z.prettifyError(result.error));
  process.exit(1);
}

export const env = result.data;

export type Env = typeof env;
