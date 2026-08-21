import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../../data/store'

export default function AtivarConvite() {
  const { conviteId } = useParams<{ conviteId: string }>()
  const { convites, tenants, ativarConvite } = useStore()
  const [senha, setSenha] = useState('')
  const [ativado, setAtivado] = useState(false)

  const convite = convites.find((c) => c.id === conviteId)
  const tenant = convite ? tenants.find((t) => t.id === convite.tenantId) : undefined

  const expirado = convite ? new Date(convite.expiraEm).getTime() < Date.now() : false
  const valido = !!convite && convite.status === 'PENDENTE' && !expirado

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!convite) return
    ativarConvite(convite.id)
    setAtivado(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link to="/" className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          Milebag
        </Link>

        {!convite && (
          <p className="mt-4 text-sm text-red-700">Convite não encontrado. Verifique o link recebido por e-mail.</p>
        )}

        {convite && ativado && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-emerald-700">Conta de administrador criada.</p>
            <p className="mt-2 text-sm text-slate-600">
              Você já pode acessar o back-office de <strong>{tenant?.nome}</strong>.
            </p>
            <Link to="/tenant" className="mt-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">
              Entrar no back-office
            </Link>
          </div>
        )}

        {convite && !ativado && !valido && (
          <div className="mt-4">
            {convite.status === 'USADO' && <p className="text-sm text-red-700">Este convite já foi usado para ativar uma conta.</p>}
            {convite.status === 'INVALIDADO' && (
              <p className="text-sm text-red-700">Este convite foi invalidado — um novo convite mais recente foi emitido para este tenant.</p>
            )}
            {(convite.status === 'EXPIRADO' || expirado) && convite.status !== 'USADO' && convite.status !== 'INVALIDADO' && (
              <p className="text-sm text-red-700">Este convite expirou. Solicite ao administrador da plataforma um novo reenvio.</p>
            )}
          </div>
        )}

        {convite && !ativado && valido && tenant && (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div>
              <p className="text-sm text-slate-600">
                Você foi convidado como administrador de <strong>{tenant.nome}</strong>.
              </p>
              <p className="mt-1 text-xs text-slate-400">{convite.emailDestinatario}</p>
            </div>

            <div>
              <label htmlFor="senha" className="text-sm font-medium text-slate-700">
                Defina uma senha
              </label>
              <input
                id="senha"
                type="password"
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Mínimo de 6 caracteres (simulado)"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
            >
              Ativar conta
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
