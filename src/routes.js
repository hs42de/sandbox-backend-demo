import { getNtpTime } from "./ntp.js";

export const routes = {
  "/": () => Response.json({ message: "Hello via Bun!" }),
  "/health": () => Response.json({ status: "ok" }),
  "/time": async () => Response.json(await getNtpTime()),
};
