import { useRef } from 'react'
import { ChevronRight } from 'react-bootstrap-icons'
import gsap from 'gsap'
import type { LinhaMemoria } from '@/types'
import { formatarBRL, formatarData } from '@/lib/formato'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import styles from './MemoriaCalculo.module.css'

interface MemoriaCalculoProps {
  linhas: LinhaMemoria[]
  fontes?: string | null
  periodo?: string | null
}

/** Tabela expansivel de compras individuais (SPEC-D02): linhas excluidas por estarem
 * fora da curva aparecem riscadas, nunca omitidas -- a memoria de calculo e a prova.
 * Ao abrir, as linhas revelam em cascata; as excluidas por ultimo (SPEC-D07 #4). */
export function MemoriaCalculo({ linhas, fontes, periodo }: MemoriaCalculoProps) {
  const corpoRef = useRef<HTMLTableSectionElement>(null)
  const reduzido = useReducedMotion()

  const aoAlternar = (aberto: boolean) => {
    if (!aberto || reduzido || !corpoRef.current) return
    const linhasEl = corpoRef.current.querySelectorAll('tr')
    gsap.fromTo(
      linhasEl,
      { opacity: 0, y: 6 },
      {
        opacity: 1, y: 0, duration: 0.3, ease: 'power1.out',
        stagger: (i: number, target: HTMLTableRowElement) =>
          target.dataset.excluida === 'true' ? 0.03 * i + 0.15 : 0.03 * i,
      },
    )
  }

  return (
    <details className={styles.detalhes} onToggle={e => aoAlternar((e.target as HTMLDetailsElement).open)}>
      <summary className={styles.resumo}>
        <span className={styles.seta}>
          <ChevronRight size={12} />
        </span>
        Memória de cálculo -- a prova, pronta para o processo
      </summary>
      <div className={styles.corpo}>
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>Local</th>
              <th>Data</th>
              <th>Qtde</th>
              <th>Valor unitário</th>
              <th></th>
            </tr>
          </thead>
          <tbody ref={corpoRef}>
            {linhas.map((linha, i) => (
              <tr key={i} className={linha.excluida ? styles.excluida : ''} data-excluida={linha.excluida}>
                <td>{linha.local}</td>
                <td>{formatarData(linha.data)}</td>
                <td>{linha.quantidade ?? '--'}</td>
                <td className="tabular-nums">{linha.valor_unitario != null ? formatarBRL(linha.valor_unitario) : '--'}</td>
                <td>{linha.excluida ? 'fora da curva -- excluído' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(fontes || periodo) && (
          <p className={styles.rodape}>
            Fontes: {fontes ?? '--'} · período {periodo ?? '--'} · preços fora da curva são excluídos do cálculo e mantidos no registro.
          </p>
        )}
      </div>
    </details>
  )
}
