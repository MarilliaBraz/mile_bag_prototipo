import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../../data/store'

export default function BagagemCarona() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { entregas, vincularBagagemCarona } = useStore()
  const entrega = entregas.find((e) => e.id === id)

  const [numero, setNumero] = useState('')
  const [passageiroNome, setPassageiroNome] = useState('')
  const [enderecoEntrega, setEnderecoEntrega] = useState(entrega?.bdo.enderecoEntrega ?? '')
  const [companhiaAerea, setCompanhiaAerea] = useState('')
  const [kmComplementar, setKmComplementar] = useState('')
  const [erro, setErro] = useState<string | null>(null)

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

  // FR-002: entrega já encerrada com comprovante não aceita novo vínculo de bagagem carona
  if (entrega.status === 'ENCERRADA_COM_SUCESSO') {
    return (
      <div>
        <Link to={`/motorista/entregas/${entrega.id}`} className="text-xs font-semibold text-blue-700">
          ← BDO {entrega.bdo.numero}
        </Link>
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Esta entrega já foi encerrada com comprovante de entrega. Não é mais possível vincular uma bagagem carona a
          ela.
        </div>
      </div>
    )
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const km = Number(kmComplementar)
    if (!numero.trim() || !passageiroNome.trim() || !enderecoEntrega.trim() || !companhiaAerea.trim()) {
      setErro('Preencha todos os dados do BDO da bagagem carona.')
      return
    }
    if (!kmComplementar || Number.isNaN(km) || km <= 0) {
      setErro('Informe a quilometragem complementar (maior que zero).')
      return
    }
    setErro(null)
    vincularBagagemCarona(entrega!.id, { numero, passageiroNome, enderecoEntrega, companhiaAerea }, km)
    navigate(`/motorista/entregas/${entrega!.id}`)
  }

  return (
    <div>
      <Link to={`/motorista/entregas/${entrega.id}`} className="text-xs font-semibold text-blue-700">
        ← BDO {entrega.bdo.numero}
      </Link>
      <h1 className="mt-2 text-lg font-bold text-slate-900">Vincular bagagem carona</h1>
      <p className="mt-1 text-sm text-slate-600">
        Capture o BDO da bagagem adicional e informe apenas a quilometragem complementar até o endereço dela. Ela
        não é tratada como uma entrega separada.
      </p>

      {entrega.bagagensCarona.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-semibold text-slate-800">Já vinculadas a esta entrega</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {entrega.bagagensCarona.map((b) => (
              <li key={b.id} className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
                BDO {b.bdo.numero} · {b.bdo.passageiroNome} (+{b.kmComplementar} km)
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Número do BDO</span>
          <input
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="GYN-48XXX"
            className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Nome do passageiro</span>
          <input
            value={passageiroNome}
            onChange={(e) => setPassageiroNome(e.target.value)}
            className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Endereço de entrega</span>
          <input
            value={enderecoEntrega}
            onChange={(e) => setEnderecoEntrega(e.target.value)}
            className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Companhia aérea</span>
          <input
            value={companhiaAerea}
            onChange={(e) => setCompanhiaAerea(e.target.value)}
            placeholder="LATAM, GOL, Azul..."
            className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Quilometragem complementar (km)</span>
          <input
            value={kmComplementar}
            onChange={(e) => setKmComplementar(e.target.value)}
            type="number"
            min="0"
            step="0.1"
            placeholder="ex.: 1.8"
            className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        {erro && <p role="alert" className="text-xs font-medium text-red-600">{erro}</p>}

        <button
          type="submit"
          className="mt-1 min-h-11 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
        >
          Vincular bagagem carona
        </button>
      </form>
    </div>
  )
}
