# SPEC-D03 -- Tela Consulta (busca de preço de referência)

## Objetivo

A tela de abertura e o momento-demo mais importante: a pessoa digita a descrição de um
item em texto livre e recebe preço típico + faixa do aceitável + selo de confiança +
memória de cálculo. Diferente do mockup v0 (4 consultas fixas), aqui a busca cobre os
**883 itens reais** exportados pela SPEC-D01.

Referência visual v0: `../mesp-match/docs/reuniao-jul2026/mockup-mesp-precos.html`
(aba Consulta). Esta spec evolui aquele desenho, não o recomeça.

---

## Busca (client-side)

- Fonte: `busca_indice.json` (SPEC-D01).
- Estratégia: normalização simples (minúsculas, sem acento) + ranking por tokens
  compartilhados com boost no primeiro substantivo (head-noun) -- espelha, de forma
  simplificada, o comportamento do `buscar.py` do motor. Uma lib leve de fuzzy
  (ex.: fuse.js) é aceitável; não reimplementar o motor.
- Autosugestão enquanto digita (máx. 8 sugestões: nome do item + selo pequeno).
- A demo é honesta sobre o escopo: busca sem resultado mostra estado vazio com voz
  ("prefere dizer 'não sei'") e sugestões próximas, nunca um resultado forçado.
- Chips de exemplos curados abaixo do campo (os 4 casos da reunião):
  `anilha 10kg`, `bambolê`, `aparador de chute`, `camisa gola polo` -- cada um foi
  escolhido para demonstrar um conceito (nível 1 com outlier excluído; porte da compra;
  nível 3; nível 2/vestuário com nota honesta).

## Card de resultado (composição de SPEC-D02)

1. Cabeçalho: "Você buscou X" + `<SeloNivel>` com tooltip.
2. "Encontrado nas compras públicas:" + descrição casada (monospace, truncável).
3. **Seletor de porte da compra** (quando `porte.json` tiver dado para a família):
   `Todas | Compra pequena (até 20 un) | Lote grande (>100 un)` -- trocar o porte
   anima a `<FaixaPreco>` e o `<PrecoHero>` para os novos valores. Esta é a resposta
   visual à objeção "preço justo"; merece a melhor microinteração da demo (SPEC-D07).
4. `<PrecoHero>` + n de compras públicas.
5. `<FaixaPreco>` com marcador "cotação da SNEAELIS" quando o item tiver `cotacao_sneaelis`
   (copy do marcador: neutra -- "cotação da SNEAELIS atual" -- sem tom de acusação; se estiver
   fora da faixa, `<NotaHonesta>` explica: acima = "referência a revisar",
   abaixo = "referência possivelmente defasada").
6. `<MemoriaCalculo>` expansível com as compras individuais (`amostras`, SPEC-D01),
   outliers riscados e rodapé de fontes/período.
7. Notas honestas contextuais: faixa larga em vestuário ("mistura tamanhos e tecidos --
   é aqui que a conferência de especialista transforma Compatível em Confirmado"),
   nível 3 ("ordem de grandeza; confira antes de usar") etc.

## Nível 4 (Sem candidato)

Itens sem preço têm card próprio: selo cinza, sem número inventado, motivo em linguagem
leiga (derivado de `justificativa`) e o encaminhamento: "este item entra na fila de
famílias a incluir" com link para a tela Famílias.

## Critérios de aceitação

1. Qualquer um dos 883 itens é encontrável por nome ou fragmento da descrição.
2. Os 4 chips reproduzem os momentos da reunião com os números reais do context.md.
3. Trocar porte no bambolê anima a faixa de ~5,50 para ~22,90 sem recarregar o card.
4. Busca vazia/absurda produz o estado "não sei" com sugestões, nunca erro ou resultado falso.
5. Tudo funciona offline (nenhuma chamada externa).
