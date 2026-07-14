import { useEffect, useState } from 'react'

export type Tema = 'light' | 'dark'

const CHAVE = 'mesp-precos:tema'

function temaInicial(): Tema {
  const salvo = localStorage.getItem(CHAVE)
  if (salvo === 'light' || salvo === 'dark') return salvo
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Preferencia de tema claro/escuro do usuario (nao e escrita simulada -- persistir em
 * localStorage aqui e correto, diferente do estado de sessao da demo em SessaoContext). */
export function useTema(): [Tema, () => void] {
  const [tema, setTema] = useState<Tema>(temaInicial)

  useEffect(() => {
    document.documentElement.dataset.theme = tema
    localStorage.setItem(CHAVE, tema)
  }, [tema])

  const alternar = () => setTema(t => (t === 'light' ? 'dark' : 'light'))
  return [tema, alternar]
}
