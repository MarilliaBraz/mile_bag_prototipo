import { useState, type KeyboardEvent } from 'react'
import { useConfiguracaoTenant, useStore } from '../../data/store'
import type { PeriodicidadeFechamento } from '../../types'

interface TagListEditorProps {
  titulo: string
  descricao: string
  itens: string[]
  onChange: (itens: string[]) => void
}

function TagListEditor({ titulo, descricao, itens, onChange }: TagListEditorProps) {
  const [novoItem, setNovoItem] = useState('')

  function adicionar() {
    const valor = novoItem.trim()
    if (valor === '' || itens.includes(valor)) return
    onChange([...itens, valor])
    setNovoItem('')
  }

  function remover(item: string) {
    onChange(itens.filter((i) => i !== item))
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      adicionar()
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-800">{titulo}</h2>
      <p className="mt-0.5 text-xs text-slate-500">{descricao}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {itens.length === 0 && <p className="text-xs text-slate-400">Nenhum item cadastrado.</p>}
        {itens.map((item) => (
          <span
            key={item}
            className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
          >
            {item}
            <button
              type="button"
              onClick={() => remover(item)}
              className="text-slate-400 hover:text-red-600"
              aria-label={`Remover ${item}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={novoItem}
          onChange={(e) => setNovoItem(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          placeholder="Adicionar item..."
        />
        <button
          type="button"
          onClick={adicionar}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Adicionar
        </button>
      </div>
    </div>
  )
}

export default function Configuracoes() {
  const configuracao = useConfiguracaoTenant()
  const { atualizarConfiguracao } = useStore()
  const [salvo, setSalvo] = useState(false)

  function avisarSalvo() {
    setSalvo(true)
    setTimeout(() => setSalvo(false), 1500)
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Configurações do tenant</h1>
      <p className="mt-1 text-sm text-slate-500">
        Parametrização exclusiva desta empresa — nenhum outro tenant vê ou edita estes valores (RNF01). Cada alteração
        é aplicada imediatamente.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <TagListEditor
          titulo="Motivos de ocorrência"
          descricao="Catálogo exibido ao motorista ao registrar que uma entrega não se concretizou (RD07)."
          itens={configuracao.motivosOcorrencia}
          onChange={(itens) => {
            atualizarConfiguracao({ motivosOcorrencia: itens })
            avisarSalvo()
          }}
        />

        <TagListEditor
          titulo="Campos obrigatórios do formulário de baixa"
          descricao="Refletido na interface de baixa exibida ao motorista (RI10)."
          itens={configuracao.camposObrigatoriosBaixa}
          onChange={(itens) => {
            atualizarConfiguracao({ camposObrigatoriosBaixa: itens })
            avisarSalvo()
          }}
        />

        <TagListEditor
          titulo="Bases aeroportuárias"
          descricao="Aeroportos a partir dos quais este tenant opera."
          itens={configuracao.basesAeroportuarias}
          onChange={(itens) => {
            atualizarConfiguracao({ basesAeroportuarias: itens })
            avisarSalvo()
          }}
        />

        <TagListEditor
          titulo="Companhias aéreas atendidas"
          descricao="BDOs dessas companhias podem ser processados por este tenant."
          itens={configuracao.companhiasAtendidas}
          onChange={(itens) => {
            atualizarConfiguracao({ companhiasAtendidas: itens })
            avisarSalvo()
          }}
        />

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-800">Periodicidade do fechamento</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Um período já em andamento é concluído com a periodicidade anterior; a mudança só vale a partir do próximo
            período (FR-008).
          </p>
          <select
            value={configuracao.periodicidadeFechamento}
            onChange={(e) => {
              atualizarConfiguracao({ periodicidadeFechamento: e.target.value as PeriodicidadeFechamento })
              avisarSalvo()
            }}
            className="mt-3 w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm sm:w-auto"
          >
            <option value="QUINZENAL">Quinzenal</option>
            <option value="MENSAL">Mensal</option>
          </select>
        </div>
      </div>

      <p className={`mt-4 text-xs font-medium text-emerald-700 transition-opacity ${salvo ? 'opacity-100' : 'opacity-0'}`}>
        ✓ Configuração salva
      </p>
    </div>
  )
}
