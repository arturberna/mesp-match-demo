import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { formatarBRL } from '@/lib/formato'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import styles from './PrecoHero.module.css'

interface PrecoHeroProps {
  valor: number
  nAmostras: number
}

/** Preco tipico em serif grande + subtitulo de amostras (SPEC-D02). Anima a contagem
 * entre valores (~400ms) quando o porte da compra muda -- a resposta visual a objecao
 * "preco justo" (SPEC-D07). */
export function PrecoHero({ valor, nAmostras }: PrecoHeroProps) {
  const precoRef = useRef<HTMLSpanElement>(null)
  const anterior = useRef(valor)
  const reduzido = useReducedMotion()

  useEffect(() => {
    const el = precoRef.current
    if (!el) return

    if (reduzido) {
      el.textContent = formatarBRL(valor)
      anterior.current = valor
      return
    }

    const obj = { v: anterior.current }
    const tween = gsap.to(obj, {
      v: valor, duration: 0.4, ease: 'power2.inOut',
      onUpdate: () => {
        el.textContent = formatarBRL(obj.v)
      },
    })
    anterior.current = valor
    return () => {
      tween.kill()
    }
  }, [valor, reduzido])

  return (
    <div className={styles.linha}>
      <span className={styles.preco}>
        <span ref={precoRef} className="tabular-nums">{formatarBRL(valor)}</span>
        <small>preço típico</small>
      </span>
      <span className={styles.amostras}>{nAmostras} compras públicas reais</span>
    </div>
  )
}
