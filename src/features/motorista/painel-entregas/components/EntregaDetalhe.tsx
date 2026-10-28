import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Icone from '../../../../shared/components/Icone'
import { trajetoAtivo, ultimoTrajetoEncerrado, useStore } from '../../../../shared/services/store'
import { entregaStatusInfo } from '../../../../shared/utils/statusLabels'
import { numero } from '../../../../shared/utils/formatar'

export default function EntregaDetalhe() {
  const { id } = useParams<{ id: string }>()
  const { entregas, autoatribuirEntrega, registrarCheckpoint } = useStore()
  const entrega = entregas.find((e) => e.id === id)
  const localizacao = useLocation()
  const [aviso, setAviso] = useState<string | null>((localizacao.state as { aviso?: string } | null)?.aviso ?? null)

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
      <Link to="/motorista" className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-blue-700">
        <Icone nome="voltar" /> Minhas entregas
      </Link>

      {aviso && (
        <div role="status" className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <span>{aviso}</span>
          <button type="button" onClick={() => setAviso(null)} className="min-h-11 px-2 text-xs font-semibold underline">
            Fechar
          </button>
        </div>
      )}

      {/* Destino em destaque e contato à mão: é o que o motorista mais consulta no carro. */}
      <section aria-label="Destino" className="mt-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <h1 className="text-xs font-bold tracking-wide text-slate-900 tabular-nums">BDO {entrega.bdo.numero}</h1>
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${status.className}`}>{status.label}</span>
        </div>
        <p className="mt-2 text-xs text-slate-600">Entregar para</p>
        <p className="text-xl font-bold text-slate-900">{entrega.bdo.passageiroNome}</p>
        <p className="mt-2 flex items-start gap-2 text-base text-slate-800">
          <Icone nome="pino" className="mt-1 text-slate-500" />
          <span>{entrega.bdo.enderecoEntrega}</span>
        </p>
      </section>

      {/* HU18/HU21: conversa e ligação ficam no mesmo lugar (RI15) */}
      <Link
        to={`/motorista/entregas/${entrega.id}/conversa`}
        className="botao-toque mt-3 flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-blue-700 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
      >
        <Icone nome="telefone" /> Ligar ou conversar com o passageiro
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
            className="botao-toque inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            <Icone nome="rota" /> {entrega.status === 'REABERTA' ? 'Tentar de novo: calcular rota' : 'Calcular rota e iniciar viagem'}
          </Link>
        )}

        {entrega.status === 'EM_ANDAMENTO' && trajeto && ultimoCalculo && (
          <>
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
                  <Icone nome="carro" /> Estou a caminho
                </button>
                <button
                  type="button"
                  onClick={() => registrarCheckpoint(entrega.id, 'chegada')}
                  className="min-h-11 flex-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  <Icone nome="pino" /> Cheguei
                </button>
              </div>
              {marcos.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1 text-xs text-slate-500">
                  {marcos.map((m) => (
                    <li key={m.id}>
                      <Icone nome={m.tipo === 'a_caminho' ? 'carro' : 'pino'} /> {m.tipo === 'a_caminho' ? 'A caminho' : 'Chegada'} · {new Date(m.dataHora).toLocaleTimeString('pt-BR')}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Link
              to={`/motorista/entregas/${entrega.id}/comprovante`}
              className="botao-toque inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
            >
              <Icone nome="checkCirculo" /> Registrar entrega
            </Link>
            <Link
              to={`/motorista/entregas/${entrega.id}/ocorrencia`}
              className="botao-toque inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              <Icone nome="alerta" /> Não consegui entregar
            </Link>
            <Link
              to={`/motorista/entregas/${entrega.id}/bagagem-carona`}
              className="botao-toque inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Icone nome="mala" /> Levar outra bagagem junto
            </Link>
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
                  {numero(ultimoCalculo.kmIda)} km / {numero(ultimoCalculo.kmVolta)} km
                </dd>
                <dt>Tempo estimado</dt>
                <dd>{ultimoCalculo.tempoEstimadoMin} min</dd>
                <dt>Pedágios</dt>
                <dd>{ultimoCalculo.pedagios.length === 0 ? 'Nenhum' : ultimoCalculo.pedagios.map((p) => p.praca).join(', ')}</dd>
                {trajeto.calculosRota.length > 1 && (
                  <>
                    <dt>Cálculos de rota</dt>
                    <dd>{trajeto.calculosRota.length} registrados (o histórico é preservado)</dd>
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

          </>
        )}

        {entrega.status === 'ENCERRADA_COM_SUCESSO' && entrega.comprovante && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
            <p className="font-semibold text-emerald-800">Comprovante de entrega</p>
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
                {trajetoEncerrado.kmIdaFinal === null ? 'Não informado' : `${numero(trajetoEncerrado.kmIdaFinal)} km`} /{' '}
                {trajetoEncerrado.kmVoltaFinal === null ? 'Não informado' : `${numero(trajetoEncerrado.kmVoltaFinal)} km`}
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
                  <dd>{trajetoEncerrado.ajustes.length} registrado(s). Veja o relatório quinzenal</dd>
                </>
              )}
            </dl>
          </div>
        )}
      </div>

      <h2 className="mt-6 text-sm font-semibold text-slate-900">Dados do BDO</h2>
      <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
        <dl className="grid grid-cols-3 gap-y-2">
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
            {entrega.bdo.origem === 'EMAIL_AUTOMATICO' ? (
              <>
                <Icone nome="email" /> Recebido por e-mail
              </>
            ) : (
              <>
                <Icone nome="camera" /> Fotografado
              </>
            )}
          </dd>
          {entrega.motoristaNome && (
            <>
              <dt className="col-span-1 text-slate-500">Motorista</dt>
              <dd className="col-span-2 text-slate-800">{entrega.motoristaNome}</dd>
            </>
          )}
        </dl>
      </div>

      {entrega.bagagensCarona.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-semibold text-slate-800">Bagagens carona</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {entrega.bagagensCarona.map((b) => (
              <li key={b.id} className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
                BDO {b.bdo.numero} · {b.bdo.passageiroNome} (+{b.kmComplementar} km)
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

    </div>
  )
}
