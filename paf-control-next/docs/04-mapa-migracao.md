# 04 - Mapa de Migracao (Legado -> Novo)

| Legado Meteor | Novo projeto |
|---|---|
| `Meteor.call('sendCmd', id)` | `POST /api/v1/commands/send` |
| `Meteor.methods('getState')` | `GET /api/v1/state` |
| `Meteor.methods('setState')` | `PATCH /api/v1/state/language` |
| `Meteor.methods('tools.toggleLock')` | `POST /api/v1/state/toggle-lock` |
| Colecao `State` | `config.json` (campo `state`) |
| Colecao `Configs` | `config.json` (campo `decks`) |
| Colecao `Logs` | `logs/*.jsonl` |
| `imports/server/arduino.js` | `packages/core/src/serial-adapter.ts` |

## Comandos
- `pedroPt` / `pedroEn`
- `linhaPt` / `linhaEn`
- `multiPt` / `multiEn`

## Estrategia de corte
1. Validar paridade por comando.
2. Validar modo live com hardware real.
3. Executar UAT com operador.
4. Congelar legado Meteor.
