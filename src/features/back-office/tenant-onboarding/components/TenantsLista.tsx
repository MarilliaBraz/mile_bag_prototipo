import { Link } from 'react-router-dom'
import { useStore } from '../../../../shared/services/store'

export default function TenantsLista() {
  const { tenants, planos } = useStore()

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Empresas assinantes</h1>
          <p className="mt-1 text-sm text-slate-500">Empresas cadastradas na plataforma.</p>
        </div>
        <Link
          to="/plataforma/tenants/novo"
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
        >
          + Cadastrar empresa assinante
        </Link>
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {tenants.map((tenant) => {
          const plano = planos.find((p) => p.id === tenant.planoId)
          return (
            <li key={tenant.id}>
              <Link
                to={`/plataforma/tenants/${tenant.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{tenant.nome}</p>
                  <p className="text-xs text-slate-500">{tenant.emailAdministrador}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {plano?.nome ?? 'Sem plano'}
                </span>
              </Link>
            </li>
          )
        })}
        {tenants.length === 0 && <p className="text-sm text-slate-500">Nenhuma empresa assinante cadastrada ainda.</p>}
      </ul>
    </div>
  )
}
