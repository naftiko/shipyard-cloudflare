# Naftiko Shipyard — End-to-End on Cloudflare Containers

One-click Cloudflare Containers deploy of the **end state** of the Naftiko Framework Shipyard tutorial — `step-11-shipyard-fleet-manifest`. Three protocol adapters, two consumed APIs, full domain-driven aggregate, all running behind a single `*.workers.dev` URL.

[![Run in Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/naftiko/shipyard-cloudflare)

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
| `Dockerfile` | Builds on `ghcr.io/naftiko/framework:latest`, copies `capability/` into `/app/`, exposes 3001/3002/3003 |
| `wrangler.toml` | Cloudflare Containers config — Durable Object–backed `ShipyardContainer` |
| `src/index.ts` | Worker that proxies traffic to the right port — `/mcp` → 3001, `/skill` → 3003, everything else → 3002 |

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
