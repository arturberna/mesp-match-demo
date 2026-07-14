const FORMATADOR_BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatarBRL(valor: number): string {
  return FORMATADOR_BRL.format(valor)
}

export function formatarData(iso: string | null): string {
  if (!iso) return '--'
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}
