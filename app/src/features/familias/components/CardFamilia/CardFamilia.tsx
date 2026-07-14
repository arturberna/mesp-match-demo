import { Chip } from '@/components/Chip'
import type { Familia } from '@/types'
import styles from './CardFamilia.module.css'

interface CardFamiliaProps {
  nome: string
  familia: Familia
  onAbrir: () => void
}

export function CardFamilia({ nome, familia, onAbrir }: CardFamiliaProps) {
  return (
    <div
      className={styles.card}
      role="button"
      tabIndex={0}
      aria-label={`Família ${nome.replace(/_/g, ' ')}, ${familia.confiavel ? 'validada' : 'aguardando especialista'}. Abrir detalhe.`}
      onClick={onAbrir}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onAbrir()
        }
      }}
    >
      <span className={`${styles.estado} ${familia.confiavel ? styles.validada : styles.aguardando}`}>
        {familia.confiavel ? '✓ Validada' : 'Aguardando especialista'}
      </span>
      <span className={styles.nome}>{nome.replace(/_/g, ' ')}</span>

      {familia.atributos_criticos.length > 0 && (
        <div className={styles.criticos}>
          {familia.atributos_criticos.map(attr => (
            <Chip key={attr}>{attr}</Chip>
          ))}
        </div>
      )}

      <p className={styles.contadores}>
        <b>{familia.n_itens_sneaelis}</b> itens da SNEAELIS -- Nível 1: <b>{familia.n_nivel_1}</b> ·
        Nível 2: <b>{familia.n_nivel_2}</b> · Nível 3: <b>{familia.n_nivel_3}</b>
      </p>

      {!familia.confiavel && familia.n_promoviveis > 0 && (
        <p className={styles.cta}>Validar esta família → promove {familia.n_promoviveis} itens</p>
      )}
    </div>
  )
}
