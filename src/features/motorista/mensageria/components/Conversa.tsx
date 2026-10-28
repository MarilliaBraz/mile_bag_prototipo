import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import Icone, { type NomeIcone } from '../../../../shared/components/Icone'
import { useStore } from '../../../../shared/services/store'
import type { Mensagem } from '../../../../shared/types'

const EVENTO_ICONE: Record<NonNullable<Mensagem['tipoEvento']>, NomeIcone> = {
  VIAGEM_INICIADA: 'caminhao',
  A_CAMINHO: 'carro',
  CHEGADA: 'pino',
  COMPROVANTE_REGISTRADO: 'checkCirculo',
  OCORRENCIA_REGISTRADA: 'alerta',
}

function Bolha({ mensagem }: { mensagem: Mensagem }) {
  if (mensagem.autor === 'SISTEMA') {
    return (
      <div className="my-2 flex justify-center">
        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          {mensagem.tipoEvento && <Icone nome={EVENTO_ICONE[mensagem.tipoEvento]} />} {mensagem.conteudo}
          <span className="text-slate-500">· {mensagem.canal === 'TELEGRAM' ? 'Telegram' : 'E-mail'}</span>
        </span>
      </div>
    )
  }

  const doMotorista = mensagem.autor === 'MOTORISTA'
  return (
    <div className={`my-1 flex ${doMotorista ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-xl px-3 py-2 text-sm shadow-sm ${
          doMotorista ? 'bg-blue-700 text-white' : 'bg-white text-slate-800'
        }`}
      >
        <p>{mensagem.conteudo}</p>
        <p className={`mt-1 text-xs ${doMotorista ? 'text-blue-200' : 'text-slate-500'}`}>
          {mensagem.canal === 'TELEGRAM' ? 'Telegram' : 'E-mail'} · {new Date(mensagem.criadoEm).toLocaleTimeString('pt-BR')}
          {mensagem.statusEnvio === 'FALHOU' && ' · falha no envio'}
        </p>
      </div>
    </div>
  )
}

export default function Conversa() {
  const { id } = useParams<{ id: string }>()
  const { entregas, enviarMensagem, simularRespostaPassageiro } = useStore()
  const entrega = entregas.find((e) => e.id === id)
  const [texto, setTexto] = useState('')

  if (!entrega) {
    return (
      <div>
        <p className="text-sm text-slate-500">Entrega não encontrada.</p>
        <Link to="/motorista" className="text-sm font-semibold text-blue-700">
          ← Voltar para a lista
        </Link>
      </div>
    )
  }

  const temTelefone = !!entrega.bdo.telefonePassageiro
  const temEmail = !!entrega.bdo.emailPassageiro
  const temTelegram = !!entrega.telegramVinculado
  // FR-006: sem e-mail não há via de convite ao Telegram (RD02); diferente
  // da versão WhatsApp original, telefone não habilita mensageria nenhuma.
  const contatoDisponivel = temEmail
  const mensagens = [...entrega.mensagens].sort((a, b) => a.criadoEm.localeCompare(b.criadoEm))

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!texto.trim() || !contatoDisponivel) return
    enviarMensagem(entrega!.id, texto)
    setTexto('')
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col">
      <Link to={`/motorista/entregas/${entrega.id}`} className="text-xs font-semibold text-blue-700">
        ← BDO {entrega.bdo.numero}
      </Link>
      <div className="mt-2 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-slate-900">{entrega.bdo.passageiroNome}</h1>
          <p className="text-xs text-slate-500">
            {temEmail && (
              <>
                <Icone nome="email" /> E-mail
              </>
            )}{' '}
            {temEmail && ' · '}
            {temTelegram || temEmail ? (
              <>
                <Icone nome="enviar" /> {temTelegram ? 'Telegram' : 'Telegram (convite enviado, aguardando)'}
              </>
            ) : null}
          </p>
        </div>

        {/* HU21: ligação direta, no mesmo lugar da conversa (RI15); usa o telefone e não depende da mensageria (HU18) */}
        {temTelefone ? (
          <a
            href={`tel:${entrega.bdo.telefonePassageiro!.replace(/\D/g, '')}`}
            className="inline-flex min-h-11 shrink-0 items-center rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800"
          >
            <Icone nome="telefone" /> Ligar
          </a>
        ) : (
          <span className="inline-flex min-h-11 shrink-0 items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500">
            <Icone nome="telefone" /> Sem telefone
          </span>
        )}
      </div>

      {!contatoDisponivel && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Esta entrega não tem e-mail do passageiro capturado no BDO. Sem e-mail não há como convidar o passageiro para o Telegram, então a conversa não está disponível.
        </div>
      )}

      {contatoDisponivel && (
        <>
          <div className="mt-3 flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
            {mensagens.length === 0 ? (
              <p className="mt-8 text-center text-xs text-slate-500">Nenhuma mensagem ainda. Envie a primeira abaixo.</p>
            ) : (
              mensagens.map((m) => <Bolha key={m.id} mensagem={m} />)
            )}
          </div>

          <button
            type="button"
            onClick={() => simularRespostaPassageiro(entrega.id)}
            className="mt-2 min-h-11 self-start text-xs font-medium text-slate-500 hover:text-slate-700"
            title="No sistema real, a resposta chega sozinha pelo Telegram ou pelo e-mail. Este botão só simula isso no protótipo."
          >
            ↺ Simular {temTelegram ? 'resposta' : 'toque no convite + resposta'} do passageiro
          </button>

          <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escreva uma mensagem…"
              className="min-h-11 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={!texto.trim()}
              className="min-h-11 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Enviar
            </button>
          </form>
        </>
      )}
    </div>
  )
}
