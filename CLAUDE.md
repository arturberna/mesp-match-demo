# CLAUDE.md -- mesp-match-demo

Front-end demonstrativo (vitrine navegável) do mesp-match: mostra o "MESP Preços"
como produto para a SNEAELIS -- consulta, cotação em lote, painel e a interface de
parametrização do catálogo de famílias. **Não é o sistema de produção.**

## Antes de qualquer coisa

1. Ler `specs/context.md` (contexto completo: público, estratégia, identidade visual,
   fontes de dados, decisões DD1-DD4).
2. Specs de implementação em `specs/spec-1.md` a `specs/spec-7.md`.
3. Referência visual v0: `../mesp-match/docs/reuniao-jul2026/mockup-mesp-precos.html`.

## Regras inegociáveis

- **Todo número exibido é real** (vem do export dos dados do mesp-match). A demo simula
  interações, nunca dados.
- **Vocabulário leigo** (tabela no context.md): nunca "match/tier/curadoria/sobrepreço"
  na UI -- sempre "encontro/nível de confiança/conferência de especialista/acima da faixa".
- **Honestidade visível:** os "não sei" (134 itens), a fraqueza de vestuário e os
  outliers excluídos aparecem na interface, não são escondidos.
- Estático, sem backend (DD1); escritas simuladas client-side (DD2).

## Convenções

- Projeto irmão de dados: `../mesp-match` (dados em parquet, catálogos YAML).
  O script de export de dados VIVE NO LADO PYTHON do mesp-match-demo (`scripts/`),
  usa `uv` (nunca pip) e segue as convenções Python do ecossistema MESP
  (ver `../mesp-match/CLAUDE.md`).
- Front-end: stack sugerida Vite + React + Tailwind (confirmar no planning);
  código do front em `app/`; JSON exportados em `app/public/dados/`.
- Sem em-dash em comentários ou strings de código (usar hífen duplo).
- Git: branch principal `main`; não commitar dados exportados grandes se ultrapassarem
  o razoável para um repo (avaliar no export).
- Documentos vivos: este arquivo, `PLANNING.md` (criar no planning), `specs/`.
