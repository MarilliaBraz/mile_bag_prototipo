import AdminShell, { type ItemMenu } from './AdminShell'

const navItems: ItemMenu[] = [
  { to: '/plataforma', label: 'Empresas assinantes', icon: 'predio', end: true },
  { to: '/plataforma/planos', label: 'Planos de assinatura', icon: 'lista' },
]

const AJUDA: Record<string, string> = {
  '/plataforma': 'Cadastre a empresa e o e-mail do primeiro administrador: ele recebe um convite para definir a própria senha.',
  '/plataforma/planos': 'Um plano define o limite de motoristas ativos e de BDOs por mês. Cadastre um plano antes de cadastrar empresas.',
}

/** Administração da plataforma (HU14–HU16): visão de todas as empresas assinantes. */
export default function PlataformaLayout() {
  return (
    <AdminShell
      area="Administração da plataforma"
      navItems={navItems}
      ajuda={AJUDA}
      marca={
        <span className="flex items-center gap-2 font-extrabold tracking-tight text-blue-700">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-700 text-sm text-white" aria-hidden="true">
            M
          </span>
          Milebag
        </span>
      }
    />
  )
}
