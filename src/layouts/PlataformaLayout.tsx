import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../data/auth'

const navItems = [
  { to: '/plataforma', label: 'Empresas assinantes', end: true },
  { to: '/plataforma/planos', label: 'Planos de assinatura' },
]

export default function PlataformaLayout() {
  const { sair } = useAuth()
  const navigate = useNavigate()

  function handleSair() {
    sair()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-900 text-white sm:flex">
        <div className="border-b border-slate-700 px-5 py-4">
          <Link to="/" className="text-xs font-semibold uppercase tracking-wide text-blue-300">
            ← Milebag
          </Link>
          <p className="mt-2 text-sm font-semibold">Administração da plataforma</p>
          <p className="mt-1 text-xs text-slate-400">Visão de todos os tenants</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
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
            ↩ Sair
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 sm:hidden">
          <Link to="/" className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            ← Milebag
          </Link>
          <p className="text-sm font-semibold text-slate-900">Administração da plataforma</p>
          <button type="button" onClick={handleSair} className="text-xs font-semibold text-slate-500 hover:text-slate-700">
            Sair
          </button>
        </header>
        <main className="mx-auto max-w-4xl px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
