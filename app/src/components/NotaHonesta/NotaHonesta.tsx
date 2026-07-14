import type { ReactNode } from 'react'
import styles from './NotaHonesta.module.css'

interface NotaHonestaProps {
  tipo?: 'info' | 'alerta' | 'discreta'
  children: ReactNode
}

/** Callout para os momentos de transparencia (SPEC-D02): faixa larga, base fraca,
 * "nao sei", cotacao fora da faixa. A honestidade fica visivel, nunca escondida. */
export function NotaHonesta({ tipo = 'info', children }: NotaHonestaProps) {
  const classe = tipo === 'alerta' ? styles.alerta : tipo === 'discreta' ? styles.discreta : ''
  return <div className={`${styles.nota} ${classe}`}>{children}</div>
}
