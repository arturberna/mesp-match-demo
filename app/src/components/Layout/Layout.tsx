import { Outlet } from 'react-router-dom'
import { TopNav } from '@/components/TopNav'
import styles from './Layout.module.css'

export function Layout() {
  return (
    <div className={styles.shell}>
      <TopNav />
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        Protótipo de conceito · dados reais do piloto de jun/2026 (PNCP + Compras.gov.br) ·
        metodologia IN SEGES/ME nº 65/2021 · MESP-Match
      </footer>
    </div>
  )
}
