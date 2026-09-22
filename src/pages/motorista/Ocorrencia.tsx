import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { avaliarDivergencia, trajetoAtivo, useConfiguracaoTenant, useStore } from '../../data/store'

export default function Ocorrencia() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { entregas, registrarOcorrencia } = useStore()
  const configuracao = useConfiguracaoTenant()
  const entrega = entregas.find((e) => e.id === id)
  const trajeto = entrega ? trajetoAtivo(entrega) : undefined
  const divergencia = trajeto ? avaliarDivergencia(trajeto, configuracao) : null

  const [motivo, setMotivo] = useState('')
  const [observacao, setObservacao] = useState('')
  const [justificativaDivergencia, setJustificativaDivergencia] = useState('')
  const [erro, setErro] = useState<string | null>(null)

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

  // FR-003: entrega já encerrada com comprovante não aceita ocorrência
  if (entrega.status === 'ENCERRADA_COM_SUCESSO') {
    return (
      <div>
        <Link to={`/motorista/entregas/${entrega.id}`} className="text-xs font-semibold text-blue-700">
          ← BDO {entrega.bdo.numero}
        </Link>
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Esta entrega já foi encerrada com comprovante de entrega — não é possível registrar uma ocorrência para ela.
        </div>
      </div>
    )
  }

  // Edge case da spec: sem motivo cadastrado pelo tenant (HU11), não é possível registrar
  const semMotivosCadastrados = configuracao.motivosOcorrencia.length === 0

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!motivo) {
      setErro('Selecione um motivo do catálogo do tenant.')
      return
    }
    if (divergencia?.divergiu && !justificativaDivergencia.trim()) {
      setErro('A quilometragem final diverge da rota inicialmente sugerida — informe uma justificativa antes de encerrar.')
      return
    }
    setErro(null)
    registrarOcorrencia(
      entrega!.id,
      motivo,
      observacao.trim() || undefined,
      divergencia?.divergiu ? justificativaDivergencia.trim() : undefined,
    )
    navigate(`/motorista/entregas/${entrega!.id}`)
  }

  return (
    <div>
      <Link to={`/motorista/entregas/${entrega.id}`} className="text-xs font-semibold text-blue-700">
        ← BDO {entrega.bdo.numero}
      </Link>
      <h1 className="mt-2 text-lg font-bold text-slate-900">Registrar ocorrência</h1>
      <p className="mt-1 text-sm text-slate-600">
        Use quando a entrega não pôde ser concluída. O BDO é reaberto automaticamente para nova tentativa — o
        histórico de tentativas anteriores fica preservado.
      </p>

      {entrega.ocorrencias.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-semibold text-slate-800">Tentativas anteriores</h2>
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

      {semMotivosCadastrados ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          O administrador do tenant ainda não cadastrou nenhum motivo de ocorrência. Não é possível registrar
          uma ocorrência até que ao menos um motivo exista no catálogo.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Motivo</span>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Selecione um motivo...</option>
              {configuracao.motivosOcorrencia.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Observação (opcional)</span>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={3}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Detalhes adicionais sobre a tentativa"
            />
          </label>

          {divergencia?.divergiu && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-amber-800">
                ⚠️ Km final ({divergencia.totalFinal.toFixed(1)} km) diverge da rota sugerida ({divergencia.totalInicial.toFixed(1)}{' '}
                km) — justifique antes de encerrar esta tentativa
              </span>
              <textarea
                value={justificativaDivergencia}
                onChange={(e) => setJustificativaDivergencia(e.target.value)}
                rows={2}
                className="rounded-lg border border-amber-300 px-3 py-2 text-sm"
                placeholder="Ex.: desvio por obra na via, trânsito intenso..."
              />
            </label>
          )}

          {erro && <p className="text-xs font-medium text-red-600">{erro}</p>}

          <button
            type="submit"
            className="mt-1 min-h-11 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-800"
          >
            Registrar ocorrência e reabrir BDO
          </button>
        </form>
      )}
    </div>
  )
}
