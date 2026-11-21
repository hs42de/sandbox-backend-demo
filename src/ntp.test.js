import { describe, test, expect } from "bun:test";
import { ntpToEpochMs, getNtpTime } from "./ntp.js";

describe("ntpToEpochMs", () => {
  test("NTP-Seconds der Unix-Epoche ergeben 0", () => {
    expect(ntpToEpochMs(2208988800, 0)).toBe(0);
  });

  test("bekannter Zeitpunkt wird korrekt umgerechnet", () => {
    const expected = Date.parse("2026-11-21T12:00:00Z");
    const seconds = Math.floor(expected / 1000) + 2208988800;
    expect(ntpToEpochMs(seconds, 0)).toBe(expected);
  });

  test("Fraction wird in Millisekunden aufgeloest", () => {
    expect(ntpToEpochMs(2208988800, 2 ** 31)).toBe(500);
  });
});

describe("getNtpTime", () => {
  test("nicht erreichbarer Server faellt auf Systemzeit zurueck", async () => {
    const before = Date.now();
    const result = await getNtpTime({ server: "127.0.0.1", port: 123, timeoutMs: 200 });
    expect(result.source).toBe("system");
    expect(Number.isInteger(result.epochMs)).toBe(true);
    expect(Math.abs(result.epochMs - before)).toBeLessThanOrEqual(5000);
    expect(new Date(result.iso).getTime()).toBe(result.epochMs);
  });

  test("ungueltiger Server-Name faellt auf Systemzeit zurueck", async () => {
    const result = await getNtpTime({
      server: "nonexistent-host.invalid",
      timeoutMs: 2000,
    });
    expect(result.source).toBe("system");
    expect(Math.abs(result.epochMs - Date.now())).toBeLessThanOrEqual(5000);
  });

  test.skipIf(!Bun.env.NTP_INTEGRATION)("echter NTP-Server liefert ntp-Zeit", async () => {
    const result = await getNtpTime();
    expect(result.source).toBe("ntp");
    expect(Math.abs(result.epochMs - Date.now())).toBeLessThanOrEqual(5000);
    expect(Number.isInteger(result.epochMs)).toBe(true);
  });
});
