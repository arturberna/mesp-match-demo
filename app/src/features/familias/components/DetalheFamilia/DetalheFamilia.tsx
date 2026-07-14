import { useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import type { Familia, Item } from '@/types'
import type { PromocaoFamilia } from '@/contexts/SessaoContext'
import { Chip } from '@/components/Chip'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { SeloNivel } from '@/components/SeloNivel'
import { NotaHonesta } from '@/components/NotaHonesta'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { formatarData } from '@/lib/formato'
import styles from './DetalheFamilia.module.css'

interface DetalheFamiliaProps {
  nome: string
  familia: Familia
  itensFamilia: Item[]
  promocao?: PromocaoFamilia
  onPromover: (especialista: string) => void
}

type Marca = 'confere' | 'nao_confere'

function previewAtributo(atributo: string, tipo: 'crítico' | 'secundário', acao: 'adicionar' | 'remover'): string {
  if (tipo === 'crítico') {
    return acao === 'adicionar'
      ? `Com "${atributo}" como detalhe crítico, dois itens só vão se encontrar se o ${atributo} for igual.`
      : `Sem "${atributo}" como detalhe crítico, o sistema deixa de exigir que o ${atributo} seja igual para considerar um encontro.`
  }
  return acao === 'adicionar'
    ? `"${atributo}" passa a pesar na comparação, mas sozinho não impede um encontro.`
    : `"${atributo}" deixa de pesar na comparação.`
}

export function DetalheFamilia({ nome, familia, itensFamilia, promocao, onPromover }: DetalheFamiliaProps) {
  const [criticos, setCriticos] = useState(familia.atributos_criticos)
  const [secundarios, setSecundarios] = useState(familia.atributos_secundarios)
  const [sinonimos, setSinonimos] = useState(familia.sinonimos)
  const [novoCritico, setNovoCritico] = useState('')
  const [novoSecundario, setNovoSecundario] = useState('')
  const [novoSinonimo, setNovoSinonimo] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [conferencias, setConferencias] = useState<Record<number, Marca>>({})
  const [especialista, setEspecialista] = useState('')
  const amostraRef = useRef<HTMLDivElement>(null)
  const reduzido = useReducedMotion()

  const amostra = useMemo(
    () => itensFamilia.filter(it => it.casou_com).slice(0, 8),
    [itensFamilia],
  )
  const conferenciaCompleta = amostra.length > 0 && amostra.every(it => conferencias[it.id])
  const podePromover = !familia.confiavel && conferenciaCompleta && especialista.trim().length > 0

  function marcar(id: number, marca: Marca) {
    setConferencias(prev => ({ ...prev, [id]: marca }))
  }

  function promover() {
    onPromover(especialista.trim())
    if (!reduzido && amostraRef.current) {
      const selos = amostraRef.current.querySelectorAll('[data-selo]')
      gsap.fromTo(selos, { scale: 1 }, { scale: 1.15, duration: 0.25, stagger: 0.06, yoyo: true, repeat: 1, ease: 'power1.inOut' })
    }
  }

  return (
    <div>
      <div className={styles.secao}>
        <h3 className={styles.tituloSecao}>Regras da família</h3>

        <div className={styles.grupoAtributos}>
          <span className={styles.grupoRotulo}>O detalhe que não pode errar (crítico)</span>
          <div className={styles.chips}>
            {criticos.map(attr => (
              <Chip key={attr} onRemover={() => {
                setCriticos(c => c.filter(a => a !== attr))
                setPreview(previewAtributo(attr, 'crítico', 'remover'))
              }} removerRotulo={`Remover ${attr}`}>
                {attr}
              </Chip>
            ))}
          </div>
          <div className={styles.adicionarLinha}>
            <Input placeholder="novo detalhe crítico" value={novoCritico} onChange={e => setNovoCritico(e.target.value)} />
            <Button variant="secondary" size="sm" onClick={() => {
              if (!novoCritico.trim()) return
              setCriticos(c => [...c, novoCritico.trim()])
              setPreview(previewAtributo(novoCritico.trim(), 'crítico', 'adicionar'))
              setNovoCritico('')
            }}>Adicionar</Button>
          </div>
        </div>

        <div className={styles.grupoAtributos}>
          <span className={styles.grupoRotulo}>Detalhes secundários</span>
          <div className={styles.chips}>
            {secundarios.map(attr => (
              <Chip key={attr} onRemover={() => {
                setSecundarios(s => s.filter(a => a !== attr))
                setPreview(previewAtributo(attr, 'secundário', 'remover'))
              }} removerRotulo={`Remover ${attr}`}>
                {attr}
              </Chip>
            ))}
          </div>
          <div className={styles.adicionarLinha}>
            <Input placeholder="novo detalhe secundário" value={novoSecundario} onChange={e => setNovoSecundario(e.target.value)} />
            <Button variant="secondary" size="sm" onClick={() => {
              if (!novoSecundario.trim()) return
              setSecundarios(s => [...s, novoSecundario.trim()])
              setPreview(previewAtributo(novoSecundario.trim(), 'secundário', 'adicionar'))
              setNovoSecundario('')
            }}>Adicionar</Button>
          </div>
        </div>

        <div className={styles.grupoAtributos}>
          <span className={styles.grupoRotulo}>Sinônimos reconhecidos</span>
          <div className={styles.chips}>
            {sinonimos.map(s => (
              <Chip key={s} onRemover={() => setSinonimos(list => list.filter(x => x !== s))} removerRotulo={`Remover ${s}`}>
                {s}
              </Chip>
            ))}
          </div>
          <div className={styles.adicionarLinha}>
            <Input placeholder="nova variante" value={novoSinonimo} onChange={e => setNovoSinonimo(e.target.value)} />
            <Button variant="secondary" size="sm" onClick={() => {
              if (!novoSinonimo.trim()) return
              setSinonimos(list => [...list, novoSinonimo.trim()])
              setNovoSinonimo('')
            }}>Adicionar</Button>
          </div>
        </div>

        {preview && <div className={styles.preview}>{preview}</div>}
      </div>

      {familia.confiavel === false && (
        <div className={styles.secao}>
          <h3 className={styles.tituloSecao}>Amostra de conferência</h3>
          <p>Encontro proposto: descrição da SNEAELIS x descrição encontrada nas compras públicas.</p>
          <div ref={amostraRef}>
            {amostra.map(item => (
              <div key={item.id} className={styles.amostraItem}>
                <div className={styles.amostraColuna}>
                  <span className={styles.amostraRotulo}>SNEAELIS</span>
                  {item.nome}
                  <div data-selo><SeloNivel nivel={item.nivel} /></div>
                </div>
                <div className={styles.amostraColuna}>
                  <span className={styles.amostraRotulo}>Base pública</span>
                  <span className={styles.amostraTextoBase}>{item.casou_com}</span>
                </div>
                <div className={styles.confereBotoes}>
                  <button
                    type="button"
                    className={`${styles.confereBotao} ${conferencias[item.id] === 'confere' ? styles.marcado : ''}`}
                    onClick={() => marcar(item.id, 'confere')}
                  >
                    Confere
                  </button>
                  <button
                    type="button"
                    className={`${styles.confereBotao} ${styles.naoConfereBotao} ${conferencias[item.id] === 'nao_confere' ? styles.marcado : ''}`}
                    onClick={() => marcar(item.id, 'nao_confere')}
                  >
                    Não confere
                  </button>
                </div>
              </div>
            ))}
          </div>

          {promocao ? (
            <div className={styles.registro}>
              Família {nome.replace(/_/g, ' ')} validada por {promocao.especialista} em {formatarData(promocao.em.slice(0, 10))}.
            </div>
          ) : (
            <div className={styles.assinaturaLinha}>
              <Input
                rotulo="Especialista responsável (SNEAELIS)"
                placeholder="Seu nome"
                value={especialista}
                onChange={e => setEspecialista(e.target.value)}
              />
              <Button onClick={promover} disabled={!podePromover}>
                Promover família a Validada
              </Button>
            </div>
          )}
          {!conferenciaCompleta && amostra.length > 0 && !promocao && (
            <NotaHonesta tipo="discreta">Marque Confere/Não confere em todos os itens da amostra para habilitar a validação.</NotaHonesta>
          )}
        </div>
      )}

      {nome === 'vestuario' && (
        <div className={styles.secao}>
          <h3 className={styles.tituloSecao}>Vestuário -- caminho complementar</h3>
          <NotaHonesta>
            A base pública tem poucas compras de vestuário com detalhe (fraqueza conhecida, não escondida).
            O caminho: a pesquisa da própria SNEAELIS, rotulada e datada, entra como fonte complementar oficial.
          </NotaHonesta>
          <p className={styles.grupoRotulo}>Registrar pesquisa própria -- visão de futuro (não implementado nesta demo)</p>
          <Input rotulo="Fonte" placeholder="ex.: cotação direta com fornecedor" disabled />
          <Input rotulo="Data" type="date" disabled />
          <Input rotulo="Critério" placeholder="ex.: tamanho M, tecido piquê" disabled />
          <Input rotulo="Valores observados" placeholder="ex.: R$ 45,00 - R$ 60,00" disabled />
        </div>
      )}

      <p className={styles.avisoProtótipo}>Edições de demonstração -- nada é gravado.</p>
    </div>
  )
}
