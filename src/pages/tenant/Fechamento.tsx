import ConfirmarAcao from '../../components/ConfirmarAcao'
import Icone from '../../components/Icone'
import { useState } from 'react'
import { useStore } from '../../data/store'
import { moeda } from '../../data/formatar'

export default function Fechamento() {
  const { fechamentos, gerarFechamento } = useStore()
  const [ultimoGerado, setUltimoGerado] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState(false)

  function handleGerar() {
    setConfirmando(false)
    const fechamento = gerarFechamento()
    setUltimoGerado(fechamento.id)
    setTimeout(() => setUltimoGerado(null), 2500)
  }

  const fechamentosOrdenados = [...fechamentos].sort((a, b) => b.geradoEm.localeCompare(a.geradoEm))

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Fechamento periódico</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pagamento de entregas e reembolso de pedágios, calculados a partir do trajeto final consolidado de cada
            entrega (usando o ajuste mais recente do motorista, quando existir) e das tarifas/pedágios vigentes,
            sempre como totais separados.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="shrink-0 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
        >
          Gerar novo fechamento
        </button>
      </div>

      {ultimoGerado && (
        <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
          <Icone nome="check" /> Fechamento gerado sem ajuste manual.
        </p>
      )}

      <ConfirmarAcao
        aberto={confirmando}
        titulo="Gerar novo fechamento?"
        descricao="O fechamento reúne o pagamento de entregas e o reembolso de pedágios dos trajetos já consolidados, com as tarifas e pedágios vigentes."
        rotuloConfirmar="Gerar fechamento"
        aoConfirmar={handleGerar}
        aoCancelar={() => setConfirmando(false)}
      />

      <div className="mt-6 flex flex-col gap-3">
        {fechamentosOrdenados.length === 0 && <p className="text-sm text-slate-500">Nenhum fechamento gerado ainda.</p>}

        {fechamentosOrdenados.map((fechamento) => (
          <div key={fechamento.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">
                Período de {formatarData(fechamento.periodoInicio)} a {formatarData(fechamento.periodoFim)}
              </p>
              <span className="text-xs text-slate-500">Gerado em {new Date(fechamento.geradoEm).toLocaleString('pt-BR')}</span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Relatório de pagamento de entregas</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{moeda(fechamento.totalPagamentoEntregas)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Relatório de reembolso de pedágios</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{moeda(fechamento.totalReembolsoPedagios)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Entregas incluídas</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{fechamento.quantidadeEntregas}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatarData(data: string): string {
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR')
}
