import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { journey, env, useUI } from '../../state/store'
import { stations, nearness, rng } from '../stations'
import { canvasTexture, glowTexture, holoMaterial, labelTexture, fromUI } from '../util'
import { allSkills, profile, education, experience, research } from '../../data/content'

const time = (state) => (env.reduced ? 2 : state.clock.elapsedTime)

// A floating glass slab with a title, used for the archive and info chambers.
function panelTexture(kicker, title, sub, color = '#00E5FF') {
  return canvasTexture(640, 360, (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, w, h)
    bg.addColorStop(0, 'rgba(14,52,80,0.94)')
    bg.addColorStop(1, 'rgba(6,22,42,0.92)')
    g.fillStyle = bg
    g.fillRect(0, 0, w, h)
    g.strokeStyle = color
    g.globalAlpha = 0.8
    g.lineWidth = 4
    g.strokeRect(2, 2, w - 4, h - 4)
    g.globalAlpha = 1
    g.fillStyle = color
    g.fillRect(40, 48, 44, 5)
    g.font = '600 24px "Sora Variable", sans-serif'
    g.fillText(kicker.toUpperCase(), 40, 96)
    g.fillStyle = '#F4F8FF'
    g.font = '600 44px Cinzel, serif'
    const words = title.split(' ')
    let line = ''
    let y = 164
    for (const wd of words) {
      if (g.measureText(line + wd).width > w - 80 && line) {
        g.fillText(line.trim(), 40, y)
        line = ''
        y += 54
      }
      line += wd + ' '
    }
    g.fillText(line.trim(), 40, y)
    g.fillStyle = '#A7B5C8'
    g.font = '400 24px "Sora Variable", sans-serif'
    g.fillText(sub, 40, h - 44)
  })
}

function GlassPanel({ tex, position, rotation, index, order = 0, width = 3 }) {
  const ref = useRef()
  const mat = useRef()
  useFrame((state) => {
    // each panel wakes as the camera approaches, one after another
    const k = THREE.MathUtils.smoothstep(nearness(journey.t, index, 1), 0.3 + order * 0.1, 0.62 + order * 0.1)
    ref.current.scale.set(k, 0.02 + 0.98 * k, 1)
    ref.current.position.y = position[1] + Math.sin(time(state) * 0.6 + order * 1.7) * 0.1
    mat.current.opacity = k * 0.96
  })
  return (
    <group ref={ref} position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[width, width * 0.5625]} />
        <meshBasicMaterial ref={mat} map={tex} transparent side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </group>
  )
}

/* ───────────── About — holographic information chamber ───────────── */

export function AboutScene() {
  const s = stations[1]
  const globe = useRef()
  const orbit = useRef()
  const holo = useMemo(() => holoMaterial('#00E5FF'), [])
  const labels = useMemo(() => profile.passions.map((p) => labelTexture(p, { size: 40 })), [])
  const light = useRef()
  useFrame((state) => {
    const t = time(state)
    const k = nearness(journey.t, 1, 0.9)
    holo.uniforms.uTime.value = t
    globe.current.rotation.y = t * 0.2
    globe.current.scale.setScalar(0.4 + 0.6 * k)
    orbit.current.rotation.y = -t * 0.12
    orbit.current.children.forEach((c, i) => {
      c.material.opacity = THREE.MathUtils.smoothstep(k, 0.3 + i * 0.08, 0.6 + i * 0.08)
    })
    light.current.intensity = k * 40
  })
  return (
    <group position={[s.focus.x, s.p.y, s.focus.z]}>
      <pointLight ref={light} position={[0, 3, 2]} color="#00E5FF" distance={22} decay={1.5} />
      {/* ring of emitter pillars */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <group key={i} position={[Math.cos(a) * 3.6, 0, Math.sin(a) * 3.6]}>
            <mesh position-y={0.6}>
              <cylinderGeometry args={[0.12, 0.2, 1.2, 6]} />
              <meshStandardMaterial color="#12283c" metalness={0.6} roughness={0.4} flatShading />
            </mesh>
            <mesh position-y={1.28}>
              <octahedronGeometry args={[0.14]} />
              <meshBasicMaterial color="#7df3ff" toneMapped={false} />
            </mesh>
          </group>
        )
      })}
      <group position-y={3.2}>
        <group ref={globe}>
          <mesh material={holo}>
            <icosahedronGeometry args={[1.5, 2]} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[1.52, 2]} />
            <meshBasicMaterial color="#7df3ff" wireframe transparent opacity={0.22} />
          </mesh>
        </group>
        <sprite scale={[6, 6, 1]}>
          <spriteMaterial map={glowTexture()} color="#00E5FF" opacity={0.22} transparent depthWrite={false} />
        </sprite>
        <group ref={orbit}>
          {labels.map((t, i) => {
            const a = (i / labels.length) * Math.PI * 2
            return (
              <sprite key={i} position={[Math.cos(a) * 3, Math.sin(i * 2.1) * 1.1, Math.sin(a) * 3]} scale={[0.5 * t.userData.aspect, 0.5, 1]}>
                <spriteMaterial map={t} transparent opacity={0} depthWrite={false} toneMapped={false} />
              </sprite>
            )
          })}
        </group>
      </group>
    </group>
  )
}

/* ───────────── Skills — the technology core ───────────── */

export function SkillsScene() {
  const s = stations[6]
  const core = useRef()
  const shell = useRef()
  const nodes = useRef([])
  const angles = useRef(allSkills.map((_, i) => (i / allSkills.length) * Math.PI * 2 * 3))
  const holo = useMemo(() => holoMaterial('#00E5FF'), [])
  const light = useRef()
  const defs = useMemo(() => {
    const r = rng(90)
    return allSkills.map((sk, i) => ({
      ...sk,
      rad: 2.7 + (i % 3) * 0.95,
      tilt: (r() - 0.5) * 0.9,
      speed: 0.22 - (i % 3) * 0.05,
      tex: labelTexture(sk.name, { size: 40 }),
    }))
  }, [])
  // neural net inside the core
  const net = useMemo(() => {
    const r = rng(17)
    const pts = Array.from({ length: 34 }, () => new THREE.Vector3().randomDirection().multiplyScalar(0.25 + r() * 0.75))
    const seg = []
    pts.forEach((a, i) => pts.forEach((b, j) => j > i && a.distanceTo(b) < 0.62 && seg.push(a, b)))
    return { pts: new THREE.BufferGeometry().setFromPoints(pts), seg: new THREE.BufferGeometry().setFromPoints(seg) }
  }, [])
  const linkGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(allSkills.length * 6), 3))
    return g
  }, [])
  const linkMat = useRef()

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const t = time(state)
    const k = nearness(journey.t, 6, 0.9)
    const ui = useUI.getState()
    holo.uniforms.uTime.value = t
    core.current.rotation.y = t * 0.18
    core.current.rotation.x = Math.sin(t * 0.11) * 0.2
    shell.current.rotation.y = -t * 0.1
    light.current.intensity = k * 60
    const arr = linkGeo.attributes.position.array
    defs.forEach((d, i) => {
      const held = ui.hoverSkill === d.name || ui.skill === d.name
      if (!held && !env.reduced) angles.current[i] += dt * d.speed
      const a = angles.current[i]
      const n = nodes.current[i]
      n.position.set(Math.cos(a) * d.rad, Math.sin(a) * d.rad * Math.sin(d.tilt) + Math.sin(a * 2 + i) * 0.25, Math.sin(a) * d.rad * Math.cos(d.tilt))
      const sc = THREE.MathUtils.damp(n.scale.x, (held ? 1.45 : 1) * (0.2 + 0.8 * k), 8, dt)
      n.scale.setScalar(sc)
      arr.set([0, 0, 0, n.position.x, n.position.y, n.position.z], i * 6)
    })
    linkGeo.attributes.position.needsUpdate = true
    linkMat.current.opacity = (0.14 + 0.12 * Math.sin(t * 2.2)) * k
  })

  const set = (patch) => useUI.getState().set(patch)
  return (
    <group position={[s.focus.x, s.p.y + 3.6, s.focus.z]}>
      <pointLight ref={light} color="#00E5FF" distance={26} decay={1.4} />
      <mesh position-y={-3.55} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[3.9, 4.0, 80]} />
        <meshBasicMaterial color="#00E5FF" toneMapped={false} transparent opacity={0.7} />
      </mesh>
      <group ref={core}>
        <mesh material={holo}>
          <icosahedronGeometry args={[1.25, 1]} />
        </mesh>
        <points geometry={net.pts}>
          <pointsMaterial color="#c9fbff" size={0.07} toneMapped={false} />
        </points>
        <lineSegments geometry={net.seg}>
          <lineBasicMaterial color="#00E5FF" transparent opacity={0.55} />
        </lineSegments>
      </group>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.55, 1]} />
        <meshBasicMaterial color="#00BFA6" wireframe transparent opacity={0.2} />
      </mesh>
      <sprite scale={[7, 7, 1]}>
        <spriteMaterial map={glowTexture()} color="#00E5FF" opacity={0.3} transparent depthWrite={false} />
      </sprite>
      <lineSegments geometry={linkGeo} frustumCulled={false}>
        <lineBasicMaterial ref={linkMat} color="#7df3ff" transparent opacity={0.2} />
      </lineSegments>
      {defs.map((d, i) => (
        <group
          key={d.name}
          ref={(n) => (nodes.current[i] = n)}
          onPointerOver={(e) => {
            if (fromUI(e)) return
            e.stopPropagation()
            set({ hoverSkill: d.name })
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            set({ hoverSkill: null })
            document.body.style.cursor = ''
          }}
          onClick={(e) => {
            if (fromUI(e)) return
            e.stopPropagation()
            set({ skill: d.name })
          }}
        >
          {/* generous invisible hit target */}
          <mesh visible={false}>
            <sphereGeometry args={[0.45, 8, 8]} />
          </mesh>
          <mesh>
            <octahedronGeometry args={[0.17]} />
            <meshBasicMaterial color={d.color} toneMapped={false} />
          </mesh>
          <sprite scale={[0.9, 0.9, 1]}>
            <spriteMaterial map={glowTexture()} color={d.color} opacity={0.5} transparent depthWrite={false} />
          </sprite>
          <sprite position-y={0.46} scale={[0.42 * d.tex.userData.aspect, 0.42, 1]}>
            <spriteMaterial map={d.tex} transparent depthWrite={false} toneMapped={false} />
          </sprite>
        </group>
      ))}
    </group>
  )
}

/* ───────────── Knowledge chamber — experience, then research ───────────── */

function Timeline({ index, count, length = 7 }) {
  const dots = useRef([])
  useFrame(() => {
    const k = nearness(journey.t, index, 1)
    dots.current.forEach((d, i) => {
      const on = THREE.MathUtils.smoothstep(k, 0.35 + i * 0.12, 0.55 + i * 0.12)
      d.scale.setScalar(0.5 + on * 0.9)
      d.material.color.set('#12344a').lerp(_cy, on)
    })
  })
  return (
    <group>
      <mesh rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.02, 0.02, length, 6]} />
        <meshBasicMaterial color="#1f6f86" toneMapped={false} />
      </mesh>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} ref={(m) => (dots.current[i] = m)} position-x={-length / 2 + (length / (count - 1 || 1)) * i}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshBasicMaterial color="#12344a" toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}
const _cy = new THREE.Color('#00E5FF')

function Archive({ index, panels, color }) {
  const s = stations[index]
  const light = useRef()
  const yaw = s.side * 0.5 // angle the wall of panels toward the visitor
  useFrame(() => {
    light.current.intensity = nearness(journey.t, index, 0.9) * 34
  })
  const n = panels.length
  return (
    <group position={[s.focus.x, s.p.y, s.focus.z]} rotation-y={yaw} scale={1.3}>
      <pointLight ref={light} position={[0, 3, 3]} color={color} distance={22} decay={1.5} />
      {/* archive pylons */}
      {[-4.4, 4.4].map((x) => (
        <group key={x} position={[x, 0, -0.6]}>
          <mesh position-y={2.6}>
            <boxGeometry args={[0.35, 5.2, 0.35]} />
            <meshStandardMaterial color="#0f2236" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position-y={2.6}>
            <boxGeometry args={[0.37, 5.0, 0.05]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {panels.map((tex, i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const x = n <= 3 ? (i - (n - 1) / 2) * 2.75 : (col - 0.5) * 3.3
        const y = n <= 3 ? 3.3 + (i % 2) * 0.5 : 4.2 - row * 1.95
        return <GlassPanel key={i} tex={tex} index={index} order={i} position={[x, y, 0]} rotation={[0, 0, 0]} width={n <= 3 ? 2.55 : 3.0} />
      })}
      <group position={[0, 1.2, 0.4]}>
        <Timeline index={index} count={n} length={n <= 3 ? 5.5 : 6.4} />
      </group>
    </group>
  )
}

export function ExperienceScene() {
  const panels = useMemo(
    () => [
      panelTexture('Education', 'BS Computer Science', education.period),
      ...experience
        .slice()
        .reverse()
        .map((e) => panelTexture('Experience', e.role, e.period, '#00BFA6')),
    ],
    [],
  )
  return <Archive index={7} panels={panels} color="#00E5FF" />
}

export function ResearchScene() {
  const panels = useMemo(() => research.map((r) => panelTexture('Research interest', r.title, '', '#7CF5FF')), [])
  return <Archive index={8} panels={panels} color="#7CF5FF" />
}
