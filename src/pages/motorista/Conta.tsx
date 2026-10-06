import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import BarraAcessibilidade from '../../components/BarraAcessibilidade'
import type { EstadoAcessibilidade } from '../../components/useAcessibilidade'
import Icone from '../../components/Icone'
import { useAuth } from '../../data/auth'
import { MOTORISTA_ATUAL, useEntregasDoTenant } from '../../data/store'

/**
 * Conta do motorista: o que não é do dia a dia (registros do aparelho,
 * preferências de leitura e sair) fica aqui, longe de toques acidentais
 * durante as entregas; mesma organização do mile_bag_app.
 */
export default function Conta() {
  const acessibilidade = useOutletContext<EstadoAcessibilidade>()
  const pendentes = useEntregasDoTenant().filter((e) => e.pendenteSincronizacao).length
  const { sair } = useAuth()
  const navigate = useNavigate()

  const iniciais = MOTORISTA_ATUAL.nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-lg font-extrabold text-blue-700" aria-hidden="true">
          {iniciais}
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-900">{MOTORISTA_ATUAL.nome}</h1>
          <p className="text-xs text-slate-600">Motorista</p>
        </div>
      </div>

      <Link
        to="/motorista/sincronizacao"
        className="botao-toque mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300"
      >
        <Icone nome="sincronizar" className="!h-6 !w-6 text-blue-700" />
        <span className="flex-1">
          <span className="block text-sm font-semibold text-slate-900">Registros do aparelho</span>
          <span className="block text-xs text-slate-600">
            {pendentes > 0 ? `${pendentes} aguardando envio` : 'Tudo o que foi registrado neste celular'}
          </span>
        </span>
        {pendentes > 0 && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">{pendentes}</span>}
        <Icone nome="chevron" className="text-slate-400" />
      </Link>

      <h2 className="mt-6 text-sm font-semibold text-slate-900">Leitura</h2>
      <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <BarraAcessibilidade estado={acessibilidade} />
        <p className="mt-2 text-xs text-slate-600">Texto em {acessibilidade.fontScale}%. A preferência fica salva neste aparelho.</p>
      </div>

      <button
        type="button"
        onClick={() => {
          sair()
          navigate('/', { replace: true })
        }}
        className="mt-8 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50"
      >
        <Icone nome="sair" /> Sair
      </button>
      <p className="mt-2 text-center text-xs text-slate-600">O que ainda não foi enviado continua guardado neste aparelho.</p>
    </div>
  )
}
