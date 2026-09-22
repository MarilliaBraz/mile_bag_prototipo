import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../data/store'
import type { ConviteAdministrador, Tenant } from '../../types'

export default function CadastrarTenant() {
  const { planos, cadastrarTenant, convites } = useStore()

  const [nome, setNome] = useState('')
  const [emailAdministrador, setEmailAdministrador] = useState('')
  const [planoId, setPlanoId] = useState(planos[0]?.id ?? '')
  const [tenantCriado, setTenantCriado] = useState<Tenant | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const tenant = cadastrarTenant({ nome, emailAdministrador, planoId })
    setTenantCriado(tenant)
  }

  if (tenantCriado) {
    // O convite é criado automaticamente por cadastrarTenant(); buscamos o mais
    // recente para este tenant para exibir o link de ativação (substitui o e-mail
    // real, que este protótipo não envia).
    const convite = [...convites]
      .filter((c: ConviteAdministrador) => c.tenantId === tenantCriado.id)
      .sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1))[0]

    return (
      <div>
        <h1 className="text-xl font-bold text-slate-900">Empresa cadastrada</h1>
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm font-semibold text-emerald-800">{tenantCriado.nome} foi cadastrada com sucesso.</p>
          <p className="mt-2 text-sm text-emerald-900">
            Convite enviado automaticamente para <strong>{tenantCriado.emailAdministrador}</strong>. Como este
            protótipo não envia e-mail de verdade, o link de ativação (simulado) é:
          </p>
          {convite && (
            <Link
              to={`/ativar-convite/${convite.id}`}
              className="mt-2 inline-block rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 underline"
            >
              /ativar-convite/{convite.id}
            </Link>
          )}
        </div>
        <Link to="/plataforma" className="mt-6 inline-block text-sm font-semibold text-blue-700">
          ← Voltar para a lista de empresas
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/plataforma" className="text-xs font-semibold text-blue-700">
        ← Empresas assinantes
      </Link>
      <h1 className="mt-2 text-xl font-bold text-slate-900">Cadastrar empresa assinante</h1>
      <p className="mt-1 text-sm text-slate-500">
        Sem implantação dedicada: o tenant é provisionado imediatamente após o cadastro.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-md flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <label htmlFor="nome" className="text-sm font-medium text-slate-700">
            Nome da empresa
          </label>
          <input
            id="nome"
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Ex.: Entrega Rápida Anápolis Ltda"
          />
        </div>

        <div>
          <label htmlFor="emailAdministrador" className="text-sm font-medium text-slate-700">
            E-mail do primeiro administrador
          </label>
          <input
            id="emailAdministrador"
            type="email"
            required
            value={emailAdministrador}
            onChange={(e) => setEmailAdministrador(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="admin@empresa.com.br"
          />
        </div>

        <div>
          <label htmlFor="planoId" className="text-sm font-medium text-slate-700">
            Plano de assinatura
          </label>
          <select
            id="planoId"
            required
            value={planoId}
            onChange={(e) => setPlanoId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {planos.map((plano) => (
              <option key={plano.id} value={plano.id}>
                {plano.nome} — até {plano.limiteMotoristasAtivos} motoristas, {plano.limiteVolumeMensalBdos} BDOs/mês
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="mt-2 self-start rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
        >
          Cadastrar e enviar convite
        </button>
      </form>
    </div>
  )
}
