import { useEffect, useState } from 'react'
import Icone from './Icone'

const FONT_SCALE_MIN = 87.5
const FONT_SCALE_MAX = 125
const FONT_SCALE_STEP = 12.5
const FONT_SCALE_KEY = 'milebag_motorista_fontScale'
const ALTO_CONTRASTE_KEY = 'milebag_motorista_altoContraste'

function ler(chave: string): string | null {
  try {
    return localStorage.getItem(chave)
  } catch {
    return null
  }
}

function gravar(chave: string, valor: string) {
  try {
    localStorage.setItem(chave, valor)
  } catch {
    // Armazenamento bloqueado: a preferência vale só nesta sessão.
  }
}

/**
 * Tamanho do texto e alto contraste para baixa visão, lembrados neste navegador.
 * Aplica enquanto o layout que chama o hook está montado e desfaz ao sair,
 * para não vazar para outras áreas do protótipo.
 */
export function useAcessibilidade() {
  const [fontScale, setFontScale] = useState(() => {
    const salvo = Number(ler(FONT_SCALE_KEY))
    return salvo >= FONT_SCALE_MIN && salvo <= FONT_SCALE_MAX ? salvo : 100
  })
  const [altoContraste, setAltoContraste] = useState(() => ler(ALTO_CONTRASTE_KEY) === 'true')

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`
    gravar(FONT_SCALE_KEY, String(fontScale))
    return () => {
      document.documentElement.style.fontSize = ''
    }
  }, [fontScale])

  useEffect(() => {
    document.documentElement.dataset.altoContraste = altoContraste ? 'true' : 'false'
    gravar(ALTO_CONTRASTE_KEY, String(altoContraste))
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

export type EstadoAcessibilidade = ReturnType<typeof useAcessibilidade>

/** Controles de fonte e contraste; o estado vem do layout (useAcessibilidade), que fica montado na área toda. */
export default function BarraAcessibilidade({ estado, className = '' }: { estado: EstadoAcessibilidade; className?: string }) {
  const { fontScale, diminuirFonte, aumentarFonte, altoContraste, alternarAltoContraste } = estado

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
            altoContraste ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Icone nome="contraste" /> Alto contraste
        </button>
      </div>
      <p className="sr-only" role="status">
        {altoContraste ? 'Alto contraste ativado. ' : ''}Tamanho da fonte em {fontScale}%.
      </p>
    </div>
  )
}
