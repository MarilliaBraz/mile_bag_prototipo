import Icone from '../components/Icone'
import { Link } from 'react-router-dom'
import { PERFIS_LISTA } from '../data/perfis'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Protótipo navegável</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Milebag</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-600">
          Gestão de última milha da devolução de bagagens extraviadas. Este protótipo simula, com dados fictícios em
          memória, os 3 perfis de usuário do sistema — sem back-end real, apenas para validar os fluxos das 21
          histórias de usuário (HU01–HU21).
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PERFIS_LISTA.map((perfil) => (
            <Link
              key={perfil.id}
              to={`/login/${perfil.id}`}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Icone nome={perfil.icone} className="!h-9 !w-9 text-blue-700" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{perfil.titulo}</h2>
              <p className="mt-2 flex-1 text-sm text-slate-600">{perfil.descricao}</p>
              <span className="mt-4 text-sm font-semibold text-blue-700">Entrar como {perfil.subtitulo.toLowerCase()} →</span>
            </Link>
          ))}
        </div>

        <p className="mt-12 text-xs text-slate-500">
          Baseado nas especificações em{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5">mile_bag_documentacao/specs/</code>. Os dados digitados
          aqui ficam salvos só no seu navegador (localStorage) — nada é enviado a um servidor.
        </p>
      </div>
    </div>
  )
}
