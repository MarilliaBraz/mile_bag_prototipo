import { useState, type FormEvent } from 'react'
import { useIdentidadeVisualTenant, useStore } from '../../data/store'

export default function IdentidadeVisual() {
  const identidade = useIdentidadeVisualTenant()
  const { atualizarIdentidadeVisual } = useStore()

  const [nomeExibicao, setNomeExibicao] = useState(identidade.nomeExibicao)
  const [corPrimaria, setCorPrimaria] = useState(identidade.corPrimaria)
  const [logoIniciais, setLogoIniciais] = useState(identidade.logoIniciais)
  const [salvo, setSalvo] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    atualizarIdentidadeVisual({
      nomeExibicao,
      corPrimaria,
      logoIniciais: logoIniciais.slice(0, 3).toUpperCase(),
    })
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Identidade visual</h1>
      <p className="mt-1 text-sm text-slate-500">
        Configure o logotipo e o cabeçalho do seu tenant. Essa identidade é aplicada automaticamente aos relatórios
        de fechamento gerados. Não existe uma tela separada de "relatório" aqui, só a configuração.
      </p>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row">
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
          <div>
            <label htmlFor="nomeExibicao" className="text-sm font-medium text-slate-700">
              Nome de exibição
            </label>
            <input
              id="nomeExibicao"
              type="text"
              required
              value={nomeExibicao}
              onChange={(e) => setNomeExibicao(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label htmlFor="logoIniciais" className="text-sm font-medium text-slate-700">
              Iniciais do logotipo (2 ou 3 letras)
            </label>
            <input
              id="logoIniciais"
              type="text"
              required
              maxLength={3}
              value={logoIniciais}
              onChange={(e) => setLogoIniciais(e.target.value)}
              className="mt-1 w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase"
            />
            <p className="mt-1 text-xs text-slate-500">
              Este protótipo simula o upload do logotipo com as iniciais em um círculo colorido.
            </p>
          </div>

          <div>
            <label htmlFor="corPrimaria" className="text-sm font-medium text-slate-700">
              Cor primária
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="corPrimaria"
                type="color"
                value={corPrimaria}
                onChange={(e) => setCorPrimaria(e.target.value)}
                className="h-9 w-14 cursor-pointer rounded border border-slate-300"
              />
              <span className="text-xs text-slate-500">{corPrimaria}</span>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 min-h-11 self-start rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            Salvar identidade visual
          </button>
          {salvo && <p className="text-sm font-medium text-emerald-700">Identidade visual atualizada.</p>}
        </form>

        <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 sm:w-64">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prévia</p>
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white shadow"
            style={{ backgroundColor: corPrimaria }}
          >
            {logoIniciais.slice(0, 3).toUpperCase() || '?'}
          </span>
          <p className="text-center text-sm font-semibold text-slate-800">{nomeExibicao || 'Nome da empresa'}</p>
          <p className="text-center text-xs text-slate-500">
            Assim aparece no topo do back-office e no cabeçalho dos relatórios de fechamento.
          </p>
        </div>
      </div>
    </div>
  )
}
