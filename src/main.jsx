import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Configurar viewport meta tag dinámico para mejor responsividad
if (!document.querySelector('meta[name="viewport"]')) {
  const viewport = document.createElement('meta')
  viewport.name = 'viewport'
  viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
  document.head.appendChild(viewport)
}

// Configurar preferencias de color para dark mode
if (!document.querySelector('meta[name="color-scheme"]')) {
  const colorScheme = document.createElement('meta')
  colorScheme.name = 'color-scheme'
  colorScheme.content = 'light dark'
  document.head.appendChild(colorScheme)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

