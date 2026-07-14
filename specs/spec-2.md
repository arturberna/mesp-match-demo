# SPEC-D02 -- Fundação do front: stack, design system e componentes base

## Objetivo

Estruturar a aplicação e codificar a identidade visual (já estabelecida e testada nos
artefatos da reunião) como design system reutilizável. Nenhuma tela é construída aqui;
esta spec entrega o chassi que todas usam.

---

## Stack

- **Vite + React + TypeScript + Tailwind** (sugestão DD4; confirmar no planning).
- Build 100% estático (`vite build`), servível de file://, GitHub Pages ou S3.
- Sem dependência de rede em runtime além dos próprios JSONs (`app/public/dados/`).
- Estrutura: `app/` (front), `scripts/` (Python do export, SPEC-D01).

## Tokens de design (fonte da verdade: specs/context.md)

Codificar a paleta clara/escura como CSS custom properties (ou tema Tailwind),
exatamente como definida no context.md: papel, cartão, tinta, primário verde
institucional e os 4 selos de nível com seus fundos. Tema escuro por
`prefers-color-scheme` com toggle manual que sobrepõe (`data-theme` no root).

Tipografia:
- Preços e títulos-herói: serif ("Palatino Linotype", "Book Antiqua", Georgia).
- UI: "Segoe UI", system-ui.
- Descrições de base (texto cru da compra pública): monospace (Consolas).
- `tabular-nums` em toda coluna numérica.

## Componentes base (biblioteca interna)

| Componente | Comportamento |
|---|---|
| `<SeloNivel nivel={1..4}>` | pill com cor do nível + rótulo textual ("Confirmado", "Compatível", "Aproximado", "Sem candidato"). Nunca cor sem texto. Tooltip com a explicação leiga de cada nível. |
| `<FaixaPreco>` | a visualização-assinatura do produto: trilho horizontal, banda p25-p75, marcador do preço típico, marcador opcional "cotação da SNEAELIS" (âmbar). Anima transições de valor (ver SPEC-D07). |
| `<PrecoHero>` | preço típico em serif grande + "R$" formatado pt-BR + subtítulo de amostras. |
| `<MemoriaCalculo>` | tabela expansível de compras individuais; linhas excluídas aparecem riscadas com motivo "fora da curva -- excluído". |
| `<NotaHonesta>` | callout âmbar para os momentos de transparência (faixa larga, base fraca, "não sei"). |
| `<CardItem>` | composição dos anteriores: cabeçalho (consulta + selo), corpo (preço, faixa, notas), rodapé (memória). |

## Copy e microcopy

- Todo texto de UI passa pelo filtro de vocabulário do context.md (tabela leiga).
- Estados vazios e de erro têm voz: "O sistema prefere dizer 'não sei' a inventar um
  número" em vez de "Nenhum resultado".
- Formatação monetária: `Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'})`.

## Layout global

- Header de produto: marca "MESP Preços" + selo "Protótipo de conceito" (sempre visível,
  discreto -- decisão DD2: não fingir que é produção).
- Navegação por 4 áreas: Consulta | Cotação em lote | Famílias | Painel.
- Responsivo: a demo será mostrada em projetor (1080p) e possivelmente em notebook
  modesto; testar nos dois. Sem scroll horizontal em nenhuma viewport >= 360px.

## Critérios de aceitação

1. Tema claro/escuro funcionando com toggle e com `prefers-color-scheme`.
2. Storybook OU página interna `/kit` exibindo todos os componentes base nos dois temas
   (serve de conferência visual rápida).
3. Nenhum texto de UI com jargão proibido (conferir com grep no bundle: match, tier,
   curadoria, sobrepreço, outlier, mediana como rótulo de UI).
4. Lighthouse: acessibilidade >= 95 (contraste, foco visível, aria nos componentes).
