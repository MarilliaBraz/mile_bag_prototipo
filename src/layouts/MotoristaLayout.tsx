import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { MOTORISTA_ATUAL, useEntregasDoTenant, useStore } from '../data/store'
import { useAuth } from '../data/auth'
import BarraAcessibilidade from '../components/BarraAcessibilidade'
import Icone, { type NomeIcone } from '../components/Icone'

const navItems: { to: string; label: string; icon: NomeIcone; end: boolean }[] = [
  { to: '/motorista', label: 'Entregas', icon: 'lista', end: true },
  { to: '/motorista/novo', label: 'Novo BDO', icon: 'camera', end: true },
  { to: '/motorista/relatorio', label: 'Relatório', icon: 'documento', end: true },
  { to: '/motorista/sincronizacao', label: 'Sincronizar', icon: 'sincronizar', end: true },
]

export default function MotoristaLayout() {
  const { offline, setOffline } = useStore()
  const entregas = useEntregasDoTenant()
  const pendentes = entregas.filter((e) => e.pendenteSincronizacao).length
  const { sair } = useAuth()
  const navigate = useNavigate()

  function handleSair() {
    sair()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <a
        href="#conteudo"
        className="absolute left-2 top-[-4rem] z-50 rounded-md border-2 border-blue-700 bg-white px-4 py-2 text-sm font-semibold text-blue-800 focus:top-2"
      >
        Pular para o conteúdo
      </a>
      <header className="border-b border-slate-200 bg-white px-4 py-3 print:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div>
            <Link to="/" className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              ← Milebag
            </Link>
            <p className="text-sm font-semibold text-slate-900">{MOTORISTA_ATUAL.nome}</p>
          </div>
          <button
            type="button"
            onClick={() => setOffline(!offline)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              offline ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}
            title="Alternar simulação de conectividade"
          >
            <Icone nome={offline ? 'semConexao' : 'conexao'} /> {offline ? 'Sem conexão' : 'Online'}
          </button>
        </div>

        <BarraAcessibilidade className="mx-auto mt-2 max-w-md" />
        {(offline || pendentes > 0) && (
          <div className="mx-auto mt-2 max-w-md rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {offline
              ? 'Operando offline: suas ações continuam sendo salvas neste dispositivo e serão sincronizadas ao reconectar.'
              : `${pendentes} registro(s) aguardando sincronização.`}{' '}
            <Link to="/motorista/sincronizacao" className="font-semibold underline">
              Ver detalhes
            </Link>
          </div>
        )}
      </header>

      <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-md flex-1 px-4 py-4 pb-24 outline-none">
        <Outlet />
      </main>

      <nav aria-label="Menu do motorista" className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white print:hidden">
        <div className="mx-auto flex max-w-md">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium ${
                  isActive ? 'text-blue-700' : 'text-slate-500'
                }`
              }
            >
              <Icone nome={item.icon} className="!h-6 !w-6" />
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleSair}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium text-slate-500"
          >
            <Icone nome="sair" className="!h-6 !w-6" />
            Sair
          </button>
        </div>
      </nav>
    </div>
  )
}
