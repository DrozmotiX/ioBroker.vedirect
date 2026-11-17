![Logo](admin/vedirect.png)

# ioBroker.vedirect

[![Test and Release](https://github.com/joergspoerl/ioBroker.vedirect/actions/workflows/test-and-release.yml/badge.svg)](https://github.com/joergspoerl/ioBroker.vedirect/actions/workflows/test-and-release.yml)

Read-only ioBroker-Adapter für Victron-Geräte mit serieller VE.Direct-Schnittstelle. Dieses Repository ist ein Fork von [DrozmotiX/ioBroker.vedirect](https://github.com/DrozmotiX/ioBroker.vedirect) und enthält eine grundlegende Protokoll- und Lifecycle-Härtung.

> **Entwicklungsstand:** Der Branch `fix/robust-ve-direct` ist noch kein Produktivrelease. Die bestehende pi3-Installation wurde nicht verändert.

## Funktionen

- Byteorientierter, atomarer Parser nach **VE.Direct Protocol 3.34** und offizieller FAQ.
- Modulo-256-Checksumme und Veröffentlichung erst nach einem gültigen vollständigen Block.
- Alle 256 binären Checksumbytes, beliebige Serial-Chunk-Grenzen und mehrere Blöcke.
- Kontrollierte Behandlung asynchroner HEX-Nachrichten und Wiederaufsynchronisation.
- Strikte numerische Validierung; keine stillen `parseFloat`-Teilwerte, kein `NaN` und keine erfundenen Nullen.
- Instanzgebundener SerialPort-12-Lifecycle mit Open-/Set-/Close-Timeouts, Reconnect und Late-Callback-Schutz.
- `info.connection` folgt ausschließlich frischen gültigen Blöcken.
- Objekt-Migration vor State-Schreiben sowie behandelte Promise-Fehler.
- Frame-Sampling ohne Verlust einzelner Protokollfelder.
- Mehrinstanzfähigkeit ohne globale Ports, Parser, Timer oder Buffer.

## Unterstützte Geräte und Umfang

Die Feldregistry deckt die im bisherigen Adapter enthaltenen BMV-, MPPT-, Phoenix- und Orion-Felder ab, einschließlich SmartSolar-, SmartShunt- und VE.Direct-Phoenix-Daten. Die tatsächliche Feldverfügbarkeit hängt von Produkt und Firmware ab.

Der Adapter bleibt **read-only**. HEX-`Get`/`Set`-Steuerung, etwa Charge-Current-Limits oder Relaissteuerung, ist nicht Bestandteil dieser Überarbeitung.

Offizielle Referenzen:

- [VE.Direct Protocol 3.34](https://www.victronenergy.com/upload/documents/VE.Direct-Protocol-3.34.pdf)
- [VE.Direct Protocol FAQ](https://www.victronenergy.com/live/vedirect_protocol:faq)

## Konfiguration

### Serielle Schnittstelle

Den Gerätepfad eintragen, beispielsweise `/dev/ttyUSB0` oder einen stabilen `/dev/serial/by-id/...`-Pfad. Der Adapter verwendet **19200 Baud, 8N1**. Vor dem Start darf kein anderer Prozess denselben Port verwenden.

### State-Ablaufzeit (`expireTime`)

- `0`: Keine TTL; unveränderte Werte werden mit echter Changed-Optimierung behandelt.
- Größer `0`: Bei als flüchtig markierten Messfeldern wird die TTL mit gültigen Frames erneuert.
- Statische Identifikations-/Statusfelder besitzen je nach Felddefinition keine TTL.

Die Ablaufzeit sollte bei aktiviertem Sampling deutlich größer als das Samplingintervall sein.

### Frame-Sampling (`messageBuffer`)

Der bisherige Konfigurationsname bleibt aus Kompatibilitätsgründen erhalten, das Verhalten ist korrigiert:

- `0`: Jeder gültige Block wird verarbeitet.
- Größer `0`: Serielle Daten werden weiterhin vollständig geparst; für die State-Publikation werden vollständige Blöcke über das Intervall zusammengeführt. Der jeweils letzte Wert jedes Felds wird anschließend geschrieben.
- Liveness und Reconnect werden durch Sampling nicht gedrosselt.
- Es werden keine einzelnen Zeilen oder History-Blöcke mehr verworfen.

## Verbindungs- und Fehlerverhalten

- `info.connection=true`: Innerhalb der letzten zehn Sekunden wurde ein checksumgültiger Block empfangen.
- `info.connection=false`: Kein frischer gültiger Block, Open-/Serial-Fehler oder Adapterstopp.
- Bei Datenstopp oder Disconnect wird der Port kontrolliert geschlossen und mit Cooldown erneut geöffnet.
- Ungültige Checksummen und malformed bekannte Werte verändern keine Mess-States.
- Wiederholte identische Serialfehler werden im Log gedrosselt.
- Beim Unload wird vor dem Abschluss `info.connection=false` quittiert.

## Sonderwerte und Decodierung

| Eingabe | Verhalten |
|---|---|
| `---` | `null`; kein `NaN` oder Pseudo-Nullwert |
| `TTG=-1` | `TTG=null`, zusätzlich `TTGInfinite=true` |
| Normales TTG | Weiterhin Minuten zur Wahrung der bestehenden State-API |
| `FW` / `FWE` | Strings; führende Nullen und Release-/Beta-Kennungen bleiben erhalten |
| `AR` / `WARN` / `OR` | Alle gesetzten Bits werden gemeinsam decodiert; unbekannte Restbits bleiben sichtbar |
| `Alarm` / `Relay` / `LOAD` | Case-insensitive, kanonische `ON`/`OFF`-Strings ohne bisherigen Typwechsel |
| Unbekanntes Feld | Kein State; bekannte Werte desselben gültigen Blocks bleiben erhalten |

## Migration und Kompatibilität

Bestehende State-IDs bleiben grundsätzlich erhalten. Objektdefinitionen werden beim ersten gültigen Empfang des jeweiligen Felds aktualisiert; Custom-Settings etwa für History/InfluxDB bleiben erhalten.

Wichtige Korrekturen gegenüber 0.1.2/0.3.x:

- `PPV`, `H21`, `H23`, `HSDS` und weitere numerische Felder werden zuverlässig als Zahlen geschrieben.
- `H15`/`H16` besitzen nach der vorhandenen Umrechnung korrekt die Einheit `V` statt `mV`.
- Energiezähler verwenden `kWh` und Energie-Rollen.
- `FW`/`FWE` werden zur Erhaltung ihrer Protokollsemantik als Strings migriert.
- `TTGInfinite` ist ein neuer synthetischer State.
- Bereits historisch gespeicherte Werte werden nicht rückwirkend verändert.

## Entwicklung und Tests

Voraussetzungen: Node.js 22 oder neuer, js-controller ≥6.0.11 und Admin ≥7.6.20.

```bash
npm ci
npm run test:all
```

`test:all` umfasst die fachliche Suite, Package-Checks, `checkJs`, ESLint und js-controller-Integration. Die CI-Matrix verwendet Node.js 22/24/26 auf Linux, Windows und macOS.

Die Tests umfassen unter anderem den exakten offiziellen FAQ-Frame, alle Chunk-Grenzen und Checksumbytes, HEX/Multiblock/Recovery, reale SmartSolar- und BMV-Vektoren, Serial-Fehler und hängende native Callbacks, State-/TTL-/Sampling-Verhalten sowie getrennte Instanzen.

Der vollständige Audit steht in [docs/audit-2026-11-17.md](docs/audit-2026-11-17.md).

## Dependency-Audit

Der Produktions-Audit ist ohne Befund. Im Entwicklungs-Toolchain-Audit verbleibt eine transitve `picomatch`-ReDoS-Meldung über `tinyglobby`/TypeScript-ESLint, für die zum Prüfzeitpunkt keine korrigierte kompatible Release-Kette verfügbar ist. Sie betrifft ausschließlich Entwicklungs-Globbing mit potenziell bösartigen Patterns, nicht den Adapterbetrieb oder die VE.Direct-Verarbeitung.

## Changelog

### **WORK IN PROGRESS**

- (joerg) Atomarer VE.Direct-3.34-Parser mit Checksum-, HEX-, Multiblock- und Recovery-Tests (#1).
- (joerg) Feldskalierungen, Sentinels, Bitfelder, Firmwaretypen, Rollen und Metadaten korrigiert (#1).
- (joerg) Instanzgebundener SerialPort-12-Lifecycle, Reconnect, sichere State-Queues und Unload (#2).
- (joerg) Frame-Sampling, Expire-/Changed-Verhalten und Mehrinstanzbetrieb korrigiert (#2).
- (joerg) Dummy-Test durch reale Protokoll-/Lifecycle-/Adaptertests ersetzt; CI und Dokumentation erweitert (#3).

### 0.3.3 (2024-09-10)

- (DutchmanNL) Repository checker compliance updates.
- (DutchmanNL) Update dependencies; der aktuelle Fork deklariert korrekt Node.js 22+.

### 0.3.1 (2023-10-29)

- (DutchmanNL) Message buffer implemented; im Fork durch verlustfreies Frame-Sampling ersetzt.

### 0.3.0 (2023-08-07)

- (DutchmanNL/Andiling) Protocol 3.33 und Bugfixes.

### 0.2.0 (2023-08-06)

- (DutchmanNL/Andiling) Protocol 3.32, Produktnamen und konfigurierbare State-Ablaufzeiten.

### 0.1.2 und älter

- Ursprüngliche Releases von DutchmanNL/Andiling; siehe Upstream-Historie.

## Sentry

Das ioBroker-Sentry-Plugin bleibt konfiguriert. Details und Deaktivierung sind in der [Sentry-Plugin-Dokumentation](https://github.com/ioBroker/plugin-sentry#plugin-sentry) beschrieben.

## License

MIT License — ursprünglich Copyright DutchmanNL und Mitwirkende; siehe [LICENSE](LICENSE).
