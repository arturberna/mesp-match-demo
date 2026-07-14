import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  rotulo?: string
  dica?: string
  erro?: string
  iconeEsquerda?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { rotulo, dica, erro, iconeEsquerda, className, id, ...props },
  ref,
) {
  const inputId = id ?? rotulo?.toLowerCase().replace(/\s+/g, '-')
  const inputClasses = [styles.input, iconeEsquerda ? styles.comIconeEsquerda : '', className ?? '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.wrapper}>
      {rotulo && (
        <label htmlFor={inputId} className={styles.rotulo}>
          {rotulo}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {iconeEsquerda && <span className={styles.iconeEsquerda}>{iconeEsquerda}</span>}
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={!!erro}
          aria-describedby={erro ? `${inputId}-erro` : dica ? `${inputId}-dica` : undefined}
          {...props}
        />
      </div>
      {dica && !erro && (
        <span id={`${inputId}-dica`} className={styles.dica}>
          {dica}
        </span>
      )}
      {erro && (
        <span id={`${inputId}-erro`} className={styles.erro} role="alert">
          {erro}
        </span>
      )}
    </div>
  )
})
