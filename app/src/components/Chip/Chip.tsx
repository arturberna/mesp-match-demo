import type { ReactNode } from 'react'
import { X } from 'react-bootstrap-icons'
import styles from './Chip.module.css'

interface ChipProps {
  children: ReactNode
  onClick?: () => void
  onRemover?: () => void
  removerRotulo?: string
  className?: string
}

/** Chip clicavel (exemplos de busca, onClick) ou removivel (atributo de familia em
 * edicao simulada, onRemover com botao "x" proprio). Sem os dois, renderiza <span> inerte. */
export function Chip({ children, onClick, onRemover, removerRotulo, className }: ChipProps) {
  const classes = [styles.chip, onRemover ? styles.removivel : '', className ?? ''].filter(Boolean).join(' ')

  if (onRemover) {
    return (
      <span className={classes}>
        {children}
        <button
          type="button"
          className={styles.removerBotao}
          aria-label={removerRotulo ?? 'Remover'}
          onClick={onRemover}
        >
          <X size={12} />
        </button>
      </span>
    )
  }

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {children}
      </button>
    )
  }

  return <span className={classes}>{children}</span>
}
