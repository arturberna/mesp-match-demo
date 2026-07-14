# SPEC-D05 -- Tela Cotação em Lote

## Objetivo

Mostrar o fluxo que resolve a rotina da SNEAELIS: "a planilha entra de manhã, o
relatório sai antes do café". O upload é simulado (DD2), mas o relatório exibido é o
**relatório real do piloto** (883 itens, `itens.json`).

---

## Fluxo encenado

1. **Zona de upload** (arrastar .xlsx) com o modelo esperado descrito
   (Nome do Material, Descrição, Cotação). Soltar QUALQUER arquivo (ou clicar em
   "usar planilha de exemplo") dispara a encenação.
2. **Processamento teatral honesto** (3-5 s): barra de progresso com etapas reais do
   motor em linguagem leiga -- "lendo a planilha", "organizando por famílias",
   "conferindo o detalhe que não pode errar", "calculando preços e faixas",
   "montando a memória de cálculo". As etapas são as fases reais do pipeline
   (parser -> família -> validação -> preço -> relatório); a encenação ensina o funil
   enquanto diverte.
3. **Relatório navegável**: os 883 itens reais em tabela virtualizada.

## O relatório

- Cabeçalho-resumo: total, com preço (84%), distribuição por nível (barra com os 4
  segmentos), alertas acima da faixa (13).
- Tabela: nome | selo do nível | preço típico | faixa | n amostras | cotação da SNEAELIS |
  situação (dentro/acima/abaixo da faixa). Ordenável, filtrável por nível e família,
  busca por nome.
- Clique numa linha abre o `<CardItem>` completo (mesmo componente da Consulta) em
  drawer -- com memória de cálculo.
- Botão "exportar relatório (.xlsx)": pode ser real (gerar xlsx client-side com lib
  leve) ou download do relatorio_sneaelis.xlsx real copiado no export -- decidir no
  planning pelo caminho mais simples.
- Os itens Nível 4 aparecem com o motivo leigo, não escondidos (honestidade visível).

## Critérios de aceitação

1. O fluxo completo (soltar arquivo -> processar -> navegar relatório) roda liso ao vivo.
2. Números do cabeçalho batem com o context.md (883, 84%, 146/492/111/134, 13).
3. Tabela com 883 linhas rola sem engasgo (virtualização) em notebook modesto.
4. A encenação de processamento respeita `prefers-reduced-motion` (vira progresso
   instantâneo com as etapas listadas).
