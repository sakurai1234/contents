import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppMap from './App_map.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppMap />
  </StrictMode>,
)
