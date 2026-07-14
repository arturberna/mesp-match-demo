import { useEffect, useState } from 'react'

/** SPEC-D07: prefers-reduced-motion desliga o gsap e vira mudanca de estado instantanea.
 * Critério de aceitação, não cortesia -- testar explicitamente. */
export function useReducedMotion(): boolean {
  const [reduzido, setReduzido] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setReduzido(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduzido
}
