import { NavLink } from 'react-router-dom'
import { MoonStars, Sun } from 'react-bootstrap-icons'
import { useTema } from '@/hooks/useTema'
import styles from './TopNav.module.css'

const ABAS = [
  { to: '/', label: 'Consulta' },
  { to: '/lote', label: 'Cotação em lote' },
  { to: '/familias', label: 'Famílias' },
  { to: '/painel', label: 'Painel' },
]

export function TopNav() {
  const [tema, alternarTema] = useTema()

  return (
    <header className={styles.header}>
      <div className={styles.marca}>
        <i className={styles.marcaIcone} aria-hidden="true">◈</i>
        MESP Preços
      </div>
      <span className={styles.protótipo}>Protótipo de conceito</span>

      <nav className={styles.tabs} aria-label="Áreas do MESP Preços">
        {ABAS.map(aba => (
          <NavLink
            key={aba.to}
            to={aba.to}
            end={aba.to === '/'}
            className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabAtivo : ''}`}
          >
            {aba.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className={styles.temaBotao}
        onClick={alternarTema}
        aria-label={tema === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
        title={tema === 'light' ? 'Tema escuro' : 'Tema claro'}
      >
        {tema === 'light' ? <MoonStars size={16} /> : <Sun size={16} />}
      </button>
    </header>
  )
}
