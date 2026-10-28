import { Link } from 'react-router-dom'
import Icone, { type NomeIcone } from '../../../../shared/components/Icone'
import { useEntregasDoTenant, useStore } from '../../../../shared/services/store'

export default function Dashboard() {
  const entregas = useEntregasDoTenant()
  const { tarifas, pedagios, fechamentos } = useStore()

  const emAndamento = entregas.filter((e) => e.status === 'EM_ANDAMENTO' || e.status === 'ATRIBUIDA').length
  const encerradas = entregas.filter((e) => e.status === 'ENCERRADA_COM_SUCESSO').length
  const reabertas = entregas.filter((e) => e.status === 'REABERTA').length

  const cards: { label: string; value: number; icon: NomeIcone; href: string | null; tom?: string }[] = [
    { label: 'Entregas em andamento', value: emAndamento, icon: 'carro', href: null },
    { label: 'Entregas concluídas', value: encerradas, icon: 'checkCirculo', href: null, tom: 'border-l-emerald-600' },
    { label: 'Reabertas por ocorrência', value: reabertas, icon: 'alerta', href: null, tom: reabertas > 0 ? 'border-l-amber-600' : undefined },
    { label: 'Tabelas de tarifa', value: tarifas.length, icon: 'moeda', href: '/tenant/tarifas' },
    { label: 'Praças de pedágio', value: pedagios.length, icon: 'pedagio', href: '/tenant/pedagios' },
    { label: 'Fechamentos gerados', value: fechamentos.length, icon: 'calendario', href: '/tenant/fechamento' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Visão geral</h1>
      <p className="mt-1 text-sm text-slate-600">Resumo da operação da sua empresa.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const content = (
            <div className={`flex h-full items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${card.tom ? `border-l-4 ${card.tom}` : ''}`}>
              <div>
                <p className="text-sm font-semibold text-slate-600">{card.label}</p>
                <p className="mt-1 text-3xl font-extrabold tabular-nums text-slate-900">{card.value}</p>
                {card.href && <p className="mt-2 text-xs font-semibold text-blue-700">Gerenciar →</p>}
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700">
                <Icone nome={card.icon} className="!h-5 !w-5" />
              </span>
            </div>
          )
          return card.href ? (
            <Link key={card.label} to={card.href} className="botao-toque rounded-xl transition-shadow hover:shadow-md">
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}
