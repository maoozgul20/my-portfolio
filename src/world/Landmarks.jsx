import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { journey, env } from '../state/store'
import { CASTLE, rng, pathAt, stations, N, nearness } from './stations'
import { glowTexture } from './util'

// The distant castle: the landmark the journey opens on. Its lights come up
// during the opening shot.
export function Castle() {
  const windows = useRef()
  const halo = useRef()
  const winMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffd9a0', toneMapped: false }), [])
  const cyanMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#00E5FF', toneMapped: false, transparent: true }), [])
  const stone = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2a3a5c', roughness: 0.9, flatShading: true }), [])
  const roof = useMemo(() => new THREE.MeshStandardMaterial({ color: '#15486b', roughness: 0.6, flatShading: true, emissive: '#06324a', emissiveIntensity: 0.6 }), [])

  const towers = useMemo(() => {
    const r = rng(3)
    const out = [{ x: 0, z: 0, rad: 5, h: 46 }]
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.3
      const d = 11 + (i % 2) * 7
      out.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, rad: 2.2 + r() * 1.6, h: 16 + r() * 18 })
    }
    return out
  }, [])
  const wins = useMemo(() => {
    const r = rng(9)
    const out = []
    for (const t of towers) {
      const n = Math.round(t.h / 2.4)
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2
        out.push({ x: t.x + Math.cos(a) * t.rad, y: 5 + r() * (t.h - 5), z: t.z + Math.sin(a) * t.rad, a })
      }
    }
    return out
  }, [towers])
  useLayoutEffect(() => {
    const m = new THREE.Object3D()
    wins.forEach((w, i) => {
      m.position.set(w.x, w.y, w.z)
      m.rotation.y = -w.a + Math.PI / 2
      m.updateMatrix()
      windows.current.setMatrixAt(i, m.matrix)
    })
    windows.current.instanceMatrix.needsUpdate = true
  }, [wins])

  useFrame((state) => {
    const k = THREE.MathUtils.smoothstep(journey.intro, 0.35, 1)
    winMat.color.set('#ffd9a0').multiplyScalar(0.05 + k * 1.1)
    cyanMat.opacity = k
    if (!env.reduced) halo.current.rotation.z = state.clock.elapsedTime * 0.12
  })

  return (
    <group position={CASTLE} scale={1.5}>
      <CastleRock />
      {/* keep and walls */}
      <mesh material={stone} position-y={6}>
        <cylinderGeometry args={[15, 19, 12, 10]} />
      </mesh>
      <mesh material={stone} position-y={14}>
        <cylinderGeometry args={[9, 11, 10, 8]} />
      </mesh>
      {towers.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          <mesh material={stone} position-y={t.h / 2}>
            <cylinderGeometry args={[t.rad * 0.82, t.rad, t.h, 8]} />
          </mesh>
          <mesh material={stone} position-y={t.h}>
            <cylinderGeometry args={[t.rad * 1.12, t.rad * 0.82, 1.4, 8]} />
          </mesh>
          <mesh material={roof} position-y={t.h + 0.7 + t.rad * 1.7}>
            <coneGeometry args={[t.rad * 1.2, t.rad * 3.4, 8]} />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={windows} args={[null, null, wins.length]} material={winMat} frustumCulled={false}>
        <boxGeometry args={[0.5, 1.1, 0.25]} />
      </instancedMesh>
      {/* halo and beacon above the central spire */}
      <group position-y={70}>
        <mesh ref={halo} rotation-x={Math.PI / 2.25} material={cyanMat}>
          <torusGeometry args={[11, 0.22, 8, 64]} />
        </mesh>
        <mesh material={cyanMat} position-y={-3}>
          <sphereGeometry args={[0.9, 12, 12]} />
        </mesh>
        <sprite scale={[44, 44, 1]}>
          <spriteMaterial map={glowTexture()} color="#00E5FF" opacity={0.5} transparent depthWrite={false} fog={false} />
        </sprite>
      </group>
      <sprite position-y={22} scale={[110, 80, 1]}>
        <spriteMaterial map={glowTexture()} color="#2bb6e6" opacity={0.2} transparent depthWrite={false} fog={false} />
      </sprite>
    </group>
  )
}

function CastleRock() {
  const geo = useMemo(() => {
    const g = new THREE.CylinderGeometry(27, 2, 60, 14, 5)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i)
      const a = Math.atan2(p.getZ(i), p.getX(i))
      const k = 1 + Math.sin(a * 4 + y * 0.2) * 0.12 + Math.sin(a * 9) * 0.05
      p.setX(i, p.getX(i) * k)
      p.setZ(i, p.getZ(i) * k)
    }
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <>
      <mesh geometry={geo} position-y={-30}>
        <meshStandardMaterial color="#1c2638" roughness={1} flatShading />
      </mesh>
      <mesh position-y={0.1}>
        <cylinderGeometry args={[28, 27, 0.8, 14]} />
        <meshStandardMaterial color="#17493f" roughness={0.9} flatShading />
      </mesh>
    </>
  )
}

const portalMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uOpen: { value: 1 }, uColor: { value: new THREE.Color('#00E5FF') } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uOpen; uniform vec3 uColor; varying vec2 vUv;
      void main(){
        vec2 p = vUv - 0.5;
        float r = length(p) * 2.0;
        float a = atan(p.y, p.x);
        float swirl = 0.5 + 0.5 * sin(a * 5.0 + r * 9.0 - uTime * 1.6);
        float rings = 0.5 + 0.5 * sin(r * 26.0 - uTime * 2.4);
        float open = smoothstep(uOpen, uOpen - 0.35, r);
        float rim = smoothstep(0.75, 1.0, r / max(uOpen, 0.001)) * open;
        float core = (0.1 + swirl * 0.2 + rings * 0.07) * open;
        vec3 col = mix(uColor, vec3(1.0), rim * 0.45);
        gl_FragColor = vec4(col, (core + rim * 0.8) * step(r, 1.0));
      }`,
  })

// A standing ring gate. `openRef` returns 0…1.
export function Portal({ position, yaw = 0, radius = 2.6, open = () => 1, stones = 9 }) {
  const mat = useMemo(portalMat, [])
  const ring = useRef()
  const glow = useRef()
  const back = useRef()
  useFrame((state) => {
    const o = open()
    back.current.material.opacity = o * 0.93
    back.current.scale.setScalar(0.02 + o * 0.98)
    mat.uniforms.uTime.value = env.reduced ? 1 : state.clock.elapsedTime
    mat.uniforms.uOpen.value = 0.02 + o * 0.98
    glow.current.material.opacity = 0.1 + o * 0.2
    if (!env.reduced) ring.current.rotation.z = state.clock.elapsedTime * 0.1
  })
  return (
    <group position={position} rotation-y={yaw}>
      <mesh ref={back} position-z={-0.03}>
        <circleGeometry args={[radius * 0.99, 48]} />
        <meshBasicMaterial color="#03131f" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh material={mat}>
        <planeGeometry args={[radius * 2, radius * 2]} />
      </mesh>
      <mesh>
        <torusGeometry args={[radius, radius * 0.035, 8, 72]} />
        <meshBasicMaterial color="#9ff6ff" toneMapped={false} />
      </mesh>
      <group ref={ring}>
        {Array.from({ length: stones }).map((_, i) => {
          const a = (i / stones) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * radius * 1.14, Math.sin(a) * radius * 1.14, 0]} rotation-z={a}>
              <boxGeometry args={[radius * 0.16, radius * 0.42, radius * 0.14]} />
              <meshStandardMaterial color="#1a2a44" roughness={0.6} metalness={0.4} flatShading emissive="#00576a" emissiveIntensity={0.5} />
            </mesh>
          )
        })}
      </group>
      <sprite ref={glow} scale={[radius * 5, radius * 5, 1]}>
        <spriteMaterial map={glowTexture()} color="#00E5FF" opacity={0.3} transparent depthWrite={false} />
      </sprite>
    </group>
  )
}

// Gate between the first island and everything beyond it.
export function JourneyGate() {
  const { pos, yaw } = useMemo(() => {
    const p = pathAt(0.5)
    const q = pathAt(0.52)
    return { pos: [p.x, p.y + 2.5, p.z], yaw: Math.atan2(q.x - p.x, q.z - p.z) }
  }, [])
  return <Portal position={pos} yaw={yaw} radius={2.7} open={() => THREE.MathUtils.smoothstep(journey.t, 0.02, 0.3)} />
}

// The last gate, at the end of the path.
export function FinalPortal() {
  const f = stations[N - 1].focus
  const light = useRef()
  useFrame(() => {
    light.current.intensity = nearness(journey.t, N - 1, 0.9) * 60
  })
  return (
    <>
      <Portal position={[f.x, f.y + 0.6, f.z]} radius={3.8} stones={12} open={() => THREE.MathUtils.smoothstep(journey.t, N - 1.75, N - 1.02)} />
      <pointLight ref={light} position={[f.x, f.y, f.z + 2]} color="#00E5FF" distance={30} decay={1.6} />
    </>
  )
}
