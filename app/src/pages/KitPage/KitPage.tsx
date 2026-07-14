import { useState } from 'react'
import { Search } from 'react-bootstrap-icons'
import { useDados } from '@/contexts/DadosContext'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { Input } from '@/components/Input'
import { SegmentedControl } from '@/components/SegmentedControl'
import { SeloNivel } from '@/components/SeloNivel'
import { NotaHonesta } from '@/components/NotaHonesta'
import { CardItem } from '@/components/CardItem'
import { Drawer } from '@/components/Drawer'
import type { Nivel } from '@/types'
import styles from './KitPage.module.css'

/** Pagina interna de conferencia visual (SPEC-D02, criterio de aceitacao #2) -- nao faz
 * parte do roteiro de demonstracao, serve para checar o design system nos dois temas. */
export function KitPage() {
  const { dados, carregando } = useDados()
  const [drawerAberto, setDrawerAberto] = useState(false)
  const [porte, setPorte] = useState<'a' | 'b'>('a')

  if (carregando || !dados) return <p>Carregando kit...</p>

  const exemploPorItem = ([1, 2, 3, 4] as Nivel[])
    .map(nivel => dados.itens.find(it => it.nivel === nivel && (nivel === 4 || it.preco_tipico != null)))
    .filter(Boolean)

  return (
    <div className={styles.pagina}>
      <section className={styles.secao}>
        <h2 className={styles.tituloSecao}>Selos de nível</h2>
        <div className={styles.linha}>
          {([1, 2, 3, 4] as Nivel[]).map(n => (
            <SeloNivel key={n} nivel={n} />
          ))}
        </div>
      </section>

      <section className={styles.secao}>
        <h2 className={styles.tituloSecao}>Botões</h2>
        <div className={styles.linha}>
          <Button variant="primary">Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" disabled>Desabilitado</Button>
        </div>
      </section>

      <section className={styles.secao}>
        <h2 className={styles.tituloSecao}>Chips</h2>
        <div className={styles.linha}>
          <Chip onClick={() => {}}>anilha 10kg</Chip>
          <Chip onRemover={() => {}} removerRotulo="Remover peso">peso</Chip>
          <Chip>informativo</Chip>
        </div>
      </section>

      <section className={styles.secao}>
        <h2 className={styles.tituloSecao}>Input</h2>
        <Input placeholder="Descreva o item... ex.: anilha 10kg" iconeEsquerda={<Search size={14} />} />
      </section>

      <section className={styles.secao}>
        <h2 className={styles.tituloSecao}>SegmentedControl</h2>
        <SegmentedControl
          rotulo="Porte:"
          valor={porte}
          onChange={setPorte}
          opcoes={[{ valor: 'a', rotulo: 'Opção A' }, { valor: 'b', rotulo: 'Opção B' }]}
        />
      </section>

      <section className={styles.secao}>
        <h2 className={styles.tituloSecao}>Notas honestas</h2>
        <NotaHonesta>Nota neutra -- explica um contexto.</NotaHonesta>
        <NotaHonesta tipo="alerta">Nota de alerta -- algo pede atenção.</NotaHonesta>
        <NotaHonesta tipo="discreta">Nota discreta -- observação de rodapé.</NotaHonesta>
      </section>

      <section className={styles.secao}>
        <h2 className={styles.tituloSecao}>Drawer</h2>
        <Button onClick={() => setDrawerAberto(true)}>Abrir drawer de exemplo</Button>
        <Drawer aberto={drawerAberto} onFechar={() => setDrawerAberto(false)} titulo="Exemplo de drawer">
          <p>Conteúdo de exemplo.</p>
        </Drawer>
      </section>

      <section className={styles.secao}>
        <h2 className={styles.tituloSecao}>CardItem (um por nível, dados reais do export)</h2>
        <div className={styles.grid}>
          {exemploPorItem.map(item => item && (
            <CardItem
              key={item.id}
              item={item}
              amostras={dados.amostras[String(item.id)]}
              porte={dados.porte[String(item.id)]}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
