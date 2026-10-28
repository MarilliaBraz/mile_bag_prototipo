import { Link } from 'react-router-dom'
import Icone, { type NomeIcone } from '../../../../shared/components/Icone'
import { marcoMaisRecente, useBdosDisponiveis, useMinhasEntregasPendentes, useStore } from '../../../../shared/services/store'
import { entregaStatusInfo } from '../../../../shared/utils/statusLabels'

const MARCO_LABEL: Record<'a_caminho' | 'chegada', { icone: NomeIcone; texto: string }> = {
  a_caminho: { icone: 'carro', texto: 'A caminho' },
  chegada: { icone: 'pino', texto: 'Chegou ao endereço' },
}

export default function EntregasLista() {
  const pendentes = useMinhasEntregasPendentes()
  const bdosDisponiveis = useBdosDisponiveis()
  const { autoatribuirEntrega, receberBdoPorEmail } = useStore()

  function simularBdoPorEmail() {
    receberBdoPorEmail({
      numero: `GYN-${Math.floor(40000 + Math.random() * 9000)}`,
      passageiroNome: 'Patrícia Nogueira Dias',
      enderecoEntrega: 'Rua 136, 780, Setor Marista, Goiânia - GO',
      companhiaAerea: 'LATAM',
      telefonePassageiro: '(62) 99221-4400',
      emailPassageiro: 'patricia.dias@example.com',
      etiquetaBagagem: `LA${Math.floor(100000 + Math.random() * 899999)}`,
    })
  }

  return (
    <div>
      <h1 className="text-lg font-bold text-slate-900">Minhas entregas</h1>

      <div className="mt-3 flex items-center gap-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-4 text-white shadow-md">
        <span className="text-4xl font-extrabold tabular-nums leading-none">{pendentes.length}</span>
        <span className="text-sm font-semibold leading-snug">
          {pendentes.length === 1 ? 'entrega pendente' : 'entregas pendentes'}
          <span className="block text-xs font-normal text-blue-100">Toque em uma entrega para ver rota, contato e comprovante.</span>
        </span>
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-semibold text-slate-900">Para entregar</h2>

        {pendentes.length === 0 && (
          <div className="mt-2 grid justify-items-center gap-1 rounded-xl border-2 border-dashed border-slate-200 bg-white px-4 py-8 text-center">
            <Icone nome="checkCirculo" className="!h-10 !w-10 text-blue-700" />
            <p className="text-sm font-semibold text-slate-900">Nenhuma entrega pendente</p>
            <p className="text-xs text-slate-600">Assuma um BDO disponível abaixo ou capture um novo pelo botão da câmera.</p>
          </div>
        )}

        <ul className="mt-2 flex flex-col gap-3">
          {pendentes.map((entrega) => {
            const status = entregaStatusInfo[entrega.status]
            const marco = marcoMaisRecente(entrega)
            const rotuloMarco = marco ? MARCO_LABEL[marco.tipo as 'a_caminho' | 'chegada'] : null
            return (
              <li key={entrega.id} className="entrar">
                <Link
                  to={`/motorista/entregas/${entrega.id}`}
                  className="botao-toque flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-400 hover:shadow-md"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <p className="text-xs font-bold tracking-wide text-slate-900 tabular-nums">BDO {entrega.bdo.numero}</p>
                      {rotuloMarco ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                          <Icone nome={rotuloMarco.icone} /> {rotuloMarco.texto}
                        </span>
                      ) : (
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${status.className}`}>{status.label}</span>
                      )}
                    </div>
                    <p className="mt-1 text-base font-semibold text-slate-900">{entrega.bdo.passageiroNome}</p>
                    <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-600">
                      <Icone nome="pino" className="mt-0.5 text-slate-500" />
                      <span>{entrega.bdo.enderecoEntrega}</span>
                    </p>
                    {entrega.bagagensCarona.length > 0 && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                        <Icone nome="mala" className="text-slate-500" /> +{entrega.bagagensCarona.length} bagagem carona
                      </p>
                    )}
                    {entrega.pendenteSincronizacao && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                        <Icone nome="sincronizar" /> Aguardando envio
                      </p>
                    )}
                  </div>
                  <Icone nome="chevron" className="!h-6 !w-6 text-slate-400" />
                </Link>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Disponíveis para assumir ({bdosDisponiveis.length})</h2>
          <button
            type="button"
            onClick={simularBdoPorEmail}
            className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
            title="Simula o recebimento automático de um BDO por e-mail. No sistema real, isso acontece sem ação do motorista."
          >
            <Icone nome="email" /> Simular BDO por e-mail
          </button>
        </div>

        {bdosDisponiveis.length === 0 && <p className="mt-2 text-sm text-slate-600">Nenhum BDO disponível no momento.</p>}

        <ul className="mt-2 flex flex-col gap-3">
          {bdosDisponiveis.map((entrega) => (
            <li key={entrega.id} className="entrar rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <p className="text-xs font-bold tracking-wide text-slate-900 tabular-nums">BDO {entrega.bdo.numero}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                  {entrega.bdo.origem === 'EMAIL_AUTOMATICO' ? (
                    <>
                      <Icone nome="email" /> Por e-mail
                    </>
                  ) : (
                    <>
                      <Icone nome="camera" /> Fotografado
                    </>
                  )}
                </span>
              </div>
              <p className="mt-1 text-base font-semibold text-slate-900">{entrega.bdo.passageiroNome}</p>
              <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-600">
                <Icone nome="pino" className="mt-0.5 text-slate-500" />
                <span>{entrega.bdo.enderecoEntrega}</span>
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => autoatribuirEntrega(entrega.id)}
                  className="min-h-11 flex-1 rounded-lg border-2 border-blue-700 bg-white px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                >
                  Assumir entrega
                </button>
                <Link
                  to={`/motorista/entregas/${entrega.id}`}
                  className="botao-toque inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Detalhes
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
