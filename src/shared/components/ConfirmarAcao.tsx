import { useEffect, useId, useRef } from 'react'

interface Props {
  aberto: boolean
  titulo: string
  descricao: string
  rotuloConfirmar: string
  perigo?: boolean
  aoConfirmar: () => void
  aoCancelar: () => void
}

/** Confirmação antes de uma ação difícil de desfazer. Usa <dialog> nativo: prende o foco, fecha com Esc e devolve o foco ao botão de origem. */
export default function ConfirmarAcao({ aberto, titulo, descricao, rotuloConfirmar, perigo, aoConfirmar, aoCancelar }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const uid = useId()

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (aberto && !dialogo.open) dialogo.showModal()
    else if (!aberto && dialogo.open) dialogo.close()
  }, [aberto])

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${uid}-titulo`}
      aria-describedby={`${uid}-descricao`}
      onCancel={aoCancelar}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-slate-300 bg-white p-5 text-slate-800 shadow-xl backdrop:bg-black/50"
    >
      <h2 id={`${uid}-titulo`} className="text-base font-bold text-slate-900">
        {titulo}
      </h2>
      <p id={`${uid}-descricao`} className="mt-2 text-sm text-slate-700">
        {descricao}
      </p>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          autoFocus
          onClick={aoCancelar}
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={aoConfirmar}
          className={`min-h-11 rounded-lg px-4 text-sm font-semibold text-white ${perigo ? 'bg-red-700 hover:bg-red-800' : 'bg-blue-700 hover:bg-blue-800'}`}
        >
          {rotuloConfirmar}
        </button>
      </div>
    </dialog>
  )
}
