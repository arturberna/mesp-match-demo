import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Download } from 'react-bootstrap-icons'
import { useDados } from '@/contexts/DadosContext'
import { useSessao, aplicarPromocoes } from '@/contexts/SessaoContext'
import { calcularSegmentosNivel } from '@/lib/niveis'
import { BarraNiveis } from '@/components/BarraNiveis'
import { CardItem } from '@/components/CardItem'
import { Drawer } from '@/components/Drawer'
import { ZonaUpload } from '@/features/lote/components/ZonaUpload'
import { ProgressoEtapas } from '@/features/lote/components/ProgressoEtapas'
import { TabelaRelatorio } from '@/features/lote/components/TabelaRelatorio'
import type { Item, Nivel } from '@/types'
import styles from './LotePage.module.css'

type Estado = 'ocioso' | 'processando' | 'pronto'

export function LotePage() {
  const { dados, carregando, erro } = useDados()
  const { familiasPromovidas } = useSessao()
  const [searchParams] = useSearchParams()
  const nivelFiltro = searchParams.get('nivel')
  // Chegar da barra de niveis do Painel (SPEC-D06 #2) ja mostra o relatorio filtrado,
  // sem exigir que o usuario repita a encenacao de upload.
  const [estado, setEstado] = useState<Estado>(nivelFiltro ? 'pronto' : 'ocioso')
  const [itemAberto, setItemAberto] = useState<Item | null>(null)

  const itensComPromocoes = useMemo(
    () => (dados ? aplicarPromocoes(dados.itens, familiasPromovidas) : []),
    [dados, familiasPromovidas],
  )
  const segmentos = useMemo(() => calcularSegmentosNivel(itensComPromocoes), [itensComPromocoes])
  const comPreco = itensComPromocoes.filter(it => it.preco_tipico != null).length
  const acimaDaFaixa = itensComPromocoes.filter(it => it.acima_da_faixa).length

  if (carregando) return <p>Carregando dados reais do piloto...</p>
  if (erro || !dados) return <p>Não foi possível carregar os dados: {erro}</p>

  return (
    <div className={styles.pagina}>
      <p className={styles.intro}>
        A planilha de itens entra de manhã. O relatório sai antes do café -- com um preço e um selo de
        confiança por item.
      </p>

      {estado === 'ocioso' && <ZonaUpload onEnviar={() => setEstado('processando')} />}

      {estado === 'processando' && <ProgressoEtapas onConcluido={() => setEstado('pronto')} />}

      {estado === 'pronto' && (
        <>
          <div className={styles.resumo}>
            <div className={styles.resumoLinha}>
              <div className={styles.stat}>
                <span className={styles.statValor}>{itensComPromocoes.length}</span>
                <span className={styles.statRotulo}>itens processados</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValor}>{Math.round((100 * comPreco) / itensComPromocoes.length)}%</span>
                <span className={styles.statRotulo}>com preço</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValor}>{acimaDaFaixa}</span>
                <span className={styles.statRotulo}>alertas acima da faixa</span>
              </div>
            </div>
            <BarraNiveis segmentos={segmentos} />
          </div>

          <TabelaRelatorio itens={itensComPromocoes} onAbrirItem={setItemAberto} filtroNivelInicial={nivelFiltro ? (Number(nivelFiltro) as Nivel) : undefined} />

          <div className={styles.rodapeAcoes}>
            <a href="/dados/relatorio_sneaelis.xlsx" download className={styles.exportarLink}>
              <Download size={14} /> Exportar relatório (.xlsx)
            </a>
          </div>
        </>
      )}

      <Drawer aberto={itemAberto != null} onFechar={() => setItemAberto(null)} titulo={itemAberto?.nome}>
        {itemAberto && (
          <CardItem
            item={itemAberto}
            amostras={dados.amostras[String(itemAberto.id)]}
            porte={dados.porte[String(itemAberto.id)]}
          />
        )}
      </Drawer>
    </div>
  )
}
