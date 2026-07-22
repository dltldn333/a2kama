import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const host = option("--host", "0.0.0.0");
const port = Number(option("--port", "4173"));
const routes = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["src/styles.css", "text/css; charset=utf-8"]],
  ["/app.js", ["src/main.js", "text/javascript; charset=utf-8"]],
  ["/vendor/gsap.min.js", ["vendor/gsap.min.js", "text/javascript; charset=utf-8"]],
  ["/vendor/lenis.min.js", ["vendor/lenis.min.js", "text/javascript; charset=utf-8"]],
  ["/favicon.svg", ["public/favicon.svg", "image/svg+xml"]],
]);

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    const route = routes.get(pathname);
    if (!route) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const [file, contentType] = route;
    const body = await readFile(new URL(`../${file}`, import.meta.url));
    response.writeHead(200, {
      "content-type": contentType,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch (error) {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end(error instanceof Error ? error.message : "Server error");
  }
});

server.listen(port, host, () => {
  console.log(`Vanilla Apple Lab running on http://${host}:${port}`);
});
