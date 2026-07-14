import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type {
  DadosDemo, Familia, Item, ItemBusca, LinhaMemoria, Painel, PorteItem,
} from '@/types'

interface EstadoDados {
  dados: DadosDemo | null
  carregando: boolean
  erro: string | null
}

const DadosContext = createContext<EstadoDados | undefined>(undefined)

async function buscarJson<T>(caminho: string): Promise<T> {
  const resposta = await fetch(caminho)
  if (!resposta.ok) {
    throw new Error(`Falha ao carregar ${caminho}: ${resposta.status}`)
  }
  return resposta.json() as Promise<T>
}

export function DadosProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoDados>({ dados: null, carregando: true, erro: null })

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      try {
        const [itens, busca, amostras, porte, familias, painel] = await Promise.all([
          buscarJson<{ itens: Item[] }>('/dados/itens.json'),
          buscarJson<{ indice: ItemBusca[] }>('/dados/busca_indice.json'),
          buscarJson<{ amostras: Record<string, LinhaMemoria[]> }>('/dados/amostras.json'),
          buscarJson<{ itens: Record<string, PorteItem> }>('/dados/porte.json'),
          buscarJson<{ familias: Record<string, Familia> }>('/dados/familias.json'),
          buscarJson<Painel & { _meta: unknown }>('/dados/painel.json'),
        ])
        if (cancelado) return
        setEstado({
          dados: {
            itens: itens.itens,
            buscaIndice: busca.indice,
            amostras: amostras.amostras,
            porte: porte.itens,
            familias: familias.familias,
            painel,
          },
          carregando: false,
          erro: null,
        })
      } catch (e) {
        if (cancelado) return
        setEstado({
          dados: null, carregando: false,
          erro: e instanceof Error ? e.message : 'Erro desconhecido ao carregar os dados.',
        })
      }
    }

    carregar()
    return () => {
      cancelado = true
    }
  }, [])

  return <DadosContext.Provider value={estado}>{children}</DadosContext.Provider>
}

export function useDados(): EstadoDados {
  const ctx = useContext(DadosContext)
  if (!ctx) throw new Error('useDados precisa estar dentro de <DadosProvider>')
  return ctx
}
