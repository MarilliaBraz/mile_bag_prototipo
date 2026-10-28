import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './shared/services/store'
import { AuthProvider } from './shared/services/auth'
import RequireAuth from './shared/components/RequireAuth'
import AcessibilidadeDeRota from './shared/components/AcessibilidadeDeRota'

import { Home, Login } from './features/auth'

import { MotoristaLayout } from './features/motorista/layout'
import { EntregasLista, EntregaDetalhe } from './features/motorista/painel-entregas'
import { CapturarBdo, BagagemCarona } from './features/motorista/captura-bdo'
import { RotaViagem } from './features/motorista/rota'
import { Comprovante } from './features/motorista/comprovante-entrega'
import { Ocorrencia } from './features/motorista/ocorrencia'
import { Sincronizacao } from './features/motorista/offline-sync'
import { Conversa } from './features/motorista/mensageria'
import { RelatorioQuinzenal } from './features/motorista/relatorio-quinzenal'
import { Conta } from './features/motorista/conta'

import { TenantLayout, PlataformaLayout } from './features/back-office/layout'
import { Dashboard as TenantDashboard } from './features/back-office/dashboard'
import { Tarifas } from './features/back-office/tarifas'
import { Pedagios } from './features/back-office/pedagios'
import { Configuracoes, IdentidadeVisual } from './features/back-office/configuracao-tenant'
import { Fechamento } from './features/back-office/fechamento'

import { TenantsLista, CadastrarTenant, TenantDetalhe, AtivarConvite } from './features/back-office/tenant-onboarding'
import { Planos } from './features/back-office/planos'

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <HashRouter>
          <AcessibilidadeDeRota />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login/:perfil" element={<Login />} />

            {/* Tela de ativação de convite, fora dos layouts autenticados:
                simula o link recebido por e-mail pelo primeiro administrador (HU15) */}
            <Route path="/ativar-convite/:conviteId" element={<AtivarConvite />} />

            {/* Aplicação do motorista (PWA): HU01 a HU08 */}
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
              <Route path="conta" element={<Conta />} />
            </Route>

            {/* Administração da empresa (administrador do tenant): HU09 a HU13 */}
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

            {/* Administração da plataforma: HU14 a HU16 */}
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
