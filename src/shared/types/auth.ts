import type { Perfil } from '../utils/perfis'

export interface Sessao {
  perfil: Perfil
  usuario: string
  autenticadoEm: string
}
