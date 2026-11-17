import * as THREE from 'three'

// One connected world. Every section of the page is a station along a single
// path; the explorer walks it and the camera follows.
// side: -1 → page content on the left, 3D subject on the right. +1 → mirrored.
const raw = [
  { id: 'home', p: [0, 0, 0], side: -1 },
  { id: 'about', p: [-5, 1, -46], side: 1 },
  { id: 'dentora', p: [5, 2, -92], side: -1 },
  { id: 'notegpt', p: [-5, 3, -138], side: 1 },
  { id: 'health', p: [5, 2, -184], side: -1 },
  { id: 'odyssey', p: [-5, 5, -230], side: 1 },
  { id: 'skills', p: [2, 3, -276], side: -1 },
  { id: 'experience', p: [-3, 2, -318], side: 1 },
  { id: 'research', p: [3, 2, -354], side: -1 },
  { id: 'contact', p: [0, 4, -402], side: -1 },
]

export const stations = raw.map((s, i) => {
  const p = new THREE.Vector3(...s.p)
  const side = s.side
  // where the 3D subject of this station floats
  const focus = p.clone().add(new THREE.Vector3(-side * 5.6, 2.6, -6.5))
  const cam = p.clone().add(new THREE.Vector3(side * 2.6, 2.5, 8.2))
  const look = p.clone().add(new THREE.Vector3(-side * 3.0, 2.3, -8))
  return { ...s, index: i, p, side, focus, cam, look }
})

// Hero: look out over the cliff toward the castle.
stations[0].cam.set(-2.4, 2.3, 7.6)
stations[0].look.set(10, 4.2, -30)
stations[0].focus.set(92, 20, -172)
// Contact: the portal is straight ahead at the end of the path.
const last = stations[stations.length - 1]
last.focus.copy(last.p).add(new THREE.Vector3(0, 3.4, -11))
last.cam.copy(last.p).add(new THREE.Vector3(-2.2, 2.6, 8.6))
last.look.copy(last.p).add(new THREE.Vector3(0.5, 2.8, -9))

export const N = stations.length
export const CASTLE = new THREE.Vector3(92, -16, -172)

const curve = (key) => new THREE.CatmullRomCurve3(stations.map((s) => s[key]), false, 'catmullrom', 0.5)
const camCurve = curve('cam')
const lookCurve = curve('look')
const pathCurve = curve('p')

const clampT = (t) => THREE.MathUtils.clamp(t, 0, N - 1)
export const camAt = (t, out) => camCurve.getPoint(clampT(t) / (N - 1), out)
export const lookAt = (t, out) => lookCurve.getPoint(clampT(t) / (N - 1), out)

// Path the explorer walks. x/z follow the spline; height holds level on each
// island and ramps on the bridges between them.
export function pathAt(t, out = new THREE.Vector3()) {
  t = clampT(t)
  pathCurve.getPoint(t / (N - 1), out)
  const i = Math.min(Math.floor(t), N - 2)
  const f = THREE.MathUtils.smoothstep(t - i, 0.3, 0.7)
  out.y = THREE.MathUtils.lerp(stations[i].p.y, stations[i + 1].p.y, f)
  return out
}

export const sideAt = (t) => {
  t = clampT(t)
  const i = Math.min(Math.floor(t), N - 2)
  return THREE.MathUtils.lerp(stations[i].side, stations[i + 1].side, THREE.MathUtils.smoothstep(t - i, 0.15, 0.85))
}

// Atmosphere per station: sky top, horizon, fog colour, fog density, stars, sun.
const A = (top, hor, fog, density, stars, sun = 0, day = 1) => ({
  day,
  top: new THREE.Color(top),
  hor: new THREE.Color(hor),
  fog: new THREE.Color(fog),
  density,
  stars,
  sun,
})
export const atmos = [
  A('#040c22', '#11486e', '#0a2439', 0.0046, 0.9),
  A('#040b1c', '#0c3a56', '#071c2e', 0.0105, 0.7),
  A('#03101c', '#0a4b5c', '#062531', 0.0125, 0.5),
  A('#060a24', '#1d2c6a', '#0a1232', 0.0125, 0.7),
  A('#03121a', '#0a4d46', '#052622', 0.0125, 0.5),
  A('#010208', '#0b1030', '#02040d', 0.0055, 1.7, 0, 0.45),
  A('#020610', '#06263c', '#030d1a', 0.013, 0.6),
  A('#040a1a', '#0d2e4c', '#06192c', 0.0115, 0.7),
  A('#050a1e', '#152c58', '#081630', 0.0115, 0.8),
  A('#121a4c', '#ff9a66', '#33284a', 0.0058, 0.6, 1),
]

const _c = { top: new THREE.Color(), hor: new THREE.Color(), fog: new THREE.Color(), density: 0, stars: 0, sun: 0, day: 0 }
const DAY = { top: new THREE.Color('#2f78c4'), hor: new THREE.Color('#bfe6fa'), fog: new THREE.Color('#8fc4e2') }
export function atmosAt(t, light = 0) {
  t = clampT(t)
  const i = Math.min(Math.floor(t), N - 2)
  const f = THREE.MathUtils.smoothstep(t - i, 0.1, 0.9)
  const a = atmos[i]
  const b = atmos[i + 1]
  _c.top.lerpColors(a.top, b.top, f)
  _c.hor.lerpColors(a.hor, b.hor, f)
  _c.fog.lerpColors(a.fog, b.fog, f)
  _c.density = THREE.MathUtils.lerp(a.density, b.density, f)
  _c.stars = THREE.MathUtils.lerp(a.stars, b.stars, f)
  _c.sun = THREE.MathUtils.lerp(a.sun, b.sun, f)
  // light theme: the same world by day (deep space stays dusky)
  const d = light * THREE.MathUtils.lerp(a.day, b.day, f)
  _c.day = d
  if (d > 0) {
    const keep = 1 - _c.sun * 0.55 // let the sunset keep its colour
    _c.top.lerp(DAY.top, d * 0.9)
    _c.hor.lerp(DAY.hor, d * 0.85 * keep)
    _c.fog.lerp(DAY.fog, d * 0.85 * keep)
    _c.stars *= 1 - d
    _c.density *= 1 - d * 0.55
  }
  return _c
}

// 0 far away → 1 standing at the station.
export const nearness = (t, i, range = 1) => THREE.MathUtils.clamp(1 - Math.abs(t - i) / range, 0, 1)

// deterministic random
export function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let x = Math.imul(s ^ (s >>> 15), 1 | s)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}
