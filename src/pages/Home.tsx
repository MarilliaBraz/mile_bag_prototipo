import { Link } from 'react-router-dom'

interface AreaCard {
  titulo: string
  descricao: string
  href: string
  cta: string
  emoji: string
}

const areas: AreaCard[] = [
  {
    titulo: 'Aplicação do motorista',
    descricao:
      'Captura do BDO, autoatribuição, rota, viagem, bagagem carona, comprovante de entrega, ocorrências e operação offline (HU01–HU08).',
    href: '/motorista',
    cta: 'Entrar como motorista',
    emoji: '🚚',
  },
  {
    titulo: 'Back-office do tenant',
    descricao:
      'Tarifas, praças de pedágio, parametrização, fechamento quinzenal e identidade visual dos relatórios (HU09–HU13).',
    href: '/tenant',
    cta: 'Entrar como administrador do tenant',
    emoji: '🏢',
  },
  {
    titulo: 'Administração da plataforma',
    descricao: 'Cadastro de empresas assinantes, convite do primeiro administrador e planos de assinatura (HU14–HU16).',
    href: '/plataforma',
    cta: 'Entrar como administrador da plataforma',
    emoji: '🛠️',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Protótipo navegável</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Milebag</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Gestão de última milha da devolução de bagagens extraviadas. Este protótipo simula, com dados fictícios em
          memória, os 3 perfis de usuário do sistema — sem back-end real, apenas para validar os fluxos das 16
          histórias de usuário.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <Link
              key={area.href}
              to={area.href}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="text-3xl">{area.emoji}</span>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{area.titulo}</h2>
              <p className="mt-2 flex-1 text-sm text-slate-600">{area.descricao}</p>
              <span className="mt-4 text-sm font-semibold text-blue-700">{area.cta} →</span>
            </Link>
          ))}
        </div>

        <p className="mt-12 text-xs text-slate-400">
          Baseado nas especificações em{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5">mile_bag_documentacao/specs/</code>. Os dados digitados
          aqui ficam salvos só no seu navegador (localStorage) — nada é enviado a um servidor.
        </p>
      </div>
    </div>
  )
}
