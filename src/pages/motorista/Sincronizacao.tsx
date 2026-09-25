import Icone from '../../components/Icone'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useEntregasDoTenant, useStore } from '../../data/store'
import { entregaStatusInfo } from '../../data/statusLabels'

export default function Sincronizacao() {
  const { offline, sincronizarPendentes } = useStore()
  const entregas = useEntregasDoTenant()
  const [ultimaSincronizacao, setUltimaSincronizacao] = useState<string | null>(null)

  const pendentes = entregas.filter((e) => e.pendenteSincronizacao)

  function handleSincronizar() {
    sincronizarPendentes()
    setUltimaSincronizacao(new Date().toLocaleTimeString('pt-BR'))
  }

  return (
    <div>
      <h1 className="text-lg font-bold text-slate-900">Sincronização</h1>
      <p className="mt-1 text-sm text-slate-600">
        Enquanto o motorista está sem conexão, todas as ações continuam funcionando e ficam guardadas neste
        dispositivo. Assim que a conexão volta, tudo é enviado automaticamente, na mesma ordem em que foi criado —
        este botão só existe neste protótipo para simular esse momento de reconexão.
      </p>

      <div
        className={`mt-4 rounded-xl border p-4 text-sm ${
          offline ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
        }`}
      >
        <Icone nome={offline ? 'semConexao' : 'conexao'} />{' '}
        {offline
          ? 'Dispositivo simulado como offline. Novas ações continuam sendo salvas localmente, mas não podem ser sincronizadas agora.'
          : 'Dispositivo simulado como online.'}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">
            {pendentes.length === 0 ? 'Nada pendente' : `${pendentes.length} registro(s) pendente(s)`}
          </p>
          <button
            type="button"
            onClick={handleSincronizar}
            disabled={offline || pendentes.length === 0}
            className="min-h-11 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            title={offline ? 'Volte a ficar online para sincronizar' : undefined}
          >
            Sincronizar agora
          </button>
        </div>

        {offline && pendentes.length > 0 && (
          <p className="mt-2 text-xs text-amber-700">
            A sincronização automática só acontece quando a conectividade for restabelecida — use o alternador
            "Online/Sem conexão" no topo da tela para simular a reconexão.
          </p>
        )}

        {ultimaSincronizacao && pendentes.length === 0 && (
          <p className="mt-2 text-xs text-emerald-700">Última sincronização às {ultimaSincronizacao}. Tudo em dia.</p>
        )}

        {pendentes.length === 0 ? (
          <p className="mt-3 text-xs text-slate-500">Todos os registros já foram sincronizados com o servidor.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {pendentes.map((e) => {
              const status = entregaStatusInfo[e.status]
              return (
                <li key={e.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">BDO {e.bdo.numero}</span>
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${status.className}`}>{status.label}</span>
                  </div>
                  <Link to={`/motorista/entregas/${e.id}`} className="mt-1 inline-block text-blue-700 underline">
                    Ver entrega
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
