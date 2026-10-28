import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../services/auth'
import type { Perfil } from '../utils/perfis'

interface RequireAuthProps {
  perfil: Perfil
  children: ReactNode
}

export default function RequireAuth({ perfil, children }: RequireAuthProps) {
  const { sessao } = useAuth()
  const location = useLocation()

  if (!sessao || sessao.perfil !== perfil) {
    return <Navigate to={`/login/${perfil}`} replace state={{ de: location.pathname }} />
  }

  return <>{children}</>
}
