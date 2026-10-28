import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Ajuda from '../../../../shared/components/Ajuda'
import ConfirmarAcao from '../../../../shared/components/ConfirmarAcao'
import Icone from '../../../../shared/components/Icone'
import { avaliarDivergencia, trajetoAtivo, useConfiguracaoTenant, useStore } from '../../../../shared/services/store'
import { numero } from '../../../../shared/utils/formatar'

// Coordenadas de referência em Goiânia; usadas só para simular a captura de
// geolocalização (o protótipo não tem acesso real ao GPS do dispositivo).
const LAT_BASE = -16.6799
const LNG_BASE = -49.255

export default function Comprovante() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { entregas, registrarComprovante, offline } = useStore()
  const configuracao = useConfiguracaoTenant()
  const entrega = entregas.find((e) => e.id === id)
  const trajeto = entrega ? trajetoAtivo(entrega) : undefined
  const divergencia = trajeto ? avaliarDivergencia(trajeto, configuracao) : null

  const [recebedorNome, setRecebedorNome] = useState('')
  const [fotoCapturada, setFotoCapturada] = useState(false)
  const [geolocalizacao, setGeolocalizacao] = useState<{ lat: number; lng: number } | null>(null)
  const [capturandoGeo, setCapturandoGeo] = useState(false)
  const [justificativaDivergencia, setJustificativaDivergencia] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState(false)

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

  // FR-004: impede registrar mais de um comprovante para a mesma tentativa em aberto
  if (entrega.status === 'ENCERRADA_COM_SUCESSO') {
    return (
      <div>
        <Link to={`/motorista/entregas/${entrega.id}`} className="text-xs font-semibold text-blue-700">
          ← BDO {entrega.bdo.numero}
        </Link>
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Esta entrega já possui um comprovante de entrega registrado. Não é possível registrar um novo.
        </div>
      </div>
    )
  }

  function simularFoto() {
    setFotoCapturada(true)
  }

  function capturarGeolocalizacao() {
    setCapturandoGeo(true)
    // Simula a captura de GPS: pequena variação aleatória em torno de um ponto de Goiânia.
    setTimeout(() => {
      setGeolocalizacao({
        lat: LAT_BASE + (Math.random() - 0.5) * 0.02,
        lng: LNG_BASE + (Math.random() - 0.5) * 0.02,
      })
      setCapturandoGeo(false)
    }, 500)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    // FR-001/FR-002: foto, recebedor, data/hora e geolocalização são todos obrigatórios
    if (!fotoCapturada) {
      setErro('Fotografe o documento assinado antes de confirmar.')
      return
    }
    if (!recebedorNome.trim()) {
      setErro('Informe o nome do recebedor.')
      return
    }
    if (!geolocalizacao) {
      setErro('Capture a geolocalização antes de confirmar. Se o GPS falhar, tente novamente: o restante do comprovante fica guardado até lá.')
      return
    }
    if (divergencia?.divergiu && !justificativaDivergencia.trim()) {
      setErro('A quilometragem final diverge da rota sugerida no início. Informe uma justificativa antes de encerrar.')
      return
    }
    setErro(null)
    setConfirmando(true)
  }

  function confirmarEnvio() {
    setConfirmando(false)
    registrarComprovante(
      entrega!.id,
      { recebedorNome, dataHora: new Date().toISOString(), geolocalizacao: geolocalizacao! },
      divergencia?.divergiu ? justificativaDivergencia.trim() : undefined,
    )
    navigate(`/motorista/entregas/${entrega!.id}`, {
      state: {
        aviso: offline
          ? 'Comprovante salvo neste dispositivo. Ele será sincronizado quando houver conexão.'
          : 'Comprovante registrado e entrega encerrada com sucesso.',
      },
    })
  }

  return (
    <div>
      <Link to={`/motorista/entregas/${entrega.id}`} className="text-xs font-semibold text-blue-700">
        ← BDO {entrega.bdo.numero}
      </Link>
      <h1 className="mt-2 text-lg font-bold text-slate-900">Registrar comprovante de entrega</h1>
      <p className="mt-1 text-sm text-slate-600">
        Encerra a entrega com sucesso. Todos os campos abaixo são obrigatórios.
      </p>
      <Ajuda>
        <p>Fotografe o documento assinado, informe quem recebeu e capture a localização. A data e a hora são registradas automaticamente. Sem internet, o comprovante fica salvo no aparelho e é sincronizado depois.</p>
      </Ajuda>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Foto do documento assinado</span>
          {fotoCapturada ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
              <span>
                <Icone nome="checkCirculo" /> Foto capturada
              </span>
              <button type="button" onClick={simularFoto} className="min-h-11 text-xs font-semibold underline">
                Refazer
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={simularFoto}
              className="min-h-11 rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm font-medium text-slate-600 hover:border-blue-400 hover:text-blue-700"
            >
              <Icone nome="camera" /> Fotografar documento assinado
            </button>
          )}
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">
            Nome do recebedor <span aria-hidden="true" className="text-red-700">*</span>
          </span>
          <input
            aria-required="true"
            aria-invalid={!!erro && !recebedorNome.trim()}
            value={recebedorNome}
            onChange={(e) => setRecebedorNome(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Quem recebeu a bagagem"
          />
        </label>

        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Geolocalização</span>
          {geolocalizacao ? (
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
              <span>
                <Icone nome="pino" /> {geolocalizacao.lat.toFixed(4)}, {geolocalizacao.lng.toFixed(4)}
              </span>
              <button type="button" onClick={capturarGeolocalizacao} className="min-h-11 text-xs font-semibold underline">
                Recapturar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={capturarGeolocalizacao}
              disabled={capturandoGeo}
              className="min-h-11 rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm font-medium text-slate-600 hover:border-blue-400 hover:text-blue-700 disabled:opacity-60"
            >
              {capturandoGeo ? 'Capturando localização...' : <><Icone nome="pino" /> Capturar localização atual</>}
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500">Data/hora registradas automaticamente ao confirmar.</p>

        {divergencia?.divergiu && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-amber-800">
              <Icone nome="alerta" /> Km final ({numero(divergencia.totalFinal)} km) diverge da rota sugerida ({numero(divergencia.totalInicial)}{' '}
              km). Justifique antes de encerrar
            </span>
            <textarea
              value={justificativaDivergencia}
              onChange={(e) => setJustificativaDivergencia(e.target.value)}
              rows={2}
              className="rounded-lg border border-amber-300 px-3 py-2 text-sm"
              placeholder="Ex.: desvio por obra na via, trânsito intenso..."
            />
          </label>
        )}

        {erro && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {erro}
          </p>
        )}

        <button
          type="submit"
          className="mt-1 min-h-11 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
        >
          Confirmar comprovante e encerrar entrega
        </button>
      </form>

      <ConfirmarAcao
        aberto={confirmando}
        titulo="Encerrar a entrega?"
        descricao="O comprovante será registrado e a entrega será encerrada. Confira a foto e o nome de quem recebeu antes de continuar."
        rotuloConfirmar="Encerrar entrega"
        aoConfirmar={confirmarEnvio}
        aoCancelar={() => setConfirmando(false)}
      />
    </div>
  )
}
