import { useMemo, useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowDown, ArrowUp, Search } from 'react-bootstrap-icons'
import type { Item, Nivel } from '@/types'
import { formatarBRL } from '@/lib/formato'
import { normalizarTexto } from '@/lib/normalizar'
import { SeloNivel } from '@/components/SeloNivel'
import { Input } from '@/components/Input'
import { SegmentedControl } from '@/components/SegmentedControl'
import styles from './TabelaRelatorio.module.css'

interface TabelaRelatorioProps {
  itens: Item[]
  onAbrirItem: (item: Item) => void
  filtroNivelInicial?: Nivel
}

type Campo = 'nome' | 'nivel' | 'preco_tipico' | 'n_amostras' | 'cotacao_sneaelis' | 'situacao'

type Situacao = 'acima' | 'abaixo' | 'dentro' | null

function calcularSituacao(item: Item): Situacao {
  if (item.acima_da_faixa) return 'acima'
  if (item.cotacao_sneaelis != null && item.faixa) {
    if (item.cotacao_sneaelis < item.faixa[0]) return 'abaixo'
    return 'dentro'
  }
  return null
}

const ROTULO_SITUACAO: Record<NonNullable<Situacao>, string> = {
  acima: 'acima da faixa', abaixo: 'abaixo da faixa', dentro: 'dentro da faixa',
}

function comparar(a: Item, b: Item, campo: Campo): number {
  if (campo === 'nome') return a.nome.localeCompare(b.nome, 'pt-BR')
  if (campo === 'situacao') return (calcularSituacao(a) ?? '').localeCompare(calcularSituacao(b) ?? '')
  const va = a[campo]
  const vb = b[campo]
  if (va == null && vb == null) return 0
  if (va == null) return 1
  if (vb == null) return -1
  return (va as number) - (vb as number)
}

export function TabelaRelatorio({ itens, onAbrirItem, filtroNivelInicial }: TabelaRelatorioProps) {
  const [busca, setBusca] = useState('')
  const [filtroNivel, setFiltroNivel] = useState<'todos' | Nivel>(filtroNivelInicial ?? 'todos')
  const [ordenarPor, setOrdenarPor] = useState<Campo>('nivel')
  const [ordemAsc, setOrdemAsc] = useState(true)

  const buscaNorm = normalizarTexto(busca)

  const filtrados = useMemo(() => {
    let resultado = itens
    if (filtroNivel !== 'todos') resultado = resultado.filter(it => it.nivel === filtroNivel)
    if (buscaNorm) resultado = resultado.filter(it => normalizarTexto(it.nome).includes(buscaNorm))
    const ordenados = [...resultado].sort((a, b) => comparar(a, b, ordenarPor) * (ordemAsc ? 1 : -1))
    return ordenados
  }, [itens, filtroNivel, buscaNorm, ordenarPor, ordemAsc])

  function alternarOrdenacao(campo: Campo) {
    if (campo === ordenarPor) {
      setOrdemAsc(a => !a)
    } else {
      setOrdenarPor(campo)
      setOrdemAsc(true)
    }
  }

  const parentRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line react-hooks/incompatible-library -- sem plugin babel do React Compiler no projeto
  const virtualizer = useVirtualizer({
    count: filtrados.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 12,
  })

  function cabecalhoOrdenavel(campo: Campo, rotulo: string, numerica = false) {
    return (
      <button type="button" className={`${styles.cabecalhoBotao} ${numerica ? styles.numerica : ''}`} onClick={() => alternarOrdenacao(campo)}>
        {rotulo}
        {ordenarPor === campo && (ordemAsc ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
      </button>
    )
  }

  return (
    <div>
      <div className={styles.controles}>
        <div className={styles.buscaCampo}>
          <Input placeholder="Buscar por nome..." iconeEsquerda={<Search size={14} />} value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        <SegmentedControl<'todos' | `${Nivel}`>
          rotulo="Nível:"
          valor={filtroNivel === 'todos' ? 'todos' : (`${filtroNivel}` as `${Nivel}`)}
          onChange={v => setFiltroNivel(v === 'todos' ? 'todos' : (Number(v) as Nivel))}
          opcoes={[
            { valor: 'todos', rotulo: 'Todos' },
            { valor: '1', rotulo: '1' }, { valor: '2', rotulo: '2' },
            { valor: '3', rotulo: '3' }, { valor: '4', rotulo: '4' },
          ]}
        />
        <span className={styles.contagem}>{filtrados.length} de {itens.length} itens</span>
      </div>

      <div className={styles.colunas}>
        <div className={styles.cabecalho} role="row">
          <div role="columnheader">{cabecalhoOrdenavel('nome', 'Nome')}</div>
          <div role="columnheader">{cabecalhoOrdenavel('nivel', 'Nível')}</div>
          <div role="columnheader">{cabecalhoOrdenavel('preco_tipico', 'Preço típico', true)}</div>
          <div role="columnheader">Faixa</div>
          <div role="columnheader">{cabecalhoOrdenavel('n_amostras', 'N amostras', true)}</div>
          <div role="columnheader">{cabecalhoOrdenavel('cotacao_sneaelis', 'cotação da SNEAELIS', true)}</div>
          <div role="columnheader">{cabecalhoOrdenavel('situacao', 'Situação')}</div>
        </div>

        <div ref={parentRef} className={styles.scroller} role="table" aria-label="Relatório de cotação em lote">
          <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
            {virtualizer.getVirtualItems().map(linhaVirtual => {
              const item = filtrados[linhaVirtual.index]
              const situacao = calcularSituacao(item)
              return (
                <div
                  key={item.id}
                  role="row"
                  tabIndex={0}
                  className={styles.linha}
                  aria-label={`${item.nome}, nível ${item.nivel}. Abrir detalhe.`}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: linhaVirtual.size, transform: `translateY(${linhaVirtual.start}px)` }}
                  onClick={() => onAbrirItem(item)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') onAbrirItem(item)
                  }}
                >
                  <div role="cell" className={styles.celula}>{item.nome}</div>
                  <div role="cell"><SeloNivel nivel={item.nivel} /></div>
                  <div role="cell" className={item.preco_tipico != null ? styles.numericaCelula : `${styles.numericaCelula} ${styles.semPreco}`}>
                    {item.preco_tipico != null ? formatarBRL(item.preco_tipico) : '--'}
                  </div>
                  <div role="cell" className={styles.celula}>
                    {item.faixa ? `${formatarBRL(item.faixa[0])} - ${formatarBRL(item.faixa[1])}` : '--'}
                  </div>
                  <div role="cell" className={styles.numericaCelula}>{item.n_amostras || '--'}</div>
                  <div role="cell" className={styles.numericaCelula}>
                    {item.cotacao_sneaelis != null ? formatarBRL(item.cotacao_sneaelis) : '--'}
                  </div>
                  <div role="cell" className={situacao ? styles[`situacao${situacao[0].toUpperCase()}${situacao.slice(1)}`] : ''}>
                    {situacao ? ROTULO_SITUACAO[situacao] : '--'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
