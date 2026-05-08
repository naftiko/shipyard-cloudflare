# Naftiko Shipyard — End-to-End

One-click container deploy of the **end state** of the Naftiko Framework Shipyard tutorial — `step-11-shipyard-fleet-manifest`. Three protocol adapters, two consumed APIs, full domain-driven aggregate.

## Run it

[![Run in Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/naftiko/shipyard-cloudflare)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/naftiko/shipyard-cloudflare)
[![Run on Google Cloud](https://deploy.cloud.run/button.svg)](https://deploy.cloud.run/?git_repo=https://github.com/naftiko/shipyard-cloudflare)
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/new/template?template=https://github.com/naftiko/shipyard-cloudflare)
[![Run on Replit](https://replit.com/badge/github/naftiko/shipyard-cloudflare)](https://replit.com/github/naftiko/shipyard-cloudflare)

The Cloudflare button gives you the full three-protocol surface (MCP + REST + SKILL) via the bundled Worker proxy at one `*.workers.dev` hostname. The other four buttons expose the MCP server on port 3001 directly — REST and SKILL are reachable inside the container only. See [Per-platform behavior](#per-platform-behavior) below.

## What this deploys

The Shipyard tutorial walks through eleven YAML files, each one layering more capability onto the last — mock MCP, real consumes, auth, output shaping, multi-source, write operations, orchestrated lookup, skill groups, aggregates, REST adapter, fleet manifest. This deploy is the cumulative final state: the one capability YAML that demonstrates the full feature surface of the framework end to end.

| Adapter | Path | Namespace | Purpose |
|---|---|---|---|
| MCP | `POST /mcp` | `shipyard-tools` | MCP tool calls — list ships, get ship, voyage planning, etc. |
| REST | `/api/...` | `shipyard-api` | REST adapter exposing the same domain as REST resources |
| SKILL | `/skill` | `shipyard-skills` | Agent skill server for structured discovery |

Backed by:

- **Maritime Registry mock** — `mocks.naftiko.net/rest/naftiko-shipyard-maritime-registry-api/1.0.0-alpha2` — bearer auth (test token shipped in `capability/shared/secrets.yaml`)
- **Legacy Dockyard mock** — same host, different base path

No real upstream credentials are required to exercise the tutorial flow.

## Files

| Path | What it is |
|---|---|
| `capability/shipyard.naftiko.yml` | The end-to-end Shipyard capability — 832 lines, the cumulative tutorial output |
| `capability/shared/step11-registry-consumes.yml` | Imported `consumes` for the Maritime Registry |
| `capability/shared/legacy-consumes.yaml` | Imported `consumes` for the legacy Dockyard |
| `capability/shared/secrets.yaml` | Bound test secrets (dummy bearer tokens that the public mocks accept) |
| `Dockerfile` | Builds on `ghcr.io/naftiko/framework:latest`, copies `capability/` into `/app/`, exposes 3001/3002/3003 — read by every platform |
| `wrangler.toml` | Cloudflare-only — Durable Object–backed `ShipyardContainer` |
| `src/index.ts` | Cloudflare-only — Worker that proxies `/mcp` → 3001, `/skill` → 3003, everything else → 3002 |
| `render.yaml` | Render-only — Blueprint that pins `PORT=3001` to the Dockerfile |

Cloud Run, Railway, and Replit auto-detect the Dockerfile and need no extra config in the repo.

## Per-platform behavior

| Button | Public surface | Notes |
|---|---|---|
| **Cloudflare** | `/mcp` + `/api/...` + `/skill` + landing page on `/` | Worker (`src/index.ts`) proxies three ports through one hostname. Verified working. |
| **Render** | MCP only on the assigned hostname (`PORT=3001`) | Free tier with cold-starts; pin to `starter` plan in `render.yaml` to avoid sleep. Unverified. |
| **Google Cloud Run** | MCP only on `PORT=3001` | Scales to zero. May require setting `--port=3001` if the Cloud Run UI defaults to 8080. Unverified. |
| **Railway** | MCP only on the assigned hostname | Auto-detects Dockerfile; no per-repo config. Requires Railway login + billing link. Unverified. |
| **Replit** | MCP only inside the Replit container | Best for "kick the tires" exploration; not production-grade. Unverified. |

For non-Cloudflare platforms that need REST or SKILL exposed too, fork and modify the Dockerfile to add a path-routing reverse proxy (Caddy/Nginx) fronting all three ports on a single PORT.

## Local development

```sh
npm install
npm run dev
```

## Deploy from the CLI instead

```sh
npm install
npm run deploy
```

## Source

- Tutorial: <https://github.com/naftiko/framework/wiki/Tutorial-%E2%80%90-Part-1>
- Capability source: <https://github.com/naftiko/framework/blob/main/src/main/resources/tutorial/step-11-shipyard-fleet-manifest.yml>
- Naftiko Framework: <https://github.com/naftiko/framework>
