# 02 - Arquitetura Alvo

## Camadas
1. `apps/desktop/src/frontend`: interface React.
2. `apps/desktop/src/backend`: API local Fastify + WebSocket.
3. `packages/protocols`: tipos canônicos e schemas.
4. `packages/core`: dominio de comandos, hardware e persistencia.

## Fluxo principal
1. Operador aciona comando na UI.
2. UI chama `POST /api/v1/commands/send`.
3. Backend resolve deck/idioma e envia mensagens OSC.
4. Estado e logs sao atualizados em disco.
5. Evento WebSocket notifica UI em tempo real.

## Persistencia local
- `apps/desktop/data/config.json`: estado/config principal.
- `apps/desktop/logs/*.jsonl`: trilha de auditoria.

## Modos de hardware
- `simulated`: desenvolvimento sem hardware.
- `live`: integra OSC/Serial reais.

## Empacotamento
- Tauri (`apps/desktop/src-tauri`) para distribuicao desktop local.
