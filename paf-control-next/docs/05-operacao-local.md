# 05 - Operacao Local

## Pre-requisitos
- Node.js 20+
- npm 10+
- Rust toolchain (para build Tauri)

## Desenvolvimento
```bash
cd paf-control-next
npm install
npm run dev
```

Backend: `http://127.0.0.1:4317`
Frontend: `http://127.0.0.1:5173`

## Variaveis de ambiente
- `PAF_HARDWARE_MODE=simulated|live`
- `PAF_SERVER_PORT=4317`
- `PAF_CONFIG_PATH=<caminho-config.json>`
- `PAF_LOG_DIR=<diretorio-logs>`

## Solucao de problemas
- OSC falhando: validar IP/porta e firewall local.
- Serial indisponivel: validar permissao da porta e nome do device.
- UI sem atualizar: validar conexao WebSocket em `/ws`.
