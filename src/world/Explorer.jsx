import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { journey, env } from '../state/store'
import { pathAt, stations, N } from './stations'
import { glowTexture } from './util'

const here = new THREE.Vector3()
const ahead = new THREE.Vector3()
const tmp = new THREE.Vector3()
const WALK = 4.2 // stride reference, world units per second

// The explorer: one stylised character, same look the whole way. Idles
// (breathing, small weight shifts), walks whenever the journey moves, stops at
// each destination and turns toward what is on show there.
export function Explorer() {
  const root = useRef()
  const body = useRef()
  const torso = useRef()
  const head = useRef()
  const armL = useRef()
  const armR = useRef()
  const foreL = useRef()
  const foreR = useRef()
  const legL = useRef()
  const legR = useRef()
  const shinL = useRef()
  const shinR = useRef()
  const scarf = useRef()
  const s = useRef({ phase: 0, walk: 0, yaw: Math.PI, dist: 0 })

  const M = useMemo(() => {
    const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, flatShading: true, ...extra })
    return {
      jacket: std('#2f6f8f'),
      trim: std('#17384c'),
      pants: std('#27384d'),
      boots: std('#5a4032'),
      skin: std('#c9946c'),
      hair: std('#2a1d18'),
      pack: std('#8a6a4c'),
      scarf: std('#0bbfa9', { emissive: '#00bfa6', emissiveIntensity: 0.35, side: THREE.DoubleSide }),
      glow: new THREE.MeshBasicMaterial({ color: '#7df3ff', toneMapped: false }),
    }
  }, [])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const st = s.current
    const time = state.clock.elapsedTime
    const t = journey.t
    const dir = Math.sign(journey.speed) || 1

    pathAt(t, here)
    const moved = here.distanceTo(root.current.position)
    root.current.position.copy(here)

    const moving = Math.abs(journey.speed) > 0.02 && !env.reduced
    st.walk = THREE.MathUtils.damp(st.walk, moving ? 1 : 0, 6, dt)
    // stride follows ground covered, capped so the legs never race
    st.phase += Math.min(moved, WALK * dt * 1.7) * 1.5 * st.walk

    // heading: along the path while walking; toward the display when stopped
    let want
    if (st.walk > 0.4) {
      pathAt(t + 0.02 * dir, ahead)
      tmp.subVectors(ahead, here)
      want = Math.atan2(tmp.x, tmp.z)
    } else {
      const i = THREE.MathUtils.clamp(Math.round(t), 0, N - 1)
      if (i === N - 1) tmp.subVectors(state.camera.position, here) // final stop: face the visitor
      else tmp.subVectors(stations[i].focus, here)
      want = Math.atan2(tmp.x, tmp.z)
    }
    let d = want - st.yaw
    d = Math.atan2(Math.sin(d), Math.cos(d))
    st.yaw += d * Math.min(1, dt * (st.walk > 0.4 ? 7 : 2.4))
    root.current.rotation.y = st.yaw

    const w = st.walk
    const p = st.phase
    const swing = Math.sin(p)
    const idle = env.reduced ? 0 : 1 - w
    const breath = Math.sin(time * 1.6) * idle

    body.current.position.y = 0.94 + Math.abs(Math.cos(p)) * 0.05 * w + breath * 0.006
    body.current.rotation.x = 0.1 * w
    body.current.rotation.z = Math.sin(time * 0.5) * 0.015 * idle
    torso.current.scale.set(1 + breath * 0.018, 1 + breath * 0.012, 1 + breath * 0.03)
    torso.current.rotation.y = -swing * 0.12 * w
    head.current.rotation.y = Math.sin(time * 0.37) * 0.22 * idle
    head.current.rotation.x = Math.sin(time * 0.23) * 0.05 * idle - 0.04

    legL.current.rotation.x = swing * 0.62 * w
    legR.current.rotation.x = -swing * 0.62 * w
    shinL.current.rotation.x = Math.max(0, -Math.cos(p)) * 0.95 * w
    shinR.current.rotation.x = Math.max(0, Math.cos(p)) * 0.95 * w
    armL.current.rotation.x = -swing * 0.5 * w + breath * 0.02
    armR.current.rotation.x = swing * 0.5 * w + breath * 0.02
    armL.current.rotation.z = 0.09
    armR.current.rotation.z = -0.09
    foreL.current.rotation.x = -0.18 - 0.35 * w
    foreR.current.rotation.x = -0.18 - 0.35 * w
    scarf.current.rotation.x = 0.25 + 0.55 * w + Math.sin(time * 2.2) * 0.07 * (0.4 + w)
    scarf.current.rotation.z = Math.sin(time * 1.3) * 0.08
  })

  const limb = (r, len) => <capsuleGeometry args={[r, len, 3, 8]} />

  return (
    <group ref={root} rotation-y={Math.PI}>
      <pointLight position={[0.6, 3, 2.4]} color="#cfeeff" intensity={7} distance={9} decay={1.6} />
      {/* contact shadow */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.03}>
        <circleGeometry args={[0.55, 20]} />
        <meshBasicMaterial map={glowTexture()} color="#000" transparent opacity={0.55} depthWrite={false} />
      </mesh>
      <group ref={body} position-y={0.94}>
        {/* torso + jacket */}
        <group ref={torso}>
          <mesh material={M.jacket} position-y={0.3} castShadow>
            <cylinderGeometry args={[0.21, 0.17, 0.56, 8]} />
          </mesh>
          <mesh material={M.trim} position-y={0.02}>
            <cylinderGeometry args={[0.18, 0.19, 0.1, 8]} />
          </mesh>
          <mesh material={M.jacket} position-y={0.58}>
            <sphereGeometry args={[0.215, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          {/* backpack with a light strip */}
          <group position={[0, 0.32, -0.21]}>
            <mesh material={M.pack} castShadow>
              <boxGeometry args={[0.3, 0.4, 0.17]} />
            </mesh>
            <mesh material={M.pack} position={[0, 0.24, 0]} rotation-z={Math.PI / 2}>
              <capsuleGeometry args={[0.07, 0.24, 3, 8]} />
            </mesh>
            <mesh material={M.glow} position={[0, 0.02, -0.09]}>
              <boxGeometry args={[0.16, 0.035, 0.01]} />
            </mesh>
          </group>
          {/* scarf */}
          <mesh material={M.scarf} position-y={0.62} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.13, 0.05, 6, 12]} />
          </mesh>
          <group ref={scarf} position={[0.08, 0.6, -0.12]}>
            <mesh material={M.scarf} position={[0, -0.2, -0.02]}>
              <boxGeometry args={[0.11, 0.42, 0.015]} />
            </mesh>
          </group>
          {/* head */}
          <group ref={head} position-y={0.82}>
            <mesh material={M.skin} castShadow>
              <sphereGeometry args={[0.15, 12, 10]} />
            </mesh>
            <mesh material={M.hair} position={[0, 0.035, -0.02]} rotation-x={-0.25}>
              <sphereGeometry args={[0.162, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.56]} />
            </mesh>
            <mesh material={M.skin} position-y={-0.15}>
              <cylinderGeometry args={[0.06, 0.07, 0.1, 8]} />
            </mesh>
          </group>
          {/* arms */}
          <group ref={armL} position={[0.26, 0.52, 0]}>
            <mesh material={M.jacket} position-y={-0.16} castShadow>
              {limb(0.065, 0.24)}
            </mesh>
            <group ref={foreL} position-y={-0.33}>
              <mesh material={M.jacket} position-y={-0.13}>
                {limb(0.055, 0.2)}
              </mesh>
              <mesh material={M.skin} position-y={-0.3}>
                <sphereGeometry args={[0.058, 8, 6]} />
              </mesh>
            </group>
          </group>
          <group ref={armR} position={[-0.26, 0.52, 0]}>
            <mesh material={M.jacket} position-y={-0.16} castShadow>
              {limb(0.065, 0.24)}
            </mesh>
            <group ref={foreR} position-y={-0.33}>
              <mesh material={M.jacket} position-y={-0.13}>
                {limb(0.055, 0.2)}
              </mesh>
              <mesh material={M.skin} position-y={-0.3}>
                <sphereGeometry args={[0.058, 8, 6]} />
              </mesh>
            </group>
          </group>
        </group>
        {/* legs */}
        {[
          [legL, shinL, 0.1],
          [legR, shinR, -0.1],
        ].map(([leg, shin, x], i) => (
          <group key={i} ref={leg} position={[x, 0, 0]}>
            <mesh material={M.pants} position-y={-0.22} castShadow>
              {limb(0.085, 0.3)}
            </mesh>
            <group ref={shin} position-y={-0.45}>
              <mesh material={M.pants} position-y={-0.18}>
                {limb(0.07, 0.26)}
              </mesh>
              <mesh material={M.boots} position={[0, -0.41, 0.04]}>
                <boxGeometry args={[0.13, 0.13, 0.26]} />
              </mesh>
            </group>
          </group>
        ))}
      </group>
    </group>
  )
}
