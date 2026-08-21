import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../data/store'
import type { Bdo, Entrega } from '../../types'

type CamposBdo = Omit<Bdo, 'id'>

const CAMPOS_VAZIOS: CamposBdo = {
  numero: '',
  passageiroNome: '',
  enderecoEntrega: '',
  companhiaAerea: '',
  telefonePassageiro: '',
}

// Exemplo plausível devolvido pela simulação do OCR — os valores são só um
// ponto de partida: o motorista sempre revisa e pode corrigir antes de
// confirmar (RI01 / RN01, tela de conferência obrigatória).
function gerarExtracaoSimulada(): CamposBdo {
  const numero = `GYN-${Math.floor(40000 + Math.random() * 9000)}`
  return {
    numero,
    passageiroNome: 'Beatriz Almeida Santos',
    enderecoEntrega: 'Rua 84, 215, Setor Sul, Goiânia - GO',
    companhiaAerea: 'LATAM',
    telefonePassageiro: '(62) 99456-7890',
  }
}

export default function CapturarBdo() {
  const navigate = useNavigate()
  const { entregas, criarEntregaComBdo, autoatribuirEntrega } = useStore()

  const [fase, setFase] = useState<'foto' | 'conferencia' | 'confirmado'>('foto')
  const [extraindo, setExtraindo] = useState(false)
  const [campos, setCampos] = useState<CamposBdo>(CAMPOS_VAZIOS)
  const [entregaCriada, setEntregaCriada] = useState<Entrega | null>(null)

  const duplicidade = campos.numero.trim().length > 0 && entregas.some((e) => e.bdo.numero === campos.numero.trim())

  function simularFotografia() {
    setExtraindo(true)
    // Simula o tempo de processamento do OCR (Tesseract) antes de sugerir os campos
    setTimeout(() => {
      setCampos(gerarExtracaoSimulada())
      setExtraindo(false)
      setFase('conferencia')
    }, 900)
  }

  function atualizarCampo<K extends keyof CamposBdo>(campo: K, valor: CamposBdo[K]) {
    setCampos((c) => ({ ...c, [campo]: valor }))
  }

  function confirmarBdo(evento: FormEvent) {
    evento.preventDefault()
    const entrega = criarEntregaComBdo(campos)
    setEntregaCriada(entrega)
    setFase('confirmado')
  }

  function atribuirAMim() {
    if (!entregaCriada) return
    autoatribuirEntrega(entregaCriada.id)
    navigate(`/motorista/entregas/${entregaCriada.id}`)
  }

  return (
    <div>
      <Link to="/motorista" className="text-xs font-semibold text-blue-700">
        ← Minhas entregas
      </Link>
      <h1 className="mt-2 text-lg font-bold text-slate-900">Capturar BDO</h1>

      {fase === 'foto' && (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-4xl">📄</p>
          <p className="mt-2 text-sm text-slate-600">
            Fotografe o telex do BDO recebido da companhia aérea. O sistema extrai os campos automaticamente (RF02).
          </p>
          <button
            type="button"
            onClick={simularFotografia}
            disabled={extraindo}
            className="mt-4 w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-60"
          >
            {extraindo ? 'Extraindo dados do documento…' : '📷 Simular fotografia do BDO'}
          </button>
        </div>
      )}

      {fase === 'conferencia' && (
        <form onSubmit={confirmarBdo} className="mt-4 flex flex-col gap-3">
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Confira e corrija os campos abaixo antes de confirmar. Nenhum BDO é salvo automaticamente a partir do
            reconhecimento (RN01).
          </div>

          {duplicidade && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
              ⚠️ Já existe uma entrega registrada com este número de BDO. Confira antes de prosseguir para evitar
              duplicidade.
            </div>
          )}

          <label className="text-xs font-semibold text-slate-600">
            Número do BDO
            <input
              required
              value={campos.numero}
              onChange={(e) => atualizarCampo('numero', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>

          <label className="text-xs font-semibold text-slate-600">
            Nome do passageiro
            <input
              required
              value={campos.passageiroNome}
              onChange={(e) => atualizarCampo('passageiroNome', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>

          <label className="text-xs font-semibold text-slate-600">
            Endereço de entrega
            <input
              required
              value={campos.enderecoEntrega}
              onChange={(e) => atualizarCampo('enderecoEntrega', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>

          <label className="text-xs font-semibold text-slate-600">
            Companhia aérea
            <input
              required
              value={campos.companhiaAerea}
              onChange={(e) => atualizarCampo('companhiaAerea', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>

          <label className="text-xs font-semibold text-slate-600">
            Telefone do passageiro (opcional)
            <input
              value={campos.telefonePassageiro}
              onChange={(e) => atualizarCampo('telefonePassageiro', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </label>

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setFase('foto')}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Refazer foto
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
            >
              Confirmar BDO
            </button>
          </div>
        </form>
      )}

      {fase === 'confirmado' && entregaCriada && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">BDO {entregaCriada.bdo.numero} confirmado</p>
            <p className="mt-1 text-xs text-emerald-700">{entregaCriada.bdo.passageiroNome}</p>
          </div>
          <p className="text-sm text-slate-600">Quer assumir esta entrega agora?</p>
          <button
            type="button"
            onClick={atribuirAMim}
            className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            Atribuir esta entrega a mim
          </button>
          <button
            type="button"
            onClick={() => navigate(`/motorista/entregas/${entregaCriada.id}`)}
            className="text-xs font-medium text-slate-400 hover:text-slate-600"
          >
            Ver a entrega sem atribuir agora
          </button>
        </div>
      )}
    </div>
  )
}
