import { useState, type FormEvent } from 'react'
import { useStore } from '../../../../shared/services/store'

export default function Planos() {
  const { planos, tenants, cadastrarPlano, trocarPlanoTenant } = useStore()

  const [nome, setNome] = useState('')
  const [limiteMotoristasAtivos, setLimiteMotoristasAtivos] = useState(10)
  const [limiteVolumeMensalBdos, setLimiteVolumeMensalBdos] = useState(300)
  const [precoMensal, setPrecoMensal] = useState(0)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    cadastrarPlano({ nome, limiteMotoristasAtivos, limiteVolumeMensalBdos, precoMensal })
    setNome('')
    setLimiteMotoristasAtivos(10)
    setLimiteVolumeMensalBdos(300)
    setPrecoMensal(0)
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Planos de assinatura</h1>
      <p className="mt-1 text-sm text-slate-500">
        Limites por número de motoristas ativos e volume mensal de BDOs.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {planos.map((plano) => (
          <div key={plano.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">{plano.nome}</p>
            <dl className="mt-2 flex flex-col gap-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <dt>Motoristas ativos</dt>
                <dd>até {plano.limiteMotoristasAtivos}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Volume mensal de BDOs</dt>
                <dd>até {plano.limiteVolumeMensalBdos}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex max-w-md flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-800">Cadastrar novo plano</h2>
        <div>
          <label htmlFor="nome" className="text-xs font-medium text-slate-600">
            Nome
          </label>
          <input
            id="nome"
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="limiteMotoristas" className="text-xs font-medium text-slate-600">
              Limite de motoristas
            </label>
            <input
              id="limiteMotoristas"
              type="number"
              min={1}
              required
              value={limiteMotoristasAtivos}
              onChange={(e) => setLimiteMotoristasAtivos(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="limiteBdos" className="text-xs font-medium text-slate-600">
              Limite de BDOs/mês
            </label>
            <input
              id="limiteBdos"
              type="number"
              min={1}
              required
              value={limiteVolumeMensalBdos}
              onChange={(e) => setLimiteVolumeMensalBdos(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label htmlFor="preco" className="text-xs font-medium text-slate-600">
            Preço mensal (R$): sem cobrança no piloto, serve de referência
          </label>
          <input
            id="preco"
            type="number"
            min={0}
            step="0.01"
            value={precoMensal}
            onChange={(e) => setPrecoMensal(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="mt-1 self-start rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
        >
          Cadastrar plano
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-800">Plano por empresa assinante</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {tenants.map((tenant) => (
            <li key={tenant.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <span className="text-slate-800">{tenant.nome}</span>
              <select
                value={tenant.planoId}
                onChange={(e) => trocarPlanoTenant(tenant.id, e.target.value)}
                className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
              >
                {planos.map((plano) => (
                  <option key={plano.id} value={plano.id}>
                    {plano.nome}
                  </option>
                ))}
              </select>
            </li>
          ))}
          {tenants.length === 0 && <p className="text-xs text-slate-500">Nenhuma empresa assinante cadastrada.</p>}
        </ul>
      </div>
    </div>
  )
}
