# Placard

Placard is an open-source social image renderer for creating consistent, branded cards automatically and at scale. Choose a template, add your content, then export an SVG or PNG image for a blog post, product page, release note, or any other shareable link.

It includes a web interface for composing and previewing cards, plus an HTTP API for automated generation. The web interface and API can also be self-hosted together with Docker.

## Features

- Reusable templates with custom content and branding
- SVG and PNG output
- Web interface and HTTP API
- Single-container self-hosting

## Container releases

Stable container images are published publicly to the GitHub Container Registry for Linux AMD64 and ARM64. Every release publishes an exact version and updates `latest` to the same image digest.

The standard release command creates and pushes an annotated SemVer tag, creates a GitHub Release, and waits for GitHub Actions to build the image:

```sh
pnpm release:container 0.2.0
```

On a trusted development machine that is already authenticated to `ghcr.io`, the image can instead be built and pushed locally. The release tag records this choice so GitHub Actions verifies the published manifest and skips its duplicate image build:

```sh
docker login ghcr.io
pnpm release:container 0.2.0 --local-image
```

Use an exact version in production so deployments do not change unexpectedly:

```sh
docker run --rm -p 3003:3003 ghcr.io/unix/placard:0.1.0
```

## Runtime port

The API listens on `0.0.0.0:3003` by default. Set `HOST` or `PORT` at runtime to
override either value without rebuilding the application:

```sh
HOST=127.0.0.1 PORT=13003 pnpm --filter @unix/placard-api start
```

The API package's `start` command loads `packages/api/.env` when that file exists.
For Docker, pass the same variable and publish the matching container port:

```sh
docker run --rm -e PORT=13003 -p 13003:13003 ghcr.io/unix/placard:0.1.0
```

## License

[MIT](LICENSE)
