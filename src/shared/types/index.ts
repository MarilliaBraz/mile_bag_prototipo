// Tipos do protótipo Milebag; espelham (de forma simplificada, sem persistência
// real) as entidades documentadas em mile_bag_documentacao/specs/HU*/data-model.md

export type EntregaStatus =
  | 'AGUARDANDO_ATRIBUICAO'
  | 'ATRIBUIDA'
  | 'EM_ANDAMENTO'
  | 'ENCERRADA_COM_SUCESSO'
  | 'REABERTA'

export type ConviteStatus = 'PENDENTE' | 'USADO' | 'EXPIRADO' | 'INVALIDADO'

export interface PlanoAssinatura {
  id: string
  nome: string
  limiteMotoristasAtivos: number
  limiteVolumeMensalBdos: number
  precoMensal: number
}

export interface Tenant {
  id: string
  nome: string
  emailAdministrador: string
  planoId: string
  criadoEm: string
}

export interface ConviteAdministrador {
  id: string
  tenantId: string
  emailDestinatario: string
  status: ConviteStatus
  criadoEm: string
  expiraEm: string
  usadoEm?: string
}

// RF21 (regenerado 2026-09-09): via principal é o recebimento automático por
// e-mail; a fotografia (HU01) passa a via de contingência.
export type BdoOrigem = 'FOTO_MANUAL' | 'EMAIL_AUTOMATICO'

export interface Bdo {
  id: string
  numero: string
  passageiroNome: string
  enderecoEntrega: string
  companhiaAerea: string
  telefonePassageiro?: string
  emailPassageiro?: string
  etiquetaBagagem?: string
  origem: BdoOrigem
  dataCaptura: string
}

export interface BagagemCarona {
  id: string
  entregaPrincipalId: string
  bdo: Bdo
  kmComplementar: number
  vinculadaEm: string
}

export interface TrechoPedagio {
  praca: string
  valor: number
  semValorCadastrado?: boolean
}

// HU04 (regenerado 2026-09-09): "rota congelada" vira Trajeto reconstruído;
// sequência de CalculoRota + CheckpointGps, consolidada só no encerramento.
export type OrigemSelecaoRota = 'sugerida' | 'propria'

export interface CalculoRota {
  id: string
  kmIda: number
  kmVolta: number
  pedagios: TrechoPedagio[]
  tempoEstimadoMin: number
  origemSelecao: OrigemSelecaoRota
  justificativaRotaPropria?: string
  dataHora: string
  ehRotaInicial: boolean
}

export type TipoCheckpoint = 'partida' | 'a_caminho' | 'chegada' | 'comprovante' | 'ocorrencia'

export interface CheckpointGps {
  id: string
  tipo: TipoCheckpoint
  lat: number | null
  lng: number | null
  dataHora: string
  ausente: boolean
}

// HU17: correção pontual de um valor final consolidado do trajeto; registro
// aditivo, nunca sobrescreve o Trajeto nem ajustes anteriores.
export type CampoAjuste = 'KM_IDA' | 'KM_VOLTA' | 'TARIFA_APLICADA' | 'VALOR_PEDAGIO'

export interface AjusteViagem {
  id: string
  trajetoId: string
  campo: CampoAjuste
  valorAnterior: string
  valorNovo: string
  justificativa: string
  motoristaId: string
  motoristaNome: string
  criadoEm: string
}

export type TrajetoStatus = 'em_execucao' | 'encerrado'

export interface Trajeto {
  id: string
  entregaId: string
  status: TrajetoStatus
  dataInicio: string
  calculosRota: CalculoRota[]
  checkpoints: CheckpointGps[]
  kmIdaFinal: number | null
  kmVoltaFinal: number | null
  pracasPedagioFinal: TrechoPedagio[] | null
  tempoFinalMin: number | null
  justificativaDivergencia?: string
  ajustes: AjusteViagem[]
}

export interface ComprovanteEntrega {
  id: string
  entregaId: string
  recebedorNome: string
  dataHora: string
  geolocalizacao: { lat: number; lng: number }
}

export interface Ocorrencia {
  id: string
  entregaId: string
  motivo: string
  observacao?: string
  registradaEm: string
}

// HU18: mensageria motorista-passageiro (Telegram + e-mail), registro aditivo.
// Telegram só fica disponível depois que o passageiro toca no link de convite
// recebido por e-mail (ver Entrega.telegramVinculado); trocado de WhatsApp
// em 2026-09-23 para manter RNF08 (orçamento zerado) sem custo por conversa.
export type AutorMensagem = 'MOTORISTA' | 'PASSAGEIRO' | 'SISTEMA'
export type CanalMensagem = 'TELEGRAM' | 'EMAIL'
export type TipoMensagem = 'MANUAL' | 'AUTOMATICA'
export type StatusEnvioMensagem = 'ENVIADA' | 'FALHOU' | 'RECEBIDA'
export type TipoEventoMensagem =
  | 'VIAGEM_INICIADA'
  | 'A_CAMINHO'
  | 'CHEGADA'
  | 'COMPROVANTE_REGISTRADO'
  | 'OCORRENCIA_REGISTRADA'

export interface Mensagem {
  id: string
  entregaId: string
  autor: AutorMensagem
  canal: CanalMensagem
  tipo: TipoMensagem
  conteudo: string
  statusEnvio: StatusEnvioMensagem
  criadoEm: string
  tipoEvento?: TipoEventoMensagem
}

export interface Entrega {
  id: string
  tenantId: string
  bdo: Bdo
  motoristaId?: string
  motoristaNome?: string
  status: EntregaStatus
  bagagensCarona: BagagemCarona[]
  // Um trajeto por tentativa (HU04); no máximo um com status 'em_execucao'
  // por vez (FR-005); reaberturas (HU07) podem acumular vários encerrados.
  trajetos: Trajeto[]
  comprovante?: ComprovanteEntrega
  ocorrencias: Ocorrencia[]
  mensagens: Mensagem[]
  criadaEm: string
  pendenteSincronizacao?: boolean
  // HU18: true assim que o passageiro toca no link de convite ao Telegram
  // (recebido por e-mail) e o bot recebe o /start daquela entrega; estado
  // dinâmico, não um campo do BDO (diferente de telefone/e-mail).
  telegramVinculado?: boolean
}

export type EscopoTarifa = 'TENANT' | 'MOTORISTA' | 'REGIAO'

export interface TabelaTarifa {
  id: string
  tenantId: string
  escopo: EscopoTarifa
  referencia?: string
  valorFixo: number
  valorPorKm: number
}

export interface PracaPedagio {
  id: string
  tenantId: string
  nome: string
  valor: number
  vigenteDesde: string
}

export interface Fechamento {
  id: string
  tenantId: string
  periodoInicio: string
  periodoFim: string
  totalPagamentoEntregas: number
  totalReembolsoPedagios: number
  quantidadeEntregas: number
  geradoEm: string
}

export interface IdentidadeVisualTenant {
  tenantId: string
  nomeExibicao: string
  corPrimaria: string
  logoIniciais: string
}

export type PeriodicidadeFechamento = 'QUINZENAL' | 'MENSAL'

export interface ConfiguracaoTenant {
  tenantId: string
  motivosOcorrencia: string[]
  camposObrigatoriosBaixa: string[]
  basesAeroportuarias: string[]
  companhiasAtendidas: string[]
  periodicidadeFechamento: PeriodicidadeFechamento
  // HU04/RN14; limiar de divergência entre a rota inicialmente sugerida e a
  // quilometragem final consolidada do trajeto (o que for maior dos dois).
  limiarDivergenciaPercentual: number
  limiarDivergenciaKm: number
}
