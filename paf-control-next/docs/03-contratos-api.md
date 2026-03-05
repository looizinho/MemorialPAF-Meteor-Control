# 03 - Contratos de API

## REST

### `GET /api/v1/state`
Retorna estado corrente e saude do hardware.

Resposta:
```json
{
  "state": {
    "version": 1,
    "idleMode": true,
    "activeLang": "port",
    "activeDeck": "",
    "locked": false,
    "updatedAt": 1730000000000
  },
  "health": {
    "mode": "simulated",
    "osc": "connected",
    "serial": "connected",
    "updatedAt": 1730000000000
  }
}
```

### `POST /api/v1/commands/send`
Payload:
```json
{ "commandId": "pedroPt" }
```
`commandId` permitido: `pedroPt|pedroEn|linhaPt|linhaEn|multiPt|multiEn`.

### `PATCH /api/v1/state/language`
Payload:
```json
{ "activeLang": "port" }
```
`activeLang`: `port|eng`.

### `POST /api/v1/state/toggle-lock`
Sem payload. Alterna estado `locked`.

## WebSocket
Endpoint: `/ws`

Eventos:
- `state.updated`
- `command.sent`
- `hardware.status`

Envelope:
```json
{
  "event": "state.updated",
  "payload": {},
  "ts": 1730000000000
}
```
