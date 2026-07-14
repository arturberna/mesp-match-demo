# SPEC-D01 -- Exportador de dados reais (parquet/YAML -> JSON estático)

## Objetivo

Materializar o contrato de dados da demo: um script Python (`scripts/exportar_dados.py`,
rodado com `uv run`) que lê os artefatos reais do projeto irmão `../mesp-match` e gera
JSONs estáticos em `app/public/dados/`. É a única ponte entre o motor e o front.

**Princípio:** desenhar cada JSON como se fosse a resposta de uma API futura. Quando o
sistema virar produto, o front troca `fetch('/dados/x.json')` por `fetch('/api/x')` sem
mudar de forma.

---

## Entradas (todas no projeto irmão)

| Fonte | Caminho |
|---|---|
| Relatório de cotação (883 itens) | `../mesp-match/data/processed/relatorio_cotacao.parquet` |
| Compras individuais (37.040 linhas, com `quantidade`, `uf`, `municipio`, `data_compra`, `fonte`) | `../mesp-match/data/trusted/base_precos/` |
| Índice agregado por descrição (18.792 descrições) | `../mesp-match/data/index/base_agrupada.parquet` |
| Catálogo de famílias (+ lista `confiaveis`) | `../mesp-match/catalogos/familias.yaml` |
| Sinônimos | `../mesp-match/catalogos/sinonimos.yaml` |

Se um parquet não existir, falhar com mensagem clara apontando o script gerador no
mesp-match (ver PLANNING de lá). Nunca gerar JSON parcial silenciosamente.

## Saídas (em `app/public/dados/`)

### 1. `itens.json` -- os 883 itens cotados
Um registro por item do relatório. Campos (renomear para o domínio da UI):

```jsonc
{
  "id": 4,
  "nome": "ANILHA 10KG",
  "descricao": "Anilha - Finalidade: ...",        // descricao_sneaelis
  "familia": "anilha",
  "nivel": 1,                                      // tier: VALIDADO=1, TECNICO=2, INDICATIVO=3, SEM_CANDIDATO=4
  "preco_tipico": 227.89,                          // preco_referencia (null p/ nivel 4)
  "faixa": [182.34, 272.57],                       // [preco_p25, preco_p75]
  "n_amostras": 5,
  "n_fora_da_curva": 1,                            // n_outliers_excluidos
  "fontes": "Compras.gov.br",                      // fonte_precos normalizado p/ exibicao
  "periodo": "2025",
  "casou_com": "ANILHA, MATERIAL: FERRO FUNDIDO ...", // descricao_base_encontrada
  "cotacao_sneaelis": 129.90,                      // mediana_sneaelis
  "acima_da_faixa": false,                         // flag_sobrepreco
  "justificativa": "tier=VALIDADO | familia=anilha | ..."
}
```

### 2. `busca_indice.json` -- índice leve para busca client-side
Derivado de `itens.json`: id + nome + descrição normalizada + tokens. Se o total passar
de ~1 MB gzip, avaliar minificação de campos. A busca da demo é client-side
(SPEC-D03) -- este arquivo é o que a alimenta.

### 3. `amostras/{id}.json` OU `amostras.json` -- memória de cálculo
Para cada item com preço, as compras individuais que sustentam o preço: filtrar
`base_precos` pelas descrições casadas do item (`descricao_base_encontrada`), máximo
~30 linhas por item (as usadas + as excluídas por outlier, marcadas). Campos:
`local` (municipio/uf), `data`, `quantidade`, `valor_unitario`, `excluida` (bool).
Decidir no planning entre um arquivo único (se couber) ou um por item (lazy load).
**Os outliers excluídos DEVEM vir marcados, nunca omitidos** -- a UI os exibe riscados.

### 4. `porte.json` -- faixa por porte de compra
Para cada família (ou item) com amostra suficiente, as estatísticas por faixa de lote:
`ate_20`, `de_21_a_100`, `acima_100` -- cada uma com `{mediana, p25, p75, n}`.
Calcular a partir de `base_precos.quantidade`. Só emitir faixas com n >= 3 (regra da
IN 65 herdada do motor); a UI esconde o seletor quando não houver dado. Caso de
validação: bambolê/arco deve dar ~22,90 (até 20 un, n=33) e ~4,45 (>100 un, n=44).

### 5. `familias.json` -- o catálogo como dado de UI
Conversão direta de `familias.yaml` + `sinonimos.yaml`:

```jsonc
{
  "anilha": {
    "confiavel": true,                    // esta na lista `confiaveis`
    "atributos_criticos": ["peso"],
    "atributos_secundarios": ["material", "acabamento"],
    "sinonimos": ["anilha emborrachada", ...],
    "n_itens_sneaelis": 12,               // contagem no relatorio
    "n_nivel_1": 12, "n_nivel_2": 0,      // distribuicao dos itens da familia
    "n_promoviveis": 0                    // itens nivel 2 que subiriam se a familia fosse validada
  }
}
```

`n_promoviveis` é o número que a tela de parametrização exibe no botão "validar esta
família promove N itens" (SPEC-D04).

### 6. `painel.json` -- agregados do dashboard
Distribuição por nível (146/492/111/134), total com preço, precisão do Nível 1 (97%,
constante documentada, origem: curadoria de 267 itens), contagem acima da faixa (13),
famílias validadas vs pendentes, distribução por família (top N por volume).

## Regras

- Escrita atômica (`.tmp` + rename), convenção herdada do ecossistema MESP.
- Valores monetários como número (float), formatação é responsabilidade da UI.
- Encoding UTF-8; strings de descrição preservadas como estão na base (a UI pode truncar).
- O script imprime no final um resumo de conferência (contagens por arquivo) que deve
  bater com os números de referência do `context.md`.
- Registrar no próprio JSON um bloco `_meta`: `{gerado_em, fonte, versao_relatorio}`.

## Critérios de aceitação

1. `uv run python scripts/exportar_dados.py` gera todos os JSONs a partir dos dados reais.
2. Contagens batem com o context.md (883 itens, 146/492/111/134 por nível, 13 acima da faixa).
3. `porte.json` reproduz o caso bambolê (~22,90 / ~4,45).
4. Nenhum campo com jargão interno vaza para os JSONs consumidos pela UI (tier -> nivel etc.).
