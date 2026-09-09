import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './data/store'
import { AuthProvider } from './data/auth'
import RequireAuth from './components/RequireAuth'

import Home from './pages/Home'
import Login from './pages/Login'

import MotoristaLayout from './layouts/MotoristaLayout'
import EntregasLista from './pages/motorista/EntregasLista'
import EntregaDetalhe from './pages/motorista/EntregaDetalhe'
import CapturarBdo from './pages/motorista/CapturarBdo'
import RotaViagem from './pages/motorista/RotaViagem'
import BagagemCarona from './pages/motorista/BagagemCarona'
import Comprovante from './pages/motorista/Comprovante'
import Ocorrencia from './pages/motorista/Ocorrencia'
import Sincronizacao from './pages/motorista/Sincronizacao'
import Conversa from './pages/motorista/Conversa'
import RelatorioQuinzenal from './pages/motorista/RelatorioQuinzenal'

import TenantLayout from './layouts/TenantLayout'
import TenantDashboard from './pages/tenant/Dashboard'
import Tarifas from './pages/tenant/Tarifas'
import Pedagios from './pages/tenant/Pedagios'
import Configuracoes from './pages/tenant/Configuracoes'
import Fechamento from './pages/tenant/Fechamento'
import IdentidadeVisual from './pages/tenant/IdentidadeVisual'

import PlataformaLayout from './layouts/PlataformaLayout'
import TenantsLista from './pages/plataforma/TenantsLista'
import CadastrarTenant from './pages/plataforma/CadastrarTenant'
import TenantDetalhe from './pages/plataforma/TenantDetalhe'
import Planos from './pages/plataforma/Planos'
import AtivarConvite from './pages/plataforma/AtivarConvite'

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login/:perfil" element={<Login />} />

            {/* Tela de ativação de convite — fora dos layouts autenticados,
                simula o link recebido por e-mail pelo primeiro administrador (HU15) */}
            <Route path="/ativar-convite/:conviteId" element={<AtivarConvite />} />

            {/* Aplicação do motorista (PWA) — HU01 a HU08 */}
            <Route
              path="/motorista"
              element={
                <RequireAuth perfil="motorista">
                  <MotoristaLayout />
                </RequireAuth>
              }
            >
              <Route index element={<EntregasLista />} />
              <Route path="novo" element={<CapturarBdo />} />
              <Route path="entregas/:id" element={<EntregaDetalhe />} />
              <Route path="entregas/:id/rota" element={<RotaViagem />} />
              <Route path="entregas/:id/bagagem-carona" element={<BagagemCarona />} />
              <Route path="entregas/:id/comprovante" element={<Comprovante />} />
              <Route path="entregas/:id/ocorrencia" element={<Ocorrencia />} />
              <Route path="entregas/:id/conversa" element={<Conversa />} />
              <Route path="sincronizacao" element={<Sincronizacao />} />
              <Route path="relatorio" element={<RelatorioQuinzenal />} />
            </Route>

            {/* Back-office — administrador do tenant — HU09, HU10, HU11, HU12, HU13 */}
            <Route
              path="/tenant"
              element={
                <RequireAuth perfil="tenant">
                  <TenantLayout />
                </RequireAuth>
              }
            >
              <Route index element={<TenantDashboard />} />
              <Route path="tarifas" element={<Tarifas />} />
              <Route path="pedagios" element={<Pedagios />} />
              <Route path="configuracoes" element={<Configuracoes />} />
              <Route path="fechamento" element={<Fechamento />} />
              <Route path="identidade-visual" element={<IdentidadeVisual />} />
            </Route>

            {/* Back-office — administrador da plataforma — HU14, HU15, HU16 */}
            <Route
              path="/plataforma"
              element={
                <RequireAuth perfil="plataforma">
                  <PlataformaLayout />
                </RequireAuth>
              }
            >
              <Route index element={<TenantsLista />} />
              <Route path="tenants/novo" element={<CadastrarTenant />} />
              <Route path="tenants/:id" element={<TenantDetalhe />} />
              <Route path="planos" element={<Planos />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </StoreProvider>
  )
}
