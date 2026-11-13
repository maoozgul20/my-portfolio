import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { journey, env, useUI } from '../state/store'
import { Atmosphere, Particles, Clouds } from './Atmosphere'
import { CameraRig } from './CameraRig'
import { Explorer } from './Explorer'
import { Terrain } from './Terrain'
import { Castle, JourneyGate, FinalPortal } from './Landmarks'
import { DentoraScene, NoteGPTScene, HealthScene, OdysseyScene } from './scenes/Projects'
import { AboutScene, SkillsScene, ExperienceScene, ResearchScene } from './scenes/Chambers'

// Mount a part of the world only while the journey is close to it, so distant
// environments cost nothing until the visitor approaches.
function Near({ at, range = 1.6, children }) {
  const [on, setOn] = useState(() => Math.abs(journey.t - at) < range)
  useFrame(() => {
    const n = Math.abs(journey.t - at) < range
    if (n !== on) setOn(n)
  })
  return on ? children : null
}

function Ready() {
  const frames = useRef(0)
  useFrame(() => {
    if (++frames.current === 4) useUI.getState().set({ ready: true })
  })
  return null
}

// Stop rendering while the tab is hidden.
function Visibility() {
  const set = useThree((s) => s.setFrameloop)
  useEffect(() => {
    const on = () => set(document.hidden ? 'never' : 'always')
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [set])
  return null
}

export default function World() {
  // ?fx=1 / ?fx=0 forces post-processing on or off
  const forced = new URLSearchParams(location.search).get('fx')
  const [fx, setFx] = useState(forced ? forced === '1' : !env.mobile && !env.reduced)
  const [dpr, setDpr] = useState(env.mobile ? 1.25 : Math.min(window.devicePixelRatio, 1.6))
  return (
    <Canvas
      className="world-canvas"
      flat
      dpr={dpr}
      shadows={!env.mobile}
      gl={{ antialias: !env.mobile, powerPreference: 'high-performance', alpha: false }}
      camera={{ position: [-16, 15, 40], fov: 48, near: 0.3, far: 1400 }}
      eventSource={document.getElementById('root')}
      eventPrefix="client"
      onCreated={({ gl }) => {
        gl.toneMapping = fx ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.15
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          useUI.getState().set({ webgl: false, ready: true })
        })
      }}
    >
      <PerformanceMonitor
        onDecline={() => {
          if (forced === '1') return
          setFx(false)
          setDpr(1)
        }}
      />
      <Ready />
      <Visibility />
      <CameraRig />
      <Atmosphere />
      <Particles />
      <Clouds />
      <Terrain />
      <Explorer />
      <Near at={1} range={3.6}>
        <Castle />
      </Near>
      <Near at={0.5} range={1.8}>
        <JourneyGate />
      </Near>
      <Near at={1}>
        <AboutScene />
      </Near>
      <Near at={2}>
        <DentoraScene />
      </Near>
      <Near at={3}>
        <NoteGPTScene />
      </Near>
      <Near at={4}>
        <HealthScene />
      </Near>
      <Near at={5}>
        <OdysseyScene />
      </Near>
      <Near at={6}>
        <SkillsScene />
      </Near>
      <Near at={7}>
        <ExperienceScene />
      </Near>
      <Near at={8}>
        <ResearchScene />
      </Near>
      <Near at={9} range={2.2}>
        <FinalPortal />
      </Near>
      {fx && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.62} luminanceSmoothing={0.25} radius={0.72} />
          <Vignette eskil={false} offset={0.22} darkness={0.72} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
