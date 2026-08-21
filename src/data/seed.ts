import type {
  Tenant,
  PlanoAssinatura,
  ConviteAdministrador,
  Entrega,
  TabelaTarifa,
  PracaPedagio,
  Fechamento,
  IdentidadeVisualTenant,
  ConfiguracaoTenant,
} from '../types'

// Dados iniciais do protótipo — só para a demonstração navegável partir de um
// estado realista (um tenant já operando, entregas em diferentes estágios do
// ciclo de vida). Nada disso é persistido em servidor: ver src/data/store.tsx.

export const TENANT_ID = 'tenant-goiania-01'

export const seedPlanos: PlanoAssinatura[] = [
  { id: 'plano-starter', nome: 'Starter', limiteMotoristasAtivos: 5, limiteVolumeMensalBdos: 150, precoMensal: 0 },
  { id: 'plano-crescimento', nome: 'Crescimento', limiteMotoristasAtivos: 20, limiteVolumeMensalBdos: 600, precoMensal: 0 },
  { id: 'plano-operacao-plena', nome: 'Operação Plena', limiteMotoristasAtivos: 60, limiteVolumeMensalBdos: 2000, precoMensal: 0 },
]

export const seedTenants: Tenant[] = [
  {
    id: TENANT_ID,
    nome: 'Entrega Rápida Goiânia Ltda',
    emailAdministrador: 'admin@entregarapidago.com.br',
    planoId: 'plano-crescimento',
    criadoEm: '2026-08-01T09:00:00',
  },
]

export const seedConvites: ConviteAdministrador[] = [
  {
    id: 'convite-01',
    tenantId: TENANT_ID,
    emailDestinatario: 'admin@entregarapidago.com.br',
    status: 'USADO',
    criadoEm: '2026-08-01T09:00:00',
    expiraEm: '2026-08-04T09:00:00',
    usadoEm: '2026-08-01T10:15:00',
  },
]

export const seedEntregas: Entrega[] = [
  {
    id: 'entrega-001',
    tenantId: TENANT_ID,
    bdo: {
      id: 'bdo-001',
      numero: 'GYN-48213',
      passageiroNome: 'Marcos Andrade Silva',
      enderecoEntrega: 'Rua T-30, 450, Setor Bueno, Goiânia - GO',
      companhiaAerea: 'LATAM',
      telefonePassageiro: '(62) 99123-4567',
    },
    motoristaId: 'motorista-01',
    motoristaNome: 'Carlos Eduardo Souza',
    status: 'AGUARDANDO_ATRIBUICAO',
    bagagensCarona: [],
    ocorrencias: [],
    criadaEm: '2026-08-20T08:30:00',
  },
  {
    id: 'entrega-002',
    tenantId: TENANT_ID,
    bdo: {
      id: 'bdo-002',
      numero: 'GYN-48214',
      passageiroNome: 'Fernanda Lima Costa',
      enderecoEntrega: 'Av. T-9, 1200, Setor Marista, Goiânia - GO',
      companhiaAerea: 'GOL',
      telefonePassageiro: '(62) 99876-1122',
    },
    motoristaId: 'motorista-01',
    motoristaNome: 'Carlos Eduardo Souza',
    status: 'EM_ANDAMENTO',
    bagagensCarona: [],
    viagem: {
      id: 'viagem-002',
      entregaId: 'entrega-002',
      kmIda: 12.4,
      kmVolta: 12.4,
      pedagios: [],
      tempoEstimadoMin: 22,
      rotaPropria: false,
      iniciadaEm: '2026-08-20T09:10:00',
    },
    ocorrencias: [],
    criadaEm: '2026-08-20T08:45:00',
  },
  {
    id: 'entrega-003',
    tenantId: TENANT_ID,
    bdo: {
      id: 'bdo-003',
      numero: 'GYN-48190',
      passageiroNome: 'Roberto Kenji Tanaka',
      enderecoEntrega: 'Rua 9, 320, Setor Oeste, Goiânia - GO',
      companhiaAerea: 'Azul',
      telefonePassageiro: '(62) 99333-8899',
    },
    motoristaId: 'motorista-01',
    motoristaNome: 'Carlos Eduardo Souza',
    status: 'ENCERRADA_COM_SUCESSO',
    bagagensCarona: [],
    viagem: {
      id: 'viagem-003',
      entregaId: 'entrega-003',
      kmIda: 8.1,
      kmVolta: 8.1,
      pedagios: [],
      tempoEstimadoMin: 15,
      rotaPropria: false,
      iniciadaEm: '2026-08-19T14:00:00',
    },
    comprovante: {
      id: 'comprovante-003',
      entregaId: 'entrega-003',
      recebedorNome: 'Roberto Kenji Tanaka',
      dataHora: '2026-08-19T14:26:00',
      geolocalizacao: { lat: -16.6799, lng: -49.255 },
    },
    ocorrencias: [],
    criadaEm: '2026-08-19T13:40:00',
  },
  {
    id: 'entrega-004',
    tenantId: TENANT_ID,
    bdo: {
      id: 'bdo-004',
      numero: 'GYN-48175',
      passageiroNome: 'Juliana Pereira Rocha',
      enderecoEntrega: 'Alameda das Rosas, 88, Jardim Goiás, Goiânia - GO',
      companhiaAerea: 'LATAM',
    },
    motoristaId: 'motorista-02',
    motoristaNome: 'Ana Paula Ribeiro',
    status: 'REABERTA',
    bagagensCarona: [],
    ocorrencias: [
      {
        id: 'ocorrencia-004',
        entregaId: 'entrega-004',
        motivo: 'Passageiro ausente',
        observacao: 'Ninguém atendeu no endereço; tentativa registrada às 16h40.',
        registradaEm: '2026-08-19T16:40:00',
      },
    ],
    criadaEm: '2026-08-19T15:10:00',
  },
]

export const seedTarifas: TabelaTarifa[] = [
  { id: 'tarifa-padrao', tenantId: TENANT_ID, escopo: 'TENANT', valorFixo: 15, valorPorKm: 2.2 },
  { id: 'tarifa-motorista-01', tenantId: TENANT_ID, escopo: 'MOTORISTA', referencia: 'Carlos Eduardo Souza', valorFixo: 15, valorPorKm: 2.5 },
]

export const seedPedagios: PracaPedagio[] = [
  { id: 'pedagio-br153-goiania', tenantId: TENANT_ID, nome: 'BR-153 - Goiânia/Aparecida', valor: 6.9, vigenteDesde: '2026-07-01' },
  { id: 'pedagio-go070', tenantId: TENANT_ID, nome: 'GO-070 - Trindade', valor: 4.5, vigenteDesde: '2026-07-01' },
]

export const seedFechamentos: Fechamento[] = [
  {
    id: 'fechamento-2026-08-01',
    tenantId: TENANT_ID,
    periodoInicio: '2026-08-01',
    periodoFim: '2026-08-15',
    totalPagamentoEntregas: 1840,
    totalReembolsoPedagios: 214.2,
    quantidadeEntregas: 42,
    geradoEm: '2026-08-16T08:00:00',
  },
]

export const seedIdentidadeVisual: IdentidadeVisualTenant = {
  tenantId: TENANT_ID,
  nomeExibicao: 'Entrega Rápida Goiânia',
  corPrimaria: '#1d4ed8',
  logoIniciais: 'ERG',
}

export const seedConfiguracao: ConfiguracaoTenant = {
  tenantId: TENANT_ID,
  motivosOcorrencia: ['Passageiro ausente', 'Endereço não localizado', 'Recusa no recebimento', 'Acesso restrito ao local'],
  camposObrigatoriosBaixa: ['Foto do documento assinado', 'Nome do recebedor', 'Geolocalização'],
  basesAeroportuarias: ['Aeroporto Santa Genoveva (GYN)'],
  companhiasAtendidas: ['LATAM', 'GOL', 'Azul'],
  periodicidadeFechamento: 'QUINZENAL',
}
