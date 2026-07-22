import assert from "node:assert/strict";
import test from "node:test";

const workerUrl = new URL(`../dist/server/index.js?test=${Date.now()}`, import.meta.url);
const { default: worker } = await import(workerUrl);

const fetchRoute = (pathname) => worker.fetch(new Request(`http://localhost${pathname}`), {}, {});

test("serves the framework-free showcase", async () => {
  const response = await fetchRoute("/");
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /<body>\s*<div id="root">/);
  assert.match(html, /class="lock-screen"/);
  assert.match(html, /data-lock-time/);
  assert.match(html, /data-range="glass-opacity"/);
  assert.match(html, /data-dock-highlight/);
  assert.equal((html.match(/layout-only-page/g) ?? []).length, 4);
  assert.doesNotMatch(html, /dynamic-island|status-bar|battery|lock-clock|quick-actions/);
  assert.doesNotMatch(html, /An interface|A clear sense|Made to be touched|Always in the moment/);
  assert.doesNotMatch(html, /_next|__next|vinext|react-dom|data-reactroot/i);
});

test("serves vanilla interaction code and libraries", async () => {
  const app = await (await fetchRoute("/app.js")).text();
  const styles = await (await fetchRoute("/styles.css")).text();
  const gsap = await fetchRoute("/vendor/gsap.min.js");
  const lenis = await fetchRoute("/vendor/lenis.min.js");

  assert.match(app, /document\.addEventListener\("DOMContentLoaded"/);
  assert.match(app, /new Lenis\(/);
  assert.match(app, /wrapper: scrollViewport/);
  assert.match(styles, /#root\s*\{/);
  assert.match(styles, /background:\s*rgba\(0, 0, 0, \.1\)/);
  assert.doesNotMatch(app, /useEffect|React/);
  assert.equal(gsap.status, 200);
  assert.equal(lenis.status, 200);
});
