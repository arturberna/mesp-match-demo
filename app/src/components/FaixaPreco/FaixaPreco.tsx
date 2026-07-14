import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { formatarBRL } from '@/lib/formato'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import styles from './FaixaPreco.module.css'

interface FaixaPrecoProps {
  p25: number
  p75: number
  tipico: number
  voce?: number | null
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function calcularEscala(p25: number, p75: number, voce?: number | null): [number, number] {
  const min = Math.min(p25, voce ?? p25)
  const max = Math.max(p75, voce ?? p75)
  const pad = (max - min) * 0.15 || max * 0.15 || 10
  return [Math.max(0, min - pad), max + pad]
}

function pct(v: number, [min, max]: [number, number]): number {
  return clamp(((v - min) / (max - min)) * 100, 1, 99)
}

/** A visualizacao-assinatura do produto (SPEC-D02/D03): trilho + banda p25-p75 +
 * marcador do preco tipico + marcador opcional "sua cotacao". Anima a transicao entre
 * valores (troca de porte da compra e a melhor animacao da demo -- SPEC-D07). */
export function FaixaPreco({ p25, p75, tipico, voce }: FaixaPrecoProps) {
  const bandaRef = useRef<HTMLDivElement>(null)
  const marcadorRef = useRef<HTMLDivElement>(null)
  const rotuloTipicoRef = useRef<HTMLDivElement>(null)
  const marcadorVoceRef = useRef<HTMLDivElement>(null)
  const reduzido = useReducedMotion()

  const escala = calcularEscala(p25, p75, voce)
  const posP25 = pct(p25, escala)
  const posP75 = pct(p75, escala)
  const posTipico = pct(tipico, escala)
  const posVoce = voce != null ? pct(voce, escala) : null

  useEffect(() => {
    const alvos = [
      [bandaRef.current, { left: `${posP25}%`, width: `${posP75 - posP25}%` }],
      [marcadorRef.current, { left: `${posTipico}%` }],
      [rotuloTipicoRef.current, { left: `${posTipico}%` }],
    ] as const

    if (reduzido) {
      alvos.forEach(([el, vars]) => el && gsap.set(el, vars))
    } else {
      alvos.forEach(([el, vars]) => el && gsap.to(el, { ...vars, duration: 0.4, ease: 'power2.inOut' }))
    }

    if (marcadorVoceRef.current && posVoce != null) {
      const vars = { left: `${posVoce}%` }
      if (reduzido) {
        gsap.set(marcadorVoceRef.current, vars)
      } else {
        gsap.to(marcadorVoceRef.current, { ...vars, duration: 0.4, ease: 'power2.inOut' })
      }
    }
  }, [posP25, posP75, posTipico, posVoce, reduzido])

  return (
    <div className={styles.faixa} aria-label={`Faixa do aceitável: de ${formatarBRL(p25)} a ${formatarBRL(p75)}, preço típico ${formatarBRL(tipico)}`}>
      <div className={styles.trilho} />
      <div ref={bandaRef} className={styles.banda} style={{ left: `${posP25}%`, width: `${posP75 - posP25}%` }} />
      <div ref={marcadorRef} className={styles.marcador} style={{ left: `${posTipico}%` }} />
      <div ref={rotuloTipicoRef} className={styles.rotuloTipico} style={{ left: `${posTipico}%` }}>
        típico {formatarBRL(tipico)}
      </div>
      <div className={styles.rotuloExtremo} style={{ left: `${posP25}%` }}>{formatarBRL(p25)}</div>
      <div className={styles.rotuloExtremo} style={{ left: `${posP75}%` }}>{formatarBRL(p75)}</div>
      {posVoce != null && (
        <>
          <div ref={marcadorVoceRef} className={`${styles.marcador} ${styles.marcadorVoce}`} style={{ left: `${posVoce}%` }} />
          <div className={styles.rotuloVoce} style={{ left: `${posVoce}%` }}>cotação da SNEAELIS</div>
        </>
      )}
    </div>
  )
}
