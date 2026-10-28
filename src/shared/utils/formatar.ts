const REAL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** R$ no padrão brasileiro (vírgula decimal): "R$ 15,00", nunca "R$ 15.00". */
export function moeda(valor: number): string {
  return REAL.format(valor)
}

/** Número com vírgula decimal e casas fixas (km, valores de ajuste). */
export function numero(valor: number, casas = 1): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}
