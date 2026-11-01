#!/usr/bin/env bash

set -euo pipefail

readonly image='ghcr.io/norehq/og'
readonly local_build_marker='container-build: local'
readonly source_url='https://github.com/norehq/og'

usage() {
  printf 'Usage: pnpm release:container <version> [--local-image]\n' >&2
  printf 'Example: pnpm release:container 0.2.0 --local-image\n' >&2
}

fail() {
  printf 'Error: %s\n' "$1" >&2
  exit 1
}

version_input="${1:-}"
mode="${2:-}"

if [[ -z "${version_input}" ]]; then
  usage
  exit 1
fi

if [[ -n "${3:-}" ]]; then
  usage
  fail 'too many arguments'
fi

version="${version_input#v}"
tag="v${version}"

if [[ ! "${version}" =~ ^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]]; then
  fail "version must be a stable SemVer such as 0.2.0"
fi

if [[ -n "${mode}" && "${mode}" != '--local-image' ]]; then
  usage
  fail "unknown release mode: ${mode}"
fi

if [[ -n "$(git status --porcelain)" ]]; then
  fail 'the working tree must be clean before a release'
fi

if [[ "$(git branch --show-current)" != 'main' ]]; then
  fail 'container releases must be created from main'
fi

command -v gh >/dev/null || fail 'GitHub CLI is required'
gh auth status --hostname github.com >/dev/null || fail 'GitHub CLI is not authenticated'

git fetch origin main --tags

if [[ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]]; then
  fail 'local main must exactly match origin/main'
fi

readonly revision="$(git rev-parse HEAD)"

if git show-ref --verify --quiet "refs/tags/${tag}"; then
  fail "tag already exists: ${tag}"
fi

if gh release view "${tag}" >/dev/null 2>&1; then
  fail "GitHub Release already exists: ${tag}"
fi

if [[ "${mode}" == '--local-image' ]]; then
  command -v docker >/dev/null || fail 'Docker is required for a local image release'
  docker buildx version >/dev/null || fail 'Docker Buildx is required for a local image release'

  if docker buildx imagetools inspect "${image}:${version}" >/dev/null 2>&1; then
    fail "container image already exists: ${image}:${version}"
  fi

  readonly created="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"

  docker buildx build \
    --annotation "index,manifest:org.opencontainers.image.created=${created}" \
    --annotation 'index,manifest:org.opencontainers.image.description=Server-side Open Graph image generator' \
    --annotation 'index,manifest:org.opencontainers.image.licenses=MIT' \
    --annotation "index,manifest:org.opencontainers.image.revision=${revision}" \
    --annotation "index,manifest:org.opencontainers.image.source=${source_url}" \
    --annotation 'index,manifest:org.opencontainers.image.title=Nore OG' \
    --annotation "index,manifest:org.opencontainers.image.version=${version}" \
    --label "org.opencontainers.image.created=${created}" \
    --label 'org.opencontainers.image.description=Server-side Open Graph image generator' \
    --label 'org.opencontainers.image.licenses=MIT' \
    --label "org.opencontainers.image.revision=${revision}" \
    --label "org.opencontainers.image.source=${source_url}" \
    --label 'org.opencontainers.image.title=Nore OG' \
    --label "org.opencontainers.image.version=${version}" \
    --platform linux/amd64,linux/arm64 \
    --provenance=mode=max \
    --pull \
    --push \
    --sbom=true \
    --tag "${image}:${version}" \
    --tag "${image}:latest" \
    .

  version_digest="$(docker buildx imagetools inspect "${image}:${version}" | awk '$1 == "Digest:" { print $2; exit }')"
  latest_digest="$(docker buildx imagetools inspect "${image}:latest" | awk '$1 == "Digest:" { print $2; exit }')"

  if [[ -z "${version_digest}" || "${version_digest}" != "${latest_digest}" ]]; then
    fail 'published version and latest tags do not resolve to the same digest'
  fi

  git tag -a "${tag}" -m "${tag}" -m "${local_build_marker}"
else
  git tag -a "${tag}" -m "${tag}"
fi

git push origin "${tag}"
gh release create "${tag}" --verify-tag --title "${tag}" --generate-notes

workflow_run_id=''

for _ in {1..30}; do
  workflow_run_id="$(gh run list --workflow publish-container.yml --branch "${tag}" --event push --limit 1 --json databaseId --jq '.[0].databaseId // empty')"

  if [[ -n "${workflow_run_id}" ]]; then
    break
  fi

  sleep 2
done

if [[ -z "${workflow_run_id}" ]]; then
  fail 'the container publishing workflow did not start within 60 seconds'
fi

gh run watch "${workflow_run_id}" --exit-status

printf 'Released %s\n' "${tag}"
