import type { ReactNode } from 'react'

/** Ajuda contextual recolhida por padrão: fica à mão sem poluir a tela. */
export default function Ajuda({ titulo = 'Precisa de ajuda?', children }: { titulo?: string; children: ReactNode }) {
  return (
    <details className="group mt-3 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold text-slate-800">
        <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-700">
          ?
        </span>
        {titulo}
        <span aria-hidden="true" className="ml-auto h-2 w-2 rotate-45 border-r-2 border-b-2 border-slate-500 transition-transform group-open:-rotate-[135deg]" />
      </summary>
      <div className="pb-3">{children}</div>
    </details>
  )
}
