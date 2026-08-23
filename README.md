# Nore OG

A pnpm workspace for self-hosted Open Graph image rendering by Nore.

- `packages/api`: Node.js + Takumi HTTP API with SVG and PNG output.
- `packages/web`: Astro + React template gallery, deployed to Cloudflare Workers by
  default.

## Local development

```sh
pnpm install
pnpm dev:api
pnpm dev:web
```

The API listens on `http://localhost:3003`. The web app reads that URL by default;
set `PUBLIC_API_BASE_URL` when the API is hosted elsewhere.

## API

The API is public when `OG_INTERNAL_TOKEN` is unset or blank. When it is set, all
render and template endpoints require `Authorization: Bearer <token>`. `/health`
always remains public.

```text
GET  /health
GET  /api/templates-minify
GET  /api/templates
GET  /render.svg
GET  /render.png
POST /api/render
```

Supported render fields are `template`, `title`, `description`, `author`, `date`,
`brandName`, `logoId`, `logoUrl`, `maxTitleLength`, and `maxDescriptionLength`.
Global render behavior fields are `canvasColor`, `canvasPadding`, `canvasRadius`,
`contentRadius`, `seed`, and `lang`. `contentRadius` accepts a non-negative integer
or `"auto"`; automatic mode uses `max(canvasRadius - canvasPadding, 0)`. The POST
endpoint accepts the same fields plus `format: "svg" | "png"`.

Invalid global render behavior falls back to the corresponding default without
failing the request. Successful responses list any supplied invalid fields in the
`X-Render-Fallback-Fields` response header. Omitted fields use their defaults and
are not included in that header.

## Web deployment

The web package uses the Astro Cloudflare adapter and Wrangler. Deploy it to
Cloudflare Workers from the workspace root:

```sh
pnpm deploy
```

Set `PUBLIC_API_BASE_URL` to the public API origin in the Cloudflare build
environment.

## Docker

The default Dockerfile builds only the API. The web package is excluded from the
Docker build context because it is deployed separately to Cloudflare Workers.

```sh
docker build -t open-graph-api .
docker run --rm -p 3003:3003 open-graph-api
```

The Dockerfile has no architecture-specific download step and can be published for
multiple platforms with Buildx.
