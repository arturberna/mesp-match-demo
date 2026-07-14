import type { SegmentoNivel } from '@/types'
import styles from './BarraNiveis.module.css'

interface BarraNiveisProps {
  segmentos: SegmentoNivel[]
  onSegmentoClick?: (nivel: SegmentoNivel['nivel']) => void
}

const CLASSE_NIVEL: Record<number, string> = { 1: 'n1', 2: 'n2', 3: 'n3', 4: 'n4' }

/** Os 883 itens como barra de 4 segmentos (SPEC-D06): rotulo direto + leitura leiga,
 * separacao de 2px, clicavel quando onSegmentoClick e passado. */
export function BarraNiveis({ segmentos, onSegmentoClick }: BarraNiveisProps) {
  const total = segmentos.reduce((soma, s) => soma + s.n, 0) || 1

  return (
    <div>
      <div className={styles.barra} role="img" aria-label="Distribuição dos itens por nível de confiança">
        {segmentos.map(seg => {
          const largura = `${(seg.n / total) * 100}%`
          const rotuloCompleto = `Nível ${seg.nivel}, ${seg.rotulo}: ${seg.n} itens -- ${seg.leitura}`
          const props = {
            className: `${styles.segmento} ${styles[CLASSE_NIVEL[seg.nivel]]}`,
            style: { width: largura },
            title: rotuloCompleto,
            'aria-label': rotuloCompleto,
          }
          return onSegmentoClick ? (
            <button key={seg.nivel} type="button" {...props} onClick={() => onSegmentoClick(seg.nivel)} />
          ) : (
            <div key={seg.nivel} {...props} />
          )
        })}
      </div>
      <div className={styles.legenda}>
        {segmentos.map(seg => (
          <span key={seg.nivel} className={styles.legendaItem}>
            <span className={`${styles.ponto} ${styles[CLASSE_NIVEL[seg.nivel]]}`} />
            {seg.rotulo} ({seg.n}) -- {seg.leitura}
          </span>
        ))}
      </div>
    </div>
  )
}
