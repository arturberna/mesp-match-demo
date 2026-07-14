import { useState, type DragEvent } from 'react'
import { Button } from '@/components/Button'
import styles from './ZonaUpload.module.css'

interface ZonaUploadProps {
  onEnviar: () => void
}

/** Upload simulado (DD2): qualquer arquivo solto ou o botao "usar planilha de exemplo"
 * dispara a mesma encenacao de processamento -- o conteudo do arquivo nunca e lido. */
export function ZonaUpload({ onEnviar }: ZonaUploadProps) {
  const [arrastando, setArrastando] = useState(false)

  function aoSoltar(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setArrastando(false)
    if (e.dataTransfer.files.length > 0) onEnviar()
  }

  return (
    <div>
      <div
        className={`${styles.zona} ${arrastando ? styles.arrastando : ''}`}
        onDragOver={e => {
          e.preventDefault()
          setArrastando(true)
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={aoSoltar}
        onClick={onEnviar}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onEnviar()
          }
        }}
      >
        ⬆ Arraste a planilha de itens aqui (.xlsx)
        <span className={styles.dica}>modelo SNEAELIS: Nome do Material · Descrição · Cotação</span>
      </div>
      <div className={styles.acoes}>
        <Button variant="secondary" onClick={onEnviar}>Usar planilha de exemplo</Button>
      </div>
    </div>
  )
}
