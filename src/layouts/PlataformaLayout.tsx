import Icone from '../components/Icone'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Ajuda from '../components/Ajuda'
import BarraAcessibilidade from '../components/BarraAcessibilidade'
import { useAuth } from '../data/auth'

const navItems = [
  { to: '/plataforma', label: 'Empresas assinantes', end: true },
  { to: '/plataforma/planos', label: 'Planos de assinatura' },
]

const AJUDA: Record<string, string> = {
  '/plataforma': 'Cadastre a empresa e o e-mail do primeiro administrador: ele recebe um convite para definir a própria senha.',
  '/plataforma/planos': 'Um plano define o limite de motoristas ativos e de BDOs por mês. Cadastre um plano antes de cadastrar empresas.',
}

export default function PlataformaLayout() {
  const { sair } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function handleSair() {
    sair()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <a
        href="#conteudo"
        className="absolute left-2 top-[-4rem] z-50 rounded-md border-2 border-blue-700 bg-white px-4 py-2 text-sm font-semibold text-blue-800 focus:top-2"
      >
        Pular para o conteúdo
      </a>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-900 text-white sm:flex">
        <div className="border-b border-slate-700 px-5 py-4">
          <Link to="/" className="text-xs font-semibold uppercase tracking-wide text-blue-300">
            ← Milebag
          </Link>
          <p className="mt-2 text-sm font-semibold">Administração da plataforma</p>
          <p className="mt-1 text-xs text-slate-400">Visão de todos os tenants</p>
        </div>
        <nav aria-label="Seções" className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-700 p-3">
          <button
            type="button"
            onClick={handleSair}
            className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Icone nome="sair" /> Sair
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 sm:hidden">
          <Link to="/" className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            ← Milebag
          </Link>
          <p className="text-sm font-semibold text-slate-900">Administração da plataforma</p>
          <button type="button" onClick={handleSair} className="text-xs font-semibold text-slate-500 hover:text-slate-700">
            Sair
          </button>
        </header>
        <nav aria-label="Seções" className="overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 sm:hidden print:hidden">
          <div className="flex gap-2 whitespace-nowrap">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `inline-flex min-h-11 items-center rounded-full border px-3 text-sm font-medium ${
                    isActive ? 'border-blue-700 bg-blue-50 text-blue-800' : 'border-slate-300 bg-white text-slate-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
        <BarraAcessibilidade className="mx-auto max-w-4xl px-6 pt-4" />
        <main id="conteudo" tabIndex={-1} className="mx-auto max-w-4xl px-6 py-8 outline-none">
          {AJUDA[pathname] && (
            <Ajuda>
              <p>{AJUDA[pathname]}</p>
            </Ajuda>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
