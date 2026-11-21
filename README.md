# backend

JavaScript-Backend auf Basis von [Bun](https://bun.com).

## Voraussetzungen

Bun installieren (falls noch nicht vorhanden):

```bash
curl -fsSL https://bun.sh/install | bash
```

## Einrichtung

```bash
bun install
cp .env.example .env
```

## Scripts

| Befehl         | Beschreibung                                    |
| -------------- | ----------------------------------------------- |
| `bun run dev`  | Server mit Hot-Reload starten (`--hot`)         |
| `bun run start`| Server ohne Hot-Reload starten                  |
| `bun test`     | Tests ausführen (`*.test.js`)                   |

Der Server läuft standardmäßig auf http://localhost:3000 (`PORT` in `.env` anpassbar).

## Endpunkte

| Route     | Beschreibung                                                                |
| --------- | --------------------------------------------------------------------------- |
| `/`       | Begrüßung                                                                   |
| `/health` | Health-Check                                                                |
| `/time`   | Aktuelle Uhrzeit per NTP; JSON mit `iso`, `epochMs` und `source` (`ntp`/`system`) |

Bei `/time` fragt der Server einen NTP-Server per UDP ab. Ist der NTP-Server
nicht erreichbar, antwortet der Endpunkt trotzdem mit der Systemzeit und setzt
`source` auf `system`.

Konfiguration über `.env` (Bun lädt die Datei automatisch):

| Variable         | Standard        | Beschreibung                      |
| ---------------- | --------------- | --------------------------------- |
| `PORT`           | `3000`          | Port des Servers                  |
| `NTP_SERVER`     | `pool.ntp.org`  | Host des NTP-Servers              |
| `NTP_TIMEOUT_MS` | `3000`          | Timeout für die NTP-Abfrage in ms |

## Struktur

```
src/
  index.js       Einstiegspunkt (Bun.serve)
  routes.js      Routen-Map (/, /health, /time)
  ntp.js         SNTP-Client über node:dgram mit Fallback auf Systemzeit
  index.test.js  Beispieltest (bun:test)
  routes.test.js HTTP-Tests für die Routen
  ntp.test.js    Tests für NTP-Umrechnung und Fallback
jsconfig.json    Editor-Autovervollständigung für Bun-APIs
.env.example     Vorlage für Umgebungsvariablen
```
