import { Link, useNavigate, useParams } from 'react-router-dom'
import { trajetoAtivo, ultimoTrajetoEncerrado, useStore } from '../../data/store'
import { entregaStatusInfo } from '../../data/statusLabels'

export default function EntregaDetalhe() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { entregas, autoatribuirEntrega, registrarCheckpoint } = useStore()
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
  const trajeto = trajetoAtivo(entrega)
  const trajetoEncerrado = ultimoTrajetoEncerrado(entrega)
  const ultimoCalculo = trajeto?.calculosRota[trajeto.calculosRota.length - 1]
  const marcos = trajeto?.checkpoints.filter((c) => c.tipo === 'a_caminho' || c.tipo === 'chegada') ?? []

  return (
    <div>
      <Link to="/motorista" className="text-xs font-semibold text-blue-700">
        ← Painel de entregas
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
          {entrega.bdo.etiquetaBagagem && (
            <>
              <dt className="col-span-1 text-slate-500">Etiqueta</dt>
              <dd className="col-span-2 text-slate-800">{entrega.bdo.etiquetaBagagem}</dd>
            </>
          )}
          <dt className="col-span-1 text-slate-500">Origem do BDO</dt>
          <dd className="col-span-2 text-slate-800">
            {entrega.bdo.origem === 'EMAIL_AUTOMATICO' ? '✉️ Recebido por e-mail' : '📷 Fotografado'}
          </dd>
          {entrega.motoristaNome && (
            <>
              <dt className="col-span-1 text-slate-500">Motorista</dt>
              <dd className="col-span-2 text-slate-800">{entrega.motoristaNome}</dd>
            </>
          )}
        </dl>
      </div>

      {/* HU18/HU21 — conversa e ligação ficam no mesmo lugar (RI15) */}
      <Link
        to={`/motorista/entregas/${entrega.id}/conversa`}
        className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm hover:border-blue-300"
      >
        <span className="font-semibold text-slate-800">💬 Conversa e ligação com o passageiro</span>
        <span className="text-xs font-semibold text-blue-700">Abrir →</span>
      </Link>

      {/* Ações contextuais conforme o estado do ciclo de vida (RD05) */}
      <div className="mt-4 flex flex-col gap-2">
        {entrega.status === 'AGUARDANDO_ATRIBUICAO' && (
          <button
            type="button"
            onClick={() => autoatribuirEntrega(entrega.id)}
            className="min-h-11 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            Atribuir esta entrega a mim
          </button>
        )}

        {(entrega.status === 'ATRIBUIDA' || entrega.status === 'REABERTA') && (
          <Link
            to={`/motorista/entregas/${entrega.id}/rota`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            {entrega.status === 'REABERTA' ? 'Tentar entrega novamente: calcular rota' : 'Calcular rota e iniciar viagem'}
          </Link>
        )}

        {entrega.status === 'EM_ANDAMENTO' && trajeto && ultimoCalculo && (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-800">Trajeto em execução</p>
                <Link to={`/motorista/entregas/${entrega.id}/rota`} className="min-h-11 text-xs font-semibold text-blue-700 hover:underline">
                  Recalcular rota
                </Link>
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-y-1 text-xs text-slate-600">
                <dt>Km ida / volta (atual)</dt>
                <dd>
                  {ultimoCalculo.kmIda} km / {ultimoCalculo.kmVolta} km
                </dd>
                <dt>Tempo estimado</dt>
                <dd>{ultimoCalculo.tempoEstimadoMin} min</dd>
                <dt>Pedágios</dt>
                <dd>{ultimoCalculo.pedagios.length === 0 ? 'Nenhum' : ultimoCalculo.pedagios.map((p) => p.praca).join(', ')}</dd>
                {trajeto.calculosRota.length > 1 && (
                  <>
                    <dt>Cálculos de rota</dt>
                    <dd>{trajeto.calculosRota.length} registrados (histórico preservado — RD04)</dd>
                  </>
                )}
                {ultimoCalculo.origemSelecao === 'propria' && (
                  <>
                    <dt>Rota própria</dt>
                    <dd>{ultimoCalculo.justificativaRotaPropria ?? 'Sem justificativa registrada'}</dd>
                  </>
                )}
              </dl>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <p className="font-semibold text-slate-800">Marcos de progresso</p>
              <p className="mt-1 text-xs text-slate-500">
                Cada toque avisa automaticamente o passageiro pela conversa, quando houver contato disponível.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => registrarCheckpoint(entrega.id, 'a_caminho')}
                  className="min-h-11 flex-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-100"
                >
                  🚗 Estou a caminho
                </button>
                <button
                  type="button"
                  onClick={() => registrarCheckpoint(entrega.id, 'chegada')}
                  className="min-h-11 flex-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  📍 Cheguei
                </button>
              </div>
              {marcos.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1 text-xs text-slate-500">
                  {marcos.map((m) => (
                    <li key={m.id}>
                      {m.tipo === 'a_caminho' ? '🚗 A caminho' : '📍 Chegada'} — {new Date(m.dataHora).toLocaleTimeString('pt-BR')}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Link
              to={`/motorista/entregas/${entrega.id}/bagagem-carona`}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Vincular bagagem carona
            </Link>
            <Link
              to={`/motorista/entregas/${entrega.id}/comprovante`}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
            >
              Registrar comprovante de entrega
            </Link>
            <Link
              to={`/motorista/entregas/${entrega.id}/ocorrencia`}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Registrar ocorrência — entrega não concretizada
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

        {trajetoEncerrado && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
            <p className="font-semibold text-slate-800">Trajeto consolidado</p>
            <dl className="mt-2 grid grid-cols-2 gap-y-1 text-xs text-slate-600">
              <dt>Km ida / volta final</dt>
              <dd>
                {trajetoEncerrado.kmIdaFinal} km / {trajetoEncerrado.kmVoltaFinal} km
              </dd>
              <dt>Tempo final</dt>
              <dd>{trajetoEncerrado.tempoFinalMin} min</dd>
              {trajetoEncerrado.justificativaDivergencia && (
                <>
                  <dt>Justificativa de divergência</dt>
                  <dd>{trajetoEncerrado.justificativaDivergencia}</dd>
                </>
              )}
              {trajetoEncerrado.ajustes.length > 0 && (
                <>
                  <dt>Ajustes</dt>
                  <dd>{trajetoEncerrado.ajustes.length} registrado(s) — ver relatório quinzenal</dd>
                </>
              )}
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
        className="mt-6 min-h-11 text-xs font-medium text-slate-500 hover:text-slate-700"
      >
        Voltar para o painel de entregas
      </button>
    </div>
  )
}
