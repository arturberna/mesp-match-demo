# SPEC-D07 -- Microinterações, acessibilidade e critérios de aceitação da demo

## Objetivo

Definir o polimento que separa "protótipo HTML" de "produto que dá vontade de usar" --
e os critérios finais para considerar a demo pronta para ser mostrada à SNEAELIS.

**Princípio:** microinteração a serviço da compreensão. Cada animação existe para
explicar uma ideia do domínio; se não explica nada, não entra.

---

## As microinterações que importam (em ordem de prioridade)

1. **Troca de porte da compra** (SPEC-D03): a banda da `<FaixaPreco>` desliza e o
   preço-herói transita (contagem animada ~400ms) entre R$ 5,50 e R$ 22,90.
   É a objeção "preço justo" sendo respondida em movimento. A melhor animação da demo
   vive aqui.
2. **Promoção de família** (SPEC-D04): selos azuis virando verdes em cascata sutil +
   contador do painel subindo. É o "seu conhecimento virou regra" em movimento.
3. **Processamento em lote** (SPEC-D05): as etapas do funil acendendo em sequência.
   Ensina o pipeline sem slide.
4. **Memória de cálculo** expandindo (todas as telas): revelar a prova deve ter peso --
   expansão suave, linha excluída aparecendo riscada por último.
5. Hover/focus em qualquer elemento interativo: resposta visível < 100ms (elevação
   leve, borda primária). O que é clicável parece clicável.

## Regras de movimento

- Durações: 150-250ms para feedback, 300-500ms para transições narrativas (porte,
  promoção). Nada acima de 600ms exceto a encenação do lote.
- Easing padrão: ease-out para entradas, ease-in-out para transições de valor.
- **`prefers-reduced-motion: reduce` desliga tudo** e substitui por mudança instantânea
  de estado. Testar explicitamente -- é critério de aceitação, não cortesia.

## Acessibilidade

- Navegação completa por teclado (tab order sensato, foco visível com anel primário).
- Selos e faixas com `aria-label` descritivo ("Nível 1, Confirmado: item certo com
  detalhe conferido").
- Contraste AA em ambos os temas (a paleta do context.md já foi validada; não derivar
  cores novas sem revalidar).
- Tabelas com cabeçalho semântico; drawer/modal com foco preso e Esc para fechar.

## Critérios de aceitação da demo como um todo

1. **O teste dos 5 minutos:** uma pessoa não técnica, sem instrução prévia, consegue
   (a) buscar um item e entender o selo, (b) trocar o porte do bambolê e explicar com
   as próprias palavras por que o preço mudou, (c) promover uma família e ver o efeito.
2. **O teste do projetor:** roteiro da reunião (consulta anilha -> porte bambolê ->
   lote -> famílias -> painel) executável em < 8 minutos sem travar, em 1080p.
3. **O teste da honestidade:** em nenhuma tela existe número que não venha do export
   real; o selo "Protótipo de conceito" está sempre visível; os "não sei" aparecem.
4. **O teste do vocabulário:** grep no bundle final não encontra jargão proibido em
   texto de UI (match, tier, curadoria, sobrepreço, outlier, mediana-como-rótulo).
5. Funciona offline, direto de arquivo estático, nos dois temas.
