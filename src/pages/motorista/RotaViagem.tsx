import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { trajetoAtivo, useStore } from '../../data/store'
import type { TrechoPedagio } from '../../types'

interface OpcaoRota {
  id: string
  titulo: string
  kmIda: number
  kmVolta: number
  tempoEstimadoMin: number
  pedagios: TrechoPedagio[]
}

// Gera 2-3 alternativas de rota mock. `variacao` diferencia o resultado entre
// o cálculo inicial e um recálculo (HU04 FR-003) para a mesma entrega.
function gerarOpcoesRota(entregaId: string, variacao = 0): OpcaoRota[] {
  let seed = variacao
  for (let i = 0; i < entregaId.length; i += 1) seed = (seed * 31 + entregaId.charCodeAt(i)) % 1000

  const base = 6 + (seed % 12) // 6–17 km
  return [
    {
      id: 'sugerida-rapida',
      titulo: 'Rota sugerida — mais rápida',
      kmIda: Math.round(base * 10) / 10,
      kmVolta: Math.round(base * 10) / 10,
      tempoEstimadoMin: Math.round(base * 2.1),
      pedagios: base > 12 ? [{ praca: 'BR-153 - Goiânia/Aparecida', valor: 6.9 }] : [],
    },
    {
      id: 'sugerida-sem-pedagio',
      titulo: 'Rota sugerida — evita pedágio',
      kmIda: Math.round((base + 2.4) * 10) / 10,
      kmVolta: Math.round((base + 2.4) * 10) / 10,
      tempoEstimadoMin: Math.round((base + 2.4) * 2.6),
      pedagios: [],
    },
    {
      id: 'sugerida-alternativa',
      titulo: 'Rota sugerida — alternativa',
      kmIda: Math.round((base - 1.5 > 3 ? base - 1.5 : base + 4) * 10) / 10,
      kmVolta: Math.round((base - 1.5 > 3 ? base - 1.5 : base + 4) * 10) / 10,
      tempoEstimadoMin: Math.round(base * 1.8),
      pedagios: base > 8 ? [{ praca: 'GO-070 - Trindade', valor: 4.5 }] : [],
    },
  ]
}

export default function RotaViagem() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { entregas, iniciarViagem, recalcularRota } = useStore()
  const entrega = entregas.find((e) => e.id === id)
  const trajeto = entrega ? trajetoAtivo(entrega) : undefined
  const modoRecalculo = !!trajeto

  // Recálculo usa uma variação diferente do primeiro cálculo, para não repetir
  // exatamente as mesmas opções (só efeito visual do protótipo).
  const opcoes = useMemo(
    () => (id ? gerarOpcoesRota(id, modoRecalculo ? (trajeto?.calculosRota.length ?? 1) : 0) : []),
    [id, modoRecalculo, trajeto?.calculosRota.length],
  )
  const [opcaoEscolhidaId, setOpcaoEscolhidaId] = useState<string | null>(null)
  const [rotaPropria, setRotaPropria] = useState(false)
  const [justificativa, setJustificativa] = useState('')

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

  const opcaoSelecionada = opcoes.find((o) => o.id === opcaoEscolhidaId) ?? null
  const podeConfirmar = rotaPropria ? justificativa.trim().length > 0 : opcaoSelecionada !== null

  function confirmar() {
    if (!podeConfirmar) return
    const calculo = rotaPropria
      ? {
          kmIda: 0,
          kmVolta: 0,
          pedagios: [],
          tempoEstimadoMin: 0,
          origemSelecao: 'propria' as const,
          justificativaRotaPropria: justificativa.trim(),
        }
      : opcaoSelecionada
        ? {
            kmIda: opcaoSelecionada.kmIda,
            kmVolta: opcaoSelecionada.kmVolta,
            pedagios: opcaoSelecionada.pedagios,
            tempoEstimadoMin: opcaoSelecionada.tempoEstimadoMin,
            origemSelecao: 'sugerida' as const,
          }
        : null
    if (!calculo) return
    if (modoRecalculo) {
      recalcularRota(entrega!.id, calculo)
    } else {
      iniciarViagem(entrega!.id, calculo)
    }
    navigate(`/motorista/entregas/${entrega!.id}`)
  }

  return (
    <div>
      <Link to={`/motorista/entregas/${entrega.id}`} className="text-xs font-semibold text-blue-700">
        ← BDO {entrega.bdo.numero}
      </Link>
      <h1 className="mt-2 text-lg font-bold text-slate-900">{modoRecalculo ? 'Recalcular rota' : 'Calcular e escolher rota'}</h1>
      <p className="mt-1 text-xs text-slate-500">Destino: {entrega.bdo.enderecoEntrega}</p>
      {modoRecalculo && (
        <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
          A viagem já está em execução — recalcular não trava nem apaga nada: o novo cálculo entra no histórico do
          trajeto, junto com os anteriores.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {opcoes.map((opcao) => {
          const selecionada = !rotaPropria && opcaoEscolhidaId === opcao.id
          return (
            <button
              type="button"
              key={opcao.id}
              onClick={() => {
                setRotaPropria(false)
                setOpcaoEscolhidaId(opcao.id)
              }}
              className={`rounded-xl border p-4 text-left text-sm ${
                selecionada ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <p className="font-semibold text-slate-800">{opcao.titulo}</p>
              <dl className="mt-2 grid grid-cols-3 gap-1 text-xs text-slate-600">
                <div>
                  <dt className="text-slate-500">Distância</dt>
                  <dd>
                    {opcao.kmIda} km ida / {opcao.kmVolta} km volta
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Tempo estimado</dt>
                  <dd>{opcao.tempoEstimadoMin} min</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Pedágios</dt>
                  <dd>{opcao.pedagios.length === 0 ? 'Nenhum' : opcao.pedagios.map((p) => p.praca).join(', ')}</dd>
                </div>
              </dl>
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => {
            setRotaPropria(true)
            setOpcaoEscolhidaId(null)
          }}
          className={`rounded-xl border p-4 text-left text-sm ${
            rotaPropria ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <p className="font-semibold text-slate-800">Traçar rota própria</p>
          <p className="mt-1 text-xs text-slate-500">
            Use quando nenhuma sugestão atende à situação real — exige justificativa.
          </p>
        </button>

        {rotaPropria && (
          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
            Justificativa da rota própria
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Ex.: desvio por obra na via, trânsito intenso…"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              rows={3}
            />
          </label>
        )}
      </div>

      <button
        type="button"
        disabled={!podeConfirmar}
        onClick={confirmar}
        className="mt-4 min-h-11 w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {modoRecalculo ? 'Usar esta rota a partir de agora' : 'Iniciar viagem com esta rota'}
      </button>
      <p className="mt-2 text-center text-xs text-slate-500">
        {modoRecalculo
          ? 'A quilometragem final será consolidada a partir do último cálculo usado, ao encerrar a entrega.'
          : 'A quilometragem e os pedágios são consolidados ao encerrar a entrega, a partir do trajeto completo.'}
      </p>
    </div>
  )
}
