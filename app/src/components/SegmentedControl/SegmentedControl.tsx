import styles from './SegmentedControl.module.css'

interface Opcao<T extends string> {
  valor: T
  rotulo: string
}

interface SegmentedControlProps<T extends string> {
  rotulo: string
  opcoes: Opcao<T>[]
  valor: T
  onChange: (valor: T) => void
}

/** Seletor de porte da compra (SPEC-D03) -- a microinteracao mais importante da demo:
 * trocar aqui anima a FaixaPreco/PrecoHero no componente pai (nao aqui). */
export function SegmentedControl<T extends string>({
  rotulo, opcoes, valor, onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className={styles.grupo} role="group" aria-label={rotulo}>
      <span className={styles.rotulo}>{rotulo}</span>
      {opcoes.map(opcao => (
        <button
          key={opcao.valor}
          type="button"
          className={`${styles.botao} ${opcao.valor === valor ? styles.ativo : ''}`}
          aria-pressed={opcao.valor === valor}
          onClick={() => onChange(opcao.valor)}
        >
          {opcao.rotulo}
        </button>
      ))}
    </div>
  )
}
