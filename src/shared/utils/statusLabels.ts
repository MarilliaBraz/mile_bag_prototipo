import type { ConviteStatus, EntregaStatus } from '../types'

export const entregaStatusInfo: Record<EntregaStatus, { label: string; className: string }> = {
  AGUARDANDO_ATRIBUICAO: { label: 'Aguardando atribuição', className: 'bg-slate-100 text-slate-700' },
  ATRIBUIDA: { label: 'Atribuída', className: 'bg-blue-100 text-blue-700' },
  EM_ANDAMENTO: { label: 'Em andamento', className: 'bg-blue-100 text-blue-700' },
  ENCERRADA_COM_SUCESSO: { label: 'Encerrada com sucesso', className: 'bg-emerald-100 text-emerald-700' },
  REABERTA: { label: 'Reaberta (ocorrência)', className: 'bg-red-100 text-red-700' },
}

export const conviteStatusInfo: Record<ConviteStatus, { label: string; className: string }> = {
  PENDENTE: { label: 'Pendente', className: 'bg-amber-100 text-amber-800' },
  USADO: { label: 'Usado', className: 'bg-emerald-100 text-emerald-700' },
  EXPIRADO: { label: 'Expirado', className: 'bg-slate-100 text-slate-700' },
  INVALIDADO: { label: 'Invalidado', className: 'bg-red-100 text-red-700' },
}
