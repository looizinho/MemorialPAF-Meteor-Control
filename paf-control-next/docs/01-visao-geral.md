# 01 - Visao Geral

## Objetivo
Migrar o dashboard de automacao da instalacao interativa de Meteor para React, com redesign completo e empacotamento desktop local.

## Escopo
- Novo projeto em arquitetura monorepo.
- Frontend React + TypeScript.
- Backend local Fastify + WebSocket para comandos e telemetria.
- Integracao OSC/Serial com modo simulado para desenvolvimento.
- Persistencia inicial em JSON local + logs JSONL rotativos.

## Fora de Escopo (Fase inicial)
- Banco relacional.
- Orquestracao cloud.
- Multiusuario com autenticacao externa.

## Criterios de sucesso
- Paridade funcional com os comandos do legado.
- Operacao offline em maquina local.
- Build desktop instalavel.
