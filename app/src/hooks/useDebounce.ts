import { useEffect, useState } from 'react'

export function useDebounce<T>(valor: T, atrasoMs: number = 150): T {
  const [valorAtrasado, setValorAtrasado] = useState<T>(valor)

  useEffect(() => {
    const timer = setTimeout(() => setValorAtrasado(valor), atrasoMs)
    return () => clearTimeout(timer)
  }, [valor, atrasoMs])

  return valorAtrasado
}
