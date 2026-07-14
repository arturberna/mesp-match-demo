import { useEffect, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import styles from './ProgressoEtapas.module.css'

const ETAPAS = [
  { rotulo: 'Lendo a planilha', descricao: '883 itens em texto livre, do jeito que já existe hoje.' },
  { rotulo: 'Organizando por famílias', descricao: 'cada item entra no corredor certo do catálogo.' },
  { rotulo: 'Conferindo o detalhe que não pode errar', descricao: 'peso, modalidade, tamanho -- o que decide o encontro.' },
  { rotulo: 'Calculando preços e faixas', descricao: 'preço típico e faixa do aceitável, com os fora da curva excluídos e registrados.' },
  { rotulo: 'Montando a memória de cálculo', descricao: 'cada preço fica com a prova por trás, pronta para o processo.' },
]

const DURACAO_POR_ETAPA_MS = 700

interface ProgressoEtapasProps {
  onConcluido: () => void
}

/** Processamento teatral honesto (SPEC-D05): as etapas SAO as fases reais do pipeline
 * (parser -> familia -> validacao -> preco -> relatorio) em linguagem leiga -- ensina o
 * funil enquanto diverte. prefers-reduced-motion vira progresso instantaneo. */
export function ProgressoEtapas({ onConcluido }: ProgressoEtapasProps) {
  const reduzido = useReducedMotion()
  const [etapaAtual, setEtapaAtual] = useState(reduzido ? ETAPAS.length - 1 : 0)

  useEffect(() => {
    if (reduzido) {
      const t = setTimeout(onConcluido, 0)
      return () => clearTimeout(t)
    }

    const intervalo = setInterval(() => {
      setEtapaAtual(atual => {
        if (atual >= ETAPAS.length - 1) {
          clearInterval(intervalo)
          setTimeout(onConcluido, DURACAO_POR_ETAPA_MS)
          return atual
        }
        return atual + 1
      })
    }, DURACAO_POR_ETAPA_MS)

    return () => clearInterval(intervalo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduzido])

  return (
    <div className={styles.grade} aria-live="polite">
      {ETAPAS.map((etapa, i) => (
        <div
          key={etapa.rotulo}
          className={`${styles.passo} ${i === etapaAtual ? styles.ativo : ''} ${i < etapaAtual || reduzido ? styles.concluido : ''}`}
        >
          <div className={styles.numero}>{i + 1}</div>
          <span className={styles.rotulo}>{etapa.rotulo}</span>
          <span className={styles.descricao}>{etapa.descricao}</span>
        </div>
      ))}
    </div>
  )
}
