import AdminShell, { type ItemMenu } from './AdminShell'
import { useIdentidadeVisualTenant } from '../data/store'

const navItems: ItemMenu[] = [
  { to: '/tenant', label: 'Visão geral', icon: 'casa', end: true },
  { to: '/tenant/tarifas', label: 'Tarifas', icon: 'moeda' },
  { to: '/tenant/pedagios', label: 'Praças de pedágio', icon: 'pedagio' },
  { to: '/tenant/fechamento', label: 'Fechamento', icon: 'calendario' },
  { to: '/tenant/identidade-visual', label: 'Identidade visual', icon: 'imagem' },
  { to: '/tenant/configuracoes', label: 'Configurações', icon: 'engrenagem' },
]

const AJUDA: Record<string, string> = {
  '/tenant': 'Resumo da operação da sua empresa. Use o menu para cadastrar tarifas e pedágios, gerar fechamentos e ajustar as configurações.',
  '/tenant/tarifas': 'A tarifa define quanto o motorista recebe por entrega. Cada mudança vale a partir da data de vigência e não altera fechamentos já emitidos.',
  '/tenant/pedagios': 'Cadastre cada praça com o valor de ida e a data em que ele passa a valer. O reembolso considera ida e volta, com o valor vigente na data da viagem.',
  '/tenant/fechamento': 'Gera o pagamento de entregas e o reembolso de pedágios a partir dos trajetos já consolidados. Confira os totais antes de pagar.',
  '/tenant/identidade-visual': 'Defina como a sua empresa aparece nos relatórios em PDF: nome de exibição e cor.',
  '/tenant/configuracoes': 'Ajuste as regras da sua empresa, como os motivos de ocorrência e o limite de divergência de quilometragem.',
}

/** Back-office do administrador do tenant (HU09 a HU13), com a marca da própria empresa (HU13) no topo do menu. */
export default function TenantLayout() {
  const identidade = useIdentidadeVisualTenant()

  return (
    <AdminShell
      area="Administração da empresa"
      navItems={navItems}
      ajuda={AJUDA}
      marca={
        <span className="flex items-center gap-2">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: identidade.corPrimaria }}
            aria-hidden="true"
          >
            {identidade.logoIniciais}
          </span>
          <span className="text-sm font-bold text-slate-900">{identidade.nomeExibicao}</span>
        </span>
      }
    />
  )
}
