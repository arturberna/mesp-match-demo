import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'
import type { Familia, Item } from '@/types'

/** Estado de escritas simuladas (DD2): so vive na memoria da aba. NUNCA localStorage --
 * a spec-4 exige que recarregar a pagina restaure o estado original. */

export interface PromocaoFamilia {
  especialista: string
  em: string
}

interface EstadoSessao {
  familiasPromovidas: Record<string, PromocaoFamilia>
}

type AcaoSessao = { tipo: 'PROMOVER_FAMILIA'; familia: string; especialista: string }

const estadoInicial: EstadoSessao = { familiasPromovidas: {} }

function reducer(estado: EstadoSessao, acao: AcaoSessao): EstadoSessao {
  switch (acao.tipo) {
    case 'PROMOVER_FAMILIA':
      return {
        ...estado,
        familiasPromovidas: {
          ...estado.familiasPromovidas,
          [acao.familia]: { especialista: acao.especialista, em: new Date().toISOString() },
        },
      }
    default:
      return estado
  }
}

const SessaoStateContext = createContext<EstadoSessao | undefined>(undefined)
const SessaoDispatchContext = createContext<Dispatch<AcaoSessao> | undefined>(undefined)

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(reducer, estadoInicial)
  return (
    <SessaoStateContext.Provider value={estado}>
      <SessaoDispatchContext.Provider value={dispatch}>{children}</SessaoDispatchContext.Provider>
    </SessaoStateContext.Provider>
  )
}

export function useSessao(): EstadoSessao {
  const ctx = useContext(SessaoStateContext)
  if (!ctx) throw new Error('useSessao precisa estar dentro de <SessaoProvider>')
  return ctx
}

export function usePromoverFamilia(): (familia: string, especialista: string) => void {
  const dispatch = useContext(SessaoDispatchContext)
  if (!dispatch) throw new Error('usePromoverFamilia precisa estar dentro de <SessaoProvider>')
  return (familia, especialista) => dispatch({ tipo: 'PROMOVER_FAMILIA', familia, especialista })
}

/** Seletor unico reusado em Consulta/Lote/Painel: aplica as promocoes da sessao sobre os
 * itens reais do export, sem mutar os dados originais. Nivel 2 -> 1 quando a familia foi
 * promovida nesta sessao (o "seu conhecimento virou regra" em efeito imediato). */
export function aplicarPromocoes(itens: Item[], familiasPromovidas: Record<string, PromocaoFamilia>): Item[] {
  if (Object.keys(familiasPromovidas).length === 0) return itens
  return itens.map(item =>
    item.familia && item.nivel === 2 && familiasPromovidas[item.familia]
      ? { ...item, nivel: 1 }
      : item,
  )
}

export function aplicarPromocoesFamilias(
  familias: Record<string, Familia>, familiasPromovidas: Record<string, PromocaoFamilia>,
): Record<string, Familia> {
  if (Object.keys(familiasPromovidas).length === 0) return familias
  const saida: Record<string, Familia> = {}
  for (const [nome, fam] of Object.entries(familias)) {
    if (familiasPromovidas[nome] && !fam.confiavel) {
      saida[nome] = {
        ...fam, confiavel: true,
        n_nivel_1: fam.n_nivel_1 + fam.n_nivel_2, n_nivel_2: 0, n_promoviveis: 0,
      }
    } else {
      saida[nome] = fam
    }
  }
  return saida
}
