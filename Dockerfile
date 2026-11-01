FROM node:24-alpine AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

FROM base AS api-build

COPY packages/api/package.json packages/api/package.json
RUN pnpm install --filter @norehq/open-graph-api... --frozen-lockfile

COPY packages/api packages/api
RUN pnpm --filter @norehq/open-graph-api build

# This is pnpm's workspace packaging command, not a package deploy script.
# It copies the built API and production dependencies into /release.
RUN pnpm --filter @norehq/open-graph-api deploy --legacy --prod /release

FROM base AS web-build

COPY packages/web/package.json packages/web/package.json
# Wrangler is a dev dependency and is intentionally omitted from Docker.
RUN pnpm install --filter @norehq/open-graph-web... --prod --frozen-lockfile

COPY packages/web packages/web
RUN pnpm --filter @norehq/open-graph-web build

FROM alpine:3.24 AS runtime

RUN apk add --no-cache nodejs
RUN addgroup --gid 1000 --system node \
  && adduser --uid 1000 --system --ingroup node node

ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV OG_ALLOW_ANONYMOUS=true
ENV OG_WEB_ENABLED=true
ENV PORT=3003

WORKDIR /app

COPY --from=api-build /release ./
COPY --from=web-build /app/packages/web/dist ./web/dist

EXPOSE 3003

USER node

CMD ["node", "dist/src/server.js"]
