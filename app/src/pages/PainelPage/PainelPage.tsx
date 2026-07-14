import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDados } from '@/contexts/DadosContext'
import { useSessao, aplicarPromocoes, aplicarPromocoesFamilias } from '@/contexts/SessaoContext'
import { calcularSegmentosNivel } from '@/lib/niveis'
import { BarraNiveis } from '@/components/BarraNiveis'
import styles from './PainelPage.module.css'

export function PainelPage() {
  const { dados, carregando, erro } = useDados()
  const { familiasPromovidas } = useSessao()
  const navigate = useNavigate()

  const itensComPromocoes = useMemo(
    () => (dados ? aplicarPromocoes(dados.itens, familiasPromovidas) : []),
    [dados, familiasPromovidas],
  )
  const segmentos = useMemo(() => calcularSegmentosNivel(itensComPromocoes), [itensComPromocoes])
  const familias = useMemo(
    () => (dados ? aplicarPromocoesFamilias(dados.familias, familiasPromovidas) : {}),
    [dados, familiasPromovidas],
  )

  if (carregando) return <p>Carregando dados reais do piloto...</p>
  if (erro || !dados) return <p>Não foi possível carregar os dados: {erro}</p>

  const { painel } = dados
  const nivel1Original = painel.por_nivel.find(s => s.nivel === 1)?.n ?? 0
  const nivel1Atual = segmentos.find(s => s.nivel === 1)?.n ?? 0
  const promovidosNestaSessao = nivel1Atual - nivel1Original

  const validadas = Object.values(familias).filter(f => f.confiavel).length
  const aguardando = Object.keys(familias).length - validadas

  const filaMaiorRetorno = Object.entries(familias)
    .filter(([, f]) => f.n_promoviveis > 0)
    .sort((a, b) => b[1].n_promoviveis - a[1].n_promoviveis)
    .slice(0, 8)

  return (
    <div className={styles.pagina}>
      <div className={styles.heroi}>
        <h2 className={styles.heroiTitulo}>Os 883 itens do piloto</h2>
        <BarraNiveis segmentos={segmentos} onSegmentoClick={nivel => navigate(`/lote?nivel=${nivel}`)} />
        {promovidosNestaSessao > 0 && (
          <p className={styles.efeitoSessao}>
            Nesta demonstração, a conferência de especialista promoveu +{promovidosNestaSessao} itens do
            Nível 2 (Compatível) para o Nível 1 (Confirmado).
          </p>
        )}
      </div>

      <div className={styles.indicadores}>
        <div className={styles.tile}>
          <div className={styles.tileValor}>{painel.pct_com_preco}%</div>
          <div className={styles.tileRotulo}>dos itens com preço de referência</div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileValor}>{Math.round(painel.precisao_nivel_1 * 100)}%</div>
          <div className={styles.tileRotulo}>precisão do Nível 1 (Confirmado)</div>
          <div className={styles.tileNota}>conferido por conferência de especialista em {painel.n_curadoria_nivel_1} itens</div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileValor}>{painel.acima_da_faixa}</div>
          <div className={styles.tileRotulo}>alertas de preço acima da faixa</div>
        </div>
        <div className={styles.tile}>
          <div className={styles.tileValor}>{validadas} / {validadas + aguardando}</div>
          <div className={styles.tileRotulo}>famílias validadas</div>
        </div>
      </div>

      <div className={styles.secao}>
        <h2 className={styles.tituloSecao}>A fila de maior retorno</h2>
        <div className={styles.filaLista}>
          {filaMaiorRetorno.map(([nome, fam]) => (
            <Link key={nome} to={`/familias/${nome}`} className={styles.filaItem}>
              <span className={styles.filaNome}>{nome.replace(/_/g, ' ')}</span>
              <span className={styles.filaPromoviveis}>validar promove {fam.n_promoviveis} itens</span>
            </Link>
          ))}
          {filaMaiorRetorno.length === 0 && <p>Nenhuma família aguardando com itens promovíveis no momento.</p>}
        </div>
      </div>

      <div className={styles.rodapeHonestidade}>
        <p>Abrangência parcial: a amostra cobre o período e as UFs presentes no PNCP e Compras.gov.br disponíveis no piloto -- não é um censo nacional.</p>
        <p>Memória de cálculo por item: fonte, UF, município e período ficam registrados e visíveis na Consulta e no Lote.</p>
        <p>Metodologia: mediana robusta com exclusão motivada de preços fora da curva, ancorada na IN SEGES/ME nº 65/2021.</p>
      </div>
    </div>
  )
}
