import { Link } from 'react-router-dom'
import { useEntregasDoTenant, useStore } from '../../data/store'

export default function Dashboard() {
  const entregas = useEntregasDoTenant()
  const { tarifas, pedagios, fechamentos } = useStore()

  const emAndamento = entregas.filter((e) => e.status === 'EM_ANDAMENTO' || e.status === 'ATRIBUIDA').length
  const encerradas = entregas.filter((e) => e.status === 'ENCERRADA_COM_SUCESSO').length
  const reabertas = entregas.filter((e) => e.status === 'REABERTA').length

  const cards = [
    { label: 'Entregas em andamento', value: emAndamento, href: null },
    { label: 'Entregas concluídas', value: encerradas, href: null },
    { label: 'Reabertas por ocorrência', value: reabertas, href: null },
    { label: 'Tabelas de tarifa cadastradas', value: tarifas.length, href: '/tenant/tarifas' },
    { label: 'Praças de pedágio cadastradas', value: pedagios.length, href: '/tenant/pedagios' },
    { label: 'Fechamentos gerados', value: fechamentos.length, href: '/tenant/fechamento' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Visão geral</h1>
      <p className="mt-1 text-sm text-slate-500">Resumo da operação do tenant.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const content = (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="mt-1 text-xs text-slate-500">{card.label}</p>
            </div>
          )
          return card.href ? (
            <Link key={card.label} to={card.href} className="hover:border-blue-300">
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
