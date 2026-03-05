# PAF Control Next

Nova base da migracao Meteor -> React para operacao desktop local.

## Estrutura
- `apps/desktop`: app React + backend Fastify + Tauri
- `packages/protocols`: tipos e contratos
- `packages/core`: dominio, adapters e persistencia
- `docs`: documentacao de arquitetura e migracao

## Inicio rapido
```bash
npm install
npm run dev
```

## Build desktop
```bash
npm run tauri:build -w apps/desktop
```
