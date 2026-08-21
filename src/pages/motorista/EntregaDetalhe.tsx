import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../data/store'
import { entregaStatusInfo } from '../../data/statusLabels'

export default function EntregaDetalhe() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { entregas, autoatribuirEntrega } = useStore()
  const entrega = entregas.find((e) => e.id === id)

  if (!entrega) {
    return (
      <div>
        <p className="text-sm text-slate-500">Entrega não encontrada.</p>
        <Link to="/motorista" className="text-sm font-semibold text-blue-700">
          ← Voltar para a lista
        </Link>
      </div>
    )
  }

  const status = entregaStatusInfo[entrega.status]

  return (
    <div>
      <Link to="/motorista" className="text-xs font-semibold text-blue-700">
        ← Minhas entregas
      </Link>

      <div className="mt-2 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-slate-900">BDO {entrega.bdo.numero}</h1>
          <p className="text-sm text-slate-600">{entrega.bdo.passageiroNome}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>{status.label}</span>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <dl className="grid grid-cols-3 gap-y-2">
          <dt className="col-span-1 text-slate-500">Endereço</dt>
          <dd className="col-span-2 text-slate-800">{entrega.bdo.enderecoEntrega}</dd>
          <dt className="col-span-1 text-slate-500">Companhia aérea</dt>
          <dd className="col-span-2 text-slate-800">{entrega.bdo.companhiaAerea}</dd>
          {entrega.motoristaNome && (
            <>
              <dt className="col-span-1 text-slate-500">Motorista</dt>
              <dd className="col-span-2 text-slate-800">{entrega.motoristaNome}</dd>
            </>
          )}
        </dl>
      </div>

      {/* Ações contextuais conforme o estado do ciclo de vida (RD05) */}
      <div className="mt-4 flex flex-col gap-2">
        {entrega.status === 'AGUARDANDO_ATRIBUICAO' && (
          <button
            type="button"
            onClick={() => autoatribuirEntrega(entrega.id)}
            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            Atribuir esta entrega a mim (HU02)
          </button>
        )}

        {(entrega.status === 'ATRIBUIDA' || entrega.status === 'REABERTA') && (
          <Link
            to={`/motorista/entregas/${entrega.id}/rota`}
            className="rounded-lg bg-blue-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            {entrega.status === 'REABERTA' ? 'Tentar entrega novamente: calcular rota' : 'Calcular rota e iniciar viagem'} (HU03/HU04)
          </Link>
        )}

        {entrega.status === 'EM_ANDAMENTO' && entrega.viagem && (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <p className="font-semibold text-slate-800">Viagem congelada</p>
              <dl className="mt-2 grid grid-cols-2 gap-y-1 text-xs text-slate-600">
                <dt>Km ida / volta</dt>
                <dd>
                  {entrega.viagem.kmIda} km / {entrega.viagem.kmVolta} km
                </dd>
                <dt>Tempo estimado</dt>
                <dd>{entrega.viagem.tempoEstimadoMin} min</dd>
                <dt>Pedágios</dt>
                <dd>{entrega.viagem.pedagios.length === 0 ? 'Nenhum' : entrega.viagem.pedagios.map((p) => p.praca).join(', ')}</dd>
                {entrega.viagem.rotaPropria && (
                  <>
                    <dt>Rota própria</dt>
                    <dd>{entrega.viagem.justificativaRotaPropria ?? 'Sem justificativa registrada'}</dd>
                  </>
                )}
              </dl>
            </div>
            <Link
              to={`/motorista/entregas/${entrega.id}/bagagem-carona`}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Vincular bagagem carona (HU05)
            </Link>
            <Link
              to={`/motorista/entregas/${entrega.id}/comprovante`}
              className="rounded-lg bg-emerald-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
            >
              Registrar comprovante de entrega (HU06)
            </Link>
            <Link
              to={`/motorista/entregas/${entrega.id}/ocorrencia`}
              className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Registrar ocorrência — entrega não concretizada (HU07)
            </Link>
          </>
        )}

        {entrega.status === 'ENCERRADA_COM_SUCESSO' && entrega.comprovante && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
            <p className="font-semibold text-emerald-800">Comprovante de entrega (POD)</p>
            <dl className="mt-2 grid grid-cols-2 gap-y-1 text-xs text-emerald-900">
              <dt>Recebedor</dt>
              <dd>{entrega.comprovante.recebedorNome}</dd>
              <dt>Data/hora</dt>
              <dd>{new Date(entrega.comprovante.dataHora).toLocaleString('pt-BR')}</dd>
              <dt>Geolocalização</dt>
              <dd>
                {entrega.comprovante.geolocalizacao.lat.toFixed(4)}, {entrega.comprovante.geolocalizacao.lng.toFixed(4)}
              </dd>
            </dl>
          </div>
        )}
      </div>

      {entrega.bagagensCarona.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-semibold text-slate-800">Bagagens carona</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {entrega.bagagensCarona.map((b) => (
              <li key={b.id} className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
                BDO {b.bdo.numero} — {b.bdo.passageiroNome} (+{b.kmComplementar} km)
              </li>
            ))}
          </ul>
        </div>
      )}

      {entrega.ocorrencias.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-semibold text-slate-800">Histórico de ocorrências</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {entrega.ocorrencias.map((o) => (
              <li key={o.id} className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <p className="font-semibold">{o.motivo}</p>
                {o.observacao && <p className="mt-0.5">{o.observacao}</p>}
                <p className="mt-0.5 text-red-600">{new Date(o.registradaEm).toLocaleString('pt-BR')}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate('/motorista')}
        className="mt-6 text-xs font-medium text-slate-400 hover:text-slate-600"
      >
        Voltar para a lista de entregas
      </button>
    </div>
  )
}
