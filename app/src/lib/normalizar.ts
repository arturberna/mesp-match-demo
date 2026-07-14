/** Normalizacao simples (minusculas, sem acento) -- espelha o normalizador.py do motor
 * de forma simplificada para a busca client-side (SPEC-D03). */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
