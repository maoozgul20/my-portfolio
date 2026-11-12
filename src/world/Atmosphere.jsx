import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { journey, env } from '../state/store'
import { atmosAt, rng, stations, N } from './stations'
import { glowTexture } from './util'

// Sky dome, fog and lights. All of it is driven by the journey progress so the
// world shifts mood continuously instead of cutting between scenes.
export function Atmosphere() {
  const { scene, camera } = useThree()
  const sky = useRef()
  const hemi = useRef()
  const sun = useRef()
  const stars = useRef()

  const skyMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uTop: { value: new THREE.Color() },
          uHor: { value: new THREE.Color() },
          uSun: { value: 0 },
          uTime: { value: 0 },
        },
        vertexShader: /* glsl */ `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uTop; uniform vec3 uHor; uniform float uSun; uniform float uTime; varying vec3 vDir;
          void main(){
            vec3 d = normalize(vDir);
            float h = clamp(d.y * 0.5 + 0.5, 0.0, 1.0);
            float band = exp(-pow((d.y + 0.02) * mix(4.2, 7.0, uSun), 2.0));
            vec3 col = mix(uTop * 0.55, uTop, smoothstep(0.0, 1.0, h));
            col = mix(col, uHor, band * 0.85);
            // sunset: a low sun straight ahead (-z)
            vec3 sdir = normalize(vec3(0.42, 0.06, -1.0));
            float s = max(dot(d, sdir), 0.0);
            col += uSun * (vec3(1.0, 0.55, 0.25) * pow(s, 14.0) * 0.4 + vec3(1.0, 0.85, 0.6) * pow(s, 420.0) * 1.6);
            col += uSun * vec3(0.5, 0.12, 0.3) * band * 0.25 * (1.0 - s);
            gl_FragColor = vec4(col, 1.0);
          }`,
      }),
    [],
  )

  const starGeo = useMemo(() => {
    const r = rng(7)
    const n = env.mobile ? 700 : 1800
    const pos = new Float32Array(n * 3)
    const size = new Float32Array(n)
    for (let i = 0; i < n; i++) {
      const u = r() * 2 - 1
      const a = r() * Math.PI * 2
      const s = Math.sqrt(1 - u * u)
      pos.set([s * Math.cos(a) * 480, Math.abs(u) * 480 * 0.9 - 30, s * Math.sin(a) * 480], i * 3)
      size[i] = 0.6 + r() * r() * 2.6
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    return g
  }, [])
  const starMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        fog: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uAmt: { value: 1 }, uPx: { value: 1 } },
        vertexShader: /* glsl */ `
          attribute float aSize; uniform float uTime; uniform float uPx; varying float vTw;
          void main(){
            vTw = 0.65 + 0.35 * sin(uTime * (0.6 + aSize) + position.x * 0.3);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            gl_PointSize = aSize * uPx * 1.5;
          }`,
        fragmentShader: /* glsl */ `
          uniform float uAmt; varying float vTw;
          void main(){
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d) * vTw * uAmt;
            gl_FragColor = vec4(vec3(0.8, 0.93, 1.0), a);
          }`,
      }),
    [],
  )

  useMemo(() => {
    scene.fog = new THREE.FogExp2('#0a2439', 0.007)
    scene.background = new THREE.Color('#030914')
  }, [scene])

  useFrame((state) => {
    const a = atmosAt(journey.t)
    const time = env.reduced ? 0 : state.clock.elapsedTime
    skyMat.uniforms.uTop.value.copy(a.top)
    skyMat.uniforms.uHor.value.copy(a.hor)
    skyMat.uniforms.uSun.value = a.sun
    scene.fog.color.copy(a.fog)
    scene.fog.density = a.density
    scene.background.copy(a.fog)
    sky.current.position.copy(camera.position)
    stars.current.position.copy(camera.position)
    starMat.uniforms.uTime.value = time
    starMat.uniforms.uAmt.value = a.stars * (0.3 + 0.7 * journey.intro)
    starMat.uniforms.uPx.value = state.gl.getPixelRatio()
    hemi.current.color.copy(a.hor).lerp(_white, 0.35)
    hemi.current.groundColor.copy(a.fog)
    hemi.current.intensity = 1.25 * (0.25 + 0.75 * journey.intro)
    // key light: cool moonlight, warming to sunset at the end
    sun.current.color.set('#9fd8ff').lerp(_warm, a.sun)
    sun.current.intensity = (1.5 + a.sun * 1.2) * (0.2 + 0.8 * journey.intro)
    const t = sun.current.target
    t.position.copy(camera.position).add(_fwd.set(0, -2, -10))
    sun.current.position.copy(t.position).add(_off.set(14 - a.sun * 4, 22 - a.sun * 12, 10 - a.sun * 34))
    t.updateMatrixWorld()
  })

  return (
    <>
      <mesh ref={sky} material={skyMat} renderOrder={-10} frustumCulled={false}>
        <sphereGeometry args={[600, 32, 16]} />
      </mesh>
      <points ref={stars} geometry={starGeo} material={starMat} frustumCulled={false} renderOrder={-9} />
      <hemisphereLight ref={hemi} intensity={0.9} />
      <directionalLight
        ref={sun}
        intensity={1.5}
        castShadow={!env.mobile}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-bias={-0.0004}
        shadow-normalBias={0.12}
      />
    </>
  )
}
const _white = new THREE.Color('#ffffff')
const _warm = new THREE.Color('#ffb072')
const _fwd = new THREE.Vector3()
const _off = new THREE.Vector3()

// Drifting motes that wrap around the camera, so one small buffer fills the
// whole world.
export function Particles() {
  const count = env.mobile ? 350 : 1100
  const ref = useRef()
  const { geo, mat } = useMemo(() => {
    const r = rng(11)
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos.set([r() * 60, r() * 30, r() * 60], i * 3)
      seed[i] = r()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uPx: { value: 1 }, uAmt: { value: 0 }, uColor: { value: new THREE.Color('#7df3ff') } },
      vertexShader: /* glsl */ `
        attribute float aSeed; uniform float uTime; uniform vec3 uCam; uniform float uPx; varying float vA;
        void main(){
          vec3 box = vec3(60.0, 30.0, 60.0);
          vec3 p = position;
          p.y += uTime * (0.15 + aSeed * 0.35);
          p.x += sin(uTime * 0.3 + aSeed * 40.0) * 1.2;
          p = mod(p - uCam + box * 0.5, box) - box * 0.5;
          vec4 mv = viewMatrix * vec4(p + uCam, 1.0);
          gl_Position = projectionMatrix * mv;
          float d = -mv.z;
          vA = smoothstep(30.0, 12.0, d) * smoothstep(0.5, 3.0, d) * (0.35 + 0.65 * sin(uTime * (1.0 + aSeed * 2.0) + aSeed * 30.0) * 0.5 + 0.5);
          gl_PointSize = (1.5 + aSeed * 3.5) * uPx * 14.0 / max(d, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmt; varying float vA;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, d) * vA * uAmt);
        }`,
    })
    return { geo, mat }
  }, [count])
  useFrame((state) => {
    mat.uniforms.uTime.value = env.reduced ? 3 : state.clock.elapsedTime
    mat.uniforms.uCam.value.copy(state.camera.position)
    mat.uniforms.uPx.value = state.gl.getPixelRatio()
    mat.uniforms.uAmt.value = 0.75 * journey.intro
  })
  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} />
}

// Soft cloud banks drifting below and beside the path.
export function Clouds() {
  const group = useRef()
  const items = useMemo(() => {
    const r = rng(23)
    const out = []
    const n = env.mobile ? 26 : 60
    const zEnd = stations[N - 1].p.z - 60
    for (let i = 0; i < n; i++) {
      const z = 40 + (zEnd - 40) * (i / n) + (r() - 0.5) * 20
      const sideX = (r() < 0.5 ? -1 : 1) * (14 + r() * 60)
      out.push({ x: sideX, y: -9 - r() * 14 + (r() < 0.18 ? 22 : 0), z, s: 22 + r() * 34, o: 0.1 + r() * 0.16, v: 0.2 + r() * 0.5 })
    }
    return out
  }, [])
  const tex = glowTexture()
  useFrame((state) => {
    if (env.reduced) return
    const t = state.clock.elapsedTime
    group.current.children.forEach((c, i) => {
      c.position.x = items[i].x + Math.sin(t * 0.05 * items[i].v + i) * 6
    })
  })
  return (
    <group ref={group}>
      {items.map((c, i) => (
        <sprite key={i} position={[c.x, c.y, c.z]} scale={[c.s * 1.9, c.s * 0.75, 1]}>
          <spriteMaterial map={tex} color="#9fd4ee" opacity={c.o} transparent depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}
