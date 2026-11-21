import express from "express";

import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import catalogRoutes from "./routes/catalog.js";

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

app.use(notFound);
app.use(errorHandler);

export default app;
