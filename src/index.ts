import { Container, getContainer } from "@cloudflare/containers";

interface Env {
  SHIPYARD: DurableObjectNamespace<ShipyardContainer>;
}

const MCP_PORT = 3001;
const REST_PORT = 3002;
const SKILL_PORT = 3003;

export class ShipyardContainer extends Container<Env> {
  defaultPort = REST_PORT;
  requiredPorts = [MCP_PORT, REST_PORT, SKILL_PORT];
  sleepAfter = "10m";

  override async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/mcp" || path.startsWith("/mcp/")) {
      const rewritten = new URL(request.url);
      rewritten.pathname = path === "/mcp" ? "/" : path.slice("/mcp".length);
      const proxied = new Request(rewritten.toString(), request);
      return super.containerFetch(proxied, MCP_PORT);
    }

    if (path === "/skill" || path.startsWith("/skill/")) {
      const rewritten = new URL(request.url);
      rewritten.pathname = path === "/skill" ? "/" : path.slice("/skill".length);
      const proxied = new Request(rewritten.toString(), request);
      return super.containerFetch(proxied, SKILL_PORT);
    }

    return super.containerFetch(request, REST_PORT);
  }

  override async onStart(): Promise<void> {
    console.log(
      `Naftiko Shipyard ready — MCP on ${MCP_PORT}, REST on ${REST_PORT}, SKILL on ${SKILL_PORT}.`,
    );
  }

  override onStop(): void {
    console.log("Naftiko Shipyard container stopped.");
  }

  override onError(error: unknown): void {
    console.error("Naftiko Shipyard container error:", error);
  }
}

function landing(): Response {
  const body = `Naftiko Shipyard — End-to-End

Naftiko Framework engine running the cumulative Shipyard tutorial capability
(step-11-shipyard-fleet-manifest) on Cloudflare Containers.

Backed by the public Maritime Registry and Dockyard mocks at
mocks.naftiko.net (no real keys required for the tutorial flow).

MCP endpoint:
  POST /mcp                   — Naftiko Framework MCP server
                                (namespace: shipyard-tools)

REST endpoint:
  /api/...                    — REST adapter (namespace: shipyard-api)
                                see capability YAML for routes

SKILL endpoint:
  /skill                      — Skill server (namespace: shipyard-skills)

Source:    https://github.com/naftiko/shipyard-cloudflare
Tutorial:  https://github.com/naftiko/framework/wiki/Tutorial-%E2%80%90-Part-1
Framework: https://github.com/naftiko/framework
`;
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "") {
      return landing();
    }
    const container = getContainer(env.SHIPYARD);
    return container.fetch(request);
  },
};
