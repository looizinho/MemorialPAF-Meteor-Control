# 07 - Riscos e Mitigacoes

## Risco: indisponibilidade de OSC
Mitigacao: retry curto, evento de erro na UI e log estruturado.

## Risco: porta serial muda por ambiente
Mitigacao: parametrizacao de portas via config e script de diagnostico local.

## Risco: divergencia funcional com legado
Mitigacao: matriz de paridade por comando e teste com operador da instalacao.

## Risco: lock operacional inconsistente
Mitigacao: regra de bloqueio centralizada no backend antes do dispatch.

## Risco: perda de rastreabilidade
Mitigacao: logs JSONL com rotacao e retention definida por operacao.
