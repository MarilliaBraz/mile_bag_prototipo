import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Perfil } from './perfis'

// Autenticação simulada do protótipo. Não há back-end: qualquer usuário
// "admin" com senha "admin" é aceito para qualquer um dos 3 perfis. A sessão
// fica em sessionStorage (não em localStorage) para expirar ao fechar a aba,
// como convém a um token de sessão; ver RNF03 (autenticação por token).

export interface Sessao {
  perfil: Perfil
  usuario: string
  autenticadoEm: string
}

const STORAGE_KEY = 'milebag-prototipo-sessao-v1'
const USUARIO_VALIDO = 'admin'
const SENHA_VALIDA = 'admin'

interface AuthValue {
  sessao: Sessao | null
  entrar: (perfil: Perfil, usuario: string, senha: string) => boolean
  sair: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

function loadSessao(): Sessao | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Sessao) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(loadSessao)

  useEffect(() => {
    try {
      if (sessao) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessao))
      else window.sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // sessionStorage indisponível; ignora, é só um protótipo
    }
  }, [sessao])

  const entrar: AuthValue['entrar'] = (perfil, usuario, senha) => {
    const ok = usuario.trim().toLowerCase() === USUARIO_VALIDO && senha === SENHA_VALIDA
    if (ok) setSessao({ perfil, usuario: USUARIO_VALIDO, autenticadoEm: new Date().toISOString() })
    return ok
  }

  const sair: AuthValue['sair'] = () => setSessao(null)

  return <AuthContext.Provider value={{ sessao, entrar, sair }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
