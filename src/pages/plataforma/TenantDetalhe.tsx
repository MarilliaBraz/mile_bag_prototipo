import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../../data/store'
import { conviteStatusInfo } from '../../data/statusLabels'
import Badge from '../../components/Badge'

export default function TenantDetalhe() {
  const { id } = useParams<{ id: string }>()
  const { tenants, planos, convites, reenviarConvite } = useStore()
  const [ultimoConviteId, setUltimoConviteId] = useState<string | null>(null)

  const tenant = tenants.find((t) => t.id === id)

  if (!tenant) {
    return (
      <div>
        <p className="text-sm text-slate-500">Empresa não encontrada.</p>
        <Link to="/plataforma" className="text-sm font-semibold text-blue-700">
          ← Voltar
        </Link>
      </div>
    )
  }

  const plano = planos.find((p) => p.id === tenant.planoId)
  const conviteDoTenant = convites
    .filter((c) => c.tenantId === tenant.id)
    .sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1))
  const temAdministradorAtivo = conviteDoTenant.some((c) => c.status === 'USADO')

  function handleReenviar() {
    const novo = reenviarConvite(tenant!.id)
    setUltimoConviteId(novo.id)
  }

  return (
    <div>
      <Link to="/plataforma" className="text-xs font-semibold text-blue-700">
        ← Empresas assinantes
      </Link>

      <h1 className="mt-2 text-xl font-bold text-slate-900">{tenant.nome}</h1>
      <dl className="mt-2 grid max-w-md grid-cols-3 gap-y-1 text-sm">
        <dt className="text-slate-500">Administrador</dt>
        <dd className="col-span-2 text-slate-800">{tenant.emailAdministrador}</dd>
        <dt className="text-slate-500">Plano</dt>
        <dd className="col-span-2 text-slate-800">{plano?.nome ?? 'Sem plano'}</dd>
        <dt className="text-slate-500">Cadastrada em</dt>
        <dd className="col-span-2 text-slate-800">{new Date(tenant.criadoEm).toLocaleString('pt-BR')}</dd>
      </dl>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Histórico de convites</h2>
        {!temAdministradorAtivo && (
          <button
            type="button"
            onClick={handleReenviar}
            className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            Reenviar convite
          </button>
        )}
      </div>

      {!temAdministradorAtivo && (
        <p className="mt-1 text-xs text-amber-700">Esta empresa ainda não tem administrador ativo.</p>
      )}

      {ultimoConviteId && (
        <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
          Novo convite gerado. Link de ativação (simulado):{' '}
          <Link to={`/ativar-convite/${ultimoConviteId}`} className="font-semibold text-blue-700 underline">
            /ativar-convite/{ultimoConviteId}
          </Link>
        </div>
      )}

      <ul className="mt-3 flex flex-col gap-2">
        {conviteDoTenant.map((convite) => {
          const info = conviteStatusInfo[convite.status]
          return (
            <li key={convite.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-xs">
              <div>
                <p className="font-medium text-slate-800">{convite.emailDestinatario}</p>
                <p className="text-slate-500">Criado em {new Date(convite.criadoEm).toLocaleString('pt-BR')}</p>
              </div>
              <Badge label={info.label} className={info.className} />
            </li>
          )
        })}
        {conviteDoTenant.length === 0 && <p className="text-xs text-slate-500">Nenhum convite registrado.</p>}
      </ul>
    </div>
  )
}
