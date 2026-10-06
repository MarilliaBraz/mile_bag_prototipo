import { useEffect, useState } from 'react'

export const FONT_SCALE_MIN = 87.5
export const FONT_SCALE_MAX = 125
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
