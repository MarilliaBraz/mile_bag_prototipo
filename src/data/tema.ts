// Tema claro/escuro do protótipo. "automatico" segue o sistema operacional;
// "claro" e "escuro" forçam, para demonstrar o protótipo sem mudar a
// configuração do computador. O CSS só conhece data-tema="claro" ou "escuro":
// o automático é resolvido aqui, para a paleta escura existir uma vez só.
export type Tema = 'automatico' | 'claro' | 'escuro'

// A mesma chave é lida pelo script do <head> do index.html (evita piscar o tema errado ao abrir).
const CHAVE = 'milebag_prototipo_tema'
const EVENTO = 'milebag:tema'
const CONSULTA_ESCURO = '(prefers-color-scheme: dark)'

function lerTema(): Tema {
  try {
    const valor = localStorage.getItem(CHAVE)
    return valor === 'claro' || valor === 'escuro' ? valor : 'automatico'
  } catch {
    return 'automatico'
  }
}

let atual: Tema = lerTema()

function aplicar(tema: Tema) {
  const escuro = tema === 'escuro' || (tema === 'automatico' && window.matchMedia(CONSULTA_ESCURO).matches)
  document.documentElement.dataset.tema = escuro ? 'escuro' : 'claro'
}

export function obterTema(): Tema {
  return atual
}

/** Para useSyncExternalStore: todas as cópias do seletor mostram o mesmo tema. */
export function assinarTema(aoMudar: () => void): () => void {
  window.addEventListener(EVENTO, aoMudar)
  return () => window.removeEventListener(EVENTO, aoMudar)
}

export function escolherTema(tema: Tema) {
  atual = tema
  try {
    localStorage.setItem(CHAVE, tema)
  } catch {
    // Armazenamento bloqueado: vale só nesta sessão.
  }
  aplicar(tema)
  window.dispatchEvent(new Event(EVENTO))
}

/** Chamado em main.tsx antes de renderizar; também acompanha a troca de tema do sistema no modo automático. */
export function iniciarTema() {
  atual = lerTema()
  aplicar(atual)
  window.matchMedia(CONSULTA_ESCURO).addEventListener('change', () => {
    if (atual === 'automatico') {
      aplicar(atual)
    }
  })
}
