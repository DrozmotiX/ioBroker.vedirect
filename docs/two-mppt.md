# Zwei Victron-MPPTs mit ioBroker.vedirect

## Aktueller Produktivaufbau

Auf dem pi3 existieren zwei aktivierte Instanzen mit jeweils eigenem SmartSolar MPPT 100/50:

| Instanz | Konfigurierter serieller Pfad | Reale Felder |
|---|---|---|
| `vedirect.0` | `/dev/ttyUSB-VE-1` | V, VPV, I, PPV, CS, MPPT, ERR, OR, H19–H23, HSDS, PID, SER#, FW |
| `vedirect.1` | `/dev/ttyUSB-VE-2` | Dieselben Feldgruppen, eigene unabhängige Werte |

Jeder MPPT benötigt eine eigene VE.Direct-Verbindung und einen eigenen Serialport. Derselbe Port darf nicht gleichzeitig von zwei Programmen oder Instanzen verwendet werden. Für dauerhafte Zuordnung sind `/dev/serial/by-id/...`-Pfade oder dokumentierte statische Aliase empfohlen.

## Was der Fork mit beiden MPPTs kann

- Beide Geräte gleichzeitig und instanzgetrennt auslesen.
- Spannung, Strom, Panelspannung und Panelleistung verarbeiten.
- Betriebszustand, Trackerstatus, Fehler und Abschaltgründe decodieren.
- Historische Tages-/Gesamterträge und maximale Leistung lesen.
- Produkte, Seriennummern und Firmware unterscheiden.
- Checksummen, Multiblock, HEX-Unterbrechungen und Recovery pro Instanz verarbeiten.
- Ports, Watchdogs, Samples und Reconnects vollständig getrennt halten.

Der Adapter aggregiert oder steuert die beiden Geräte nicht automatisch gemeinsam; Berechnungen/Regelungen über beide MPPTs können in ioBroker-Skripten auf den getrennten States aufsetzen.

## Read-only-Grenze

Der aktuelle Fork besitzt **keine Schreib- oder Steuerfunktion**. Es gibt keine beschreibbaren States und keine HEX-`Get`/`Set`-Befehle. Load-, Relais-, Charger- oder Ladestromsteuerung werden dadurch weder angeboten noch implizit unterstützt.

## Prinzipielle Schreiboptionen einer späteren separaten Erweiterung

Das offizielle BlueSolar-/SmartSolar-HEX-Protokoll dokumentiert unter anderem:

| Funktion | Beispielregister | Wichtige Einschränkung |
|---|---|---|
| Dynamisches Ladestromlimit | `0x2015` | Muss zusammen mit passendem Netzwerkmodus `0x200E` verwendet und regelmäßig erneuert werden |
| Ladespannungs-Sollwert | `0x2001` | Nur im passenden Remote-Control-Kontext; sicherheitsrelevant |
| Charger Ein/Aus | `0x0200` | Von Remote-Control-Freigabe/Firmware abhängig |
| Persistentes maximales Batteriestromlimit | `0xEDF0` | Batterieeinstellung, nicht mit dynamischem Limit verwechseln |
| Load-Ausgang | `0xEDAB` | Nur bei Geräten mit Load-Ausgang; nicht beim SmartSolar 100/50 |
| Relais-/Schwellenfunktionen | modellabhängig | Nur bei vorhandener Hardware/Firmware |

Diese Auflistung ist bewusst keine Implementierungs- oder Schreibfreigabe. Register müssen pro Gerät und Firmware validiert werden.

### Sicherheitsanforderungen für etwaigen Schreibsupport

- Standardmäßig deaktiviert und auf eine explizite Whitelist begrenzt.
- Response-/Fehlerdecodierung und Read-after-Write.
- Kein paralleler Zugriff durch ein zweites Programm auf denselben Port.
- Keine kontinuierlichen Schreibschleifen auf nichtflüchtige Batterieeinstellungen.
- Berücksichtigung möglicher TEXT-Pausen nach HEX-Kommunikation.
- Keine allgemeinen Restore-/Clear-History-/Restart-Kommandos.
- Keine Load-Steuerung ohne Entladungsschutz und passende Hardware.

## Quellen

- [VE.Direct Protocol 3.34](https://www.victronenergy.com/upload/documents/VE.Direct-Protocol-3.34.pdf)
- [VE.Direct Protocol FAQ](https://www.victronenergy.com/live/vedirect_protocol:faq)
- [BlueSolar/SmartSolar HEX Protocol](https://www.victronenergy.com/upload/documents/BlueSolar-HEX-protocol.pdf)
