import { Component, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useUI } from '../state/store'
import { projects } from '../data/content'
import { Logo, Close, Arrow } from './Icons'

export function Loader() {
  const ready = useUI((s) => s.ready)
  const [gone, setGone] = useState(false)
  const [p, setP] = useState(0)
  useEffect(() => {
    if (ready) {
      setP(100)
      const t = setTimeout(() => setGone(true), 450)
      return () => clearTimeout(t)
    }
    const id = setInterval(() => setP((v) => Math.min(92, v + (92 - v) * 0.12 + 1)), 140)
    // never trap the visitor behind the loader
    const safety = setTimeout(() => useUI.getState().set({ ready: true }), 9000)
    return () => {
      clearInterval(id)
      clearTimeout(safety)
    }
  }, [ready])
  return (
    <AnimatePresence>
      {!gone && (
        <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="fixed inset-0 z-[100] grid place-items-center bg-bg" role="status" aria-live="polite">
          <div className="flex w-56 flex-col items-center gap-6">
            <Logo size={64} />
            <p className="kicker !text-mute">The journey begins</p>
            <div className="h-[3px] w-full overflow-hidden rounded bg-ink/10">
              <div className="h-full rounded bg-gradient-to-r from-cyan to-teal transition-[width] duration-300" style={{ width: `${p}%` }} />
            </div>
            <p className="text-xs tabular-nums text-mute">{Math.round(p)}%</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// If the 3D world throws, keep the page: swap in the static backdrop.
export class WorldBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err) {
    console.warn('3D world unavailable, using static backdrop.', err)
    useUI.getState().set({ webgl: false, ready: true })
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function Fallback() {
  const [show, setShow] = useState(true)
  return (
    <>
      <div className="fallback-world" aria-hidden="true" />
      {show && (
        <div data-ui className="glass fixed bottom-4 left-4 z-30 flex max-w-xs items-start gap-3 rounded-xl p-3 text-xs text-mute">
          <span>The 3D world could not start on this device, so you are seeing the static version. Everything else works the same.</span>
          <button onClick={() => setShow(false)} aria-label="Dismiss" className="text-ink">
            <Close size={14} />
          </button>
        </div>
      )}
    </>
  )
}

export function ProjectModal() {
  const id = useUI((s) => s.project)
  const set = useUI((s) => s.set)
  const p = projects.find((x) => x.id === id)
  const closeRef = useRef()
  const panel = useRef()

  useEffect(() => {
    if (!p) return
    const prev = document.activeElement
    document.documentElement.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') set({ project: null })
      if (e.key === 'Tab') {
        const f = panel.current.querySelectorAll('button, a[href]')
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [p, set])

  const i = projects.findIndex((x) => x.id === id)
  const next = projects[(i + 1) % projects.length]

  return (
    <AnimatePresence>
      {p && (
        <motion.div data-ui key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] overflow-y-auto bg-[var(--scrim)] backdrop-blur-md" onClick={() => set({ project: null })}>
          <div className="flex min-h-full items-center justify-center p-3 sm:p-6">
            <motion.article
              ref={panel}
              key={p.id}
              role="dialog"
              aria-modal="true"
              aria-labelledby="case-title"
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="glass relative w-full max-w-3xl overflow-hidden rounded-3xl"
              style={{ '--a': p.accent }}
            >
              <div className="absolute inset-x-0 top-0 h-40 opacity-60" style={{ background: `radial-gradient(80% 100% at 20% 0%, ${p.accent}33, transparent 70%)` }} aria-hidden="true" />
              <button ref={closeRef} onClick={() => set({ project: null })} className="glass-soft absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full hover:border-cyan" aria-label="Close case study">
                <Close />
              </button>

              <div className="relative p-6 sm:p-10">
                <p className="kicker" style={{ color: p.accent }}>
                  Project {p.index} · {p.status}
                </p>
                <h2 id="case-title" className="display mt-3 text-4xl sm:text-5xl">
                  {p.title}
                </h2>
                <p className="mt-2 text-mute">{p.subtitle}</p>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {p.facts.map((f) => (
                    <div key={f.label} className="glass-soft rounded-2xl p-4">
                      <div className="text-xl font-semibold" style={{ color: p.accent }}>
                        {f.value}
                      </div>
                      <div className="mt-1 text-xs text-mute">{f.label}</div>
                    </div>
                  ))}
                </div>

                <h3 className="mt-9 text-sm font-semibold uppercase tracking-[0.2em] text-ink/90">Overview</h3>
                <p className="mt-3 leading-relaxed text-ink/85">{p.overview}</p>

                <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-ink/90">What it does</h3>
                <ul className="mt-3 grid gap-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-ink/85">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: p.accent, boxShadow: `0 0 10px ${p.accent}` }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-ink/90">How it fits together</h3>
                <ol className="mt-4 flex flex-wrap items-center gap-2">
                  {p.architecture.map((a, k) => (
                    <li key={a} className="flex items-center gap-2">
                      <span className="glass-soft rounded-xl px-3 py-2 text-sm">{a}</span>
                      {k < p.architecture.length - 1 && <Arrow size={14} style={{ color: p.accent }} />}
                    </li>
                  ))}
                </ol>

                <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-ink/90">Technologies</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
                  <button className="btn btn-ghost" onClick={() => set({ project: null })}>
                    Back to the world
                  </button>
                  <button className="btn btn-primary" onClick={() => set({ project: next.id })}>
                    Next: {next.title} <Arrow size={16} />
                  </button>
                </div>
              </div>
            </motion.article>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
