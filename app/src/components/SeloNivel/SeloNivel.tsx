import { useId } from 'react'
import type { Nivel } from '@/types'
import { EXPLICACAO_NIVEL, ROTULO_NIVEL, SIMBOLO_NIVEL } from '@/lib/niveis'
import styles from './SeloNivel.module.css'

interface SeloNivelProps {
  nivel: Nivel
  className?: string
}

const CLASSE_NIVEL: Record<Nivel, string> = { 1: 'n1', 2: 'n2', 3: 'n3', 4: 'n4' }

/** Pill de nivel de confianca -- SEMPRE com rotulo textual, nunca so cor (paleta
 * validada para daltonismo, mas a regra vale de qualquer forma). Tooltip com a
 * explicacao leiga (SPEC-D02). */
export function SeloNivel({ nivel, className }: SeloNivelProps) {
  const dicaId = useId()

  return (
    <span
      className={`${styles.wrapper} ${className ?? ''}`}
      tabIndex={0}
      aria-describedby={dicaId}
      aria-label={`Nível ${nivel}, ${ROTULO_NIVEL[nivel]}: ${EXPLICACAO_NIVEL[nivel]}`}
    >
      <span className={`${styles.selo} ${styles[CLASSE_NIVEL[nivel]]}`} aria-hidden="true">
        {SIMBOLO_NIVEL[nivel]} {ROTULO_NIVEL[nivel]}
      </span>
      <span id={dicaId} role="tooltip" className={styles.dica}>
        {EXPLICACAO_NIVEL[nivel]}
      </span>
    </span>
  )
}
