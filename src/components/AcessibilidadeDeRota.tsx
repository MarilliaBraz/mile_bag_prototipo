import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const NOME_SISTEMA = 'Milebag'

/**
 * A cada mudança de tela: mantém o título da aba igual ao <h1> (WCAG 2.4.2) e,
 * ao navegar, leva o foco ao conteúdo principal para que leitores de tela
 * anunciem a nova tela e o teclado comece do topo dela (WCAG 2.4.3).
 */
export default function AcessibilidadeDeRota() {
  const { pathname } = useLocation()
  const primeira = useRef(true)

  useEffect(() => {
    const atualizarTitulo = () => {
      const principal = document.querySelector('main')
      if (principal && !principal.hasAttribute('tabindex')) principal.tabIndex = -1
      const titulo = document.querySelector('h1')?.textContent?.trim()
      document.title = titulo && titulo !== NOME_SISTEMA ? `${titulo} — ${NOME_SISTEMA}` : NOME_SISTEMA
    }

    // As telas podem montar o <h1> depois (dados, fases): observa o DOM.
    let quadro = 0
    const observador = new MutationObserver(() => {
      cancelAnimationFrame(quadro)
      quadro = requestAnimationFrame(atualizarTitulo)
    })
    observador.observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true, characterData: true })
    atualizarTitulo()

    if (primeira.current) {
      primeira.current = false
    } else {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true }))
    }

    return () => {
      observador.disconnect()
      cancelAnimationFrame(quadro)
    }
  }, [pathname])

  return null
}
