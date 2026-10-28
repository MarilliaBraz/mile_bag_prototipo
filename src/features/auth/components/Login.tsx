import Icone from '../../../shared/components/Icone'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../../shared/services/auth'
import { PERFIS, PERFIS_LISTA, isPerfil } from '../../../shared/utils/perfis'

export default function Login() {
  const { perfil: perfilParam } = useParams<{ perfil: string }>()
  const navigate = useNavigate()
  const { sessao, entrar } = useAuth()

  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [entrando, setEntrando] = useState(false)

  if (!isPerfil(perfilParam)) {
    return <Navigate to="/" replace />
  }

  const perfil = PERFIS[perfilParam]

  // Já autenticado neste perfil: não faz sentido mostrar o formulário de novo.
  if (sessao?.perfil === perfil.id) {
    return <Navigate to={perfil.home} replace />
  }

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro(null)
    setEntrando(true)

    // Pequeno atraso simulado, só para o envio do formulário parecer uma
    // chamada real de autenticação; não há back-end neste protótipo.
    window.setTimeout(() => {
      const autenticou = entrar(perfil.id, usuario, senha)
      if (autenticou) {
        navigate(perfil.home, { replace: true })
        return
      }
      setEntrando(false)
      setErro('Usuário ou senha inválidos. Use admin / admin neste protótipo.')
    }, 350)
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Painel de marca: só em telas médias e grandes (computador) */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-[#0b1220] px-12 py-12 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl"
        />

        <Link to="/" className="relative text-sm font-semibold uppercase tracking-wide text-blue-200 hover:text-white">
          ← Milebag
        </Link>

        <div className="relative">
          <Icone nome={perfil.icone} className="!h-14 !w-14" />
          <h1 className="mt-6 text-3xl font-bold leading-tight">{perfil.titulo}</h1>
          <p className="mt-4 max-w-sm text-blue-100">{perfil.descricaoLogin}</p>

          <ul className="mt-10 space-y-3 text-sm text-blue-100">
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs">
                <Icone nome="check" />
              </span>
              Fluxos completos das histórias de usuário do Milebag
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs">
                <Icone nome="check" />
              </span>
              Dados isolados por perfil, salvos só neste navegador
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs">
                <Icone nome="check" />
              </span>
              Interface adaptada para uso em campo e no back-office
            </li>
          </ul>
        </div>

        <p className="relative text-xs text-blue-200">Gestão de última milha da devolução de bagagens extraviadas.</p>
      </aside>

      {/* Formulário: visível em qualquer tamanho de tela */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:flex-none lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="text-xs font-semibold uppercase tracking-wide text-blue-700 lg:hidden">
            ← Milebag
          </Link>

          <div className="mt-4 flex items-center gap-3 lg:mt-0">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-xl text-white">
              <Icone nome={perfil.icone} className="!h-6 !w-6" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Entrar como</p>
              <h2 className="text-lg font-bold text-slate-900">{perfil.subtitulo}</h2>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-600 lg:hidden">{perfil.descricaoLogin}</p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            {erro && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {erro}
              </div>
            )}

            <div>
              <label htmlFor="usuario" className="block text-sm font-medium text-slate-700">
                Usuário
              </label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                required
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="admin"
                aria-invalid={!!erro}
                className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="senha" className="block text-sm font-medium text-slate-700">
                  Senha
                </label>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="senha"
                  name="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••"
                  aria-invalid={!!erro}
                  className="block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-xs font-semibold text-slate-500 hover:text-slate-700"
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={mostrarSenha}
                >
                  {mostrarSenha ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={entrando}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {entrando && (
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
              )}
              {entrando ? 'Entrando…' : 'Entrar'}
            </button>

            <p className="rounded-lg bg-slate-100 px-3.5 py-2.5 text-center text-xs text-slate-500">
              Protótipo: use <span className="font-semibold text-slate-700">admin</span> /{' '}
              <span className="font-semibold text-slate-700">admin</span> para entrar.
            </p>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Outros perfis</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PERFIS_LISTA.filter((p) => p.id !== perfil.id).map((p) => (
                <Link
                  key={p.id}
                  to={`/login/${p.id}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700"
                >
                  <Icone nome={p.icone} /> {p.subtitulo}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
