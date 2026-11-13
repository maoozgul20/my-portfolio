import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useUI, journey } from '../state/store'
import { goTo } from '../state/useScrollJourney'
import { navItems, sections, profile } from '../data/content'
import { Logo, Download, Menu, Close, Up } from './Icons'

// station index → the nav item it belongs to (all four projects sit under Projects)
const navFor = (i) => {
  for (let k = i; k >= 0; k--) if (sections[k].nav) return sections[k].id
  return 'home'
}

export function Nav() {
  const active = useUI((s) => s.active)
  const current = navFor(active)
  const [open, setOpen] = useState(false)
  const bar = useRef()

  // scroll progress, written straight to the DOM every frame
  useEffect(() => {
    let raf
    const tick = () => {
      if (bar.current) bar.current.style.transform = `scaleX(${journey.scroll || 0})`
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])

  const go = (id) => {
    setOpen(false)
    goTo(id)
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-[2px] bg-white/5" aria-hidden="true">
        <div ref={bar} className="h-full origin-left bg-gradient-to-r from-cyan to-teal" style={{ transform: 'scaleX(0)' }} />
      </div>

      <header data-ui className="fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <button onClick={() => go('home')} className="flex items-center gap-3 rounded-xl" aria-label="Maooz Gul — back to start">
            <Logo />
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-semibold">{profile.name}</span>
              <span className="block text-[0.68rem] text-mute">AI Engineer &amp; Creative Builder</span>
            </span>
          </button>

          <nav aria-label="Sections" className="glass hidden rounded-full p-1.5 lg:block">
            <ul className="flex items-center gap-0.5">
              {navItems.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => go(n.id)}
                    aria-current={current === n.id ? 'true' : undefined}
                    className={`relative rounded-full px-4 py-2 text-[0.82rem] font-medium transition-colors ${current === n.id ? 'text-[#021018]' : 'text-ink/80 hover:text-cyan'}`}
                  >
                    {current === n.id && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan to-teal shadow-[0_0_24px_-4px_#00e5ff]" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                    <span className="relative">{n.nav}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a href={profile.cv} download className="btn btn-ghost !min-h-[42px] !px-4 !py-2 text-[0.82rem]">
              <span className="hidden sm:inline">Download</span> CV <Download size={16} />
            </a>
            <button className="glass grid h-[42px] w-[42px] place-items-center rounded-full lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              aria-label="Sections"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass mx-auto mt-3 max-w-7xl rounded-2xl p-2 lg:hidden"
            >
              {navItems.map((n) => (
                <button key={n.id} onClick={() => go(n.id)} className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium ${current === n.id ? 'bg-cyan/15 text-cyan' : 'text-ink/85'}`}>
                  {n.nav}
                  {current === n.id && <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_10px_#00e5ff]" />}
                </button>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* section rail */}
      <div data-ui className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex">
        {navItems.map((n) => (
          <button key={n.id} onClick={() => go(n.id)} className="group relative grid h-4 w-4 place-items-center" aria-label={`Go to ${n.nav}`}>
            <span className={`block rounded-full transition-all duration-300 ${current === n.id ? 'h-2.5 w-2.5 bg-cyan shadow-[0_0_12px_#00e5ff]' : 'h-1.5 w-1.5 bg-white/35 group-hover:bg-cyan'}`} />
            <span className="glass pointer-events-none absolute right-6 rounded-md px-2 py-1 text-[0.68rem] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">{n.nav}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active > 0 && (
          <motion.button
            data-ui
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => go('home')}
            className="glass fixed bottom-5 right-5 z-30 grid h-11 w-11 place-items-center rounded-full text-cyan hover:border-cyan"
            aria-label="Back to top"
          >
            <Up />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
