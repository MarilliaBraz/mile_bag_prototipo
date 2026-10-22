import type { NomeIcone } from '../components/Icone'
export type Perfil = 'motorista' | 'tenant' | 'plataforma'

export interface PerfilInfo {
  id: Perfil
  titulo: string
  subtitulo: string
  descricao: string
  descricaoLogin: string
  home: string
  icone: NomeIcone
}

export const PERFIS: Record<Perfil, PerfilInfo> = {
  motorista: {
    id: 'motorista',
    titulo: 'Aplicação do motorista',
    subtitulo: 'Motorista',
    descricao:
      'Captura do BDO, autoatribuição, rota, viagem, bagagem carona, comprovante de entrega, ocorrências, operação sem conexão, conferência do relatório quinzenal, mensagens e ligação com o passageiro e marcos de progresso (HU01 a HU08 e HU17 a HU21).',
    descricaoLogin: 'Capture BDOs, gerencie suas entregas e registre comprovantes direto do campo.',
    home: '/motorista',
    icone: 'caminhao',
  },
  tenant: {
    id: 'tenant',
    titulo: 'Administração da empresa',
    subtitulo: 'Administrador da empresa',
    descricao:
      'Tarifas, praças de pedágio, parametrização, fechamento quinzenal e identidade visual dos relatórios (HU09 a HU13).',
    descricaoLogin: 'Configure tarifas, pedágios e acompanhe o fechamento financeiro da sua empresa.',
    home: '/tenant',
    icone: 'predio',
  },
  plataforma: {
    id: 'plataforma',
    titulo: 'Administração da plataforma',
    subtitulo: 'Administrador da plataforma',
    descricao: 'Cadastro de empresas assinantes, convite do primeiro administrador e planos de assinatura (HU14 a HU16).',
    descricaoLogin: 'Gerencie as empresas assinantes e os planos de assinatura da plataforma.',
    home: '/plataforma',
    icone: 'ferramenta',
  },
}

export const PERFIS_LISTA: PerfilInfo[] = [PERFIS.motorista, PERFIS.tenant, PERFIS.plataforma]

export function isPerfil(valor: string | undefined): valor is Perfil {
  return !!valor && valor in PERFIS
}
