import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { MOTORISTA_ATUAL, useEntregasDoTenant, useStore } from '../data/store'
import { useAuth } from '../data/auth'

const navItems = [
  { to: '/motorista', label: 'Entregas', icon: '📋', end: true },
  { to: '/motorista/novo', label: 'Novo BDO', icon: '📷', end: true },
  { to: '/motorista/relatorio', label: 'Relatório', icon: '🧾', end: true },
  { to: '/motorista/sincronizacao', label: 'Sincronizar', icon: '🔄', end: true },
]

const FONT_SCALE_MIN = 87.5
const FONT_SCALE_MAX = 125
const FONT_SCALE_STEP = 12.5
const FONT_SCALE_KEY = 'milebag_motorista_fontScale'
const ALTO_CONTRASTE_KEY = 'milebag_motorista_altoContraste'

function useAcessibilidadeMotorista() {
  const [fontScale, setFontScale] = useState(() => {
    const salvo = Number(localStorage.getItem(FONT_SCALE_KEY))
    return salvo >= FONT_SCALE_MIN && salvo <= FONT_SCALE_MAX ? salvo : 100
  })
  const [altoContraste, setAltoContraste] = useState(() => localStorage.getItem(ALTO_CONTRASTE_KEY) === 'true')

  // Aplica as preferências só enquanto o app do motorista está montado, e
  // desfaz ao sair (voltar ao Milebag) para não vazar para tenant/plataforma.
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`
    localStorage.setItem(FONT_SCALE_KEY, String(fontScale))
    return () => {
      document.documentElement.style.fontSize = ''
    }
  }, [fontScale])

  useEffect(() => {
    document.documentElement.dataset.altoContraste = altoContraste ? 'true' : 'false'
    localStorage.setItem(ALTO_CONTRASTE_KEY, String(altoContraste))
    return () => {
      delete document.documentElement.dataset.altoContraste
    }
  }, [altoContraste])

  return {
    fontScale,
    diminuirFonte: () => setFontScale((s) => Math.max(FONT_SCALE_MIN, s - FONT_SCALE_STEP)),
    aumentarFonte: () => setFontScale((s) => Math.min(FONT_SCALE_MAX, s + FONT_SCALE_STEP)),
    altoContraste,
    alternarAltoContraste: () => setAltoContraste((v) => !v),
  }
}

export default function MotoristaLayout() {
  const { offline, setOffline } = useStore()
  const entregas = useEntregasDoTenant()
  const pendentes = entregas.filter((e) => e.pendenteSincronizacao).length
  const { sair } = useAuth()
  const navigate = useNavigate()
  const { fontScale, diminuirFonte, aumentarFonte, altoContraste, alternarAltoContraste } = useAcessibilidadeMotorista()

  function handleSair() {
    sair()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
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
            {offline ? '📴 Sem conexão' : '📶 Online'}
          </button>
        </div>

        <div className="mx-auto mt-2 flex max-w-md gap-2">
          <button
            type="button"
            onClick={diminuirFonte}
            disabled={fontScale <= FONT_SCALE_MIN}
            aria-label="Diminuir tamanho da fonte"
            className="min-h-11 min-w-11 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            A−
          </button>
          <button
            type="button"
            onClick={aumentarFonte}
            disabled={fontScale >= FONT_SCALE_MAX}
            aria-label="Aumentar tamanho da fonte"
            className="min-h-11 min-w-11 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            A+
          </button>
          <button
            type="button"
            onClick={alternarAltoContraste}
            aria-pressed={altoContraste}
            className={`min-h-11 flex-1 rounded-lg border px-3 text-sm font-semibold ${
              altoContraste ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            ◐ Alto contraste
          </button>
        </div>
        <p className="sr-only" role="status">
          {altoContraste ? 'Alto contraste ativado. ' : ''}Tamanho da fonte em {fontScale}%.
        </p>
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

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white print:hidden">
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
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleSair}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium text-slate-500"
          >
            <span className="text-lg">↩</span>
            Sair
          </button>
        </div>
      </nav>
    </div>
  )
}
