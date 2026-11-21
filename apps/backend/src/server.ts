import http from "node:http";
import debugFactory from "debug";
import cors from "cors";
import app from "./app.js";
import { connectDB } from "./config/db/index.js";
import { env } from "./config/env.js";

const debug = debugFactory("backend:server");

app.use(
  cors({
    origin: env.CORS_ORIGINS.includes("*") ? "*" : env.CORS_ORIGINS,
  }),
);

console.log(
  `CORS: ${
    env.CORS_ORIGINS.includes("*")
      ? "Todos los dominios permitidos (*)"
      : env.CORS_ORIGINS.join(", ")
  }`,
);

await connectDB();

app.set("port", env.PORT);

const server = http.createServer(app);

server.listen(env.PORT);
server.on("error", onError);
server.on("listening", onListening);

function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== "listen") throw error;

  const bind = `Port ${env.PORT}`;

  if (error.code === "EACCES") {
    console.error(`${bind} requires elevated privileges`);
    process.exit(1);
  }

  if (error.code === "EADDRINUSE") {
    console.error(`${bind} is already in use`);
    process.exit(1);
  }

  throw error;
}

function onListening(): void {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr?.port}`;

  debug(`Listening on ${bind}`);
  console.log(`SERVER: http://localhost:${env.PORT}`);
}
