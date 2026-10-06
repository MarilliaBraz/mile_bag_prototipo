import { useState, type FormEvent } from 'react'
import { useStore } from '../../data/store'
import type { EscopoTarifa } from '../../types'
import { moeda } from '../../data/formatar'

const escopoLabel: Record<EscopoTarifa, string> = {
  TENANT: 'Padrão da empresa',
  MOTORISTA: 'Motorista específico',
  REGIAO: 'Região específica',
}

export default function Tarifas() {
  const { tarifas, cadastrarTarifa } = useStore()

  const [escopo, setEscopo] = useState<EscopoTarifa>('TENANT')
  const [referencia, setReferencia] = useState('')
  const [valorFixo, setValorFixo] = useState('')
  const [valorPorKm, setValorPorKm] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  function limparFormulario() {
    setEscopo('TENANT')
    setReferencia('')
    setValorFixo('')
    setValorPorKm('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErro(null)

    const fixo = valorFixo.trim() === '' ? undefined : Number(valorFixo)
    const porKm = valorPorKm.trim() === '' ? undefined : Number(valorPorKm)

    // FR-005 (HU09); ao menos um dos dois componentes é obrigatório
    if (!fixo && !porKm) {
      setErro('Informe ao menos o valor fixo ou o valor por quilômetro.')
      return
    }
    if (escopo !== 'TENANT' && referencia.trim() === '') {
      setErro(escopo === 'MOTORISTA' ? 'Informe o motorista.' : 'Informe a região.')
      return
    }

    cadastrarTarifa({
      escopo,
      referencia: escopo === 'TENANT' ? undefined : referencia.trim(),
      valorFixo: fixo ?? 0,
      valorPorKm: porKm ?? 0,
    })
    limparFormulario()
  }

  const ordemEspecificidade: Record<EscopoTarifa, number> = { MOTORISTA: 0, REGIAO: 1, TENANT: 2 }
  const tarifasOrdenadas = [...tarifas].sort((a, b) => ordemEspecificidade[a.escopo] - ordemEspecificidade[b.escopo])

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Tabelas de tarifa</h1>
      <p className="mt-1 text-sm text-slate-500">
        Valores pagos por entrega. Em caso de conflito, a ordem de especificidade é motorista &gt; região &gt; padrão do
        tenant.
      </p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white">
        {tarifasOrdenadas.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Nenhuma tarifa cadastrada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
<table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">Escopo</th>
                <th scope="col" className="px-4 py-2 font-medium">Referência</th>
                <th scope="col" className="px-4 py-2 font-medium">Valor fixo</th>
                <th scope="col" className="px-4 py-2 font-medium">Valor por km</th>
              </tr>
            </thead>
            <tbody>
              {tarifasOrdenadas.map((tarifa) => (
                <tr key={tarifa.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2 font-medium text-slate-800">{escopoLabel[tarifa.escopo]}</td>
                  <td className="px-4 py-2 text-slate-600">{tarifa.referencia ?? 'Todos os motoristas'}</td>
                  <td className="px-4 py-2 text-slate-600">{moeda(tarifa.valorFixo)}</td>
                  <td className="px-4 py-2 text-slate-600">{moeda(tarifa.valorPorKm)}</td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">Cadastrar nova tarifa</h2>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-slate-700">
            Escopo
            <select
              value={escopo}
              onChange={(e) => setEscopo(e.target.value as EscopoTarifa)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="TENANT">Padrão da empresa</option>
              <option value="MOTORISTA">Motorista específico</option>
              <option value="REGIAO">Região específica</option>
            </select>
          </label>

          {escopo !== 'TENANT' && (
            <label className="text-sm text-slate-700">
              {escopo === 'MOTORISTA' ? 'Nome do motorista' : 'Região'}
              <input
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder={escopo === 'MOTORISTA' ? 'Ex.: Carlos Eduardo Souza' : 'Ex.: Setor Bueno'}
              />
            </label>
          )}

          <label className="text-sm text-slate-700">
            Valor fixo (R$)
            <input
              type="number"
              min="0"
              step="0.01"
              value={valorFixo}
              onChange={(e) => setValorFixo(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="0,00"
            />
          </label>

          <label className="text-sm text-slate-700">
            Valor por quilômetro (R$)
            <input
              type="number"
              min="0"
              step="0.01"
              value={valorPorKm}
              onChange={(e) => setValorPorKm(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="0,00"
            />
          </label>
        </div>

        {erro && <p role="alert" className="mt-3 text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
        >
          Cadastrar tarifa
        </button>
      </form>
    </div>
  )
}
