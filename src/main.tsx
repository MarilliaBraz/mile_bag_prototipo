import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { aplicarTema, temaSalvo } from './data/tema'

// Antes de renderizar, para não piscar o tema claro ao abrir.
aplicarTema(temaSalvo())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
