import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

JSON.parse(await readFile(new URL("../dist/.openai/hosting.json", import.meta.url), "utf8"));
const worker = await import(new URL(`../dist/server/index.js?v=${Date.now()}`, import.meta.url));
assert.equal(typeof worker.default?.fetch, "function");

const response = await worker.default.fetch(new Request("http://localhost/"), {}, {});
assert.equal(response.status, 200);
assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
assert.match(await response.text(), /name="codex-preview" content="development"/i);

console.log("Validated vanilla Sites artifact.");
