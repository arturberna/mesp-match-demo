import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Search } from 'react-bootstrap-icons'
import { useDados } from '@/contexts/DadosContext'
import { useSessao, usePromoverFamilia, aplicarPromocoesFamilias } from '@/contexts/SessaoContext'
import { Input } from '@/components/Input'
import { SegmentedControl } from '@/components/SegmentedControl'
import { Drawer } from '@/components/Drawer'
import { CardFamilia } from '@/features/familias/components/CardFamilia'
import { DetalheFamilia } from '@/features/familias/components/DetalheFamilia'
import { normalizarTexto } from '@/lib/normalizar'
import styles from './FamiliasPage.module.css'

type FiltroEstado = 'todos' | 'validada' | 'aguardando'

export function FamiliasPage() {
  const { dados, carregando, erro } = useDados()
  const { familiasPromovidas } = useSessao()
  const promoverFamilia = usePromoverFamilia()
  const { slug } = useParams()
  const navigate = useNavigate()

  const [busca, setBusca] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos')

  const familias = useMemo(
    () => (dados ? aplicarPromocoesFamilias(dados.familias, familiasPromovidas) : {}),
    [dados, familiasPromovidas],
  )

  const listaOrdenada = useMemo(() => {
    const buscaNorm = normalizarTexto(busca)
    return Object.entries(familias)
      .filter(([nome, fam]) => {
        if (filtroEstado === 'validada' && !fam.confiavel) return false
        if (filtroEstado === 'aguardando' && fam.confiavel) return false
        if (buscaNorm && !normalizarTexto(nome).includes(buscaNorm)) return false
        return true
      })
      .sort((a, b) => b[1].n_promoviveis - a[1].n_promoviveis)
  }, [familias, filtroEstado, busca])

  if (carregando) return <p>Carregando dados reais do piloto...</p>
  if (erro || !dados) return <p>Não foi possível carregar os dados: {erro}</p>

  const familiaAberta = slug && familias[slug] ? { nome: slug, familia: familias[slug] } : null
  const itensDaFamiliaAberta = familiaAberta
    ? dados.itens.filter(it => it.familia === familiaAberta.nome)
    : []

  return (
    <div className={styles.pagina}>
      <p className={styles.intro}>
        Cada família de material tem <b>o detalhe que não pode errar</b>. O sistema aplica a regra; quem
        escreve a regra é o especialista. Uma validação promove a família inteira -- para sempre.
      </p>

      <div className={styles.controles}>
        <div className={styles.buscaCampo}>
          <Input placeholder="Buscar família..." iconeEsquerda={<Search size={14} />} value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        <SegmentedControl<FiltroEstado>
          rotulo="Estado:"
          valor={filtroEstado}
          onChange={setFiltroEstado}
          opcoes={[
            { valor: 'todos', rotulo: 'Todos' },
            { valor: 'aguardando', rotulo: 'Aguardando especialista' },
            { valor: 'validada', rotulo: 'Validada' },
          ]}
        />
      </div>

      <div className={styles.grade}>
        {listaOrdenada.map(([nome, fam]) => (
          <CardFamilia key={nome} nome={nome} familia={fam} onAbrir={() => navigate(`/familias/${nome}`)} />
        ))}
      </div>

      <Drawer
        aberto={familiaAberta != null}
        onFechar={() => navigate('/familias')}
        titulo={familiaAberta?.nome.replace(/_/g, ' ')}
      >
        {familiaAberta && (
          <DetalheFamilia
            nome={familiaAberta.nome}
            familia={familiaAberta.familia}
            itensFamilia={itensDaFamiliaAberta}
            promocao={familiasPromovidas[familiaAberta.nome]}
            onPromover={especialista => promoverFamilia(familiaAberta.nome, especialista)}
          />
        )}
      </Drawer>
    </div>
  )
}
