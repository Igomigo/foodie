FROM node:24-bookworm-slim AS build

WORKDIR /app/server
COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY data ./data
RUN npm run build && npm prune --omit=dev

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app/server
COPY --from=build --chown=node:node /app/server/package*.json ./
COPY --from=build --chown=node:node /app/server/node_modules ./node_modules
COPY --from=build --chown=node:node /app/server/dist ./dist
COPY --from=build --chown=node:node /app/server/data ./data

USER node
EXPOSE 2000
CMD ["node", "dist/index.js"]
