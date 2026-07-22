import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const output = new URL("../dist/", import.meta.url);

const sources = [
  ["/", "index.html", "text/html; charset=utf-8"],
  ["/styles.css", "src/styles.css", "text/css; charset=utf-8"],
  ["/app.js", "src/main.js", "text/javascript; charset=utf-8"],
  ["/vendor/gsap.min.js", "vendor/gsap.min.js", "text/javascript; charset=utf-8"],
  ["/vendor/lenis.min.js", "vendor/lenis.min.js", "text/javascript; charset=utf-8"],
  ["/favicon.svg", "public/favicon.svg", "image/svg+xml"],
];

const assets = await Promise.all(
  sources.map(async ([route, file, contentType]) => [
    route,
    {
      body: await readFile(new URL(`../${file}`, import.meta.url), "utf8"),
      contentType,
    },
  ]),
);

const workerSource = `const assets = new Map(${JSON.stringify(assets)});

export default {
  async fetch(request, env, ctx) {
    void env;
    void ctx;

    const url = new URL(request.url);
    const route = url.pathname === "/index.html" ? "/" : url.pathname;
    const asset = assets.get(route);

    if (!asset) {
      return new Response("Not found", { status: 404 });
    }

    const headers = new Headers({
      "content-type": asset.contentType,
      "cache-control": route === "/" ? "no-cache" : "public, max-age=3600",
      "x-content-type-options": "nosniff",
    });

    return new Response(request.method === "HEAD" ? null : asset.body, { headers });
  },
};
`;

await rm(output, { recursive: true, force: true });
await mkdir(new URL("../dist/server/", import.meta.url), { recursive: true });
await mkdir(new URL("../dist/.openai/", import.meta.url), { recursive: true });
await writeFile(new URL("../dist/server/index.js", import.meta.url), workerSource);
await cp(
  new URL("../.openai/hosting.json", import.meta.url),
  new URL("../dist/.openai/hosting.json", import.meta.url),
);

console.log("Built framework-free Sites artifact.");
