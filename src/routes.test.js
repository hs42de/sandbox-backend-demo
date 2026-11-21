import { test, expect, afterAll } from "bun:test";
import { routes } from "./routes.js";

const server = Bun.serve({
  port: 0,
  routes,
  fetch() {
    return new Response("Not Found", { status: 404 });
  },
});

afterAll(() => server.stop(true));

const base = `http://localhost:${server.port}`;

test("GET /time liefert 200 mit iso, epochMs und source", async () => {
  const res = await fetch(`${base}/time`);
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(["ntp", "system"]).toContain(body.source);
  expect(Number.isInteger(body.epochMs)).toBe(true);
  expect(Math.abs(body.epochMs - Date.now())).toBeLessThanOrEqual(5000);
  expect(new Date(body.iso).getTime()).toBe(body.epochMs);
});

test("GET /health liefert status ok", async () => {
  const res = await fetch(`${base}/health`);
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ status: "ok" });
});

test("GET / liefert die Begrueßung", async () => {
  const res = await fetch(`${base}/`);
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ message: "Hello via Bun!" });
});

test("unbekannte Route liefert 404", async () => {
  const res = await fetch(`${base}/does-not-exist`);
  expect(res.status).toBe(404);
});
