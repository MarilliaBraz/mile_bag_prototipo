import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Ajuda from '../components/Ajuda'
import BarraAcessibilidade from '../components/BarraAcessibilidade'
import { useAcessibilidade } from '../components/useAcessibilidade'
import Icone, { type NomeIcone } from '../components/Icone'
import { useAuth } from '../data/auth'

export type ItemMenu = { to: string; label: string; icon: NomeIcone; end?: boolean }

/**
 * Casca comum do back-office (tenant e plataforma): barra lateral clara com
 * ícones no computador, faixa rolável no celular; mesma organização do
 * mile_bag_app.
 */
export default function AdminShell({
  marca,
  area,
  navItems,
  ajuda,
}: {
  marca: ReactNode
  area: string
  navItems: ItemMenu[]
  ajuda: Record<string, string>
}) {
  const { sair } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const acessibilidade = useAcessibilidade()

  function handleSair() {
    sair()
    navigate('/', { replace: true })
  }

  const linkMenu = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-11 items-center gap-3 whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition-colors ${
      isActive ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-100'
    }`

  return (
    <div className="min-h-screen bg-[var(--fundo-app)] sm:grid sm:grid-cols-[16rem_minmax(0,1fr)]">
      <a
        href="#conteudo"
        className="absolute left-2 top-[-4rem] z-50 rounded-md border-2 border-blue-700 bg-white px-4 py-2 text-sm font-semibold text-blue-800 focus:top-2"
      >
        Pular para o conteúdo
      </a>

      <aside className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white/90 px-4 py-2 backdrop-blur sm:h-screen sm:flex-col sm:flex-nowrap sm:items-stretch sm:gap-1 sm:border-r sm:border-b-0 sm:bg-[var(--superficie)] sm:px-3 sm:py-5 print:hidden">
        <div className="sm:px-2 sm:pb-4">
          {marca}
          <p className="mt-1 hidden text-xs text-slate-600 sm:block">{area}</p>
        </div>

        <button type="button" onClick={handleSair} className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:hidden">
          <Icone nome="sair" /> Sair
        </button>

        <nav aria-label="Seções" className="order-3 -mx-1 flex basis-full gap-1 overflow-x-auto px-1 pb-1 sm:order-none sm:mx-0 sm:basis-auto sm:flex-col sm:overflow-visible sm:p-0">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkMenu}>
              {({ isActive }) => (
                <>
                  <Icone nome={item.icon} className={`!h-5 !w-5 ${isActive ? 'text-blue-700' : 'text-slate-500'}`} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden flex-col gap-1 border-t border-slate-200 pt-3 sm:flex">
          <details className="group rounded-lg">
            <summary className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              <Icone nome="contraste" className="!h-5 !w-5 text-slate-500" /> Leitura
            </summary>
            <BarraAcessibilidade estado={acessibilidade} className="px-1 pt-2 pb-1" />
          </details>
          <Link to="/" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            <Icone nome="casa" className="!h-5 !w-5 text-slate-500" /> Início do protótipo
          </Link>
          <button type="button" onClick={handleSair} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100">
            <Icone nome="sair" className="!h-5 !w-5 text-slate-500" /> Sair
          </button>
        </div>
      </aside>

      <main id="conteudo" tabIndex={-1} key={pathname} className="entrar mx-auto w-full max-w-5xl px-4 py-6 outline-none sm:px-10 sm:py-8">
        {ajuda[pathname] && (
          <div className="mb-5 max-w-3xl">
            <Ajuda>
              <p>{ajuda[pathname]}</p>
            </Ajuda>
          </div>
        )}
        <Outlet />
        <details className="mt-10 max-w-sm rounded-lg border border-slate-200 bg-white px-3 sm:hidden print:hidden">
          <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-slate-800">
            <Icone nome="contraste" /> Leitura: tamanho do texto e contraste
          </summary>
          <BarraAcessibilidade estado={acessibilidade} className="pb-3" />
        </details>
      </main>
    </div>
  )
}
