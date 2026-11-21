import { routes } from "./routes.js";

const port = Number(Bun.env.PORT ?? 3000);

const server = Bun.serve({
  port,
  routes,
  fetch() {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server läuft auf http://localhost:${server.port}`);
