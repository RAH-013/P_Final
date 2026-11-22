
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

FROM node:24-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

RUN npm install --global serve

COPY --from=build --chown=node:node /app/dist ./dist

USER node

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
