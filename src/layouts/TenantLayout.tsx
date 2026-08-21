import { Link, NavLink, Outlet } from 'react-router-dom'
import { useIdentidadeVisualTenant } from '../data/store'

const navItems = [
  { to: '/tenant', label: 'Visão geral', end: true },
  { to: '/tenant/tarifas', label: 'Tarifas' },
  { to: '/tenant/pedagios', label: 'Praças de pedágio' },
  { to: '/tenant/fechamento', label: 'Fechamento' },
  { to: '/tenant/identidade-visual', label: 'Identidade visual' },
  { to: '/tenant/configuracoes', label: 'Configurações' },
]

export default function TenantLayout() {
  const identidade = useIdentidadeVisualTenant()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white sm:block">
        <div className="border-b border-slate-200 px-5 py-4">
          <Link to="/" className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            ← Milebag
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: identidade.corPrimaria }}
            >
              {identidade.logoIniciais}
            </span>
            <p className="text-sm font-semibold text-slate-900">{identidade.nomeExibicao}</p>
          </div>
          <p className="mt-1 text-xs text-slate-500">Back-office do tenant</p>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 sm:hidden">
          <Link to="/" className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            ← Milebag
          </Link>
          <p className="text-sm font-semibold text-slate-900">{identidade.nomeExibicao}</p>
        </header>
        <main className="mx-auto max-w-4xl px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
