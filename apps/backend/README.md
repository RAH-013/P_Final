# backend

Generated with [express-generator1](https://www.npmjs.com/package/express-generator1).

**Stack:** Express · TypeScript · MySQL (Sequelize) · JWT auth · Docker

## Getting started

```sh
npm install
docker compose up -d   # starts DB (and app if you prefer)
npm run dev
```

Server will start on http://localhost:3000

## Scripts

- `npm run dev` — start in watch mode
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run the compiled build
- `npm run type-check` — type-check without emitting

## Auth endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | `{ email, password }` | Create a user, returns JWT |
| POST | `/auth/login` | `{ email, password }` | Returns JWT |
| GET | `/auth/me` | _(Bearer token)_ | Returns the current user |

## Project structure

```
src/
├── app.ts           # Express app: middleware, routes, error handlers
├── server.ts        # HTTP server bootstrap
├── routes/         # Route modules
├── db/             # Database connection
├── models/         # Data models
├── middleware/     # auth middleware
```

## License

MIT
