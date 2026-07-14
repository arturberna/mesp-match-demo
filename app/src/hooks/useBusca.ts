import { useMemo } from 'react'
import Fuse from 'fuse.js'
import type { Item, ItemBusca } from '@/types'
import { normalizarTexto } from '@/lib/normalizar'

/** Busca livre client-side (SPEC-D03) sobre busca_indice.json: normalizacao + ranking
 * por tokens compartilhados via fuse.js, com boost implicito no nome (peso maior que
 * a descricao). Nao reimplementa o motor -- so cobre a demo. */
export function useBusca(itens: Item[], indice: ItemBusca[]) {
  const fuse = useMemo(
    () =>
      new Fuse(indice, {
        keys: [
          { name: 'nome', weight: 0.6 },
          { name: 'tokens', weight: 0.3 },
          { name: 'descricao_norm', weight: 0.1 },
        ],
        threshold: 0.38,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [indice],
  )

  const itensPorId = useMemo(() => new Map(itens.map(it => [it.id, it])), [itens])

  function buscar(texto: string, limite = 8): Item[] {
    const normalizado = normalizarTexto(texto)
    if (!normalizado) return []
    return fuse
      .search(normalizado, { limit: limite })
      .map(r => itensPorId.get(r.item.id))
      .filter((it): it is Item => it != null)
  }

  return { buscar }
}
