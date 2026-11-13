import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { journey, env, useUI } from '../../state/store'
import { stations, nearness, rng } from '../stations'
import { canvasTexture, glowTexture, holoMaterial, labelTexture, fromUI } from '../util'

const time = (state) => (env.reduced ? 2 : state.clock.elapsedTime)

// Shared wrapper: places a project display at its station, makes it clickable
// (opens the case study) and gives it a base light.
function Display({ index, id, color, children, lightAt = [0, 3, 2], power = 46 }) {
  const s = stations[index]
  const [hover, setHover] = useState(false)
  const group = useRef()
  const light = useRef()
  useFrame((_, dt) => {
    const k = nearness(journey.t, index, 0.95)
    const sc = THREE.MathUtils.damp(group.current.scale.x, (0.6 + 0.6 * k) * (hover ? 1.05 : 1), 5, dt)
    group.current.scale.setScalar(sc)
    light.current.intensity = k * power
  })
  const over = (v) => (e) => {
    if (v && fromUI(e)) return
    e.stopPropagation()
    setHover(v)
    document.body.style.cursor = v ? 'pointer' : ''
  }
  return (
    <group position={[s.focus.x, s.p.y, s.focus.z]}>
      {/* emitter pad on the deck */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.05}>
        <ringGeometry args={[2.5, 2.62, 64]} />
        <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.9} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.04}>
        <circleGeometry args={[2.5, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.07} depthWrite={false} />
      </mesh>
      <pointLight ref={light} position={lightAt} color={color} distance={24} decay={1.5} />
      <group
        ref={group}
        position-y={s.focus.y - s.p.y + 0.6}
        onClick={(e) => {
          if (fromUI(e)) return
          e.stopPropagation()
          useUI.getState().set({ project: id })
        }}
        onPointerOver={over(true)}
        onPointerOut={over(false)}
      >
        {children}
      </group>
    </group>
  )
}

/* ───────────── 01 · Dentora — AI medical laboratory ───────────── */

function xrayTexture(withBoxes) {
  return canvasTexture(1024, 512, (g, w, h) => {
    const bg = g.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.6)
    bg.addColorStop(0, '#16303d')
    bg.addColorStop(1, '#040b12')
    g.fillStyle = bg
    g.fillRect(0, 0, w, h)
    const r = rng(12)
    const teeth = []
    // two arches of teeth, like a panoramic radiograph
    for (const row of [0, 1]) {
      for (let i = 0; i < 14; i++) {
        const u = (i + 0.5) / 14
        const x = 120 + u * (w - 240)
        const curve = Math.sin(u * Math.PI) * 46
        const y = row === 0 ? h / 2 - 22 - curve * 0.35 : h / 2 + 22 + curve * 0.35
        const tw = 40 + r() * 10
        const th = 92 + r() * 26
        teeth.push({ x, y, tw, th, row, i })
      }
    }
    for (const t of teeth) {
      if (t.row === 1 && t.i === 4) continue // a missing tooth
      const dir = t.row === 0 ? -1 : 1
      const grad = g.createLinearGradient(0, t.y, 0, t.y + dir * t.th)
      grad.addColorStop(0, 'rgba(235,248,255,0.95)')
      grad.addColorStop(0.45, 'rgba(160,200,215,0.75)')
      grad.addColorStop(1, 'rgba(90,130,150,0.15)')
      g.fillStyle = grad
      g.beginPath()
      g.moveTo(t.x - t.tw / 2, t.y)
      g.quadraticCurveTo(t.x - t.tw / 2 - 3, t.y + dir * t.th * 0.5, t.x - t.tw * 0.18, t.y + dir * t.th)
      g.quadraticCurveTo(t.x, t.y + dir * t.th * 0.55, t.x + t.tw * 0.18, t.y + dir * t.th)
      g.quadraticCurveTo(t.x + t.tw / 2 + 3, t.y + dir * t.th * 0.5, t.x + t.tw / 2, t.y)
      g.quadraticCurveTo(t.x, t.y - dir * 12, t.x - t.tw / 2, t.y)
      g.fill()
      if (t.row === 0 && t.i === 9) {
        // an implant reads brighter
        g.fillStyle = 'rgba(255,255,255,0.95)'
        g.fillRect(t.x - 7, t.y - t.th + 8, 14, t.th - 26)
      }
      if (t.row === 0 && t.i === 3) {
        g.fillStyle = 'rgba(5,14,20,0.8)'
        g.beginPath()
        g.arc(t.x + 9, t.y - 16, 9, 0, 7)
        g.fill()
      }
    }
    if (withBoxes) {
      const box = (x, y, bw, bh, label, col) => {
        g.strokeStyle = col
        g.lineWidth = 4
        g.strokeRect(x, y, bw, bh)
        g.font = '600 22px "Sora Variable", sans-serif'
        const tw = g.measureText(label).width + 16
        g.fillStyle = col
        g.fillRect(x - 2, y - 30, tw, 30)
        g.fillStyle = '#031018'
        g.fillText(label, x + 6, y - 8)
      }
      const T = (row, i) => teeth[row * 14 + i]
      let t = T(0, 3)
      box(t.x - 34, t.y - 130, 68, 140, 'Caries', '#00E5FF')
      t = T(0, 9)
      box(t.x - 34, t.y - 134, 68, 144, 'Implant', '#7CFFB2')
      t = T(1, 4)
      box(t.x - 32, t.y - 6, 64, 130, 'Missing tooth', '#FFC46B')
      t = T(1, 10)
      box(t.x - 34, t.y + 60, 68, 78, 'Apical periodontitis', '#FF8FA3')
    }
  })
}

function toothGeometry() {
  const pts = [
    [0.0, 1.0], [0.42, 0.98], [0.66, 0.84], [0.74, 0.55], [0.7, 0.22], [0.58, 0.0], [0.52, -0.12],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  const crown = new THREE.LatheGeometry(pts, 20)
  // dimple the biting surface so it reads as a molar
  const p = crown.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
    if (y > 0.8) p.setY(i, y - 0.16 * Math.cos(x * 4.2) * Math.cos(z * 4.2) * (1 - Math.hypot(x, z)))
  }
  crown.computeVertexNormals()
  return crown
}

export function DentoraScene() {
  const holo = useMemo(() => holoMaterial('#00E5FF'), [])
  const wire = useMemo(() => new THREE.MeshBasicMaterial({ color: '#7df3ff', wireframe: true, transparent: true, opacity: 0.16 }), [])
  const crown = useMemo(toothGeometry, [])
  const tooth = useRef()
  const beam = useRef()
  const rings = useRef()
  const screen = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: { uA: { value: xrayTexture(false) }, uB: { value: xrayTexture(true) }, uScan: { value: 0 }, uShow: { value: 0 } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform sampler2D uA; uniform sampler2D uB; uniform float uScan; uniform float uShow; varying vec2 vUv;
          void main(){
            vec3 a = texture2D(uA, vUv).rgb; vec3 b = texture2D(uB, vUv).rgb;
            vec3 col = mix(a, b, step(vUv.x, uScan));
            float line = smoothstep(0.012, 0.0, abs(vUv.x - uScan));
            col += vec3(0.0, 0.9, 1.0) * line * 1.4;
            col *= 0.9 + 0.1 * sin(vUv.y * 420.0);
            float reveal = step(abs(vUv.y - 0.5) * 2.0, uShow);
            gl_FragColor = vec4(col * 1.25, 0.94 * reveal);
          }`,
      }),
    [],
  )
  useFrame((state) => {
    const t = time(state)
    const k = nearness(journey.t, 2, 0.8)
    holo.uniforms.uTime.value = t
    tooth.current.rotation.y = t * 0.45
    tooth.current.position.y = Math.sin(t * 0.9) * 0.12
    // the scan sweeps, holds on the findings, then repeats
    const cyc = (t * 0.22) % 1
    const scan = THREE.MathUtils.smoothstep(cyc, 0.05, 0.6)
    screen.uniforms.uScan.value = env.reduced ? 1 : scan
    screen.uniforms.uShow.value = THREE.MathUtils.smoothstep(k, 0.25, 0.8)
    beam.current.position.x = (scan - 0.5) * 5.2
    beam.current.visible = k > 0.3 && scan < 0.995 && !env.reduced
    rings.current.rotation.y = -t * 0.3
    rings.current.rotation.x = Math.sin(t * 0.2) * 0.2
  })
  return (
    <Display index={2} id="dentora" color="#00E5FF">
      <group ref={tooth} position={[-0.3, 0.2, 1.2]} scale={1.25}>
        <mesh geometry={crown} material={holo} />
        <mesh geometry={crown} material={wire} />
        {[-0.3, 0.3].map((x) => (
          <group key={x} position={[x, -0.1, 0]} rotation-z={x * 0.5}>
            <mesh material={holo} position-y={-0.55} rotation-x={Math.PI}>
              <coneGeometry args={[0.27, 1.15, 12, 4, true]} />
            </mesh>
            <mesh material={wire} position-y={-0.55} rotation-x={Math.PI}>
              <coneGeometry args={[0.27, 1.15, 12, 4, true]} />
            </mesh>
          </group>
        ))}
      </group>
      <group ref={rings} position={[-0.3, 0.3, 1.2]}>
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[1.7, 0.012, 6, 80]} />
          <meshBasicMaterial color="#00E5FF" toneMapped={false} />
        </mesh>
        <mesh rotation-x={Math.PI / 2.6} rotation-y={0.6}>
          <torusGeometry args={[2.0, 0.008, 6, 80]} />
          <meshBasicMaterial color="#00BFA6" toneMapped={false} />
        </mesh>
      </group>
      {/* panoramic X-ray display */}
      <group position={[0.4, 2.6, -1.4]} rotation-x={-0.06}>
        <mesh material={screen}>
          <planeGeometry args={[5.2, 2.6]} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(5.36, 2.76)]} />
          <lineBasicMaterial color="#00E5FF" />
        </lineSegments>
        <mesh ref={beam} position-z={0.05}>
          <planeGeometry args={[0.5, 2.9]} />
          <meshBasicMaterial map={glowTexture()} color="#00E5FF" transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
    </Display>
  )
}

/* ───────────── 02 · NoteGPT — orbiting archive of notes ───────────── */

function pageTexture(seed, hot) {
  return canvasTexture(256, 352, (g, w, h) => {
    g.fillStyle = hot ? 'rgba(10,60,84,0.96)' : 'rgba(9,26,44,0.92)'
    g.fillRect(0, 0, w, h)
    g.strokeStyle = hot ? '#7CF5FF' : 'rgba(124,245,255,0.45)'
    g.lineWidth = 5
    g.strokeRect(3, 3, w - 6, h - 6)
    const r = rng(seed)
    g.fillStyle = hot ? '#e8fdff' : 'rgba(180,220,235,0.8)'
    g.fillRect(24, 28, 90 + r() * 70, 13)
    const hi = 3 + Math.floor(r() * 9)
    for (let i = 0; i < 15; i++) {
      const y = 66 + i * 18
      const on = hot && i >= hi && i < hi + 3
      g.fillStyle = on ? '#00E5FF' : 'rgba(150,190,210,0.36)'
      g.fillRect(24, y, (0.5 + r() * 0.5) * (w - 48), on ? 9 : 6)
    }
  })
}

export function NoteGPTScene() {
  const COUNT = 13 // thirteen sets of course notes
  const ring = useRef()
  const core = useRef()
  const beams = useRef()
  const pages = useRef([])
  const tex = useMemo(() => Array.from({ length: COUNT }, (_, i) => [pageTexture(i + 1, false), pageTexture(i + 1, true)]), [])
  const holo = useMemo(() => holoMaterial('#7CF5FF'), [])
  const beamGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * 2 * 3), 3))
    return g
  }, [])
  const hot = useRef([])
  const v = new THREE.Vector3()
  useFrame((state) => {
    const t = time(state)
    holo.uniforms.uTime.value = t
    ring.current.rotation.y = t * 0.16
    core.current.rotation.y = -t * 0.5
    core.current.scale.setScalar(1 + Math.sin(t * 2.4) * 0.05)
    // every few seconds a new question retrieves three passages
    const round = Math.floor(t / 3.2)
    const picks = [round * 5, round * 5 + 4, round * 5 + 9].map((n) => n % COUNT)
    const phase = (t / 3.2) % 1
    const pulse = THREE.MathUtils.smoothstep(phase, 0.05, 0.25) * (1 - THREE.MathUtils.smoothstep(phase, 0.85, 1))
    const arr = beamGeo.attributes.position.array
    pages.current.forEach((m, i) => {
      const on = picks.includes(i) && pulse > 0.2
      if (hot.current[i] !== on) {
        hot.current[i] = on
        m.material.map = tex[i][on ? 1 : 0]
      }
      const target = on ? 1.22 : 1
      m.scale.setScalar(THREE.MathUtils.lerp(m.scale.x, target, 0.1))
    })
    picks.forEach((pi, n) => {
      pages.current[pi].getWorldPosition(v)
      beams.current.worldToLocal(v)
      arr.set([0, 0.4, 0, v.x, v.y, v.z], n * 6)
    })
    beamGeo.attributes.position.needsUpdate = true
    beams.current.material.opacity = pulse * 0.85
  })
  return (
    <Display index={3} id="notegpt" color="#7CF5FF">
      <group position-y={0.9}>
        <group ref={core} position-y={0.4}>
          <mesh material={holo}>
            <icosahedronGeometry args={[0.8, 1]} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[0.38, 0]} />
            <meshBasicMaterial color="#c9fbff" toneMapped={false} />
          </mesh>
        </group>
        <sprite position-y={0.4} scale={[4.5, 4.5, 1]}>
          <spriteMaterial map={glowTexture()} color="#00E5FF" opacity={0.3} transparent depthWrite={false} />
        </sprite>
        <lineSegments ref={beams} geometry={beamGeo} frustumCulled={false}>
          <lineBasicMaterial color="#9ff6ff" transparent opacity={0} />
        </lineSegments>
        <group ref={ring}>
          {tex.map((t, i) => {
            const a = (i / COUNT) * Math.PI * 2
            const rad = 3.1
            return (
              <mesh
                key={i}
                ref={(m) => (pages.current[i] = m)}
                position={[Math.cos(a) * rad, Math.sin(i * 1.7) * 0.9 + 0.5, Math.sin(a) * rad]}
                rotation-y={-a + Math.PI / 2}
              >
                <planeGeometry args={[0.8, 1.1]} />
                <meshBasicMaterial map={t[0]} transparent opacity={0.96} side={THREE.DoubleSide} toneMapped={false} />
              </mesh>
            )
          })}
        </group>
      </group>
    </Display>
  )
}

/* ───────────── 03 · Ask the Health Library — library of guides ───────────── */

export function HealthScene() {
  const COUNT = 13 // thirteen NIH patient guides
  const cross = useRef()
  const tags = useRef()
  const books = useRef([])
  const holo = useMemo(() => holoMaterial('#00BFA6'), [])
  const cites = useMemo(() => ['[1]', '[2]', '[3]'].map((s) => labelTexture(s, { color: '#b9fff3', size: 60, weight: 700 })), [])
  const bookMats = useMemo(
    () => Array.from({ length: COUNT }, (_, i) => new THREE.MeshStandardMaterial({ color: i % 3 ? '#0e3a40' : '#0c2d44', roughness: 0.5, metalness: 0.3, emissive: '#00BFA6', emissiveIntensity: 0.08 })),
    [],
  )
  useFrame((state) => {
    const t = time(state)
    holo.uniforms.uTime.value = t
    cross.current.rotation.y = t * 0.5
    cross.current.position.y = 3.0 + Math.sin(t) * 0.12
    const round = Math.floor(t / 3.6)
    const phase = (t / 3.6) % 1
    const picks = [round * 4 + 1, round * 4 + 6, round * 4 + 10].map((n) => n % COUNT)
    books.current.forEach((b, i) => {
      const n = picks.indexOf(i)
      const on = n >= 0 && phase > 0.1 + n * 0.12 && phase < 0.9
      bookMats[i].emissiveIntensity = THREE.MathUtils.lerp(bookMats[i].emissiveIntensity, on ? 1.5 : 0.08, 0.12)
      b.position.z = THREE.MathUtils.lerp(b.position.z, on ? 0.28 : 0, 0.1)
    })
    // a numbered citation lifts off each cited guide and travels to the answer
    tags.current.children.forEach((s, n) => {
      const b = books.current[picks[n]]
      const p = THREE.MathUtils.clamp((phase - 0.15 - n * 0.12) / 0.5, 0, 1)
      const e = p * p * (3 - 2 * p)
      const a = (picks[n] - (COUNT - 1) / 2) * 0.115
      const r = 3.3
      s.position.set(THREE.MathUtils.lerp(Math.sin(a) * r, 0, e), THREE.MathUtils.lerp(1.4, 3.0, e), THREE.MathUtils.lerp(Math.cos(a) * r - 3.3 + 0.5, 0.4, e))
      s.material.opacity = Math.sin(Math.min(p, 1) * Math.PI) * (env.reduced ? 0 : 1)
    })
  })
  return (
    <Display index={4} id="health" color="#00BFA6">
      {/* medical cross — the answer forms here */}
      <group ref={cross} position-y={3.0}>
        <mesh material={holo}>
          <boxGeometry args={[0.5, 1.5, 0.3]} />
        </mesh>
        <mesh material={holo}>
          <boxGeometry args={[1.5, 0.5, 0.3]} />
        </mesh>
        <mesh>
          <torusGeometry args={[1.25, 0.018, 6, 60]} />
          <meshBasicMaterial color="#00BFA6" toneMapped={false} />
        </mesh>
      </group>
      <sprite position-y={3} scale={[5, 5, 1]}>
        <spriteMaterial map={glowTexture()} color="#00BFA6" opacity={0.28} transparent depthWrite={false} />
      </sprite>
      {/* a curved shelf of guides */}
      <group position={[0, 0, -3.3]}>
        {Array.from({ length: COUNT }).map((_, i) => {
          const a = (i - (COUNT - 1) / 2) * 0.115
          const row = 0
          return (
            <group key={i} rotation-y={a} position-y={0.3 + row}>
              <group position-z={3.3}>
                <mesh ref={(m) => (books.current[i] = m)} material={bookMats[i]}>
                  <boxGeometry args={[0.3, 1.5 + ((i * 7) % 4) * 0.12, 0.9]} />
                </mesh>
              </group>
            </group>
          )
        })}
        <mesh position={[0, -0.52, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[2.7, 3.9, 48, 1, Math.PI / 2 - 0.82, 1.64]} />
          <meshStandardMaterial color="#0b2230" metalness={0.5} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <group ref={tags}>
        {cites.map((t, i) => (
          <sprite key={i} scale={[0.75 * t.userData.aspect, 0.75, 1]}>
            <spriteMaterial map={t} transparent opacity={0} depthWrite={false} toneMapped={false} />
          </sprite>
        ))}
      </group>
    </Display>
  )
}

/* ───────────── 04 · ODYSSEY — deep space ───────────── */

function marsTexture() {
  return canvasTexture(512, 256, (g, w, h) => {
    g.fillStyle = '#a4502e'
    g.fillRect(0, 0, w, h)
    const r = rng(31)
    for (let i = 0; i < 260; i++) {
      const x = r() * w, y = r() * h, s = 6 + r() * 46
      g.fillStyle = `rgba(${r() < 0.5 ? '70,28,18' : '214,140,92'},${0.05 + r() * 0.14})`
      g.beginPath()
      g.ellipse(x, y, s * 1.8, s * 0.7, r() * 3, 0, 7)
      g.fill()
    }
    g.fillStyle = 'rgba(245,235,225,0.75)'
    g.fillRect(0, 0, w, 9)
    g.fillRect(0, h - 7, w, 7)
  })
}

export function OdysseyScene() {
  const planet = useRef()
  const craft = useRef()
  const field = useRef()
  const moon = useRef()
  const tex = useMemo(marsTexture, [])
  const worlds = useMemo(() => {
    // a catalogue of distant worlds, drawn as a slowly turning disc of points
    const n = env.mobile ? 500 : 1400
    const r = rng(64)
    const pos = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    const c = new THREE.Color()
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2
      const d = 3.4 + Math.pow(r(), 0.7) * 6.5
      pos.set([Math.cos(a) * d, (r() - 0.5) * (0.5 + d * 0.16), Math.sin(a) * d], i * 3)
      c.setHSL(0.06 + r() * 0.52, 0.75, 0.62 + r() * 0.2)
      col.set([c.r, c.g, c.b], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    return g
  }, [])
  useFrame((state) => {
    const t = time(state)
    planet.current.rotation.y = t * 0.1
    field.current.rotation.y = t * 0.035
    const a = t * 0.45
    craft.current.position.set(Math.cos(a) * 2.9, Math.sin(a * 0.9) * 0.5 + 0.3, Math.sin(a) * 2.9)
    craft.current.rotation.y = -a
    moon.current.position.set(Math.cos(-t * 0.2) * 4.3, 0.9, Math.sin(-t * 0.2) * 4.3)
  })
  return (
    <Display index={5} id="odyssey" color="#FFB86B" lightAt={[7, 7, 7]} power={70}>
      <group position-y={1.4} rotation-z={0.22} rotation-x={0.12}>
        <mesh ref={planet}>
          <sphereGeometry args={[1.9, 40, 28]} />
          <meshStandardMaterial map={tex} roughness={1} metalness={0} emissive="#5a2412" emissiveIntensity={0.35} />
        </mesh>
        <mesh scale={1.06}>
          <sphereGeometry args={[1.9, 32, 20]} />
          <meshBasicMaterial color="#ff9d6b" transparent opacity={0.09} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {[2.9, 4.3].map((r) => (
          <mesh key={r} rotation-x={Math.PI / 2}>
            <torusGeometry args={[r, 0.008, 4, 120]} />
            <meshBasicMaterial color="#ffd3a1" transparent opacity={0.55} toneMapped={false} />
          </mesh>
        ))}
        {/* command module on a transfer orbit */}
        <group ref={craft} scale={0.42}>
          <mesh rotation-x={Math.PI / 2}>
            <coneGeometry args={[0.42, 0.7, 12]} />
            <meshStandardMaterial color="#d7dee8" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position-z={-0.75}>
            <cylinderGeometry args={[0.42, 0.42, 0.85, 12]} />
            <meshStandardMaterial color="#9aa6b6" metalness={0.8} roughness={0.35} />
          </mesh>
          <mesh position-z={-1.3}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="#9fe9ff" toneMapped={false} />
          </mesh>
        </group>
        <mesh ref={moon}>
          <sphereGeometry args={[0.3, 16, 12]} />
          <meshStandardMaterial color="#9d968c" roughness={1} flatShading />
        </mesh>
        <points ref={field} geometry={worlds}>
          <pointsMaterial size={0.16} map={glowTexture()} vertexColors transparent opacity={0.95} depthWrite={false} toneMapped={false} />
        </points>
      </group>
    </Display>
  )
}
