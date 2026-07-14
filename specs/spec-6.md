# SPEC-D06 -- Painel de cobertura (dashboard)

## Objetivo

A visão de gestor: quanto do universo SNEAELIS já tem preço defensável, onde está o
próximo ganho e qual o efeito da conferência de especialista. É também a tela que
mostra o roadmap como coisa viva, não promessa de slide.

---

## Blocos (dados de `painel.json` + estado da sessão)

1. **Herói**: os 883 itens como barra de 4 segmentos (146/492/111/134) com rótulos
   diretos (nome do nível + contagem + leitura leiga: "pronto para o controle",
   "bom para planejar", "confira antes de usar", "onde investir"). Segmentos com
   separação de 2px, tooltips, e clique filtra a lista da tela Lote.
2. **Indicadores**: % com preço (84%), precisão do Nível 1 (97%, com a nota de origem:
   "conferido por curadoria humana de 267 itens"), alertas acima da faixa (13),
   famílias validadas vs aguardando.
3. **A fila de maior retorno**: ranking de famílias aguardando especialista por
   `n_promoviveis` ("validar vestuário promove N itens"), com link direto para a tela
   Famílias. É o call-to-action permanente da demo.
4. **Efeito da sessão**: se o usuário promoveu famílias na SPEC-D04, o painel mostra
   o antes/depois da barra de níveis na própria sessão ("nesta demonstração, a
   conferência de especialista promoveu +N itens"). Zera ao recarregar (DD2).
5. **Honestidade estrutural** (rodapé fixo): abrangência geográfica/temporal parcial da
   amostra, memória de cálculo por item com fonte/UF/período, metodologia
   IN SEGES/ME 65/2021.

## Regras de visualização (herdadas do dataviz)

- Um eixo por gráfico; nada de eixo duplo.
- Cores dos níveis = as dos selos (tokens SPEC-D02); rótulo textual sempre presente.
- Números em `tabular-nums`; texto nunca na cor da série.
- Sem gráfico gratuito: se o dado é um número, é um stat tile, não uma pizza.

## Critérios de aceitação

1. Todos os números derivam de `painel.json` ou do estado da sessão -- nada hardcoded
   na UI (exceto a precisão 97% documentada no export).
2. Clicar num segmento da barra leva à lista filtrada correspondente.
3. Promoção de família na SPEC-D04 reflete aqui na mesma sessão.
4. Legível em projetor a 3 metros (testar com zoom 100% em 1080p).
