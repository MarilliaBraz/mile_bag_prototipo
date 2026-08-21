import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type {
  Tenant,
  PlanoAssinatura,
  ConviteAdministrador,
  Entrega,
  Bdo,
  Viagem,
  ComprovanteEntrega,
  TabelaTarifa,
  PracaPedagio,
  Fechamento,
  IdentidadeVisualTenant,
  ConfiguracaoTenant,
} from '../types'
import {
  TENANT_ID,
  seedTenants,
  seedPlanos,
  seedConvites,
  seedEntregas,
  seedTarifas,
  seedPedagios,
  seedFechamentos,
  seedIdentidadeVisual,
  seedConfiguracao,
} from './seed'

// Store única do protótipo — simula, em memória + localStorage, o back-end do
// Milebag. Nada aqui é uma implementação real de persistência, isolamento por
// tenant ou sincronização: é só o suficiente para as telas navegarem de forma
// coerente. Ver mile_bag_documentacao/specs/HU*/data-model.md para o modelo real.

export const MOTORISTA_ATUAL = { id: 'motorista-01', nome: 'Carlos Eduardo Souza' }
export const TENANT_ATUAL_ID = TENANT_ID

interface StoreState {
  tenants: Tenant[]
  planos: PlanoAssinatura[]
  convites: ConviteAdministrador[]
  entregas: Entrega[]
  tarifas: TabelaTarifa[]
  pedagios: PracaPedagio[]
  fechamentos: Fechamento[]
  identidadesVisuais: IdentidadeVisualTenant[]
  configuracoes: ConfiguracaoTenant[]
  offline: boolean
}

const STORAGE_KEY = 'milebag-prototipo-store-v1'

function loadInitialState(): StoreState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as StoreState
  } catch {
    // localStorage indisponível ou dado corrompido — cai para o seed
  }
  return {
    tenants: seedTenants,
    planos: seedPlanos,
    convites: seedConvites,
    entregas: seedEntregas,
    tarifas: seedTarifas,
    pedagios: seedPedagios,
    fechamentos: seedFechamentos,
    identidadesVisuais: [seedIdentidadeVisual],
    configuracoes: [seedConfiguracao],
    offline: false,
  }
}

function gerarId(prefixo: string): string {
  const aleatorio = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  return `${prefixo}-${aleatorio.slice(0, 8)}`
}

interface StoreActions {
  // HU14 — cadastrar empresa assinante
  cadastrarTenant: (dados: { nome: string; emailAdministrador: string; planoId: string }) => Tenant
  // HU15 — convite do primeiro administrador
  reenviarConvite: (tenantId: string) => ConviteAdministrador
  ativarConvite: (conviteId: string) => void
  // HU16 — planos de assinatura
  cadastrarPlano: (dados: Omit<PlanoAssinatura, 'id'>) => PlanoAssinatura
  trocarPlanoTenant: (tenantId: string, planoId: string) => void
  // HU01 — capturar BDO
  criarEntregaComBdo: (bdo: Omit<Bdo, 'id'>) => Entrega
  // HU02 — autoatribuir entrega
  autoatribuirEntrega: (entregaId: string) => void
  // HU04 — iniciar viagem com rota congelada
  iniciarViagem: (entregaId: string, viagem: Omit<Viagem, 'id' | 'entregaId' | 'iniciadaEm'>) => void
  // HU05 — vincular bagagem carona
  vincularBagagemCarona: (entregaPrincipalId: string, bdo: Omit<Bdo, 'id'>, kmComplementar: number) => void
  // HU06 — registrar comprovante de entrega
  registrarComprovante: (entregaId: string, comprovante: Omit<ComprovanteEntrega, 'id' | 'entregaId'>) => void
  // HU07 — registrar ocorrência
  registrarOcorrencia: (entregaId: string, motivo: string, observacao?: string) => void
  // HU08 — offline / sincronização
  setOffline: (offline: boolean) => void
  sincronizarPendentes: () => void
  // HU09 — tarifas
  cadastrarTarifa: (dados: Omit<TabelaTarifa, 'id' | 'tenantId'>) => void
  // HU10 — pedágios
  cadastrarPedagio: (dados: Omit<PracaPedagio, 'id' | 'tenantId'>) => void
  // HU11 — configuração do tenant
  atualizarConfiguracao: (dados: Partial<Omit<ConfiguracaoTenant, 'tenantId'>>) => void
  // HU12 — fechamento quinzenal
  gerarFechamento: () => Fechamento
  // HU13 — identidade visual
  atualizarIdentidadeVisual: (dados: Partial<Omit<IdentidadeVisualTenant, 'tenantId'>>) => void
}

type StoreValue = StoreState & StoreActions

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(loadInitialState)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // sem espaço/sem localStorage — ignora, é só um protótipo
    }
  }, [state])

  const cadastrarTenant: StoreActions['cadastrarTenant'] = useCallback((dados) => {
    const tenant: Tenant = { id: gerarId('tenant'), criadoEm: new Date().toISOString(), ...dados }
    const convite: ConviteAdministrador = {
      id: gerarId('convite'),
      tenantId: tenant.id,
      emailDestinatario: dados.emailAdministrador,
      status: 'PENDENTE',
      criadoEm: new Date().toISOString(),
      expiraEm: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    }
    setState((s) => ({ ...s, tenants: [...s.tenants, tenant], convites: [...s.convites, convite] }))
    return tenant
  }, [])

  const reenviarConvite: StoreActions['reenviarConvite'] = useCallback((tenantId) => {
    const novo: ConviteAdministrador = {
      id: gerarId('convite'),
      tenantId,
      emailDestinatario: state.tenants.find((t) => t.id === tenantId)?.emailAdministrador ?? '',
      status: 'PENDENTE',
      criadoEm: new Date().toISOString(),
      expiraEm: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    }
    setState((s) => ({
      ...s,
      convites: [
        ...s.convites.map((c) => (c.tenantId === tenantId && c.status === 'PENDENTE' ? { ...c, status: 'INVALIDADO' as const } : c)),
        novo,
      ],
    }))
    return novo
  }, [state.tenants])

  const ativarConvite: StoreActions['ativarConvite'] = useCallback((conviteId) => {
    setState((s) => ({
      ...s,
      convites: s.convites.map((c) => (c.id === conviteId ? { ...c, status: 'USADO', usadoEm: new Date().toISOString() } : c)),
    }))
  }, [])

  const cadastrarPlano: StoreActions['cadastrarPlano'] = useCallback((dados) => {
    const plano: PlanoAssinatura = { id: gerarId('plano'), ...dados }
    setState((s) => ({ ...s, planos: [...s.planos, plano] }))
    return plano
  }, [])

  const trocarPlanoTenant: StoreActions['trocarPlanoTenant'] = useCallback((tenantId, planoId) => {
    setState((s) => ({ ...s, tenants: s.tenants.map((t) => (t.id === tenantId ? { ...t, planoId } : t)) }))
  }, [])

  const marcarPendente = (entrega: Entrega, offline: boolean): Entrega =>
    offline ? { ...entrega, pendenteSincronizacao: true } : entrega

  const criarEntregaComBdo: StoreActions['criarEntregaComBdo'] = useCallback(
    (bdo) => {
      const entrega: Entrega = marcarPendente(
        {
          id: gerarId('entrega'),
          tenantId: TENANT_ATUAL_ID,
          bdo: { id: gerarId('bdo'), ...bdo },
          status: 'AGUARDANDO_ATRIBUICAO',
          bagagensCarona: [],
          ocorrencias: [],
          criadaEm: new Date().toISOString(),
        },
        state.offline,
      )
      setState((s) => ({ ...s, entregas: [entrega, ...s.entregas] }))
      return entrega
    },
    [state.offline],
  )

  const autoatribuirEntrega: StoreActions['autoatribuirEntrega'] = useCallback(
    (entregaId) => {
      setState((s) => ({
        ...s,
        entregas: s.entregas.map((e) =>
          e.id === entregaId
            ? marcarPendente({ ...e, status: 'ATRIBUIDA', motoristaId: MOTORISTA_ATUAL.id, motoristaNome: MOTORISTA_ATUAL.nome }, s.offline)
            : e,
        ),
      }))
    },
    [],
  )

  const iniciarViagem: StoreActions['iniciarViagem'] = useCallback((entregaId, viagem) => {
    setState((s) => ({
      ...s,
      entregas: s.entregas.map((e) =>
        e.id === entregaId
          ? marcarPendente(
              {
                ...e,
                status: 'EM_ANDAMENTO',
                viagem: { id: gerarId('viagem'), entregaId, iniciadaEm: new Date().toISOString(), ...viagem },
              },
              s.offline,
            )
          : e,
      ),
    }))
  }, [])

  const vincularBagagemCarona: StoreActions['vincularBagagemCarona'] = useCallback((entregaPrincipalId, bdo, kmComplementar) => {
    setState((s) => ({
      ...s,
      entregas: s.entregas.map((e) =>
        e.id === entregaPrincipalId
          ? marcarPendente(
              {
                ...e,
                bagagensCarona: [
                  ...e.bagagensCarona,
                  { id: gerarId('carona'), entregaPrincipalId, bdo: { id: gerarId('bdo'), ...bdo }, kmComplementar, vinculadaEm: new Date().toISOString() },
                ],
              },
              s.offline,
            )
          : e,
      ),
    }))
  }, [])

  const registrarComprovante: StoreActions['registrarComprovante'] = useCallback((entregaId, comprovante) => {
    setState((s) => ({
      ...s,
      entregas: s.entregas.map((e) =>
        e.id === entregaId
          ? marcarPendente(
              { ...e, status: 'ENCERRADA_COM_SUCESSO', comprovante: { id: gerarId('pod'), entregaId, ...comprovante } },
              s.offline,
            )
          : e,
      ),
    }))
  }, [])

  const registrarOcorrencia: StoreActions['registrarOcorrencia'] = useCallback((entregaId, motivo, observacao) => {
    setState((s) => ({
      ...s,
      entregas: s.entregas.map((e) =>
        e.id === entregaId
          ? marcarPendente(
              {
                ...e,
                status: 'REABERTA',
                ocorrencias: [...e.ocorrencias, { id: gerarId('ocorrencia'), entregaId, motivo, observacao, registradaEm: new Date().toISOString() }],
              },
              s.offline,
            )
          : e,
      ),
    }))
  }, [])

  const setOffline: StoreActions['setOffline'] = useCallback((offline) => {
    setState((s) => ({ ...s, offline }))
  }, [])

  const sincronizarPendentes: StoreActions['sincronizarPendentes'] = useCallback(() => {
    setState((s) => ({ ...s, entregas: s.entregas.map((e) => ({ ...e, pendenteSincronizacao: false })) }))
  }, [])

  const cadastrarTarifa: StoreActions['cadastrarTarifa'] = useCallback((dados) => {
    setState((s) => ({ ...s, tarifas: [...s.tarifas, { id: gerarId('tarifa'), tenantId: TENANT_ATUAL_ID, ...dados }] }))
  }, [])

  const cadastrarPedagio: StoreActions['cadastrarPedagio'] = useCallback((dados) => {
    setState((s) => ({ ...s, pedagios: [...s.pedagios, { id: gerarId('pedagio'), tenantId: TENANT_ATUAL_ID, ...dados }] }))
  }, [])

  const atualizarConfiguracao: StoreActions['atualizarConfiguracao'] = useCallback((dados) => {
    setState((s) => ({
      ...s,
      configuracoes: s.configuracoes.map((c) => (c.tenantId === TENANT_ATUAL_ID ? { ...c, ...dados } : c)),
    }))
  }, [])

  const gerarFechamento: StoreActions['gerarFechamento'] = useCallback(() => {
    const entregasDoTenant = state.entregas.filter((e) => e.tenantId === TENANT_ATUAL_ID && e.status === 'ENCERRADA_COM_SUCESSO')
    const tarifaPadrao = state.tarifas.find((t) => t.tenantId === TENANT_ATUAL_ID && t.escopo === 'TENANT')
    const totalPagamentoEntregas = entregasDoTenant.reduce((total, e) => {
      if (!e.viagem || !tarifaPadrao) return total
      return total + tarifaPadrao.valorFixo + tarifaPadrao.valorPorKm * (e.viagem.kmIda + e.viagem.kmVolta)
    }, 0)
    const totalReembolsoPedagios = entregasDoTenant.reduce((total, e) => {
      if (!e.viagem) return total
      return total + e.viagem.pedagios.reduce((soma, p) => soma + p.valor, 0)
    }, 0)
    const fechamento: Fechamento = {
      id: gerarId('fechamento'),
      tenantId: TENANT_ATUAL_ID,
      periodoInicio: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString().slice(0, 10),
      periodoFim: new Date().toISOString().slice(0, 10),
      totalPagamentoEntregas: Math.round(totalPagamentoEntregas * 100) / 100,
      totalReembolsoPedagios: Math.round(totalReembolsoPedagios * 100) / 100,
      quantidadeEntregas: entregasDoTenant.length,
      geradoEm: new Date().toISOString(),
    }
    setState((s) => ({ ...s, fechamentos: [fechamento, ...s.fechamentos] }))
    return fechamento
  }, [state.entregas, state.tarifas])

  const atualizarIdentidadeVisual: StoreActions['atualizarIdentidadeVisual'] = useCallback((dados) => {
    setState((s) => ({
      ...s,
      identidadesVisuais: s.identidadesVisuais.map((i) => (i.tenantId === TENANT_ATUAL_ID ? { ...i, ...dados } : i)),
    }))
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      cadastrarTenant,
      reenviarConvite,
      ativarConvite,
      cadastrarPlano,
      trocarPlanoTenant,
      criarEntregaComBdo,
      autoatribuirEntrega,
      iniciarViagem,
      vincularBagagemCarona,
      registrarComprovante,
      registrarOcorrencia,
      setOffline,
      sincronizarPendentes,
      cadastrarTarifa,
      cadastrarPedagio,
      atualizarConfiguracao,
      gerarFechamento,
      atualizarIdentidadeVisual,
    }),
    [
      state,
      cadastrarTenant,
      reenviarConvite,
      ativarConvite,
      cadastrarPlano,
      trocarPlanoTenant,
      criarEntregaComBdo,
      autoatribuirEntrega,
      iniciarViagem,
      vincularBagagemCarona,
      registrarComprovante,
      registrarOcorrencia,
      setOffline,
      sincronizarPendentes,
      cadastrarTarifa,
      cadastrarPedagio,
      atualizarConfiguracao,
      gerarFechamento,
      atualizarIdentidadeVisual,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore precisa estar dentro de <StoreProvider>')
  return ctx
}

// Seletores convenientes usados pelas telas
export function useEntregasDoTenant() {
  const { entregas } = useStore()
  return entregas.filter((e) => e.tenantId === TENANT_ATUAL_ID)
}

export function useConfiguracaoTenant() {
  const { configuracoes } = useStore()
  return configuracoes.find((c) => c.tenantId === TENANT_ATUAL_ID)!
}

export function useIdentidadeVisualTenant() {
  const { identidadesVisuais } = useStore()
  return identidadesVisuais.find((i) => i.tenantId === TENANT_ATUAL_ID)!
}
