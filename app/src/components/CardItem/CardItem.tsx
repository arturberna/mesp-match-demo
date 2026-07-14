import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { FaixaPorte, Item, LinhaMemoria, PorteItem } from '@/types'
import { ROTULO_PORTE } from '@/types'
import { SeloNivel } from '@/components/SeloNivel'
import { PrecoHero } from '@/components/PrecoHero'
import { FaixaPreco } from '@/components/FaixaPreco'
import { MemoriaCalculo } from '@/components/MemoriaCalculo'
import { NotaHonesta } from '@/components/NotaHonesta'
import { SegmentedControl } from '@/components/SegmentedControl'
import { EXPLICACAO_NIVEL } from '@/lib/niveis'
import { formatarBRL } from '@/lib/formato'
import styles from './CardItem.module.css'

interface CardItemProps {
  item: Item
  amostras?: LinhaMemoria[]
  porte?: PorteItem
  consultaTexto?: string
}

type OpcaoPorte = 'geral' | FaixaPorte

export function CardItem({ item, amostras = [], porte, consultaTexto }: CardItemProps) {
  const opcoesPorte = (Object.keys(porte ?? {}) as FaixaPorte[])
  const [porteAtivo, setPorteAtivo] = useState<OpcaoPorte>('geral')

  const cabecalho = (
    <div className={styles.cabecalho}>
      <div className={styles.consulta}>
        {consultaTexto ? (
          <>
            Você buscou<b>{consultaTexto}</b>
          </>
        ) : (
          <b>{item.nome}</b>
        )}
      </div>
      <SeloNivel nivel={item.nivel} />
    </div>
  )

  if (item.nivel === 4 || item.preco_tipico == null || item.faixa == null) {
    return (
      <div className={styles.card}>
        {cabecalho}
        <div className={styles.semPreco}>
          <NotaHonesta tipo="alerta">{EXPLICACAO_NIVEL[4]}</NotaHonesta>
          <NotaHonesta tipo="discreta">
            Este item entra na fila de famílias a incluir. <Link to="/familias">Ver famílias</Link>.
          </NotaHonesta>
        </div>
      </div>
    )
  }

  const estatisticaAtiva = porteAtivo !== 'geral' ? porte?.[porteAtivo] : undefined
  const tipico = estatisticaAtiva?.mediana ?? item.preco_tipico
  const [p25, p75] = estatisticaAtiva ? [estatisticaAtiva.p25, estatisticaAtiva.p75] : item.faixa
  const nAmostras = estatisticaAtiva?.n ?? item.n_amostras
  const voce = porteAtivo === 'geral' ? item.cotacao_sneaelis : null

  let notaComparacao: { tipo: 'alerta' | 'info'; texto: string } | null = null
  if (voce != null) {
    if (voce > item.faixa[1]) {
      notaComparacao = { tipo: 'alerta', texto: `cotação da SNEAELIS atual (${formatarBRL(voce)}) está acima da faixa pública -- referência a revisar.` }
    } else if (voce < item.faixa[0]) {
      notaComparacao = { tipo: 'info', texto: `cotação da SNEAELIS atual (${formatarBRL(voce)}) está abaixo da faixa pública -- referência possivelmente defasada.` }
    }
  }

  return (
    <div className={styles.card}>
      {cabecalho}
      <div className={styles.corpo}>
        {item.casou_com && (
          <div className={styles.casouCom}>
            Encontrado nas compras públicas: <span className={styles.casouComTexto}>{item.casou_com}</span>
          </div>
        )}

        {opcoesPorte.length >= 2 && (
          <SegmentedControl<OpcaoPorte>
            rotulo="Porte da compra:"
            valor={porteAtivo}
            onChange={setPorteAtivo}
            opcoes={[
              { valor: 'geral', rotulo: 'Todas as compras' },
              ...opcoesPorte.map(chave => ({ valor: chave, rotulo: ROTULO_PORTE[chave] })),
            ]}
          />
        )}

        <PrecoHero valor={tipico} nAmostras={nAmostras} />
        <FaixaPreco p25={p25} p75={p75} tipico={tipico} voce={voce} />

        {notaComparacao && <NotaHonesta tipo={notaComparacao.tipo}>{notaComparacao.texto}</NotaHonesta>}

        {item.familia === 'vestuario' && (
          <NotaHonesta>
            A base pública tem poucas compras de vestuário com detalhe -- a faixa mistura tamanhos e
            tecidos. É aqui que a conferência de especialista transforma Compatível em Confirmado.
          </NotaHonesta>
        )}
        {item.nivel === 3 && (
          <NotaHonesta tipo="discreta">Ordem de grandeza, achado por semelhança de texto -- confira antes de usar.</NotaHonesta>
        )}

        {amostras.length > 0 ? (
          <MemoriaCalculo linhas={amostras} fontes={item.fontes} periodo={item.periodo} />
        ) : (
          <NotaHonesta tipo="discreta">
            Memória de cálculo detalhada não disponível para este item -- os números acima já são o
            agregado real do relatório.
          </NotaHonesta>
        )}
      </div>
    </div>
  )
}
