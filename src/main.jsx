import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { useUI } from './state/store'

// No WebGL → static backdrop, same content.
try {
  const c = document.createElement('canvas')
  if (!(c.getContext('webgl2') || c.getContext('webgl'))) useUI.setState({ webgl: false, ready: true })
} catch {
  useUI.setState({ webgl: false, ready: true })
}

// Labels inside the 3D world are drawn to canvas, so the fonts must be in
// before the world mounts. Never wait long for them.
const fonts = Promise.race([
  Promise.all([document.fonts.load('600 40px "Sora Variable"'), document.fonts.load('600 44px Cinzel')]).catch(() => {}),
  new Promise((r) => setTimeout(r, 2000)),
])

fonts.then(() =>
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  ),
)
