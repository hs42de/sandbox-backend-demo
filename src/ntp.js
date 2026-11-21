import dgram from "node:dgram";

const NTP_UNIX_OFFSET_MS = 2208988800000;

export function ntpToEpochMs(seconds, fraction) {
  return seconds * 1000 + (fraction / 2 ** 32) * 1000 - NTP_UNIX_OFFSET_MS;
}

export function getNtpTime({
  server = Bun.env.NTP_SERVER ?? "pool.ntp.org",
  port = 123,
  timeoutMs = Number(Bun.env.NTP_TIMEOUT_MS ?? 3000),
} = {}) {
  return new Promise((resolve) => {
    let settled = false;
    let timer = null;
    const socket = dgram.createSocket("udp4");

    function finish(result) {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      socket.close();
      resolve(result);
    }

    function fallback() {
      finish({ iso: new Date().toISOString(), epochMs: Date.now(), source: "system" });
    }

    socket.on("error", () => fallback());
    socket.on("message", (msg) => {
      if (msg.length < 48) return fallback();
      const seconds = msg.readUInt32BE(40);
      const fraction = msg.readUInt32BE(44);
      const epochMs = Math.round(ntpToEpochMs(seconds, fraction));
      finish({ iso: new Date(epochMs).toISOString(), epochMs, source: "ntp" });
    });

    timer = setTimeout(fallback, timeoutMs);

    const packet = Buffer.alloc(48);
    packet[0] = 0x23;
    try {
      socket.send(packet, 0, 48, port, server, (err) => {
        if (err) fallback();
      });
    } catch {
      fallback();
    }
  });
}
