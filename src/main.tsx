import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// React StrictMode double-mounts components in development to detect side-effects.
// Firebase listeners and cleanup handles are managed per-room to remain safe during dev remounts.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
