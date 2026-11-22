import express from "express";

import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import catalogRoutes from "./routes/catalog.js";
import genresRoutes from "./routes/genres.js";
import likesRoutes from "./routes/likes.js";
import commentsRoutes from "./routes/comments.js";
import recommendationsRoutes from "./routes/recommendations.js";
import externalRoutes from "./routes/external.js";

import { setupSwagger } from "./docs/swagger.js";

import { setupMiddlewares } from "./middlewares/index.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

setupMiddlewares(app);
setupSwagger(app);

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/catalog", catalogRoutes);
app.use("/api/genres", genresRoutes);
app.use("/api/likes", likesRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/recommendations", recommendationsRoutes);
app.use("/api/test-externo", externalRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
