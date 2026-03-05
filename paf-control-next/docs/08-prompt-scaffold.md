# 08 - Prompt Scaffold Tecnico

Use este prompt para gerar/expandir o projeto automaticamente:

## Prompt
Voce e um engenheiro senior criando um dashboard desktop de automacao para uma instalacao interativa.

### Objetivo
Construir um projeto novo com stack fixa:
- Tauri (desktop)
- Vite + React + TypeScript (frontend)
- Fastify + WebSocket (backend local)
- Integracao OSC e Serial/Firmata
- Persistencia em arquivo JSON + logs JSONL rotativos

### Estrutura obrigatoria
- `apps/desktop/src/frontend`
- `apps/desktop/src/backend`
- `apps/desktop/src-tauri`
- `packages/protocols`
- `packages/core`
- `docs`

### Contratos obrigatorios
- `POST /api/v1/commands/send` com `{ commandId }`
- `GET /api/v1/state`
- `PATCH /api/v1/state/language` com `{ activeLang }`
- `POST /api/v1/state/toggle-lock`
- WebSocket `/ws` com eventos `state.updated`, `command.sent`, `hardware.status`

### Tipos canônicos
- `DeckName`, `Language`, `CommandId`
- `SystemState`, `DeckConfig`, `CommandEnvelope`, `HardwareHealth`

### Regras funcionais
- Suportar comandos: `pedroPt`, `pedroEn`, `linhaPt`, `linhaEn`, `multiPt`, `multiEn`
- Implementar `PAF_HARDWARE_MODE=simulated|live`
- Nunca hardcodar credenciais seguras
- Validar payload de entrada (schema)
- Registrar eventos em JSONL com rotacao
- Exibir status de hardware e erros nao bloqueantes na UI

### Qualidade
- TypeScript strict
- Testes unitarios para roteamento de comandos
- Testes de integracao dos endpoints criticos
- Scripts `dev`, `build`, `test`, `typecheck`

### Entregaveis por arquivo
- Codigo completo por camada
- Documentacao tecnica em PT-BR
- Exemplo de `config.json`
- Guia de operacao local
