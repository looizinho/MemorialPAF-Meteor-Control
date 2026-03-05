# 06 - Validacao e Aceite

## Cenarios obrigatorios
1. Enviar `pedroPt`, `pedroEn`, `linhaPt`, `linhaEn`, `multiPt`, `multiEn`.
2. Persistir idioma em `config.json` apos reinicio.
3. Bloquear/desbloquear operacao com `toggle-lock`.
4. Operar integralmente em `simulated` sem hardware.
5. Tratar falhas de OSC/Serial com erro nao bloqueante.
6. Gerar logs JSONL e manter rotacao por tamanho/data.
7. Boot offline sem dependencia de internet.
8. Gerar build desktop instalavel via Tauri.

## Evidencias
- Captura de resposta HTTP dos endpoints.
- Trecho de log JSONL de envio de comando.
- Registro de UAT com operador.
