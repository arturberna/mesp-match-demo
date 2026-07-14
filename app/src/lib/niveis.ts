import type { Item, Nivel, SegmentoNivel } from '@/types'

/** Vocabulario leigo dos 4 niveis de confianca (specs/context.md -- nunca "tier"/"match"
 * na UI). Fonte unica reusada por SeloNivel, Painel e cartoes de resultado. */

export const ROTULO_NIVEL: Record<Nivel, string> = {
  1: 'Confirmado', 2: 'Compatível', 3: 'Aproximado', 4: 'Sem candidato',
}

export const SIMBOLO_NIVEL: Record<Nivel, string> = {
  1: '✓', 2: '◑', 3: '≈', 4: '–',
}

export const EXPLICACAO_NIVEL: Record<Nivel, string> = {
  1: 'Item certo, com o detalhe que não pode errar conferido. Pronto para o controle.',
  2: 'Família certa, mas ainda sem conferência completa do especialista. Bom para planejar -- confira antes de fechar.',
  3: 'Achado por semelhança de texto, fora do catálogo de famílias. Ordem de grandeza -- confira antes de usar.',
  4: 'O sistema prefere dizer "não sei" a inventar um preço.',
}

export const LEITURA_NIVEL: Record<Nivel, string> = {
  1: 'pronto para o controle', 2: 'bom para planejar', 3: 'confira antes de usar', 4: 'onde investir',
}

/** Recalcula a barra de 4 segmentos a partir dos itens correntes (com promocoes de
 * sessao ja aplicadas) -- nunca dos numeros estaticos do painel.json, para refletir o
 * efeito da conferencia de especialista ao vivo (SPEC-D04 #2 / SPEC-D06 #3). */
export function calcularSegmentosNivel(itens: Item[]): SegmentoNivel[] {
  return ([1, 2, 3, 4] as Nivel[]).map(nivel => ({
    nivel, rotulo: ROTULO_NIVEL[nivel], leitura: LEITURA_NIVEL[nivel],
    n: itens.filter(it => it.nivel === nivel).length,
  }))
}
