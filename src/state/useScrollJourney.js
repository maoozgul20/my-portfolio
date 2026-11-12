import { useEffect } from 'react'
import { journey, env } from './store'

const smooth = (x, a, b) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// The shared scroll-progress system. Each [data-station] section is a stop on
// the path; the scroll position between two section centres becomes a fraction
// between two stations. The page and the 3D world read the same number.
export function useScrollJourney() {
  useEffect(() => {
    let centers = []
    const measure = () => {
      const vh = window.innerHeight
      centers = [...document.querySelectorAll('[data-station]')].map((el, i) => {
        const r = el.getBoundingClientRect()
        const top = r.top + window.scrollY
        // tall sections (mobile) settle when their top third is in view
        return i === 0 ? 0 : top + Math.min(r.height, vh) / 2 - vh / 2
      })
      onScroll()
    }
    const onScroll = () => {
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      journey.scroll = max > 0 ? y / max : 0
      let i = 0
      while (i < centers.length - 2 && y >= centers[i + 1]) i++
      const span = centers[i + 1] - centers[i] || 1
      const f = Math.min(1, Math.max(0, (y - centers[i]) / span))
      journey.target = i + smooth(f, 0.16, 0.84) // linger at each stop
    }
    const onMove = (e) => {
      if (env.coarse) return
      journey.px = (e.clientX / window.innerWidth) * 2 - 1
      journey.py = (e.clientY / window.innerHeight) * 2 - 1
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])
}

export const goTo = (id) => {
  const el = document.getElementById(id)
  if (!el) return
  const vh = window.innerHeight
  const r = el.getBoundingClientRect()
  const top = id === 'home' ? 0 : r.top + window.scrollY + Math.min(r.height, vh) / 2 - vh / 2
  window.scrollTo({ top, behavior: env.reduced ? 'auto' : 'smooth' })
}
