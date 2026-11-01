# Nore OG

Nore OG is a server-side Open Graph image generator for creating consistent, branded cards automatically and at scale. Choose a template, add your content, then export an SVG or PNG image for a blog post, product page, release note, or any other shareable link.

It includes a web interface for composing and previewing cards, plus an HTTP API for automated generation. The web interface and API can also be self-hosted together with Docker.

## Features

- Reusable templates with custom content and branding
- SVG and PNG output
- Web interface and HTTP API
- Single-container self-hosting

## Links

- [Web app](https://og.nore.sh)
- [Documentation, API reference, and self-hosting guide](https://og.nore.sh/intro)
- [中文文档、API 参考与自部署指南](https://og.nore.sh/zh/intro)

## Container releases

Stable container images are published to the GitHub Container Registry when a SemVer tag is pushed. For example, pushing `v0.1.0` publishes both `ghcr.io/norehq/og:0.1.0` and `ghcr.io/norehq/og:latest` for Linux AMD64 and ARM64.

```sh
git tag v0.1.0
git push origin v0.1.0
```

Use an exact version in production so deployments do not change unexpectedly:

```sh
docker run --rm -p 3003:3003 ghcr.io/norehq/og:0.1.0
```

GitHub creates the package as private on its first publish. After the first successful release, an organization owner must change its visibility to public once in the package settings. Later releases remain public automatically.

## License

[MIT](LICENSE)
