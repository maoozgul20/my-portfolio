import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { journey, env } from '../state/store'
import { stations, N, pathAt, rng, CASTLE } from './stations'
import { glowTexture } from './util'

const NATURAL = new Set([0, 1, 9])
const _d = new THREE.Vector3()
const _v = new THREE.Vector3()
export const islandOf = (s) =>
  s.index === 0
    ? { c: new THREE.Vector3(1.5, 0, 7.5), r: 11 }
    : { c: s.p.clone().add(new THREE.Vector3(-s.side * 3, 0, -4)), r: s.index === N - 1 ? 15 : 13 }

// Irregular floating rock: a displaced, inverted cone under a flat top.
function islandGeometry(seed, natural) {
  const r = rng(seed)
  const a1 = r() * 6, a2 = r() * 6
  const edge = (a) => (natural ? 1 + 0.1 * Math.sin(3 * a + a1) + 0.06 * Math.sin(7 * a + a2) : 1)
  const g = new THREE.CylinderGeometry(1, 0.06, 1, natural ? 22 : 40, 6, false)
  const pos = g.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const h = 0.5 - v.y // 0 top … 1 bottom
    const a = Math.atan2(v.z, v.x)
    const rad = Math.hypot(v.x, v.z)
    if (rad > 0.001) {
      const profile = Math.pow(1 - h, 0.55) / Math.max(1 - h * 0.94, 0.06) // bulge, then taper
      const rough = h > 0.02 && h < 0.98 ? 1 + (Math.sin(a * 5 + h * 9 + a1) * 0.09 + Math.sin(a * 11 + h * 4 + a2) * 0.05) : 1
      const k = edge(a) * profile * rough
      v.x *= k
      v.z *= k
    }
    v.y = -h + (h > 0.9 ? Math.sin(a * 3 + a1) * 0.03 : 0)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  // top cap, slightly overhanging
  const top = new THREE.CylinderGeometry(1.03, 1, 0.045, natural ? 22 : 40, 1)
  const tp = top.attributes.position
  for (let i = 0; i < tp.count; i++) {
    v.fromBufferAttribute(tp, i)
    const k = edge(Math.atan2(v.z, v.x))
    tp.setXYZ(i, v.x * k, v.y - 0.0225, v.z * k)
  }
  top.computeVertexNormals()
  return { rock: g, top }
}

const rockMat = new THREE.MeshStandardMaterial({ color: '#232c3e', roughness: 0.95, flatShading: true })
const grassMat = new THREE.MeshStandardMaterial({ color: '#1d5a4c', roughness: 0.9, flatShading: true })
const deckMat = new THREE.MeshStandardMaterial({ color: '#10283c', roughness: 0.82, metalness: 0.15 })
const techRock = new THREE.MeshStandardMaterial({ color: '#141d2e', roughness: 0.8, metalness: 0.2, flatShading: true })
const ringMat = new THREE.MeshBasicMaterial({ color: '#00E5FF', toneMapped: false })

function Island({ position, radius, depth, seed, natural }) {
  const { rock, top } = useMemo(() => islandGeometry(seed, natural), [seed, natural])
  return (
    <group position={position}>
      <mesh geometry={rock} material={natural ? rockMat : techRock} position-y={-0.08} scale={[radius, depth, radius]} />
      <mesh geometry={top} material={natural ? grassMat : deckMat} scale={[radius, radius, radius]} receiveShadow />
      {!natural && (
        <>
          <mesh rotation-x={Math.PI / 2} position-y={0.02} material={ringMat}>
            <torusGeometry args={[radius * 1.02, 0.045, 6, 80]} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position-y={0.03}>
            <ringGeometry args={[radius * 0.62, radius * 0.635, 80]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.28} toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  )
}

// Water falling off an island edge.
const fallMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  side: THREE.DoubleSide,
  uniforms: { uTime: { value: 0 } },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */ `
    uniform float uTime; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
      return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
    void main(){
      float s = n(vec2(vUv.x * 22.0, vUv.y * 3.0 + uTime * 1.7));
      s = 0.45 + 0.55 * s * n(vec2(vUv.x * 7.0, vUv.y * 1.5 + uTime * 1.1) + 3.0);
      float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
      float fade = smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.94, vUv.y);
      vec3 col = mix(vec3(0.25, 0.8, 0.95), vec3(0.9, 1.0, 1.0), s);
      gl_FragColor = vec4(col, s * edge * fade * 0.8);
    }`,
})
function Waterfall({ position, width = 2, height = 14, rotation = 0 }) {
  return (
    <mesh position={[position[0], position[1] - height / 2, position[2]]} rotation-y={rotation} material={fallMat}>
      <planeGeometry args={[width, height]} />
    </mesh>
  )
}

// Low-poly pines and glowing flora on the natural islands.
function Flora() {
  const trees = useRef()
  const trunks = useRef()
  const blooms = useRef()
  const { tree, bloom } = useMemo(() => {
    const r = rng(41)
    const tree = []
    const bloom = []
    for (const i of NATURAL) {
      const { c, r: rad } = islandOf(stations[i])
      const y = stations[i].p.y
      let placed = 0
      let guard = 0
      while (placed < (env.mobile ? 8 : 14) && guard++ < 200) {
        const a = r() * Math.PI * 2
        const d = (0.45 + r() * 0.42) * rad
        const x = c.x + Math.cos(a) * d
        const z = c.z + Math.sin(a) * d
        // keep the walking line and the view down the path clear
        if (Math.abs(x - stations[i].p.x) < 3.2) continue
        if (i > 0 && Math.hypot(x - stations[i].focus.x, z - stations[i].focus.z) < 7) continue
        // and out of the camera's line of sight at this stop
        _d.subVectors(stations[i].look, stations[i].cam).setY(0).normalize()
        _v.set(x, 0, z).sub(stations[i].cam).setY(0)
        const along = _v.dot(_d)
        const lateral = Math.abs(_v.x * _d.z - _v.z * _d.x)
        if (along > -6 && lateral < 4 + Math.max(along, 0) * 0.42) continue
        tree.push({ x, y, z, s: 0.8 + r() * 1.3 })
        placed++
      }
      for (let k = 0; k < (env.mobile ? 10 : 22); k++) {
        const a = r() * Math.PI * 2
        const d = r() * 0.85 * rad
        bloom.push({ x: c.x + Math.cos(a) * d, y: y + 0.12, z: c.z + Math.sin(a) * d, s: 0.03 + r() * 0.05 })
      }
    }
    return { tree, bloom }
  }, [])
  useLayoutEffect(() => {
    const m = new THREE.Object3D()
    tree.forEach((t, i) => {
      m.position.set(t.x, t.y + 1.5 * t.s, t.z)
      m.scale.set(t.s, t.s, t.s)
      m.rotation.set(0, i, 0)
      m.updateMatrix()
      trees.current.setMatrixAt(i, m.matrix)
      m.position.y = t.y + 0.3 * t.s
      m.updateMatrix()
      trunks.current.setMatrixAt(i, m.matrix)
    })
    bloom.forEach((b, i) => {
      m.position.set(b.x, b.y, b.z)
      m.scale.setScalar(b.s)
      m.rotation.set(0, 0, 0)
      m.updateMatrix()
      blooms.current.setMatrixAt(i, m.matrix)
    })
    for (const im of [trees, trunks, blooms]) im.current.instanceMatrix.needsUpdate = true
  }, [tree, bloom])
  return (
    <>
      <instancedMesh ref={trees} args={[null, null, tree.length]} castShadow frustumCulled={false}>
        <coneGeometry args={[0.75, 2.6, 6, 3]} />
        <meshStandardMaterial color="#0f4a3c" roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[null, null, tree.length]} frustumCulled={false}>
        <cylinderGeometry args={[0.1, 0.14, 0.7, 5]} />
        <meshStandardMaterial color="#2b2019" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={blooms} args={[null, null, bloom.length]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#5ff5e6" toneMapped={false} />
      </instancedMesh>
    </>
  )
}

// Stepping stones of light between the islands.
function Bridges() {
  const slabs = useRef()
  const strips = useRef()
  const items = useMemo(() => {
    const out = []
    const isl = stations.map(islandOf)
    const p = new THREE.Vector3()
    const q = new THREE.Vector3()
    let last = null
    for (let t = 0; t <= N - 1; t += 0.004) {
      pathAt(t, p)
      if (last && p.distanceTo(last) < 1.55) continue
      if (isl.some((s) => Math.hypot(p.x - s.c.x, p.z - s.c.z) < s.r * 0.97)) { last = null; continue }
      pathAt(t + 0.01, q)
      out.push({ p: p.clone(), yaw: Math.atan2(q.x - p.x, q.z - p.z), pitch: -Math.atan2(q.y - p.y, Math.hypot(q.x - p.x, q.z - p.z)) })
      last = p.clone()
    }
    return out
  }, [])
  useLayoutEffect(() => {
    const m = new THREE.Object3D()
    items.forEach((s, i) => {
      m.position.copy(s.p)
      m.position.y -= 0.09
      m.rotation.set(s.pitch, s.yaw, 0, 'YXZ')
      m.updateMatrix()
      slabs.current.setMatrixAt(i, m.matrix)
      strips.current.setMatrixAt(i, m.matrix)
    })
    slabs.current.instanceMatrix.needsUpdate = true
    strips.current.instanceMatrix.needsUpdate = true
  }, [items])
  return (
    <>
      <instancedMesh ref={slabs} args={[null, null, items.length]} frustumCulled={false} receiveShadow>
        <boxGeometry args={[2.3, 0.16, 1.1]} />
        <meshStandardMaterial color="#0c2033" roughness={0.4} metalness={0.6} />
      </instancedMesh>
      <instancedMesh ref={strips} args={[null, null, items.length]} frustumCulled={false}>
        <boxGeometry args={[2.36, 0.03, 0.08]} />
        <meshBasicMaterial color="#00E5FF" toneMapped={false} />
      </instancedMesh>
    </>
  )
}

// Smaller islands drifting beside the route, a few with waterfalls.
function Drifters() {
  const group = useRef()
  const geos = useMemo(() => [1, 2, 3].map((s) => islandGeometry(100 + s, true)), [])
  const items = useMemo(() => {
    const r = rng(77)
    const out = []
    const n = env.mobile ? 14 : 30
    const zEnd = stations[N - 1].p.z - 50
    for (let i = 0; i < n; i++) {
      const z = 10 + (zEnd - 10) * ((i + r() * 0.8) / n)
      const sx = (i % 2 ? 1 : -1) * (24 + r() * 46)
      // keep the castle's corner of the sky clear
      if (Math.hypot(sx - CASTLE.x, z - CASTLE.z) < 70 || (sx > 0 && z > -120 && z < -20)) continue
      out.push({ x: sx, y: -6 + r() * 26, z, rad: 2.5 + r() * 6, g: i % 3, ph: r() * 6, fall: r() < 0.3 })
    }
    return out
  }, [])
  useFrame((state) => {
    if (env.reduced) return
    const t = state.clock.elapsedTime
    group.current.children.forEach((c, i) => {
      c.position.y = items[i].y + Math.sin(t * 0.35 + items[i].ph) * 0.7
      c.rotation.y = Math.sin(t * 0.08 + items[i].ph) * 0.15
    })
  })
  return (
    <group ref={group}>
      {items.map((d, i) => (
        <group key={i} position={[d.x, d.y, d.z]}>
          <mesh geometry={geos[d.g].rock} material={rockMat} position-y={-0.05} scale={[d.rad, d.rad * 1.5, d.rad]} />
          <mesh geometry={geos[d.g].top} material={grassMat} scale={d.rad} />
          <mesh position={[d.rad * 0.2, d.rad * 0.28, 0]}>
            <coneGeometry args={[d.rad * 0.2, d.rad * 0.6, 6]} />
            <meshStandardMaterial color="#0f4a3c" flatShading />
          </mesh>
          {d.fall && <Waterfall position={[-d.rad * 0.5, 0, d.rad * 0.84]} width={d.rad * 0.32} height={d.rad * 3.4} />}
        </group>
      ))}
    </group>
  )
}

function Mountains() {
  const items = useMemo(() => {
    const r = rng(5)
    const out = []
    const ring = (cx, cz, n, x0, x1, z0, z1) => {
      for (let i = 0; i < n; i++) out.push({ x: cx + x0 + r() * (x1 - x0), z: cz + z0 + r() * (z1 - z0), h: 46 + r() * 70, w: 34 + r() * 40, ry: r() * 6 })
    }
    ring(0, 0, 7, -190, -70, -210, -60) // left of the opening view
    ring(0, 0, 5, 110, 210, -260, -120) // behind the castle
    const end = stations[N - 1].p.z
    ring(0, end, 5, -200, -60, -200, -70)
    ring(0, end, 5, 60, 200, -200, -70)
    return out
  }, [])
  return items.map((m, i) => (
    <mesh key={i} position={[m.x, m.h / 2 - 46, m.z]} rotation-y={m.ry} scale={[m.w, m.h, m.w]}>
      <coneGeometry args={[1, 1, 6, 1]} />
      <meshStandardMaterial color="#111c30" roughness={1} flatShading />
    </mesh>
  ))
}

export function Terrain() {
  useFrame((state) => {
    fallMat.uniforms.uTime.value = env.reduced ? 0 : state.clock.elapsedTime
  })
  return (
    <>
      {stations.map((s) => {
        const { c, r } = islandOf(s)
        const natural = NATURAL.has(s.index)
        return <Island key={s.id} position={[c.x, s.p.y, c.z]} radius={r} depth={natural ? r * 1.5 : r * 0.9} seed={s.index + 1} natural={natural} />
      })}
      <Waterfall position={[-6.5, -0.2, 0.4]} width={2.2} height={26} rotation={0.5} />
      <Waterfall position={[9.6, -0.2, 2.5]} width={1.5} height={22} rotation={-0.7} />
      <Waterfall position={[stations[N - 1].p.x + 13.5, stations[N - 1].p.y - 0.2, stations[N - 1].p.z - 9]} width={2.4} height={26} rotation={-1.2} />
      <Bridges />
      <Flora />
      <Drifters />
      <Mountains />
      <Moon />
    </>
  )
}

function Moon() {
  return (
    <group position={[150, 150, -420]}>
      <mesh>
        <sphereGeometry args={[17, 32, 24]} />
        <meshBasicMaterial color="#b9dcf2" fog={false} />
      </mesh>
      <sprite scale={[110, 110, 1]}>
        <spriteMaterial map={glowTexture()} color="#6fc4ee" opacity={0.35} transparent depthWrite={false} fog={false} />
      </sprite>
    </group>
  )
}
