"""
exportar_dados.py -- Exporta os dados reais do mesp-match (parquet/YAML) para JSON
estatico consumido pelo front da vitrine (SPEC-D01).

Le os artefatos do piloto jun/2026 em ../mesp-match (relatorio de cotacao, base de
precos, indice agrupado, catalogo de familias) e gera os JSONs em app/public/dados/,
com os nomes de campo ja traduzidos para o vocabulario leigo da demo (tier -> nivel
etc., ver specs/context.md). Cada numero exibido na demo vem destes JSONs -- nenhum
calculo e refeito no front.

Reaproveita o motor real (scripts de ../mesp-match: match.py, preco.py, cotar.py,
normalizador.py) para reconstituir, por item, as compras individuais que sustentam o
preco (memoria de calculo) e a faixa por porte de compra -- nao reimplementa a logica
de casamento/precificacao, so acrescenta as colunas (municipio, quantidade) que o motor
de producao nao precisa carregar para cotar, mas que a demo precisa mostrar.

Uso:
    uv run python scripts/exportar_dados.py
    uv run python scripts/exportar_dados.py --limite 20    # so os N primeiros itens (depuracao)
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

import duckdb
import pandas as pd
from rich.console import Console
from rich.table import Table

RAIZ = Path(__file__).resolve().parents[1]
MESP_MATCH = RAIZ.parent / "mesp-match"
MESP_MATCH_SCRIPTS = MESP_MATCH / "scripts"

if not MESP_MATCH_SCRIPTS.exists():
    raise SystemExit(
        f"Projeto irmao nao encontrado: {MESP_MATCH_SCRIPTS}\n"
        "Este exportador depende de ../mesp-match (dados + motor real). "
        "Ver specs/context.md -- 'Fonte dos dados'."
    )

sys.path.insert(0, str(MESP_MATCH_SCRIPTS))

from match import avaliar_consulta, carregar_catalogo, carregar_confiaveis, carregar_consultas  # noqa: E402
from cotar import MIN_COBERTURA_TIER3, TOPK_POOL_TIER3, indice_invertido  # noqa: E402
from normalizador import normalizar  # noqa: E402
from preco import _percentil, detectar_outliers_tukey  # noqa: E402

console = Console()

RELATORIO = MESP_MATCH / "data" / "processed" / "relatorio_cotacao.parquet"
RELATORIO_XLSX = MESP_MATCH / "data" / "processed" / "relatorio_sneaelis.xlsx"
BASE_PRECOS = MESP_MATCH / "data" / "trusted" / "base_precos" / "**" / "*.parquet"
INDEX_BUSCA = MESP_MATCH / "data" / "index" / "base_agrupada.parquet"
CATALOGO_YAML = MESP_MATCH / "catalogos" / "familias.yaml"

SAIDA = RAIZ / "app" / "public" / "dados"

NIVEL_POR_TIER = {"VALIDADO": 1, "TECNICO": 2, "INDICATIVO": 3, "SEM_CANDIDATO": 4}
FONTE_LEIGO = {"ComprasGov": "Compras.gov.br", "PNCP": "PNCP"}

ROTULO_NIVEL = {1: "Confirmado", 2: "Compatível", 3: "Aproximado", 4: "Sem candidato"}
LEITURA_NIVEL = {   # SPEC-D06: leitura leiga de cada segmento da barra do painel
    1: "pronto para o controle", 2: "bom para planejar",
    3: "confira antes de usar", 4: "onde investir",
}

MAX_LINHAS_MEMORIA = 30           # spec-1: memoria de calculo, maximo ~30 linhas/item
MIN_AMOSTRAS_PORTE = 3            # regra da IN 65/2021 herdada do motor
FAIXAS_PORTE = [("ate_20", 0, 20), ("de_21_a_100", 21, 100), ("acima_100", 101, None)]

PRECISAO_NIVEL_1 = 0.97           # documentado (context.md): curadoria de 267 itens
N_CURADORIA_NIVEL_1 = 267

REFERENCIA_CONTEXTO = {           # conferencia final (specs/context.md)
    "total": 883, "com_preco": 747,
    "nivel_1": 146, "nivel_2": 492, "nivel_3": 111, "nivel_4": 134,
    "acima_da_faixa": 13,
}


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------

def _agora_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _meta(fonte: str) -> dict:
    return {"gerado_em": _agora_iso(), "fonte": fonte, "versao_relatorio": str(RELATORIO)}


def _escrever_json(caminho: Path, dado: dict | list) -> None:
    """Escrita atomica (.tmp + rename), UTF-8, compacto (sem indent -- a demo roda de
    file:// sem gzip de servidor, entao o tamanho do arquivo cru importa)."""
    caminho.parent.mkdir(parents=True, exist_ok=True)
    tmp = caminho.with_suffix(caminho.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(dado, f, ensure_ascii=False, separators=(",", ":"))
    tmp.replace(caminho)


def _num(v, casas: int = 2) -> float | None:
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    return round(float(v), casas)


def _texto(v) -> str | None:
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    return str(v)


def _fontes_leigo(fonte_precos) -> str | None:
    texto = _texto(fonte_precos)
    if not texto:
        return None
    partes = [p.strip() for p in texto.split(",") if p.strip()]
    return " + ".join(FONTE_LEIGO.get(p, p) for p in partes)


def _data_str(v) -> str | None:
    if v is None or (isinstance(v, float) and pd.isna(v)) or pd.isna(v):
        return None
    return pd.Timestamp(v).strftime("%Y-%m-%d")


# ---------------------------------------------------------------------------
# Base de precos com as colunas completas (municipio, quantidade) que o motor de
# cotacao nao carrega (carregar_base de match.py so seleciona o que a cotacao usa).
# Reaproveita a MESMA classificacao (classificar/normalizar) para que a familia de
# cada linha bata com a que o motor usou -- so acrescenta colunas, nao logica.
# ---------------------------------------------------------------------------

def carregar_base_completa(catalogo: dict) -> pd.DataFrame:
    con = duckdb.connect()
    df = con.execute(
        f"SELECT id_base, descricao, valor_unitario, quantidade, unidade, uf, municipio, "
        f"data_compra, fonte FROM read_parquet('{BASE_PRECOS.as_posix()}', union_by_name=true)"
    ).df()
    from match import classificar  # import tardio (evita ciclo de import no topo)
    df["norm"] = df["descricao"].map(normalizar)
    fam_sub = df["norm"].map(lambda t: classificar(t, catalogo))
    df["familia"] = fam_sub.map(lambda x: x[0])
    return df


def _linha_memoria(row: pd.Series, excluida: bool) -> dict:
    return {
        "local": f"{_texto(row.get('municipio')) or '?'}/{_texto(row.get('uf')) or '?'}",
        "data": _data_str(row.get("data_compra")),
        "quantidade": _num(row.get("quantidade"), 0),
        "valor_unitario": _num(row.get("valor_unitario")),
        "excluida": excluida,
    }


def _marcar_excluidos(linhas: list[pd.Series]) -> list[dict]:
    """Recomputa outliers (Tukey, mesma regra do preco.py) sobre o MESMO pool de valores
    do item, para marcar quais linhas da memoria correspondem aos excluidos no relatorio."""
    valores = [float(r["valor_unitario"]) for r in linhas]
    if len(valores) >= 5:
        inliers, outliers = detectar_outliers_tukey(valores, k=1.5)
        if len(inliers) < 3:
            outliers = []
    else:
        outliers = []
    restantes = list(outliers)
    saida = []
    for row in linhas:
        v = float(row["valor_unitario"])
        excluida = v in restantes
        if excluida:
            restantes.remove(v)
        saida.append(_linha_memoria(row, excluida))
    return saida[:MAX_LINHAS_MEMORIA]


def _linhas_do_item(
    r: pd.Series, catalogo: dict, base_por_familia: dict[str, pd.DataFrame],
    consultas: pd.DataFrame, base_completa: pd.DataFrame,
    idx_busca: pd.DataFrame | None, norms: list[str], inv: dict[str, list[int]],
) -> list[pd.Series]:
    """Reconstitui as linhas brutas de base_precos que sustentam o preco de UM item,
    reusando exatamente o motor de casamento (match.py/cotar.py) -- nunca inventa linha.

    Importante (achado empirico ao validar o caso bambole/arco): a familia sozinha NAO
    basta -- 'arco' no catalogo cobre tanto bambole quanto arco-e-flecha (arqueria), e
    familias como 'anilha' tem peso como atributo critico que filtra por item. Por isso
    reusamos avaliar_consulta por ITEM (o que o motor realmente fez para precificar aquele
    item), nao uma contagem cega por familia.
    """
    tier = r["tier"]
    familia = r["familia"] if pd.notna(r["familia"]) else None

    if tier in ("VALIDADO", "TECNICO") and familia in base_por_familia:
        if int(r["id"]) not in consultas.index:
            return []
        q = consultas.loc[int(r["id"])]
        criticos = catalogo.get(familia, {}).get("atributos_criticos", [])
        cand_fam = base_por_familia[familia]
        av = avaliar_consulta(q, cand_fam, criticos)
        elegiveis = [m for m in av["marcados"] if m[2] != "REJECT"]
        alvo = [m for m in elegiveis if m[2] == "MATCH"] if tier == "VALIDADO" else elegiveis
        return [m[0] for m in alvo]

    if tier == "INDICATIVO" and idx_busca is not None:
        texto_norm = normalizar(str(r["nome"]))
        q_tok = texto_norm.split()
        cands = inv.get(q_tok[0]) if q_tok else None
        if not cands:
            return []
        from cotar import _cobertura  # reuso do motor de busca livre
        scored = [(s, i) for i in cands if (s := _cobertura(q_tok, norms[i])) >= MIN_COBERTURA_TIER3]
        scored.sort(reverse=True)
        normas_cobertas = {norms[i] for _, i in scored[:TOPK_POOL_TIER3]}
        return [row for _, row in base_completa[base_completa["norm"].isin(normas_cobertas)].iterrows()]

    return []


def construir_amostras_e_porte(
    relatorio: pd.DataFrame, base_completa: pd.DataFrame, catalogo: dict, confiaveis: set[str],
) -> tuple[dict, dict]:
    """SPEC-D01 #3 (memoria de calculo) e #4 (faixa por porte), num so passo -- as duas
    reusam a mesma reconstituicao de linhas por item, evitando rodar o casamento 2x.

    porte.json e chaveado por ITEM (nao familia): a spec permite 'por familia (ou item)',
    e o item e o unico nivel que reproduz o caso de validacao do bambole (n=104 -- ver
    PLANNING.md, decisao registrada apos investigar a divergencia com specs/context.md)."""
    consultas = carregar_consultas(catalogo).set_index("id")
    base_por_familia = {
        fam: g.reset_index(drop=True) for fam, g in base_completa[base_completa["familia"].notna()].groupby("familia")
    }

    idx_busca = pd.read_parquet(INDEX_BUSCA) if INDEX_BUSCA.exists() else None
    inv, norms = {}, []
    if idx_busca is not None:
        norms = idx_busca["descricao_norm"].tolist()
        inv = indice_invertido(norms)

    amostras: dict[str, list[dict]] = {}
    porte: dict[str, dict] = {}

    for _, r in relatorio.iterrows():
        if pd.isna(r["preco_referencia"]):
            continue
        item_id = str(int(r["id"]))
        linhas = _linhas_do_item(r, catalogo, base_por_familia, consultas, base_completa, idx_busca, norms, inv)
        if not linhas:
            continue

        amostras[item_id] = _marcar_excluidos(linhas)

        entrada: dict[str, dict] = {}
        for chave, minimo, maximo in FAIXAS_PORTE:
            sub = [row for row in linhas if pd.notna(row.get("quantidade")) and row["quantidade"] >= minimo
                   and (maximo is None or row["quantidade"] <= maximo)]
            valores = [float(row["valor_unitario"]) for row in sub if pd.notna(row.get("valor_unitario"))
                       and row["valor_unitario"] > 0]
            if len(valores) < MIN_AMOSTRAS_PORTE:
                continue
            entrada[chave] = {
                "mediana": _num(pd.Series(valores).median()),
                "p25": _num(_percentil(valores, 25)),
                "p75": _num(_percentil(valores, 75)),
                "n": len(valores),
            }
        if len(entrada) >= 2:   # so vale seletor de porte com pelo menos 2 faixas distintas
            porte[item_id] = entrada

    return amostras, porte


# ---------------------------------------------------------------------------
# itens.json / busca_indice.json
# ---------------------------------------------------------------------------

def construir_itens(relatorio: pd.DataFrame) -> list[dict]:
    itens = []
    for _, r in relatorio.iterrows():
        nivel = NIVEL_POR_TIER[r["tier"]]
        faixa = None
        if pd.notna(r["preco_p25"]) and pd.notna(r["preco_p75"]):
            faixa = [_num(r["preco_p25"]), _num(r["preco_p75"])]
        itens.append({
            "id": int(r["id"]),
            "nome": _texto(r["nome"]),
            "descricao": _texto(r["descricao_sneaelis"]),
            "familia": _texto(r["familia"]),
            "nivel": nivel,
            "preco_tipico": _num(r["preco_referencia"]),
            "faixa": faixa,
            "n_amostras": int(r["n_amostras"]) if pd.notna(r["n_amostras"]) else 0,
            "n_fora_da_curva": int(r["n_outliers_excluidos"]) if pd.notna(r["n_outliers_excluidos"]) else 0,
            "fontes": _fontes_leigo(r["fonte_precos"]),
            "periodo": _texto(r["periodo"]),
            "casou_com": _texto(r["descricao_base_encontrada"]),
            "cotacao_sneaelis": _num(r["mediana_sneaelis"]),
            "acima_da_faixa": bool(r["flag_sobrepreco"]),
            "justificativa": _texto(r["justificativa"]),
        })
    return itens


def construir_busca_indice(itens: list[dict]) -> list[dict]:
    indice = []
    for it in itens:
        descricao_norm = normalizar(f"{it['nome']} {it['descricao'] or ''}")
        indice.append({
            "id": it["id"],
            "nome": it["nome"],
            "descricao_norm": descricao_norm,
            "tokens": sorted(set(descricao_norm.split())),
            "nivel": it["nivel"],
        })
    return indice


# ---------------------------------------------------------------------------
# familias.json
# ---------------------------------------------------------------------------

def construir_familias(relatorio: pd.DataFrame, catalogo: dict, confiaveis: set[str]) -> dict:
    saida: dict[str, dict] = {}
    for nome, conf in catalogo.items():
        sub = relatorio[relatorio["familia"] == nome]
        n_por_nivel = {n: int((sub["tier"] == tier).sum()) for tier, n in NIVEL_POR_TIER.items()}
        n_promoviveis = n_por_nivel.get(2, 0) if nome not in confiaveis else 0
        saida[nome] = {
            "confiavel": nome in confiaveis,
            "atributos_criticos": list(conf.get("atributos_criticos", [])),
            "atributos_secundarios": list(conf.get("atributos_secundarios", [])),
            "sinonimos": list(conf.get("aliases", [])),
            "n_itens_sneaelis": int(len(sub)),
            "n_nivel_1": n_por_nivel.get(1, 0),
            "n_nivel_2": n_por_nivel.get(2, 0),
            "n_nivel_3": n_por_nivel.get(3, 0),
            "n_nivel_4": n_por_nivel.get(4, 0),
            "n_promoviveis": n_promoviveis,
        }
    return saida


# ---------------------------------------------------------------------------
# painel.json
# ---------------------------------------------------------------------------

def construir_painel(relatorio: pd.DataFrame, familias: dict) -> dict:
    total = len(relatorio)
    com_preco = int(relatorio["preco_referencia"].notna().sum())
    contagem_tier = {tier: int((relatorio["tier"] == tier).sum()) for tier in NIVEL_POR_TIER}
    por_nivel = [
        {"nivel": nivel, "rotulo": ROTULO_NIVEL[nivel], "leitura": LEITURA_NIVEL[nivel],
         "n": contagem_tier[tier]}
        for tier, nivel in NIVEL_POR_TIER.items()
    ]
    acima_da_faixa = int(relatorio["flag_sobrepreco"].sum())

    validadas = sum(1 for f in familias.values() if f["confiavel"])
    aguardando = len(familias) - validadas

    top_familias = sorted(
        ({"familia": nome, **dados} for nome, dados in familias.items() if dados["n_promoviveis"] > 0),
        key=lambda d: d["n_promoviveis"], reverse=True,
    )

    distrib_familia = (
        relatorio.groupby("familia").size().sort_values(ascending=False).head(15)
        .rename("n_itens").reset_index().to_dict("records")
    )

    return {
        "total_itens": total,
        "com_preco": com_preco,
        "pct_com_preco": round(100 * com_preco / total, 1),
        "por_nivel": por_nivel,
        "precisao_nivel_1": PRECISAO_NIVEL_1,
        "n_curadoria_nivel_1": N_CURADORIA_NIVEL_1,
        "acima_da_faixa": acima_da_faixa,
        "familias_validadas": validadas,
        "familias_aguardando": aguardando,
        "fila_maior_retorno": top_familias,
        "distribuicao_por_familia": distrib_familia,
    }


# ---------------------------------------------------------------------------
# Conferencia final (falha alto se os numeros nao baterem com specs/context.md)
# ---------------------------------------------------------------------------

def conferir(itens: list[dict], painel: dict) -> None:
    tab = Table(title="Conferencia -- exportar_dados.py")
    tab.add_column("metrica"); tab.add_column("esperado", justify="right"); tab.add_column("obtido", justify="right")

    n_por_nivel = {seg["nivel"]: seg["n"] for seg in painel["por_nivel"]}
    checagens = [
        ("total de itens", REFERENCIA_CONTEXTO["total"], len(itens)),
        ("com preco", REFERENCIA_CONTEXTO["com_preco"], painel["com_preco"]),
        ("nivel 1", REFERENCIA_CONTEXTO["nivel_1"], n_por_nivel[1]),
        ("nivel 2", REFERENCIA_CONTEXTO["nivel_2"], n_por_nivel[2]),
        ("nivel 3", REFERENCIA_CONTEXTO["nivel_3"], n_por_nivel[3]),
        ("nivel 4", REFERENCIA_CONTEXTO["nivel_4"], n_por_nivel[4]),
        ("acima da faixa", REFERENCIA_CONTEXTO["acima_da_faixa"], painel["acima_da_faixa"]),
    ]
    divergiu = False
    for nome, esperado, obtido in checagens:
        cor = "green" if esperado == obtido else "red"
        if esperado != obtido:
            divergiu = True
        tab.add_row(nome, str(esperado), f"[{cor}]{obtido}[/{cor}]")
    console.print(tab)
    if divergiu:
        console.print("[bold red]Numeros divergem de specs/context.md -- conferir antes de usar na demo.[/bold red]")
    else:
        console.print("[bold green]Todos os numeros batem com specs/context.md.[/bold green]")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    p = argparse.ArgumentParser(description="Exporta dados reais do mesp-match para JSON estatico (SPEC-D01).")
    p.add_argument("--limite", type=int, default=None, help="limita a N primeiros itens (depuracao)")
    args = p.parse_args()

    for caminho, nome in [(RELATORIO, "relatorio_cotacao.parquet"), (BASE_PRECOS.parents[1], "base_precos/"),
                          (INDEX_BUSCA, "base_agrupada.parquet"), (CATALOGO_YAML, "familias.yaml")]:
        if not Path(str(caminho)).exists() if "*" not in str(caminho) else not any(Path(BASE_PRECOS.parents[1]).glob("*")):
            raise SystemExit(f"Faltando {nome} em {caminho}. Gere no mesp-match antes (ver PLANNING de la).")

    console.print("[bold]Carregando relatorio de cotacao...[/bold]")
    relatorio = pd.read_parquet(RELATORIO)
    if args.limite:
        relatorio = relatorio.head(args.limite)

    catalogo = carregar_catalogo()
    confiaveis = carregar_confiaveis()

    console.print("[bold]Carregando base de precos completa (municipio, quantidade)...[/bold]")
    base_completa = carregar_base_completa(catalogo)

    console.print("[bold]Construindo itens.json / busca_indice.json...[/bold]")
    itens = construir_itens(relatorio)
    busca_indice = construir_busca_indice(itens)

    console.print("[bold]Construindo amostras.json + porte.json (reusa o motor, por item)...[/bold]")
    amostras, porte = construir_amostras_e_porte(relatorio, base_completa, catalogo, confiaveis)

    console.print("[bold]Construindo familias.json...[/bold]")
    familias = construir_familias(relatorio, catalogo, confiaveis)

    console.print("[bold]Construindo painel.json...[/bold]")
    painel = construir_painel(relatorio, familias)

    SAIDA.mkdir(parents=True, exist_ok=True)
    _escrever_json(SAIDA / "itens.json", {"_meta": _meta("relatorio_cotacao.parquet"), "itens": itens})
    _escrever_json(SAIDA / "busca_indice.json", {"_meta": _meta("itens.json"), "indice": busca_indice})
    _escrever_json(SAIDA / "amostras.json", {"_meta": _meta("base_precos/"), "amostras": amostras})
    _escrever_json(SAIDA / "porte.json", {"_meta": _meta("base_precos/"), "itens": porte})
    _escrever_json(SAIDA / "familias.json", {"_meta": _meta("familias.yaml + sinonimos.yaml"), "familias": familias})
    _escrever_json(SAIDA / "painel.json", {"_meta": _meta("relatorio_cotacao.parquet"), **painel})

    if RELATORIO_XLSX.exists():
        shutil.copyfile(RELATORIO_XLSX, SAIDA / "relatorio_sneaelis.xlsx")
        console.print(f"[dim]Copiado {RELATORIO_XLSX.name} para {SAIDA}[/dim]")

    console.print(f"\n[bold]JSONs escritos em[/bold] {SAIDA}")
    if not args.limite:
        conferir(itens, painel)

    bamboles = [it for it in itens if it["nome"] and "BAMBOL" in it["nome"].upper()]
    for it in bamboles:
        chave = str(it["id"])
        if chave in porte:
            console.print(f"[dim]Caso bambole (id={chave}, '{it['nome']}'): {porte[chave]}[/dim]")

    return 0


if __name__ == "__main__":
    sys.exit(main())
