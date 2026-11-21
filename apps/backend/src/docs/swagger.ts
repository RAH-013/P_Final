import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { stringify } from "yaml";
import type { Express } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = __dirname.split(path.sep).includes("dist");

const docsPath = path.resolve(
  __dirname,
  isProduction ? "../../src/docs/schemas/**/*.ts" : "./schemas/**/*.ts",
);

const openapiSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Nexus API Rest",
      version: "1.0.0",
      description: "Documentación de la API",
    },
    servers: [
      {
        url: process.env.API_BASE_URL || "/api",
        description: "API Server",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Autenticación y gestión de sesiones",
      },
      {
        name: "Users",
        description: "Gestión de usuarios",
      },
      {
        name: "Genres",
        description: "Gestión de géneros preferidos",
      },
      {
        name: "Likes",
        description: "Gestión de películas y series favoritas",
      },
      {
        name: "Comments",
        description: "Gestión de comentarios",
      },
      {
        name: "Catalog",
        description: "Búsqueda y consulta de películas y series",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Introduce el token JWT obtenido al iniciar sesión.",
        },
      },
    },
  },
  apis: [docsPath],
});

export function setupSwagger(app: Express): void {
  app.get("/api/openapi.json", (_req, res) => {
    res.json(openapiSpec);
  });

  app.get("/api/openapi.yml", (_req, res) => {
    res.type("application/yaml").send(stringify(openapiSpec));
  });

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));
}

export default openapiSpec;
