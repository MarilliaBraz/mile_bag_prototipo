import { useState, type FormEvent } from 'react'
import { useStore } from '../../data/store'

export default function Pedagios() {
  const { pedagios, cadastrarPedagio } = useStore()

  const [nome, setNome] = useState('')
  const [valor, setValor] = useState('')
  const [vigenteDesde, setVigenteDesde] = useState(() => new Date().toISOString().slice(0, 10))
  const [erro, setErro] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErro(null)

    if (nome.trim() === '') {
      setErro('Informe o nome/identificação da praça.')
      return
    }
    const valorNumerico = Number(valor)
    if (!valor || Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      setErro('Informe um valor de pedágio válido.')
      return
    }

    // FR-005 (HU10) — rejeita vigência anterior à do valor vigente mais recente da mesma praça
    const valoresDaMesmaPraca = pedagios.filter((p) => p.nome.trim().toLowerCase() === nome.trim().toLowerCase())
    const vigenciaMaisRecente = valoresDaMesmaPraca.reduce<string | null>(
      (maisRecente, p) => (!maisRecente || p.vigenteDesde > maisRecente ? p.vigenteDesde : maisRecente),
      null,
    )
    if (vigenciaMaisRecente && vigenteDesde < vigenciaMaisRecente) {
      setErro(`Já existe um valor vigente para "${nome}" a partir de ${formatarData(vigenciaMaisRecente)}. Escolha uma data igual ou posterior.`)
      return
    }

    cadastrarPedagio({ nome: nome.trim(), valor: valorNumerico, vigenteDesde })
    setNome('')
    setValor('')
    setVigenteDesde(new Date().toISOString().slice(0, 10))
  }

  const pedagiosOrdenados = [...pedagios].sort((a, b) => a.nome.localeCompare(b.nome) || b.vigenteDesde.localeCompare(a.vigenteDesde))

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Praças de pedágio</h1>
      <p className="mt-1 text-sm text-slate-500">
        Cadastro por tenant, com histórico de valores por data de vigência. O reembolso de uma viagem é sempre o dobro
        do valor vigente — ida e volta — e usa o valor congelado no trajeto consolidado da viagem, nunca um valor
        atualizado depois.
      </p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white">
        {pedagiosOrdenados.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Nenhuma praça cadastrada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
<table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">Praça</th>
                <th scope="col" className="px-4 py-2 font-medium">Valor (ida)</th>
                <th scope="col" className="px-4 py-2 font-medium">Reembolso (ida + volta)</th>
                <th scope="col" className="px-4 py-2 font-medium">Vigente desde</th>
              </tr>
            </thead>
            <tbody>
              {pedagiosOrdenados.map((pedagio) => (
                <tr key={pedagio.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2 font-medium text-slate-800">{pedagio.nome}</td>
                  <td className="px-4 py-2 text-slate-600">R$ {pedagio.valor.toFixed(2)}</td>
                  <td className="px-4 py-2 text-slate-600">R$ {(pedagio.valor * 2).toFixed(2)}</td>
                  <td className="px-4 py-2 text-slate-600">{formatarData(pedagio.vigenteDesde)}</td>
                </tr>
              ))}
            </tbody>
          </table>
</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">Cadastrar novo valor de pedágio</h2>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="text-sm text-slate-700 sm:col-span-1">
            Praça de pedágio
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Ex.: BR-153 - Goiânia/Aparecida"
            />
          </label>

          <label className="text-sm text-slate-700">
            Valor (R$)
            <input
              type="number"
              min="0"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="0,00"
            />
          </label>

          <label className="text-sm text-slate-700">
            Vigente desde
            <input
              type="date"
              value={vigenteDesde}
              onChange={(e) => setVigenteDesde(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        {erro && <p role="alert" className="mt-3 text-sm text-red-600">{erro}</p>}

        <button
          type="submit"
          className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
        >
          Cadastrar valor
        </button>
      </form>
    </div>
  )
}

function formatarData(data: string): string {
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR')
}
