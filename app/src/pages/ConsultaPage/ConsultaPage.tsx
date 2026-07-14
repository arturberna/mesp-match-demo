import { useMemo, useState } from 'react'
import { Search } from 'react-bootstrap-icons'
import { useDados } from '@/contexts/DadosContext'
import { useSessao, aplicarPromocoes } from '@/contexts/SessaoContext'
import { useBusca } from '@/hooks/useBusca'
import { useDebounce } from '@/hooks/useDebounce'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { SeloNivel } from '@/components/SeloNivel'
import { CardItem } from '@/components/CardItem'
import styles from './ConsultaPage.module.css'

const EXEMPLOS = ['anilha 10kg', 'bambolê', 'aparador de chute', 'camisa gola polo']

export function ConsultaPage() {
  const { dados, carregando, erro } = useDados()
  const { familiasPromovidas } = useSessao()
  const [texto, setTexto] = useState('')
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const [consultaAtiva, setConsultaAtiva] = useState(EXEMPLOS[0])
  const textoDebounced = useDebounce(texto)

  const itensComPromocoes = useMemo(
    () => (dados ? aplicarPromocoes(dados.itens, familiasPromovidas) : []),
    [dados, familiasPromovidas],
  )
  const { buscar } = useBusca(itensComPromocoes, dados?.buscaIndice ?? [])

  const sugestoes = useMemo(
    () => (mostrarSugestoes && textoDebounced.trim() ? buscar(textoDebounced, 8) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [textoDebounced, mostrarSugestoes, itensComPromocoes],
  )

  // Resultado derivado da consulta ativa -- nunca sincronizado via effect (evita
  // cascata de renders); a busca client-side e barata o bastante para recalcular aqui.
  const resultado = useMemo(() => buscar(consultaAtiva, 1)[0] ?? null, [consultaAtiva, buscar])

  function executarBusca(consultaTexto: string) {
    setMostrarSugestoes(false)
    setConsultaAtiva(consultaTexto)
  }

  if (carregando) return <p>Carregando dados reais do piloto...</p>
  if (erro || !dados) return <p>Não foi possível carregar os dados: {erro}</p>

  return (
    <div className={styles.pagina}>
      <div className={styles.buscaLinha}>
        <div className={styles.buscaCampo}>
          <Input
            placeholder="Descreva o item... ex.: anilha 10kg"
            iconeEsquerda={<Search size={14} />}
            value={texto}
            onChange={e => {
              setTexto(e.target.value)
              setMostrarSugestoes(true)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') executarBusca(texto)
            }}
            onFocus={() => setMostrarSugestoes(true)}
            onBlur={() => setTimeout(() => setMostrarSugestoes(false), 150)}
            aria-label="Descrição do item"
          />
          {sugestoes.length > 0 && (
            <ul className={styles.sugestoes}>
              {sugestoes.map(item => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={styles.sugestao}
                    onClick={() => {
                      setTexto(item.nome)
                      executarBusca(item.nome)
                    }}
                  >
                    <span>{item.nome}</span>
                    <SeloNivel nivel={item.nivel} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button onClick={() => executarBusca(texto)}>Buscar preço</Button>
      </div>

      <div className={styles.chips}>
        <span className={styles.chipsRotulo}>Experimente:</span>
        {EXEMPLOS.map(exemplo => (
          <Chip
            key={exemplo}
            onClick={() => {
              setTexto(exemplo)
              executarBusca(exemplo)
            }}
          >
            {exemplo}
          </Chip>
        ))}
      </div>

      {resultado && (
        <div className={styles.resultado}>
          <CardItem
            item={resultado}
            consultaTexto={consultaAtiva}
            amostras={dados.amostras[String(resultado.id)]}
            porte={dados.porte[String(resultado.id)]}
          />
        </div>
      )}

      {!resultado && consultaAtiva && (
        <div className={styles.vazio}>
          <p className={styles.vazioTitulo}>O sistema prefere dizer "não sei" a inventar um preço.</p>
          <p>Nenhum item das 883 descrições reais do piloto ficou parecido o bastante com essa busca.</p>
          <p>Tente um dos exemplos acima, ou descreva o item com outras palavras.</p>
        </div>
      )}
    </div>
  )
}
