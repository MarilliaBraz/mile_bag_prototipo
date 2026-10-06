import { useSyncExternalStore } from 'react'
import Icone from './Icone'
import { assinarTema, escolherTema, obterTema, type Tema } from '../data/tema'

const TEMAS: { valor: Tema; rotulo: string }[] = [
  { valor: 'automatico', rotulo: 'Automático' },
  { valor: 'claro', rotulo: 'Claro' },
  { valor: 'escuro', rotulo: 'Escuro' },
]

import { FONT_SCALE_MAX, FONT_SCALE_MIN, type EstadoAcessibilidade } from './useAcessibilidade'

/** Controles de fonte e contraste; o estado vem do layout (useAcessibilidade), que fica montado na área toda. */
export default function BarraAcessibilidade({ estado, className = '' }: { estado: EstadoAcessibilidade; className?: string }) {
  const { fontScale, diminuirFonte, aumentarFonte, altoContraste, alternarAltoContraste } = estado
  const tema = useSyncExternalStore(assinarTema, obterTema)

  return (
    <div className={`print:hidden ${className}`}>
      <div className="flex gap-2">
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
            altoContraste ? 'border-blue-800 bg-blue-800 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Icone nome="contraste" /> Alto contraste
        </button>
      </div>
      <div role="group" aria-label="Tema" className="mt-2 flex gap-1 rounded-lg bg-slate-100 p-1">
        {TEMAS.map((opcao) => (
          <button
            key={opcao.valor}
            type="button"
            aria-pressed={tema === opcao.valor}
            onClick={() => escolherTema(opcao.valor)}
            className={`min-h-10 flex-1 rounded-md px-2 text-sm font-semibold ${
              tema === opcao.valor ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-700 hover:bg-white/60'
            }`}
          >
            {opcao.rotulo}
          </button>
        ))}
      </div>
      {altoContraste && tema !== 'claro' && (
        <p className="mt-1 text-xs text-slate-600">Com alto contraste ligado, o tema fica sempre claro.</p>
      )}
      <p className="sr-only" role="status">
        {altoContraste ? 'Alto contraste ativado. ' : ''}Tamanho da fonte em {fontScale}%.
      </p>
    </div>
  )
}
