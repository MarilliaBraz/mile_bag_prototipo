import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type {
  Tenant,
  PlanoAssinatura,
  ConviteAdministrador,
  Entrega,
  Bdo,
  CalculoRota,
  Trajeto,
  CheckpointGps,
  TipoCheckpoint,
  ComprovanteEntrega,
  AjusteViagem,
  CampoAjuste,
  Mensagem,
  TipoEventoMensagem,
  CanalMensagem,
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

// v2: HU04 regenerada (Trajeto reconstruído) + HU17-HU21 + RF21 mudam o
// formato de Entrega — incrementa a chave para não tentar reidratar estado
// antigo incompatível salvo por uma versão anterior do protótipo.
const STORAGE_KEY = 'milebag-prototipo-store-v2'

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

// ---- Helpers de domínio compartilhados entre store e telas -----------------

// HU19/EntregaDetalhe: trajeto ativo (no máximo um por entrega — FR-005/HU04).
export function trajetoAtivo(entrega: Entrega): Trajeto | undefined {
  return entrega.trajetos.find((t) => t.status === 'em_execucao')
}

// Último trajeto encerrado — usado para exibir o consolidado (comprovante,
// ocorrência) e para o relatório quinzenal (HU17).
export function ultimoTrajetoEncerrado(entrega: Entrega): Trajeto | undefined {
  const encerrados = entrega.trajetos.filter((t) => t.status === 'encerrado')
  return encerrados[encerrados.length - 1]
}

// HU19: marco de progresso mais recente ("a caminho"/"chegada") do trajeto ativo.
export function marcoMaisRecente(entrega: Entrega): CheckpointGps | undefined {
  const trajeto = trajetoAtivo(entrega)
  if (!trajeto) return undefined
  const marcos = trajeto.checkpoints.filter((c) => c.tipo === 'a_caminho' || c.tipo === 'chegada')
  return marcos[marcos.length - 1]
}

// HU17: valor vigente de um campo do trajeto — o ajuste mais recente, senão o
// valor final consolidado do trajeto.
export function valorVigente(trajeto: Trajeto, campo: CampoAjuste, tarifaBase: number): number {
  const ajustesDoCampo = trajeto.ajustes.filter((a) => a.campo === campo)
  const maisRecente = ajustesDoCampo[ajustesDoCampo.length - 1]
  if (maisRecente) return Number(maisRecente.valorNovo)
  switch (campo) {
    case 'KM_IDA':
      return trajeto.kmIdaFinal ?? 0
    case 'KM_VOLTA':
      return trajeto.kmVoltaFinal ?? 0
    case 'TARIFA_APLICADA':
      return tarifaBase
    case 'VALOR_PEDAGIO':
      return (trajeto.pracasPedagioFinal ?? []).reduce((soma, p) => soma + p.valor, 0)
  }
}

// HU04/RN14: compara a rota inicialmente sugerida com o último cálculo usado.
export function avaliarDivergencia(trajeto: Trajeto, configuracao: ConfiguracaoTenant) {
  const inicial = trajeto.calculosRota.find((c) => c.ehRotaInicial)
  const ultimo = trajeto.calculosRota[trajeto.calculosRota.length - 1]
  if (!inicial || !ultimo) return { divergiu: false, diffKm: 0, totalInicial: 0, totalFinal: 0 }
  const totalInicial = inicial.kmIda + inicial.kmVolta
  const totalFinal = ultimo.kmIda + ultimo.kmVolta
  const diffKm = Math.abs(totalFinal - totalInicial)
  const limiar = Math.max(configuracao.limiarDivergenciaKm, totalInicial * (configuracao.limiarDivergenciaPercentual / 100))
  return { divergiu: diffKm >= limiar && totalInicial > 0, diffKm, totalInicial, totalFinal }
}

const EVENTO_TEXTO: Record<TipoEventoMensagem, string> = {
  VIAGEM_INICIADA: 'O motorista iniciou o trajeto até você.',
  A_CAMINHO: 'O motorista está a caminho do endereço de entrega.',
  CHEGADA: 'O motorista chegou ao endereço de entrega.',
  COMPROVANTE_REGISTRADO: 'Entrega concluída — comprovante registrado.',
  OCORRENCIA_REGISTRADA: 'Não foi possível concluir a entrega nesta tentativa. Uma nova tentativa será agendada.',
}

// HU18 FR-005: dispara notificação automática nos canais disponíveis (RD02) —
// simplesmente não dispara nada quando não há contato (FR-006 não se aplica
// ao SISTEMA, só ao envio manual do motorista). Telegram só entra depois que
// o passageiro já tocou no convite (telegramVinculado) — antes disso, e-mail
// é o único canal, mas carrega o convite (FR-003a).
function gerarNotificacaoAutomatica(entrega: Entrega, tipoEvento: TipoEventoMensagem): Mensagem[] {
  const canais: CanalMensagem[] = []
  if (entrega.bdo.emailPassageiro) canais.push('EMAIL')
  if (entrega.telegramVinculado) canais.push('TELEGRAM')
  const agora = new Date().toISOString()
  return canais.map((canal) => ({
    id: gerarId('mensagem'),
    entregaId: entrega.id,
    autor: 'SISTEMA',
    canal,
    tipo: 'AUTOMATICA',
    conteudo: EVENTO_TEXTO[tipoEvento],
    statusEnvio: 'ENVIADA',
    criadoEm: agora,
    tipoEvento,
  }))
}

// HU04: consolida km/pedágio/tempo finais a partir do último CalculoRota
// usado, encerra o trajeto e registra o checkpoint final (comprovante/ocorrência).
function consolidarTrajeto(trajeto: Trajeto, tipoCheckpointFinal: TipoCheckpoint, justificativaDivergencia?: string): Trajeto {
  const ultimoCalculo = trajeto.calculosRota[trajeto.calculosRota.length - 1]
  const checkpointFinal: CheckpointGps = {
    id: gerarId('checkpoint'),
    tipo: tipoCheckpointFinal,
    lat: null,
    lng: null,
    dataHora: new Date().toISOString(),
    ausente: false,
  }
  return {
    ...trajeto,
    status: 'encerrado',
    kmIdaFinal: ultimoCalculo?.kmIda ?? 0,
    kmVoltaFinal: ultimoCalculo?.kmVolta ?? 0,
    pracasPedagioFinal: ultimoCalculo?.pedagios ?? [],
    tempoFinalMin: ultimoCalculo?.tempoEstimadoMin ?? 0,
    justificativaDivergencia,
    checkpoints: [...trajeto.checkpoints, checkpointFinal],
  }
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
  // HU01 — capturar BDO (via de contingência, RF21)
  criarEntregaComBdo: (bdo: Omit<Bdo, 'id' | 'origem' | 'dataCaptura'>) => Entrega
  // RF21 — recebimento automático do BDO por e-mail (via principal)
  receberBdoPorEmail: (bdo: Omit<Bdo, 'id' | 'origem' | 'dataCaptura'>) => Entrega
  // HU02 — autoatribuir entrega
  autoatribuirEntrega: (entregaId: string) => void
  // HU04 — iniciar trajeto e recalcular rota livremente
  iniciarViagem: (entregaId: string, calculo: Omit<CalculoRota, 'id' | 'dataHora' | 'ehRotaInicial'>) => void
  recalcularRota: (entregaId: string, calculo: Omit<CalculoRota, 'id' | 'dataHora' | 'ehRotaInicial'>) => void
  // HU05 — vincular bagagem carona
  vincularBagagemCarona: (entregaPrincipalId: string, bdo: Omit<Bdo, 'id' | 'origem' | 'dataCaptura'>, kmComplementar: number) => void
  // HU06 — registrar comprovante de entrega
  registrarComprovante: (entregaId: string, comprovante: Omit<ComprovanteEntrega, 'id' | 'entregaId'>, justificativaDivergencia?: string) => void
  // HU07 — registrar ocorrência
  registrarOcorrencia: (entregaId: string, motivo: string, observacao?: string, justificativaDivergencia?: string) => void
  // HU08 — offline / sincronização
  setOffline: (offline: boolean) => void
  sincronizarPendentes: () => void
  // HU09 — tarifas
  cadastrarTarifa: (dados: Omit<TabelaTarifa, 'id' | 'tenantId'>) => void
  // HU10 — pedágios
  cadastrarPedagio: (dados: Omit<PracaPedagio, 'id' | 'tenantId'>) => void
  // HU11 — configuração do tenant
  atualizarConfiguracao: (dados: Partial<Omit<ConfiguracaoTenant, 'tenantId'>>) => void
  // HU12 — fechamento quinzenal (considera ajustes de HU17)
  gerarFechamento: () => Fechamento
  // HU13 — identidade visual
  atualizarIdentidadeVisual: (dados: Partial<Omit<IdentidadeVisualTenant, 'tenantId'>>) => void
  // HU17 — conferir e corrigir relatório quinzenal
  registrarAjusteViagem: (trajetoId: string, campo: CampoAjuste, valorAnterior: number, valorNovo: number, justificativa: string) => void
  // HU18 — trocar mensagens com o passageiro
  enviarMensagem: (entregaId: string, conteudo: string) => void
  simularRespostaPassageiro: (entregaId: string) => void
  // HU20 — registrar marcos de progresso ("a caminho" / "chegada")
  registrarCheckpoint: (entregaId: string, tipo: 'a_caminho' | 'chegada') => void
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

  const criarEntregaBase = useCallback(
    (bdoCampos: Omit<Bdo, 'id' | 'origem' | 'dataCaptura'>, origem: Bdo['origem'], offline: boolean): Entrega => {
      const agora = new Date().toISOString()
      return marcarPendente(
        {
          id: gerarId('entrega'),
          tenantId: TENANT_ATUAL_ID,
          bdo: { id: gerarId('bdo'), origem, dataCaptura: agora, ...bdoCampos },
          status: 'AGUARDANDO_ATRIBUICAO',
          bagagensCarona: [],
          trajetos: [],
          ocorrencias: [],
          mensagens: [],
          criadaEm: agora,
        },
        offline,
      )
    },
    [],
  )

  const criarEntregaComBdo: StoreActions['criarEntregaComBdo'] = useCallback(
    (bdo) => {
      const entrega = criarEntregaBase(bdo, 'FOTO_MANUAL', state.offline)
      setState((s) => ({ ...s, entregas: [entrega, ...s.entregas] }))
      return entrega
    },
    [criarEntregaBase, state.offline],
  )

  // RF21 — simula o recebimento automático (sem etapa de conferência: FR-006)
  const receberBdoPorEmail: StoreActions['receberBdoPorEmail'] = useCallback(
    (bdo) => {
      const entrega = criarEntregaBase(bdo, 'EMAIL_AUTOMATICO', state.offline)
      setState((s) => ({ ...s, entregas: [entrega, ...s.entregas] }))
      return entrega
    },
    [criarEntregaBase, state.offline],
  )

  const autoatribuirEntrega: StoreActions['autoatribuirEntrega'] = useCallback((entregaId) => {
    setState((s) => ({
      ...s,
      entregas: s.entregas.map((e) =>
        e.id === entregaId
          ? marcarPendente({ ...e, status: 'ATRIBUIDA', motoristaId: MOTORISTA_ATUAL.id, motoristaNome: MOTORISTA_ATUAL.nome }, s.offline)
          : e,
      ),
    }))
  }, [])

  const iniciarViagem: StoreActions['iniciarViagem'] = useCallback((entregaId, calculo) => {
    setState((s) => ({
      ...s,
      entregas: s.entregas.map((e) => {
        if (e.id !== entregaId) return e
        const agora = new Date().toISOString()
        const primeiroCalculo: CalculoRota = { id: gerarId('calculo'), dataHora: agora, ehRotaInicial: true, ...calculo }
        const novoTrajeto: Trajeto = {
          id: gerarId('trajeto'),
          entregaId,
          status: 'em_execucao',
          dataInicio: agora,
          calculosRota: [primeiroCalculo],
          checkpoints: [{ id: gerarId('checkpoint'), tipo: 'partida', lat: null, lng: null, dataHora: agora, ausente: true }],
          kmIdaFinal: null,
          kmVoltaFinal: null,
          pracasPedagioFinal: null,
          tempoFinalMin: null,
          ajustes: [],
        }
        const notificacoes = gerarNotificacaoAutomatica(e, 'VIAGEM_INICIADA')
        return marcarPendente(
          { ...e, status: 'EM_ANDAMENTO', trajetos: [...e.trajetos, novoTrajeto], mensagens: [...e.mensagens, ...notificacoes] },
          s.offline,
        )
      }),
    }))
  }, [])

  // HU04 FR-003: recalcular a rota durante a execução, sem bloqueio — cada
  // recálculo é um novo CalculoRota, o histórico anterior nunca é apagado.
  const recalcularRota: StoreActions['recalcularRota'] = useCallback((entregaId, calculo) => {
    setState((s) => ({
      ...s,
      entregas: s.entregas.map((e) => {
        if (e.id !== entregaId) return e
        const trajeto = trajetoAtivo(e)
        if (!trajeto) return e
        const novoCalculo: CalculoRota = { id: gerarId('calculo'), dataHora: new Date().toISOString(), ehRotaInicial: false, ...calculo }
        const trajetoAtualizado: Trajeto = { ...trajeto, calculosRota: [...trajeto.calculosRota, novoCalculo] }
        return marcarPendente(
          { ...e, trajetos: e.trajetos.map((t) => (t.id === trajeto.id ? trajetoAtualizado : t)) },
          s.offline,
        )
      }),
    }))
  }, [])

  // HU20 — marcos de progresso ("a caminho"/"chegada"), sem dedup e sem ordem
  // obrigatória (FR-004); dispara notificação automática (HU18) quando houver
  // contato disponível.
  const registrarCheckpoint: StoreActions['registrarCheckpoint'] = useCallback((entregaId, tipo) => {
    setState((s) => ({
      ...s,
      entregas: s.entregas.map((e) => {
        if (e.id !== entregaId) return e
        const trajeto = trajetoAtivo(e)
        if (!trajeto) return e
        const checkpoint: CheckpointGps = { id: gerarId('checkpoint'), tipo, lat: null, lng: null, dataHora: new Date().toISOString(), ausente: true }
        const trajetoAtualizado: Trajeto = { ...trajeto, checkpoints: [...trajeto.checkpoints, checkpoint] }
        const notificacoes = gerarNotificacaoAutomatica(e, tipo === 'a_caminho' ? 'A_CAMINHO' : 'CHEGADA')
        return marcarPendente(
          {
            ...e,
            trajetos: e.trajetos.map((t) => (t.id === trajeto.id ? trajetoAtualizado : t)),
            mensagens: [...e.mensagens, ...notificacoes],
          },
          s.offline,
        )
      }),
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
                  {
                    id: gerarId('carona'),
                    entregaPrincipalId,
                    bdo: { id: gerarId('bdo'), origem: 'FOTO_MANUAL', dataCaptura: new Date().toISOString(), ...bdo },
                    kmComplementar,
                    vinculadaEm: new Date().toISOString(),
                  },
                ],
              },
              s.offline,
            )
          : e,
      ),
    }))
  }, [])

  const registrarComprovante: StoreActions['registrarComprovante'] = useCallback((entregaId, comprovante, justificativaDivergencia) => {
    setState((s) => ({
      ...s,
      entregas: s.entregas.map((e) => {
        if (e.id !== entregaId) return e
        const trajeto = trajetoAtivo(e)
        const notificacoes = gerarNotificacaoAutomatica(e, 'COMPROVANTE_REGISTRADO')
        return marcarPendente(
          {
            ...e,
            status: 'ENCERRADA_COM_SUCESSO',
            comprovante: { id: gerarId('pod'), entregaId, ...comprovante },
            trajetos: trajeto
              ? e.trajetos.map((t) => (t.id === trajeto.id ? consolidarTrajeto(t, 'comprovante', justificativaDivergencia) : t))
              : e.trajetos,
            mensagens: [...e.mensagens, ...notificacoes],
          },
          s.offline,
        )
      }),
    }))
  }, [])

  const registrarOcorrencia: StoreActions['registrarOcorrencia'] = useCallback((entregaId, motivo, observacao, justificativaDivergencia) => {
    setState((s) => ({
      ...s,
      entregas: s.entregas.map((e) => {
        if (e.id !== entregaId) return e
        const trajeto = trajetoAtivo(e)
        const notificacoes = gerarNotificacaoAutomatica(e, 'OCORRENCIA_REGISTRADA')
        return marcarPendente(
          {
            ...e,
            status: 'REABERTA',
            ocorrencias: [...e.ocorrencias, { id: gerarId('ocorrencia'), entregaId, motivo, observacao, registradaEm: new Date().toISOString() }],
            trajetos: trajeto
              ? e.trajetos.map((t) => (t.id === trajeto.id ? consolidarTrajeto(t, 'ocorrencia', justificativaDivergencia) : t))
              : e.trajetos,
            mensagens: [...e.mensagens, ...notificacoes],
          },
          s.offline,
        )
      }),
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

  // HU12, com a dependência cruzada de HU17: usa o valor ajustado mais
  // recente de cada trajeto (se existir), nunca só o valor bruto consolidado.
  const gerarFechamento: StoreActions['gerarFechamento'] = useCallback(() => {
    const entregasDoTenant = state.entregas.filter((e) => e.tenantId === TENANT_ATUAL_ID && e.status === 'ENCERRADA_COM_SUCESSO')
    const tarifaPadrao = state.tarifas.find((t) => t.tenantId === TENANT_ATUAL_ID && t.escopo === 'TENANT')
    let totalPagamentoEntregas = 0
    let totalReembolsoPedagios = 0
    for (const e of entregasDoTenant) {
      const trajeto = ultimoTrajetoEncerrado(e)
      if (!trajeto || !tarifaPadrao) continue
      const tarifaBase = tarifaPadrao.valorFixo + tarifaPadrao.valorPorKm * ((trajeto.kmIdaFinal ?? 0) + (trajeto.kmVoltaFinal ?? 0))
      const kmIda = valorVigente(trajeto, 'KM_IDA', tarifaBase)
      const kmVolta = valorVigente(trajeto, 'KM_VOLTA', tarifaBase)
      const tarifaAplicada = trajeto.ajustes.some((a) => a.campo === 'TARIFA_APLICADA')
        ? valorVigente(trajeto, 'TARIFA_APLICADA', tarifaBase)
        : tarifaPadrao.valorFixo + tarifaPadrao.valorPorKm * (kmIda + kmVolta)
      totalPagamentoEntregas += tarifaAplicada
      totalReembolsoPedagios += valorVigente(trajeto, 'VALOR_PEDAGIO', tarifaBase)
    }
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

  // HU17 — FR-004: exige justificativa não vazia (garantido pela tela, mas
  // reforçado aqui); registro aditivo, nunca sobrescreve o Trajeto.
  const registrarAjusteViagem: StoreActions['registrarAjusteViagem'] = useCallback((trajetoId, campo, valorAnterior, valorNovo, justificativa) => {
    if (!justificativa.trim()) return
    setState((s) => ({
      ...s,
      entregas: s.entregas.map((e) => {
        const trajeto = e.trajetos.find((t) => t.id === trajetoId)
        if (!trajeto) return e
        const ajuste: AjusteViagem = {
          id: gerarId('ajuste'),
          trajetoId,
          campo,
          valorAnterior: String(valorAnterior),
          valorNovo: String(valorNovo),
          justificativa: justificativa.trim(),
          motoristaId: MOTORISTA_ATUAL.id,
          motoristaNome: MOTORISTA_ATUAL.nome,
          criadoEm: new Date().toISOString(),
        }
        return { ...e, trajetos: e.trajetos.map((t) => (t.id === trajetoId ? { ...t, ajustes: [...t.ajustes, ajuste] } : t)) }
      }),
    }))
  }, [])

  // HU18 FR-003: escolhe o canal automaticamente — e-mail sempre que
  // capturado, Telegram assim que o passageiro tiver iniciado a conversa
  // (telegramVinculado). Sem e-mail, não há canal nenhum (FR-006/FR-007) —
  // diferente da versão WhatsApp original, telefone não é mais usado aqui.
  const enviarMensagem: StoreActions['enviarMensagem'] = useCallback((entregaId, conteudo) => {
    if (!conteudo.trim()) return
    setState((s) => ({
      ...s,
      entregas: s.entregas.map((e) => {
        if (e.id !== entregaId) return e
        const canais: CanalMensagem[] = []
        if (e.bdo.emailPassageiro) canais.push('EMAIL')
        if (e.telegramVinculado) canais.push('TELEGRAM')
        if (canais.length === 0) return e // FR-007: sem contato disponível, nenhum envio
        const agora = new Date().toISOString()
        const novas: Mensagem[] = canais.map((canal) => ({
          id: gerarId('mensagem'),
          entregaId,
          autor: 'MOTORISTA',
          canal,
          tipo: 'MANUAL',
          conteudo: conteudo.trim(),
          statusEnvio: 'ENVIADA',
          criadoEm: agora,
        }))
        return { ...e, mensagens: [...e.mensagens, ...novas] }
      }),
    }))
  }, [])

  // Não faz parte de nenhum FR — só simula, no protótipo, a chegada de uma
  // resposta do passageiro (que no sistema real chegaria por webhook do
  // Telegram/IMAP, sem o passageiro precisar de conta — RD14/FR-004). Se o
  // Telegram ainda não estava vinculado, este clique simula também o
  // passageiro tocando no link de convite pela primeira vez (/start,
  // research.md item 3 de HU18) — por isso a resposta já sai por lá.
  const simularRespostaPassageiro: StoreActions['simularRespostaPassageiro'] = useCallback((entregaId) => {
    setState((s) => ({
      ...s,
      entregas: s.entregas.map((e) => {
        if (e.id !== entregaId) return e
        if (!e.bdo.emailPassageiro) return e
        const canal: CanalMensagem = 'TELEGRAM'
        const mensagem: Mensagem = {
          id: gerarId('mensagem'),
          entregaId,
          autor: 'PASSAGEIRO',
          canal,
          tipo: 'MANUAL',
          conteudo: 'Ok, obrigado pelo aviso! Vou aguardar aqui.',
          statusEnvio: 'RECEBIDA',
          criadoEm: new Date().toISOString(),
        }
        return { ...e, telegramVinculado: true, mensagens: [...e.mensagens, mensagem] }
      }),
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
      receberBdoPorEmail,
      autoatribuirEntrega,
      iniciarViagem,
      recalcularRota,
      registrarCheckpoint,
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
      registrarAjusteViagem,
      enviarMensagem,
      simularRespostaPassageiro,
    }),
    [
      state,
      cadastrarTenant,
      reenviarConvite,
      ativarConvite,
      cadastrarPlano,
      trocarPlanoTenant,
      criarEntregaComBdo,
      receberBdoPorEmail,
      autoatribuirEntrega,
      iniciarViagem,
      recalcularRota,
      registrarCheckpoint,
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
      registrarAjusteViagem,
      enviarMensagem,
      simularRespostaPassageiro,
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

// HU19 — minhas entregas ainda pendentes (FR-001)
export function useMinhasEntregasPendentes() {
  const entregas = useEntregasDoTenant()
  return entregas
    .filter((e) => e.motoristaId === MOTORISTA_ATUAL.id && e.status !== 'ENCERRADA_COM_SUCESSO' && e.status !== 'AGUARDANDO_ATRIBUICAO')
    .sort((a, b) => a.criadaEm.localeCompare(b.criadaEm))
}

// HU19/RF21 — BDOs confirmados ainda sem motorista responsável (FR-007)
export function useBdosDisponiveis() {
  const entregas = useEntregasDoTenant()
  return entregas
    .filter((e) => e.status === 'AGUARDANDO_ATRIBUICAO')
    .sort((a, b) => a.bdo.dataCaptura.localeCompare(b.bdo.dataCaptura))
}

export function useConfiguracaoTenant() {
  const { configuracoes } = useStore()
  return configuracoes.find((c) => c.tenantId === TENANT_ATUAL_ID)!
}

export function useIdentidadeVisualTenant() {
  const { identidadesVisuais } = useStore()
  return identidadesVisuais.find((i) => i.tenantId === TENANT_ATUAL_ID)!
}
