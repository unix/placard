FROM node:24-alpine AS build

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/api/package.json packages/api/package.json
RUN pnpm install --filter @norehq/open-graph-api... --frozen-lockfile

COPY packages/api packages/api
RUN pnpm --filter @norehq/open-graph-api build
RUN pnpm --filter @norehq/open-graph-api deploy --prod /release

FROM node:24-alpine AS runtime

ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV PORT=3003

WORKDIR /app

COPY --from=build /release ./
COPY --from=build /app/packages/api/assets ./assets

EXPOSE 3003

USER node

CMD ["node", "dist/src/server.js"]
