# Projeto: mesp-match-demo -- Front-end demonstrativo do MESP Preços

## Natureza do projeto

Este projeto **não é o sistema de produção**. É a **vitrine navegável** do mesp-match:
um front-end estático que mostra, com dados reais do piloto de jun/2026, como seria a
aplicação "MESP Preços" rodando como produto -- consulta de preço de referência,
cotação em lote, painel de cobertura e, principalmente, a **interface de parametrização
do catálogo de famílias** (a curadoria como produto).

> Regra de ouro herdada do mesp-match: **todo número exibido é real e defensável.**
> A demo pode simular interações (uploads, edições, promoções de família), mas nunca
> inventa preços, contagens ou precisões. O produto que estamos vendendo É credibilidade.

## Público e propósito

- **Público primário:** servidora da SNEAELIS responsável pela precificação de materiais
  (não técnica; colaborou na planilha de cotações atual) e gestores da SNEAELIS.
- **Propósito:** materializar o "sonho concreto" apresentado na reunião de jul/2026 --
  provar por demonstração (não por argumento) que a automação da cotação com preço
  justificável existe e tem cara de produto.
- **Objetivo estratégico:** a servidora deve se enxergar como **dona do catálogo de
  famílias** (autora das regras), não como usuária passiva. A tela de parametrização
  é o coração político da demo.

## Contexto estratégico (da reunião de jul/2026)

Essências que a demo precisa respeitar (histórico completo na memória do projeto irmão
e em `../mesp-match/docs/reuniao-jul2026/`):

1. **"Preço justo" = preço + contexto.** A maior objeção da SNEAELIS é "não compro
   bambolê por R$ 5,50 (preço de licitação em volume)". A resposta é a **faixa por porte
   de compra**: a base pública registra a quantidade de cada compra; bambolê custa
   R$ 22,90 (mediana) em lotes até 20 un e R$ 4,45 em lotes >100 un. O seletor de porte
   na tela de consulta é feature obrigatória, não enfeite.
2. **Níveis de confiança medem PROVA, não existência de preço.** 84% dos 883 itens têm
   preço; o que os 4 níveis separam é quanta prova acompanha cada um. Nunca apresentar
   como "só 17% resolvido".
3. **Honestidade preventiva é identidade visual.** O sistema diz "não sei" (134 itens),
   confessa que vestuário (143 itens) não tem selo verde por fraqueza da base pública
   (12 registros), e mostra outliers excluídos na memória de cálculo (ex.: anilha 10kg
   tem compra de R$ 4.369,62 excluída e registrada). Esses momentos ficam VISÍVEIS na demo.
4. **Vocabulário leigo obrigatório** (testado nos artefatos da reunião):

   | Proibido (jargão)        | Usar                                           |
   |--------------------------|------------------------------------------------|
   | match/matching           | encontro, casamento do item                    |
   | tier                     | nível de confiança                             |
   | família taxonômica       | família (metáfora: corredor de supermercado)   |
   | atributo crítico         | o detalhe que não pode errar                   |
   | curadoria                | conferência de especialista                    |
   | mediana                  | preço típico                                   |
   | P25-P75                  | faixa do aceitável                             |
   | flag de sobrepreço       | acima da faixa de referência                   |
   | outlier                  | preço fora da curva (excluído com registro)    |

## Identidade visual estabelecida

Definida e testada nos 4 artefatos da reunião (referência viva:
`../mesp-match/docs/reuniao-jul2026/mockup-mesp-precos.html` -- v0 desta demo).

> **Atualização (reforma visual jul/2026, ver `specs/design-esneaelis.md` e
> `PLANNING.md`):** a cor primária foi mesclada com a identidade azul marinho
> institucional do e-SNEAELIS (`#1B3E6F` claro / `#5B8DEF` escuro), substituindo o verde
> abaixo, para o MESP Preços parecer módulo da mesma família de sistemas que a SNEAELIS
> já usa. Os 4 níveis de confiança abaixo **não mudaram** -- continuam sendo a
> identidade central do produto. Serifa nos preços/títulos-herói também não mudou.

- **Paleta (tema claro / tema escuro):**
  - papel `#FFFFFF` / `#0F1115`; cartão `#FFFFFF` / `#171A1F` (histórico: `#F4F7F5` /
    `#0E1512`, ver atualização acima)
  - tinta `#212529` / `#E9ECEF`; secundária `#495057` / `#ADB5BD` (histórico: `#1C2420` /
    `#E6ECE8`)
  - primário (azul marinho institucional, e-SNEAELIS) `#1B3E6F` / `#5B8DEF` (histórico:
    verde `#0B5340` / `#4ECFA2`)
  - Nível 1 Confirmado `#15803D` / `#3BC873` (fundo `#E6F2E9` / `#16281D`)
  - Nível 2 Compatível `#1D4ED8` / `#82AFF5` (fundo `#E8EDFB` / `#18222E`)
  - Nível 3 Aproximado `#B45309` / `#E5A84E` (fundo `#F8EDDD` / `#2C2417`)
  - Nível 4 Sem candidato `#5F7A8A` / `#8FA3B0` (fundo `#EAF0F3` / `#1C242A`)
  - Paleta validada para daltonismo (separação CVD ok nos dois temas); selos SEMPRE
    acompanhados de rótulo textual, nunca cor sozinha.
- **Tipografia:** display serif ("Palatino Linotype", Georgia) para preços e títulos
  grandes; "Segoe UI"/system-ui para UI; monospace para descrições de base.
  `font-variant-numeric: tabular-nums` em qualquer coluna de números.
- **Tom:** institucional-sóbrio com momentos de encanto. Microinterações a serviço da
  compreensão (ex.: a faixa do aceitável animando ao trocar o porte da compra), nunca
  espetáculo gratuito. Respeitar `prefers-reduced-motion` sempre.

## Fonte dos dados (projeto irmão mesp-match)

Tudo vem de `../mesp-match` (mesmo nível de diretório). Arquivos-chave:

| Arquivo | Conteúdo | Uso na demo |
|---|---|---|
| `../mesp-match/data/processed/relatorio_cotacao.parquet` | 883 itens cotados (30 colunas: id, nome, descricao_sneaelis, familia, tier, preco_referencia, preco_p25, preco_p75, n_amostras, n_outliers_excluidos, fonte_precos, periodo, mediana_sneaelis, flag_sobrepreco, justificativa, descricao_base_encontrada, similaridade...) | consulta, lote, painel |
| `../mesp-match/data/trusted/base_precos/` (parquet particionado) | 37.040 compras públicas individuais (descricao, valor_unitario, **quantidade**, uf, municipio, data_compra, fonte) | memória de cálculo, faixa por porte |
| `../mesp-match/data/index/base_agrupada.parquet` | 18.792 descrições agregadas (mediana/p25/p75 com corte de outlier) | busca livre |
| `../mesp-match/catalogos/familias.yaml` | catálogo de famílias + atributos críticos + lista `confiaveis` | tela de parametrização |
| `../mesp-match/catalogos/sinonimos.yaml` | variantes -> família | tela de parametrização |
| `../mesp-match/specs/context.md` e `../mesp-match/PLANNING.md` | contexto do motor, decisões Dn/DFn | leitura de fundo |
| `../mesp-match/docs/reuniao-jul2026/*.html` | artefatos da reunião (mockup = v0 da demo, briefing, apresentação) | referência visual e de copy |

**Atenção:** `data/` do mesp-match não é versionado. Se um parquet não existir, os
scripts de lá o regeneram (`uv run python scripts/cotar.py` etc. -- ver PLANNING de lá).

## Decisões de arquitetura já tomadas (não reabrir sem motivo)

- **DD1 -- Estático primeiro, backend nenhum.** A demo consome JSON pré-exportado dos
  parquets/YAML reais (SPEC-D01). Nada de API, banco ou servidor na v1. O contrato dos
  JSON deve ser desenhado como se fosse o contrato de uma API futura.
- **DD2 -- Escritas são simuladas.** Edições na parametrização e uploads em lote vivem
  só no estado do cliente (com aviso discreto de protótipo). A demo nunca grava nada.
- **DD3 -- Números reais, sempre.** Qualquer estatística exibida sai do export real.
  Se um dado não existe (ex.: memória de cálculo detalhada de um item), a UI mostra o
  agregado honesto, não linhas inventadas.
- **DD4 -- Stack sugerida: Vite + React + Tailwind** (decisão final no planning), com
  build 100% estático servível de qualquer lugar (file://, GitHub Pages, S3).

## Números de referência do piloto (jun/2026) -- para conferência

883 itens | 747 com preço (84%) | Nível 1: 146 (precisão 97% por curadoria de 267) |
Nível 2: 492 (490 com preço) | Nível 3: 111 | Nível 4: 134 | 13 acima da faixa |
vestuário: 143 itens, 0 no Nível 1 | bambolê: geral R$ 5,50 (n=104), até 20 un R$ 22,90
(n=33), >100 un R$ 4,45 (n=44) | anilha 10kg: R$ 227,89, faixa 182-273, n=5, outlier
R$ 4.369,62 excluído.
