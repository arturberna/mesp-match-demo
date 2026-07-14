import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { DadosProvider } from '@/contexts/DadosContext'
import { SessaoProvider } from '@/contexts/SessaoContext'
import { ConsultaPage } from '@/pages/ConsultaPage'
import { LotePage } from '@/pages/LotePage'
import { FamiliasPage } from '@/pages/FamiliasPage'
import { PainelPage } from '@/pages/PainelPage'
import { KitPage } from '@/pages/KitPage'

export function App() {
  return (
    <DadosProvider>
      <SessaoProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<ConsultaPage />} />
              <Route path="lote" element={<LotePage />} />
              <Route path="familias" element={<FamiliasPage />} />
              <Route path="familias/:slug" element={<FamiliasPage />} />
              <Route path="painel" element={<PainelPage />} />
              <Route path="kit" element={<KitPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SessaoProvider>
    </DadosProvider>
  )
}
