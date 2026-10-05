import Icone from '../../components/Icone'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MOTORISTA_ATUAL, ultimoTrajetoEncerrado, useStore, useEntregasDoTenant, valorVigente } from '../../data/store'
import type { CampoAjuste, Entrega, Trajeto } from '../../types'
import { numero } from '../../data/formatar'

const CAMPO_LABEL: Record<CampoAjuste, string> = {
  KM_IDA: 'Km ida',
  KM_VOLTA: 'Km volta',
  TARIFA_APLICADA: 'Tarifa aplicada (R$)',
  VALOR_PEDAGIO: 'Valor de pedágio (R$)',
}

interface LinhaAjustavelProps {
  trajeto: Trajeto
  campo: CampoAjuste
  tarifaBase: number
  onSalvar: (campo: CampoAjuste, valorAnterior: number, valorNovo: number, justificativa: string) => void
}

function LinhaAjustavel({ trajeto, campo, tarifaBase, onSalvar }: LinhaAjustavelProps) {
  const [editando, setEditando] = useState(false)
  const [valorNovo, setValorNovo] = useState('')
  const [justificativa, setJustificativa] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  const valorAtual = valorVigente(trajeto, campo, tarifaBase)
  const temAjuste = trajeto.ajustes.some((a) => a.campo === campo)

  function salvar() {
    const numero = Number(valorNovo)
    if (valorNovo.trim() === '' || Number.isNaN(numero)) {
      setErro('Informe um valor numérico.')
      return
    }
    if (!justificativa.trim()) {
      setErro('A justificativa é obrigatória para salvar um ajuste.')
      return
    }
    onSalvar(campo, valorAtual, numero, justificativa.trim())
    setEditando(false)
    setValorNovo('')
    setJustificativa('')
    setErro(null)
  }

  return (
    <div className="flex flex-col gap-2 border-b border-slate-100 py-2 last:border-b-0 print:break-inside-avoid">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">
          {CAMPO_LABEL[campo]} {temAjuste && <span className="ml-1 text-xs font-semibold text-amber-700">AJUSTADO</span>}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">{numero(valorAtual, 2)}</span>
          {!editando && (
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="min-h-11 min-w-11 rounded-full border border-slate-300 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 print:hidden"
            >
              Corrigir
            </button>
          )}
        </div>
      </div>

      {editando && (
        <div className="flex flex-col gap-2 rounded-lg bg-slate-50 p-2 print:hidden">
          <input
            value={valorNovo}
            onChange={(e) => setValorNovo(e.target.value)}
            type="number"
            step="0.01"
            placeholder={`Novo valor (atual: ${numero(valorAtual, 2)})`}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
          />
          <textarea
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            rows={2}
            placeholder="Justificativa (obrigatória)"
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
          />
          {erro && <p role="alert" className="text-xs font-medium text-red-600">{erro}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={salvar}
              className="min-h-11 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
            >
              Salvar ajuste
            </button>
            <button
              type="button"
              onClick={() => {
                setEditando(false)
                setErro(null)
              }}
              className="min-h-11 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CartaoEntrega({ entrega, trajeto, tarifaBase }: { entrega: Entrega; trajeto: Trajeto; tarifaBase: number }) {
  const { registrarAjusteViagem } = useStore()

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 print:break-inside-avoid">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">BDO {entrega.bdo.numero}</p>
        <span className="text-xs text-slate-500">{new Date(trajeto.dataInicio).toLocaleDateString('pt-BR')}</span>
      </div>
      <p className="text-xs text-slate-500">{entrega.bdo.passageiroNome}</p>

      <div className="mt-3">
        {(['KM_IDA', 'KM_VOLTA', 'TARIFA_APLICADA', 'VALOR_PEDAGIO'] as CampoAjuste[]).map((campo) => (
          <LinhaAjustavel
            key={campo}
            trajeto={trajeto}
            campo={campo}
            tarifaBase={tarifaBase}
            onSalvar={(c, valorAnterior, valorNovo, justificativa) =>
              registrarAjusteViagem(trajeto.id, c, valorAnterior, valorNovo, justificativa)
            }
          />
        ))}
      </div>

      {trajeto.ajustes.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-2">
          <p className="text-xs font-semibold text-slate-600">Histórico de ajustes</p>
          <ul className="mt-1 flex flex-col gap-1">
            {trajeto.ajustes.map((a) => (
              <li key={a.id} className="text-xs text-slate-500">
                {CAMPO_LABEL[a.campo]}: {a.valorAnterior} → {a.valorNovo} — "{a.justificativa}" ({a.motoristaNome},{' '}
                {new Date(a.criadoEm).toLocaleString('pt-BR')})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function RelatorioQuinzenal() {
  const entregas = useEntregasDoTenant()
  const { tarifas } = useStore()
  const tarifaPadrao = tarifas.find((t) => t.escopo === 'TENANT')

  const minhasComTrajeto = entregas
    .filter((e) => e.motoristaId === MOTORISTA_ATUAL.id)
    .map((e) => ({ entrega: e, trajeto: ultimoTrajetoEncerrado(e) }))
    .filter((item): item is { entrega: Entrega; trajeto: Trajeto } => !!item.trajeto)
    .sort((a, b) => b.trajeto.dataInicio.localeCompare(a.trajeto.dataInicio))

  return (
    <div>
      <div className="flex items-start justify-between gap-2 print:hidden">
        <div>
          <Link to="/motorista" className="min-h-11 text-xs font-semibold text-blue-700">
            ← Painel de entregas
          </Link>
          <h1 className="mt-2 text-lg font-bold text-slate-900">Relatório quinzenal</h1>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-11 shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Icone nome="impressora" /> Imprimir
        </button>
      </div>

      <div className="hidden print:block">
        <h1 className="text-lg font-bold text-slate-900">Relatório quinzenal — {MOTORISTA_ATUAL.nome}</h1>
        <p className="text-xs text-slate-500">Emitido em {new Date().toLocaleString('pt-BR')}</p>
      </div>

      <p className="mt-1 text-sm text-slate-600 print:hidden">
        Entregas com trajeto consolidado no período em andamento. Corrija qualquer valor calculado informando uma
        justificativa — o valor final consolidado do trajeto nunca é sobrescrito, e o fechamento seguinte usa o valor
        ajustado mais recente.
      </p>

      {minhasComTrajeto.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">Nenhuma entrega com trajeto consolidado ainda.</p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {minhasComTrajeto.map(({ entrega, trajeto }) => {
          const tarifaBase = tarifaPadrao ? tarifaPadrao.valorFixo + tarifaPadrao.valorPorKm * ((trajeto.kmIdaFinal ?? 0) + (trajeto.kmVoltaFinal ?? 0)) : 0
          return <CartaoEntrega key={trajeto.id} entrega={entrega} trajeto={trajeto} tarifaBase={tarifaBase} />
        })}
      </div>
    </div>
  )
}
