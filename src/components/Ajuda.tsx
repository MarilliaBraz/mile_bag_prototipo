import type { ReactNode } from 'react'

/** Ajuda contextual recolhida por padrão: fica à mão sem poluir a tela. */
export default function Ajuda({ titulo = 'Precisa de ajuda?', children }: { titulo?: string; children: ReactNode }) {
  return (
    <details className="mt-3 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">
      <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-slate-800">{titulo}</summary>
      <div className="pb-3">{children}</div>
    </details>
  )
}
