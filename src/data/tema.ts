// Tema claro/escuro do protótipo. "automatico" segue o sistema operacional
// (prefers-color-scheme); "claro" e "escuro" forçam, para demonstrar o
// protótipo sem mudar a configuração do computador.
export type Tema = 'automatico' | 'claro' | 'escuro'

const CHAVE = 'milebag_prototipo_tema'

export function temaSalvo(): Tema {
  try {
    const valor = localStorage.getItem(CHAVE)
    return valor === 'claro' || valor === 'escuro' ? valor : 'automatico'
  } catch {
    return 'automatico'
  }
}

/** Aplica no <html> (data-tema) — o CSS em index.css lê esse atributo. */
export function aplicarTema(tema: Tema) {
  if (tema === 'automatico') {
    delete document.documentElement.dataset.tema
  } else {
    document.documentElement.dataset.tema = tema
  }
  try {
    localStorage.setItem(CHAVE, tema)
  } catch {
    // Armazenamento bloqueado: vale só nesta sessão.
  }
}
