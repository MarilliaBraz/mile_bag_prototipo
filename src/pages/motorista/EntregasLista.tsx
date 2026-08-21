import { Link } from 'react-router-dom'
import { useEntregasDoTenant } from '../../data/store'
import { entregaStatusInfo } from '../../data/statusLabels'

export default function EntregasLista() {
  const entregas = useEntregasDoTenant()

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900">Minhas entregas</h1>
        <Link
          to="/motorista/novo"
          className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
        >
          + Capturar BDO
        </Link>
      </div>

      {entregas.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">Nenhuma entrega ainda. Capture o primeiro BDO para começar.</p>
      )}

      <ul className="mt-4 flex flex-col gap-3">
        {entregas.map((entrega) => {
          const status = entregaStatusInfo[entrega.status]
          return (
            <li key={entrega.id}>
              <Link
                to={`/motorista/entregas/${entrega.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">BDO {entrega.bdo.numero}</p>
                    <p className="text-xs text-slate-500">{entrega.bdo.passageiroNome}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{entrega.bdo.enderecoEntrega}</p>
                {entrega.pendenteSincronizacao && (
                  <p className="mt-2 text-xs font-medium text-amber-700">⏳ Pendente de sincronização</p>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
