# PLANNING.md -- mesp-match-demo

Documento vivo de decisões técnicas. Ver `CLAUDE.md` (contexto/regras) e `specs/` (specs
funcionais SPEC-D01 a D07). Este arquivo fecha as decisões deixadas em aberto pelas specs
("confirmar no planning", DD4) e registra o estado de execução por fase.

## Decisões fechadas neste planning

### DD4 -- Stack do front: React + CSS Modules, não Tailwind

A spec-2 sugeria Vite + React + Tailwind "a confirmar no planning". Decisão: **Vite +
React + TypeScript + CSS Modules** (tokens em CSS custom properties), seguindo a
padronização de código pedida explicitamente para espelhar `../Front-End/MVP` (Hub
Nacional de Esporte), que usa esse padrão em produção (`Componente.tsx` +
`Componente.module.css` + `index.ts` barrel, tokens em `global.css`). A **paleta e
tipografia** continuam vindas de `specs/context.md` e do mockup v0
(`../mesp-match/docs/reuniao-jul2026/mockup-mesp-precos.html`) -- não da paleta do MVP,
que é de outro produto (Hub de Esporte, azul/dourado). O MVP é referência de
*convenção de código e animação*, não de identidade visual.

### Animação -- gsap para microinterações narrativas, CSS para o resto

`gsap` (já dependência do MVP, usado com `gsap.context()` + cleanup em `useEffect`,
eases `back.out`/`elastic.out`/`power2.out`) para: troca de porte de compra, cascata de
promoção de família, etapas do processamento em lote. CSS transitions/keyframes puros
para hover/focus/expansão simples. Hook `useReducedMotion()` desliga o gsap e aplica o
estado final instantâneo quando `prefers-reduced-motion: reduce` -- é critério de
aceitação (SPEC-D07), testado explicitamente.

### Outras decisões técnicas

- **Busca:** fuse.js client-side sobre `busca_indice.json` (spec-3 aceita libs leves de
  fuzzy; já é dependência do MVP).
- **Dados:** sem react-query. `DadosContext` faz fetch dos JSONs estáticos uma vez no
  mount (padrão inspirado em `services/api.ts` do MVP, sem servidor por trás).
- **Estado de sessão (DD2, escritas simuladas):** Context + `useReducer` em memória.
  Nunca `localStorage` -- a spec-4 exige que recarregar restaure o estado original.
- **Tabela do lote (883 linhas):** `@tanstack/react-virtual`.
- **Painel:** sem lib de gráfico (spec-6 proíbe gráfico gratuito); barra de segmentos e
  stat tiles em CSS puro.
- **Ícones:** `react-bootstrap-icons` (consistente com o MVP).
- **Export .xlsx do lote:** cópia do `relatorio_sneaelis.xlsx` real, servido como
  download direto (sem geração client-side).
- **`amostras.json`:** arquivo único (volume pequeno, não precisa de lazy-load por item).
- **Sem autenticação/login** (não se aplica a uma demo pública estática).
- **Fontes:** só de sistema (Palatino Linotype/Georgia, Segoe UI, Consolas) -- sem
  webfont, mantém a demo 100% offline.

### `porte.json` é chaveado por ITEM, não por família (achado durante o export)

A spec-1 permite "por família (ou item)". Testado por família primeiro: o catálogo tem
aliases largos (ex. `arco` cobre bambolê E arco-e-flecha/arqueria), então agrupar por
família pura polui a faixa por porte com produtos não relacionados -- o caso de validação
do bambolê (~R$22,90 até 20 un / ~R$4,45 acima de 100 un) só reproduz corretamente por
ITEM, reusando o mesmo conjunto de linhas casadas que o motor usou para precificar aquele
item especificamente (`avaliar_consulta` reexecutado por item em `exportar_dados.py`).
Resultado após a correção: id 4555/"BAMBOLÊ/ARCO" dá R$22,90 (n=31) e R$4,42 (n=42) --
bate com o context.md dentro do ruído esperado (n=33/n=44).

### Vocabulário leigo -- achados no grep do bundle final

"curadoria" e "mediana" apareciam em duas strings de UI (nota do Painel e etapa do Lote)
copiadas de rascunhos das specs D06/D01 que antecederam a tabela de vocabulário do
context.md. Reescritas para "conferência de especialista" e "preço típico". Grep final
em `dist/assets/*.js` (pós-build) confirma zero ocorrências de curadoria/sobrepreço/
outlier/tier/atributo crítico como texto renderizado (só sobrevive `n_curadoria_nivel_1`,
nome de campo interno nunca exibido).

### Reforma visual -- identidade mesclada com o e-SNEAELIS (jul/2026)

`specs/design-esneaelis.md` extraiu a identidade do e-SNEAELIS (tela de login real da
SNEAELIS) e pediu uma decisão explícita antes de implementar, por conflitar com a
identidade verde/serifa de `specs/context.md`. Decisão (confirmada com o usuário):
**mesclar**.

- **Casca/UI geral vira azul marinho institucional** (`--primary: #1B3E6F`, tokens
  `--navbar-bg`, `--input-border`, `--line`, `--shadow` e a escala de `--radius`
  retintados na estética "Bootstrap institucional" do e-SNEAELIS -- fundo branco puro,
  cartão com borda sutil em vez de cor cheia, radius menor (~6-8px), navbar clara com
  borda inferior em vez da barra verde solida do mockup v0). Tudo isolado em
  `app/src/assets/styles/global.css`; como os componentes já consumiam só variáveis CSS
  (nunca hex fixo), a reforma não exigiu tocar a maioria dos componentes -- só
  `TopNav` (que era uma barra verde cheia, virou navbar clara com abas estilo
  nav-underline) e `Input` (borda própria `--input-border`, distinta da borda de cartão).
- **Os 4 selos de nível de confiança (`--n1`..`--n4`) ficaram INTOCADOS** -- são a
  identidade central do produto (specs/context.md), já validados para daltonismo, e o
  usuário confirmou que devem continuar exatamente como estão. O azul marinho novo não
  se confunde com o azul do Nível 2 (tons claramente distintos: marinho escuro vs. azul
  vivo).
- **Serifa nos preços/títulos-herói mantida** (confirmado com o usuário) -- é um destaque
  intencional que não conflita com a navbar/UI de casca ficar sans-serif (a referência
  e-SNEAELIS nem mostra preços).
- **Tema escuro mantido** (não estava no escopo da decisão; design-esneaelis.md descreve
  só o tema claro do e-SNEAELIS). Criada uma variante escura do azul (`#5B8DEF`) coerente
  com o resto da paleta escura já existente.
- **O que não foi copiado** (item 4 do design-esneaelis.md): captcha, ausência de tema
  escuro, logotipo/marca "e-SNEAELIS" (a demo usa sua própria marca "MESP Preços"), tela
  de login com seleção de perfil (fora do escopo desta demo).

## Estrutura de diretórios

```
mesp-match-demo/
  CLAUDE.md
  PLANNING.md
  specs/
  pyproject.toml          -- projeto Python (uv) do exportador
  scripts/
    exportar_dados.py
  app/                     -- front Vite + React + TS
    public/dados/          -- itens.json, busca_indice.json, amostras.json, porte.json,
                              familias.json, painel.json, relatorio_sneaelis.xlsx
    src/
      assets/styles/global.css
      types/index.ts
      contexts/DadosContext.tsx, SessaoContext.tsx
      hooks/
      components/          -- design system (Button, Input, Modal, Chip,
                              SegmentedControl, SeloNivel, FaixaPreco, PrecoHero,
                              MemoriaCalculo, NotaHonesta, CardItem, TopNav)
      features/{consulta,lote,familias,painel}/
      pages/{ConsultaPage,LotePage,FamiliasPage,PainelPage,KitPage}/
      App.tsx, main.tsx
```

## Status de execução

| Fase | Descrição | Status |
|---|---|---|
| 0 | Exportador de dados (SPEC-D01) | feito -- contagens batem com context.md |
| 1 | Chassi do front (SPEC-D02 parte 1) | feito |
| 2 | Design system de domínio + contexts (SPEC-D02 parte 2) | feito |
| 3 | Tela Consulta (SPEC-D03) | feito |
| 4 | Tela Cotação em Lote (SPEC-D05) | feito |
| 5 | Tela Famílias (SPEC-D04) | feito |
| 6 | Painel (SPEC-D06) | feito |
| 7 | Acessibilidade, motion, critérios finais (SPEC-D07) | feito |

## Pendências conhecidas (não bloqueantes para a demo)

- Verificação visual em navegador real não foi possível nesta sessão (ambiente sem
  `chromium-cli`/Playwright); a validação foi feita por `tsc`, `eslint`, `vite build` e
  pelo servidor de dev (`npm run dev`, HMR sem erros, um console.error real encontrado e
  corrigido -- ver histórico). Recomendado: abrir `http://localhost:5173` e rodar o
  roteiro do teste do projetor (consulta anilha -> porte bambolê -> lote -> famílias ->
  painel) antes de mostrar à SNEAELIS.
- Lighthouse de acessibilidade (critério SPEC-D02 "#4, >=95") não foi rodado (precisa de
  Chrome/CI); a base (foco visível, aria-label, foco preso no drawer, navegação por
  teclado) foi implementada e revisada manualmente.
- "Em estudo" (família fora do catálogo, âmbar) do mockup v0 não foi implementado na
  grade de Famílias: seria dado inventado (DD3 proíbe). Only os dois estados reais do
  catálogo (Validada/Aguardando) aparecem.

## Números de referência (conferência do exportador)

883 itens | 747 com preço (84%) | Nível 1: 146 (precisão 97%, curadoria de 267) |
Nível 2: 492 (490 com preço) | Nível 3: 111 | Nível 4: 134 | 13 acima da faixa |
bambolê: geral R$ 5,50 (n=104), até 20 un R$ 22,90 (n=33), >100 un R$ 4,45 (n=44).
