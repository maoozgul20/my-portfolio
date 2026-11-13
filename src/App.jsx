import { lazy, Suspense, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useUI, journey, env } from './state/store'
import { useScrollJourney } from './state/useScrollJourney'
import { Nav } from './ui/Nav'
import { Loader, Fallback, ProjectModal, WorldBoundary } from './ui/Overlays'
import { Hero, About, Projects, Skills, Experience, Research, Contact, Travel } from './ui/Sections'

gsap.registerPlugin(ScrollTrigger)
const World = lazy(() => import('./world/World'))

export default function App() {
  const ready = useUI((s) => s.ready)
  const webgl = useUI((s) => s.webgl)
  useScrollJourney()

  // Copy reveals: each section's lines arrive as its stop comes into view and
  // leave again on the way out, in either scroll direction.
  useEffect(() => {
    if (env.reduced) return
    const ctx = gsap.context(() => {
      gsap.set('[data-hero-line], [data-letter]', { autoAlpha: 0 })
      document.querySelectorAll('[data-station]').forEach((sec) => {
        const items = sec.querySelectorAll('[data-reveal]')
        if (!items.length) return
        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 26, filter: 'blur(8px)' },
          {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.7,
            stagger: 0.07,
            ease: 'power3.out',
            scrollTrigger: { trigger: sec, start: 'top 62%', end: 'bottom 30%', toggleActions: 'play reverse play reverse' },
          },
        )
        const panel = sec.querySelector('.glass.rounded-3xl')
        if (panel)
          gsap.fromTo(
            panel,
            { autoAlpha: 0, scale: 0.96, y: 30 },
            { autoAlpha: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: sec, start: 'top 66%', end: 'bottom 26%', toggleActions: 'play reverse play reverse' } },
          )
      })
    })
    return () => ctx.revert()
  }, [])

  // Opening sequence, once the world has drawn its first frames.
  useEffect(() => {
    if (!ready) return
    if (env.reduced || !webgl) {
      journey.intro = 1
      gsap.set('[data-hero-line], [data-letter]', { autoAlpha: 1 })
      return
    }
    const tl = gsap.timeline()
    tl.to(journey, { intro: 1, duration: 3.6, ease: 'power2.inOut' }, 0.3)
      .fromTo('[data-letter]', { autoAlpha: 0, y: 50, rotateX: -70, filter: 'blur(12px)' }, { autoAlpha: 1, y: 0, rotateX: 0, filter: 'blur(0px)', duration: 1.1, stagger: 0.07, ease: 'power4.out' }, 2.1)
      .fromTo('[data-hero-line]', { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 2.7)
    return () => tl.kill()
  }, [ready, webgl])

  return (
    <>
      <a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-bg2 focus:px-4 focus:py-2">
        Skip to content
      </a>
      {webgl ? (
        <WorldBoundary>
          <Suspense fallback={null}>
            <World />
          </Suspense>
        </WorldBoundary>
      ) : (
        <Fallback />
      )}
      <Nav />
      <main className="relative z-10">
        <Hero />
        <Travel />
        <About />
        <Travel />
        <Projects />
        <Skills />
        <Travel />
        <Experience />
        <Travel />
        <Research />
        <Travel />
        <Contact />
      </main>
      <ProjectModal />
      <Loader />
    </>
  )
}
