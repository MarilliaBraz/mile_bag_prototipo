import { Link } from 'react-router-dom'
import { marcoMaisRecente, useBdosDisponiveis, useMinhasEntregasPendentes, useStore } from '../../data/store'
import { entregaStatusInfo } from '../../data/statusLabels'

const MARCO_LABEL: Record<'a_caminho' | 'chegada', string> = {
  a_caminho: '🚗 A caminho',
  chegada: '📍 Chegou ao endereço',
}

export default function EntregasLista() {
  const pendentes = useMinhasEntregasPendentes()
  const bdosDisponiveis = useBdosDisponiveis()
  const { autoatribuirEntrega, receberBdoPorEmail } = useStore()

  function simularBdoPorEmail() {
    receberBdoPorEmail({
      numero: `GYN-${Math.floor(40000 + Math.random() * 9000)}`,
      passageiroNome: 'Patrícia Nogueira Dias',
      enderecoEntrega: 'Rua 136, 780, Setor Marista, Goiânia - GO',
      companhiaAerea: 'LATAM',
      telefonePassageiro: '(62) 99221-4400',
      emailPassageiro: 'patricia.dias@example.com',
      etiquetaBagagem: `LA${Math.floor(100000 + Math.random() * 899999)}`,
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900">Painel de entregas</h1>
        <Link
          to="/motorista/novo"
          className="inline-flex min-h-11 items-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
        >
          + Capturar BDO
        </Link>
      </div>

      <section className="mt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Minhas entregas pendentes</h2>
          <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-800">
            {pendentes.length} pendente{pendentes.length === 1 ? '' : 's'}
          </span>
        </div>

        {pendentes.length === 0 && (
          <p className="mt-2 text-sm text-slate-500">Nenhuma entrega pendente — atribua um BDO disponível abaixo.</p>
        )}

        <ul className="mt-2 flex flex-col gap-3">
          {pendentes.map((entrega) => {
            const status = entregaStatusInfo[entrega.status]
            const marco = marcoMaisRecente(entrega)
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
                  <div className="mt-2 flex items-center gap-2">
                    {marco && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        {MARCO_LABEL[marco.tipo as 'a_caminho' | 'chegada']}
                      </span>
                    )}
                    {entrega.bagagensCarona.length > 0 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        +{entrega.bagagensCarona.length} bagagem carona
                      </span>
                    )}
                  </div>
                  {entrega.pendenteSincronizacao && (
                    <p className="mt-2 text-xs font-medium text-amber-700">⏳ Pendente de sincronização</p>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">BDOs disponíveis</h2>
          <button
            type="button"
            onClick={simularBdoPorEmail}
            className="min-h-11 text-xs font-semibold text-blue-700 hover:underline"
            title="Simula o recebimento automático de um BDO por e-mail — no sistema real acontece sem ação do motorista."
          >
            ✉️ Simular BDO por e-mail
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          BDOs confirmados sem motorista responsável — fotografados ou recebidos automaticamente por e-mail.
          Toque para atribuir a você.
        </p>

        {bdosDisponiveis.length === 0 && <p className="mt-2 text-sm text-slate-500">Nenhum BDO disponível no momento.</p>}

        <ul className="mt-2 flex flex-col gap-3">
          {bdosDisponiveis.map((entrega) => (
            <li key={entrega.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">BDO {entrega.bdo.numero}</p>
                  <p className="text-xs text-slate-500">{entrega.bdo.passageiroNome}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    entrega.bdo.origem === 'EMAIL_AUTOMATICO' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {entrega.bdo.origem === 'EMAIL_AUTOMATICO' ? '✉️ Recebido por e-mail' : '📷 Fotografado'}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">{entrega.bdo.enderecoEntrega}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => autoatribuirEntrega(entrega.id)}
                  className="min-h-11 flex-1 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-800"
                >
                  Atribuir a mim
                </button>
                <Link
                  to={`/motorista/entregas/${entrega.id}`}
                  className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Ver detalhes
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
