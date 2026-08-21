// Tipos do protótipo Milebag — espelham (de forma simplificada, sem persistência
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

export interface Bdo {
  id: string
  numero: string
  passageiroNome: string
  enderecoEntrega: string
  companhiaAerea: string
  telefonePassageiro?: string
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
}

export interface Viagem {
  id: string
  entregaId: string
  kmIda: number
  kmVolta: number
  pedagios: TrechoPedagio[]
  tempoEstimadoMin: number
  rotaPropria: boolean
  justificativaRotaPropria?: string
  iniciadaEm: string
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

export interface Entrega {
  id: string
  tenantId: string
  bdo: Bdo
  motoristaId?: string
  motoristaNome?: string
  status: EntregaStatus
  bagagensCarona: BagagemCarona[]
  viagem?: Viagem
  comprovante?: ComprovanteEntrega
  ocorrencias: Ocorrencia[]
  criadaEm: string
  pendenteSincronizacao?: boolean
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
}
