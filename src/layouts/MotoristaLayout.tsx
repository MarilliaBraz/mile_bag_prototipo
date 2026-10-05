import { Link, NavLink, Outlet } from 'react-router-dom'
import { useEntregasDoTenant, useStore } from '../data/store'
import { useAcessibilidade } from '../components/BarraAcessibilidade'
import Icone, { type NomeIcone } from '../components/Icone'

const navItems: { to: string; label: string; icon: NomeIcone; end: boolean; destaque?: boolean }[] = [
  { to: '/motorista', label: 'Entregas', icon: 'casa', end: true },
  { to: '/motorista/novo', label: 'Capturar', icon: 'camera', end: true, destaque: true },
  { to: '/motorista/relatorio', label: 'Relatório', icon: 'documento', end: true },
  { to: '/motorista/conta', label: 'Conta', icon: 'usuario', end: false },
]

/**
 * Casca da aplicação do motorista: barra superior compacta (marca + conexão),
 * aviso de offline/pendências e navegação inferior ao alcance do polegar.
 * Sair, sincronização e acessibilidade ficam em "Conta", longe de toques
 * acidentais durante as entregas (mesma organização do mile_bag_app).
 */
export default function MotoristaLayout() {
  const { offline, setOffline } = useStore()
  const entregas = useEntregasDoTenant()
  const pendentes = entregas.filter((e) => e.pendenteSincronizacao).length
  const acessibilidade = useAcessibilidade()

  return (
    <div className="area-motorista flex min-h-screen flex-col bg-[#f3f5f9]">
      <a
        href="#conteudo"
        className="absolute left-2 top-[-4rem] z-50 rounded-md border-2 border-blue-700 bg-white px-4 py-2 text-sm font-semibold text-blue-800 focus:top-2"
      >
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-2 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight text-blue-700" title="Voltar ao início do protótipo">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-700 text-sm text-white">M</span>
            Milebag
          </Link>
          <button
            type="button"
            onClick={() => setOffline(!offline)}
            aria-pressed={offline}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ${
              offline ? 'bg-amber-100 text-amber-900' : 'bg-emerald-50 text-emerald-800'
            }`}
            title="Simulação: alterna entre online e sem conexão"
          >
            <Icone nome={offline ? 'semConexao' : 'conexao'} /> {offline ? 'Sem conexão' : 'Online'}
          </button>
        </div>
      </header>

      {(offline || pendentes > 0) && (
        <div role="status" className="mx-auto mt-3 w-full max-w-md px-4 print:hidden">
          <div className="flex items-start gap-2 rounded-lg border-l-4 border-amber-600 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <Icone nome="alerta" className="mt-0.5" />
            <p>
              {offline
                ? 'Sem conexão: o que você registrar fica salvo neste aparelho e é enviado ao reconectar.'
                : `${pendentes} registro(s) aguardando envio.`}{' '}
              <Link to="/motorista/sincronizacao" className="font-semibold underline">
                Ver registros
              </Link>
            </p>
          </div>
        </div>
      )}

      <main id="conteudo" tabIndex={-1} className="entrar mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-28 outline-none">
        <Outlet context={acessibilidade} />
      </main>

      <nav
        aria-label="Menu do motorista"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(15_23_42/0.08)] print:hidden"
      >
        <div className="mx-auto grid h-[68px] max-w-md grid-cols-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 text-[0.8125rem] font-semibold ${isActive ? 'text-blue-700' : 'text-slate-500'}`
              }
            >
              {({ isActive }) =>
                item.destaque ? (
                  <>
                    <span className="nav-destaque-icone">
                      <Icone nome={item.icon} className="!h-6 !w-6" />
                    </span>
                    {item.label}
                  </>
                ) : (
                  <>
                    <span className={`grid h-8 w-14 place-items-center rounded-full transition-colors ${isActive ? 'bg-blue-50' : ''}`}>
                      <Icone nome={item.icon} className="!h-6 !w-6" />
                    </span>
                    {item.label}
                  </>
                )
              }
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
