import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { journey, env, useUI } from '../state/store'
import { camAt, lookAt, sideAt, N } from './stations'

const pos = new THREE.Vector3()
const look = new THREE.Vector3()
const right = new THREE.Vector3()
const introPos = new THREE.Vector3(-16, 15, 40)
const introLook = new THREE.Vector3(12, 4, -60)
const ease = (x) => x * x * (3 - 2 * x)

// Single camera for the whole journey. Scroll sets journey.target; this damps
// journey.t toward it and places the camera on the path, so it can never jump.
export function CameraRig() {
  const { camera, size } = useThree()
  const cur = useRef({ look: new THREE.Vector3(), px: 0, py: 0, shift: 0, init: false })
  const lastActive = useRef(0)

  useEffect(() => {
    const portrait = size.width < size.height
    camera.fov = portrait ? 66 : size.width < 1100 ? 56 : 48
    camera.near = 0.3
    camera.far = 1400
    camera.updateProjectionMatrix()
  }, [camera, size])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const prev = journey.t
    journey.t = THREE.MathUtils.damp(journey.t, journey.target, env.reduced ? 9 : 3.2, dt)
    if (Math.abs(journey.target - journey.t) < 0.0004) journey.t = journey.target
    journey.speed = THREE.MathUtils.damp(journey.speed, (journey.t - prev) / Math.max(dt, 1e-4), 10, dt)

    const active = Math.round(THREE.MathUtils.clamp(journey.target, 0, N - 1))
    if (active !== lastActive.current) {
      lastActive.current = active
      useUI.getState().set({ active })
    }

    camAt(journey.t, pos)
    lookAt(journey.t, look)

    // opening shot: glide in from high above the sea of clouds
    const k = ease(journey.intro)
    if (k < 1) {
      pos.lerpVectors(introPos, pos, k)
      look.lerpVectors(introLook, look, k)
    }

    const c = cur.current
    const follow = env.reduced ? 0 : 1
    c.px = THREE.MathUtils.damp(c.px, journey.px * follow, 2.5, dt)
    c.py = THREE.MathUtils.damp(c.py, journey.py * follow, 2.5, dt)

    camera.position.copy(pos)
    if (!c.init) {
      c.look.copy(look)
      c.init = true
    }
    c.look.copy(look)
    camera.lookAt(c.look)
    // parallax: slide the camera on its own right/up axes and re-aim
    right.setFromMatrixColumn(camera.matrixWorld, 0)
    camera.position.addScaledVector(right, c.px * 0.75)
    camera.position.y += -c.py * 0.4
    camera.lookAt(c.look)

    // shift the picture sideways so the 3D subject clears the page content
    const wide = size.width >= 900
    const targetShift = wide ? -sideAt(journey.t) * 0.14 : 0
    c.shift = THREE.MathUtils.damp(c.shift, targetShift, 4, dt)
    const yShift = wide ? 0 : 0.16
    camera.setViewOffset(size.width, size.height, -c.shift * size.width, yShift * size.height, size.width, size.height)
  })
  return null
}
