import { AnimatePresence, motion } from 'motion/react'
import { useUI } from '../state/store'
import { goTo } from '../state/useScrollJourney'
import { profile, education, experience, research, projects, skillGroups, allSkills } from '../data/content'
import { Arrow, Download, Mail, Pin, Cap, Brief, Spark, GitHub, Close } from './Icons'

// One stop on the journey. `side` says where the copy sits on wide screens;
// the 3D subject takes the other half. On phones the copy sits low so the
// world stays visible above it.
function Station({ id, side = 'left', children, className = '', label, wide }) {
  return (
    <section
      id={id}
      data-station
      aria-label={label}
      className={`relative flex min-h-[100svh] items-end px-4 pb-10 pt-[46svh] sm:px-8 md:items-center md:py-28 ${className}`}
    >
      <div className={`mx-auto flex w-full max-w-7xl ${side === 'right' ? 'md:justify-end' : 'md:justify-start'}`}>
        <div className={wide ? 'w-full md:w-[62%]' : 'w-full md:w-[47%] md:max-w-[36rem] lg:pr-6'}>{children}</div>
      </div>
    </section>
  )
}
// Open stretch between stops: nothing on screen but the walk.
const Travel = () => <div className="h-[55svh] md:h-[80svh]" aria-hidden="true" />

const R = ({ as: Tag = 'div', children, ...p }) => (
  <Tag data-reveal {...p}>
    {children}
  </Tag>
)

/* ── Hero ── */
export function Hero() {
  return (
    <Station id="home" label="Introduction" className="md:!items-center" wide>
      <div data-hero className="world-copy">
        <p className="kicker text-shadow" data-hero-line>
          Hello, I&rsquo;m
        </p>
        <h1 className="display text-shadow mt-4 text-[clamp(3rem,7.4vw,6.4rem)] uppercase" aria-label={profile.name}>
          <span className="inline-block whitespace-nowrap" aria-hidden="true">
            {[...profile.first].map((c, i) => (
              <span key={i} data-letter className="inline-block">
                {c}
              </span>
            ))}
          </span>{' '}
          <span className="inline-block whitespace-nowrap" aria-hidden="true">
            {[...profile.last].map((c, i) => (
              <span key={i} data-letter className="inline-block name-accent text-cyan">
                {c}
              </span>
            ))}
          </span>
        </h1>
        <p data-hero-line className="text-shadow mt-5 text-[0.78rem] font-medium uppercase tracking-[0.3em] text-ink/90 sm:text-sm">
          {profile.roles.join(' · ')}
        </p>
        <p data-hero-line className="text-shadow mt-5 max-w-md text-base leading-relaxed text-ink/85 sm:text-lg">
          {profile.tagline}
        </p>
        <div data-hero-line className="mt-8 flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={() => goTo('about')}>
            Explore My World <Arrow size={17} />
          </button>
          <a className="btn btn-ghost" href={profile.cv} download>
            Download CV <Download size={17} />
          </a>
        </div>
        <div data-hero-line className="mt-9 flex items-center gap-4 text-mute">
          <a href={profile.github} target="_blank" rel="noreferrer" className="transition-colors hover:text-cyan" aria-label="GitHub">
            <GitHub size={21} />
          </a>
          <a href={`mailto:${profile.email}`} className="transition-colors hover:text-cyan" aria-label="Email">
            <Mail size={21} />
          </a>
        </div>
      </div>

      {/* motto card */}
      <div data-hero-line data-ui className="glass absolute bottom-24 right-14 hidden w-[19rem] rounded-2xl p-5 xl:block">
        <p className="display text-center text-lg italic text-ink/95">&ldquo;Dream. Build. Innovate.&rdquo;</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            ['4', 'Projects'],
            ['BS', 'Computer Science'],
            ['AI', '& Cybersecurity'],
          ].map(([a, b]) => (
            <div key={b} className="glass-soft rounded-xl px-1 py-3">
              <div className="text-lg font-semibold text-cyan">{a}</div>
              <div className="mt-0.5 text-[0.62rem] leading-tight text-mute">{b}</div>
            </div>
          ))}
        </div>
      </div>

      <button data-hero-line onClick={() => goTo('about')} className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-mute md:flex" aria-label="Scroll to continue">
        <span className="scroll-cue block h-9 w-[22px] rounded-full border border-ink/40" />
        Scroll
      </button>
    </Station>
  )
}

/* ── About ── */
export function About() {
  return (
    <Station id="about" side="right" label="About">
      <div data-ui className="glass rounded-3xl p-6 sm:p-8">
        <R as="p" className="kicker">
          About · The journey begins
        </R>
        <R as="h2" className="display mt-3 text-3xl sm:text-[2.2rem]">
          Turning ideas into intelligent solutions
        </R>
        <R as="p" className="mt-5 leading-relaxed text-ink/85">
          {profile.about}
        </R>
        <R as="p" className="mt-3 leading-relaxed text-mute">
          {profile.aim}
        </R>
        <R className="mt-6 flex flex-wrap gap-2">
          {profile.passions.map((p) => (
            <span key={p} className="chip">
              {p}
            </span>
          ))}
        </R>
        <R className="mt-7 grid gap-3 sm:grid-cols-2">
          <div className="glass-soft rounded-2xl p-4">
            <div className="flex items-center gap-2 text-cyan">
              <Cap /> <span className="text-xs font-semibold uppercase tracking-[0.18em]">Education</span>
            </div>
            <p className="mt-3 text-sm font-semibold">BS Computer Science</p>
            <p className="mt-1 text-xs leading-relaxed text-mute">
              {education.school}, Peshawar
            </p>
          </div>
          <div className="glass-soft rounded-2xl p-4">
            <div className="flex items-center gap-2 text-cyan">
              <Brief /> <span className="text-xs font-semibold uppercase tracking-[0.18em]">Experience</span>
            </div>
            <p className="mt-3 text-sm font-semibold">ISPR Internship</p>
            <p className="mt-1 text-xs leading-relaxed text-mute">Graphic design experience</p>
          </div>
        </R>
      </div>
    </Station>
  )
}

/* ── Projects ── */
function ProjectCard({ p }) {
  const open = () => useUI.getState().set({ project: p.id })
  const move = (e) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    el.style.setProperty('--ry', `${(x - 0.5) * 5}deg`)
    el.style.setProperty('--rx', `${(0.5 - y) * 4}deg`)
  }
  const leave = (e) => {
    e.currentTarget.style.setProperty('--rx', '0deg')
    e.currentTarget.style.setProperty('--ry', '0deg')
  }
  return (
    <article data-ui className="card glass rounded-3xl p-6 sm:p-8" onPointerMove={move} onPointerLeave={leave}>
      <R className="flex items-center justify-between gap-3">
        <p className="kicker" style={{ color: p.accent }}>
          Project {p.index} · {p.world}
        </p>
        <span className="flex shrink-0 items-center gap-2 rounded-full border border-line px-3 py-1 text-[0.68rem] font-medium text-ink/90">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.accent, boxShadow: `0 0 8px ${p.accent}` }} />
          {p.status}
        </span>
      </R>
      <R as="h3" className="display mt-4 text-4xl sm:text-5xl">
        {p.title}
      </R>
      <R as="p" className="mt-2 text-sm font-medium text-mute">
        {p.subtitle}
      </R>
      <R as="p" className="mt-4 leading-relaxed text-ink/85">
        {p.description}
      </R>
      <div className="more">
        <ul className="min-h-0 overflow-hidden text-sm text-mute">
          {p.features.slice(0, 2).map((f) => (
            <li key={f} className="mt-2 flex gap-2.5 first:mt-4">
              <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full" style={{ background: p.accent }} />
              {f}
            </li>
          ))}
        </ul>
      </div>
      <R className="mt-5 flex flex-wrap gap-2">
        {p.tags.map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
      </R>
      <R className="mt-6">
        <button className="btn btn-primary" onClick={open} aria-label={`View details: ${p.title}`}>
          View Details <Arrow size={17} />
        </button>
      </R>
    </article>
  )
}

export function Projects() {
  const ids = ['projects', 'project-notegpt', 'project-health', 'project-odyssey']
  return projects.map((p, i) => (
    <div key={p.id}>
      <Station id={ids[i]} side={i % 2 ? 'right' : 'left'} label={`Project: ${p.title}`}>
        {i === 0 && (
          <R as="h2" className="display text-shadow mb-5 text-2xl sm:text-3xl">
            Four worlds, four stories
          </R>
        )}
        <ProjectCard p={p} />
      </Station>
      <Travel />
    </div>
  ))
}

/* ── Skills ── */
export function Skills() {
  const skill = useUI((s) => s.skill)
  const hover = useUI((s) => s.hoverSkill)
  const set = useUI((s) => s.set)
  const sel = allSkills.find((s) => s.name === skill)
  return (
    <Station id="skills" label="Skills">
      <div data-ui className="glass rounded-3xl p-6 sm:p-9">
        <R as="p" className="kicker">
          Skills · The technology core
        </R>
        <R as="h2" className="display mt-4 text-3xl sm:text-[2.6rem]">
          Tools I build with
        </R>
        <R as="p" className="mt-3 text-sm text-mute">
          Select a skill, here or on the core, to see where I have used it.
        </R>
        <div className="mt-6 grid gap-5">
          {skillGroups.map((g) => (
            <R key={g.name}>
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/90">
                <span className="h-2 w-2 rotate-45" style={{ background: g.color, boxShadow: `0 0 10px ${g.color}` }} />
                {g.name}
              </h3>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {g.skills.map((s) => {
                  const on = skill === s.name
                  return (
                    <button
                      key={s.name}
                      aria-pressed={on}
                      onClick={() => set({ skill: on ? null : s.name })}
                      onPointerEnter={() => set({ hoverSkill: s.name })}
                      onPointerLeave={() => set({ hoverSkill: null })}
                      onFocus={() => set({ hoverSkill: s.name })}
                      onBlur={() => set({ hoverSkill: null })}
                      className={`chip !px-3.5 !py-1.5 !text-[0.8rem] transition-all ${on ? '!border-cyan !bg-cyan/20 !text-ink shadow-[0_0_20px_-6px_#00e5ff]' : hover === s.name ? '!border-cyan/70 !text-ink' : 'hover:!border-cyan/70'}`}
                    >
                      {s.name}
                    </button>
                  )
                })}
              </div>
            </R>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {sel && (
            <motion.div key={sel.name} initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden" aria-live="polite">
              <div className="glass-soft relative mt-6 rounded-2xl p-4 pr-11">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em]" style={{ color: sel.color }}>
                  {sel.group}
                </p>
                <p className="mt-1.5 font-semibold">{sel.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-mute">{sel.note}</p>
                <button onClick={() => set({ skill: null })} className="absolute right-3 top-3 text-mute hover:text-cyan" aria-label="Close skill details">
                  <Close size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Station>
  )
}

/* ── Experience ── */
export function Experience() {
  return (
    <Station id="experience" side="right" label="Education and experience">
      <div data-ui className="glass rounded-3xl p-6 sm:p-9">
        <R as="p" className="kicker">
          Experience · Knowledge chamber
        </R>
        <R as="h2" className="display mt-4 text-3xl sm:text-[2.6rem]">
          Education &amp; experience
        </R>
        <ol className="relative mt-7 grid gap-6 border-l border-line pl-6">
          {[
            { icon: <Cap size={15} />, title: education.degree, org: `${education.school} · ${education.place}`, period: education.period, text: null },
            ...experience.map((e) => ({ icon: <Brief size={15} />, title: e.role, org: `${e.org} · ${e.place}`, period: e.period, text: e.text })),
          ].map((e) => (
            <R as="li" key={e.title} className="relative">
              <span className="absolute -left-[2.2rem] top-0 grid h-7 w-7 place-items-center rounded-full border border-cyan/60 bg-bg2 text-cyan shadow-[0_0_14px_-3px_#00e5ff]">{e.icon}</span>
              <p className="text-xs font-medium text-cyan">{e.period}</p>
              <p className="mt-1 font-semibold">{e.title}</p>
              <p className="text-sm text-mute">{e.org}</p>
              {e.text && <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{e.text}</p>}
            </R>
          ))}
        </ol>
        <R className="mt-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/90">Relevant coursework</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {education.coursework.map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>
        </R>
      </div>
    </Station>
  )
}

/* ── Research ── */
export function Research() {
  return (
    <Station id="research" label="Research interests">
      <div data-ui className="glass rounded-3xl p-6 sm:p-9">
        <R as="p" className="kicker">
          Research · Direction &amp; interests
        </R>
        <R as="h2" className="display mt-4 text-3xl sm:text-[2.6rem]">
          Where I want to go deeper
        </R>
        <R as="p" className="mt-4 leading-relaxed text-mute">
          {profile.aim}
        </R>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {research.map((r) => (
            <R key={r.title} className="glass-soft rounded-2xl p-4">
              <Spark className="text-cyan" />
              <p className="mt-2.5 font-semibold">{r.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-mute">{r.text}</p>
            </R>
          ))}
        </div>
      </div>
    </Station>
  )
}

/* ── Contact ── */
export function Contact() {
  return (
    <Station id="contact" label="Contact" className="!pb-6">
      <div className="world-copy">
        <R as="p" className="kicker text-shadow">
          Contact · Final destination
        </R>
        <R as="h2" className="display text-shadow mt-4 text-[clamp(2.1rem,5.4vw,3.9rem)] uppercase">
          Let&rsquo;s build something <span className="text-cyan">amazing</span> together
        </R>
        <R as="p" className="text-shadow mt-5 max-w-md text-lg leading-relaxed text-ink/90">
          Have an idea, project or opportunity? Let&rsquo;s connect and create something meaningful.
        </R>
        <R className="mt-7 flex flex-wrap gap-3">
          <a className="btn btn-primary" href={`mailto:${profile.email}`}>
            <Mail size={17} /> Contact Me
          </a>
          <a className="btn btn-ghost" href={profile.github} target="_blank" rel="noreferrer">
            <GitHub size={17} /> GitHub
          </a>
          <a className="btn btn-ghost" href={profile.cv} download>
            <Download size={17} /> Download CV
          </a>
        </R>
        <R data-ui className="glass mt-8 grid gap-4 rounded-2xl p-5 sm:grid-cols-2">
          <a href={`mailto:${profile.email}`} className="group flex items-center gap-3">
            <span className="glass-soft grid h-10 w-10 shrink-0 place-items-center rounded-xl text-cyan">
              <Mail />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.68rem] uppercase tracking-[0.18em] text-cyan">Email</span>
              <span className="block truncate text-sm group-hover:text-cyan">{profile.email}</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <span className="glass-soft grid h-10 w-10 shrink-0 place-items-center rounded-xl text-cyan">
              <Pin />
            </span>
            <span>
              <span className="block text-[0.68rem] uppercase tracking-[0.18em] text-cyan">Location</span>
              <span className="block text-sm">{profile.location}</span>
            </span>
          </div>
        </R>
        <R as="p" className="display text-shadow mt-10 text-sm tracking-[0.5em] text-ink/90 sm:text-base">
          DREAM. BUILD. INNOVATE.
        </R>
        <p className="mt-8 text-xs text-mute/80">© {new Date().getFullYear()} {profile.name}</p>
      </div>
    </Station>
  )
}

export { Travel }
