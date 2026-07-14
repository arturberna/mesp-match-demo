import { useEffect, useRef, type ReactNode } from 'react'
import { XLg } from 'react-bootstrap-icons'
import styles from './Drawer.module.css'

interface DrawerProps {
  aberto: boolean
  onFechar: () => void
  titulo?: string
  children: ReactNode
}

const SELETOR_FOCAVEL =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Painel lateral (SPEC-D04/D05: detalhe de familia, detalhe de item no lote). Esc
 * fecha, clique no backdrop fecha, foco vai para o painel ao abrir e fica preso nele
 * (Tab/Shift+Tab nao escapam para o conteudo de fundo -- SPEC-D07). */
export function Drawer({ aberto, onFechar, titulo, children }: DrawerProps) {
  const painelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberto) return

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onFechar()
        return
      }
      if (e.key !== 'Tab' || !painelRef.current) return

      const focaveis = painelRef.current.querySelectorAll<HTMLElement>(SELETOR_FOCAVEL)
      if (focaveis.length === 0) return
      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]

      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', aoTeclar)
    document.body.style.overflow = 'hidden'
    painelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = ''
    }
  }, [aberto, onFechar])

  if (!aberto) return null

  return (
    <div
      className={styles.backdrop}
      onClick={e => {
        if (e.target === e.currentTarget) onFechar()
      }}
    >
      <div
        ref={painelRef}
        className={styles.painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titulo ? 'drawer-titulo' : undefined}
        tabIndex={-1}
      >
        <div className={styles.cabecalho}>
          {titulo && (
            <h2 id="drawer-titulo" className={styles.titulo}>
              {titulo}
            </h2>
          )}
          <button type="button" className={styles.fecharBotao} onClick={onFechar} aria-label="Fechar">
            <XLg size={16} />
          </button>
        </div>
        <div className={styles.corpo}>{children}</div>
      </div>
    </div>
  )
}
