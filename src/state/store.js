import { create } from 'zustand'

// UI state that React needs to re-render for.
export const useUI = create((set) => ({
  ready: false, // world rendered its first frames
  introDone: false,
  active: 0, // index of the current section
  project: null, // id of the open case study
  skill: null, // name of the selected skill
  hoverSkill: null,
  webgl: true,
  theme: (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) || 'dark',
  set,
}))

// Per-frame state shared between the page and the 3D world. Mutated directly,
// never triggers React renders.
export const journey = {
  t: 0, // smoothed station progress (0 … sections-1)
  target: 0, // raw station progress from scroll
  speed: 0, // d(t)/dt, signed
  px: 0, // pointer, -1 … 1
  py: 0,
  intro: 0, // 0 → 1 during the opening shot
  scroll: 0, // whole-page scroll fraction
  light: 0, // 0 night … 1 day, eased when the theme changes
}

const mq = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches
export const env = {
  reduced: mq('(prefers-reduced-motion: reduce)'),
  mobile: mq('(max-width: 767px)'),
  tablet: mq('(max-width: 1100px)'),
  coarse: mq('(pointer: coarse)'),
}
