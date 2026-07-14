/** Contrato dos JSONs gerados por scripts/exportar_dados.py (SPEC-D01).
 * Espelha exatamente os arquivos em app/public/dados/ -- nao inventar campo aqui
 * sem antes existir no export. */

export type Nivel = 1 | 2 | 3 | 4

export interface Meta {
  gerado_em: string
  fonte: string
  versao_relatorio: string
}

export interface Item {
  id: number
  nome: string
  descricao: string | null
  familia: string | null
  nivel: Nivel
  preco_tipico: number | null
  faixa: [number, number] | null
  n_amostras: number
  n_fora_da_curva: number
  fontes: string | null
  periodo: string | null
  casou_com: string | null
  cotacao_sneaelis: number | null
  acima_da_faixa: boolean
  justificativa: string | null
}

export interface ItemBusca {
  id: number
  nome: string
  descricao_norm: string
  tokens: string[]
  nivel: Nivel
}

export interface LinhaMemoria {
  local: string
  data: string | null
  quantidade: number | null
  valor_unitario: number | null
  excluida: boolean
}

export type FaixaPorte = 'ate_20' | 'de_21_a_100' | 'acima_100'

export const ROTULO_PORTE: Record<FaixaPorte, string> = {
  ate_20: 'Compra pequena (até 20 un)',
  de_21_a_100: 'Lote médio (21 a 100 un)',
  acima_100: 'Lote grande (acima de 100 un)',
}

export interface EstatisticaPorte {
  mediana: number
  p25: number
  p75: number
  n: number
}

export type PorteItem = Partial<Record<FaixaPorte, EstatisticaPorte>>

export interface Familia {
  confiavel: boolean
  atributos_criticos: string[]
  atributos_secundarios: string[]
  sinonimos: string[]
  n_itens_sneaelis: number
  n_nivel_1: number
  n_nivel_2: number
  n_nivel_3: number
  n_nivel_4: number
  n_promoviveis: number
}

export interface SegmentoNivel {
  nivel: Nivel
  rotulo: string
  leitura: string
  n: number
}

export interface Painel {
  total_itens: number
  com_preco: number
  pct_com_preco: number
  por_nivel: SegmentoNivel[]
  precisao_nivel_1: number
  n_curadoria_nivel_1: number
  acima_da_faixa: number
  familias_validadas: number
  familias_aguardando: number
  fila_maior_retorno: (Familia & { familia: string })[]
  distribuicao_por_familia: { familia: string | null; n_itens: number }[]
}

export interface DadosDemo {
  itens: Item[]
  buscaIndice: ItemBusca[]
  amostras: Record<string, LinhaMemoria[]>
  porte: Record<string, PorteItem>
  familias: Record<string, Familia>
  painel: Painel
}
