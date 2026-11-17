import * as THREE from 'three'

// Soft round sprite used for clouds, glows and particles.
let _glow
export function glowTexture() {
  if (_glow) return _glow
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.35, 'rgba(255,255,255,0.45)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  _glow = new THREE.CanvasTexture(c)
  return _glow
}

// Draw onto a canvas and return it as a texture.
export function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

export function labelTexture(text, { color = '#F4F8FF', size = 44, weight = 600, pad = 24 } = {}) {
  const font = `${weight} ${size}px "Sora Variable", Sora, system-ui, sans-serif`
  const m = document.createElement('canvas').getContext('2d')
  m.font = font
  const w = Math.ceil(m.measureText(text).width) + pad * 2
  const h = size + pad * 2
  const tex = canvasTexture(w, h, (g) => {
    g.font = font
    g.textBaseline = 'middle'
    g.textAlign = 'center'
    // dark outline keeps labels readable against a night or a day sky
    g.lineJoin = 'round'
    g.lineWidth = Math.max(4, size * 0.16)
    g.strokeStyle = 'rgba(3,14,26,0.85)'
    g.strokeText(text, w / 2, h / 2 + 2)
    g.fillStyle = color
    g.fillText(text, w / 2, h / 2 + 2)
  })
  tex.userData.aspect = w / h
  return tex
}

export const damp = THREE.MathUtils.damp
export const C = {
  cyan: '#00E5FF',
  teal: '#00BFA6',
  navy: '#071526',
  deep: '#030914',
  text: '#F4F8FF',
}

// Holographic material: fresnel rim + scanlines, additive.
const holos = new Set()
let holoLight = false
// Additive holograms vanish against a bright sky, so by day they switch to a
// tinted-glass look with normal blending.
export function setHoloLight(on) {
  holoLight = on
  for (const m of holos) {
    m.blending = on ? THREE.NormalBlending : THREE.AdditiveBlending
    m.uniforms.uLight.value = on ? 1 : 0
    m.needsUpdate = true
  }
}

export function holoMaterial(color = C.cyan, opacity = 1) {
  const m = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: holoLight ? THREE.NormalBlending : THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uTime: { value: 0 }, uOpacity: { value: opacity }, uLight: { value: holoLight ? 1 : 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      void main(){
        vec4 w = modelMatrix * vec4(position,1.0);
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        vV = normalize(cameraPosition - w.xyz);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uTime; uniform float uOpacity; uniform float uLight;
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      void main(){
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
        float scan = 0.5 + 0.5 * sin(vW.y * 26.0 - uTime * 2.2);
        float a = (0.12 + f * 0.95 + scan * 0.08) * uOpacity;
        vec3 day = uColor * (0.34 + 0.2 * f);
        gl_FragColor = vec4(mix(uColor * (0.5 + f), day, uLight), mix(a, clamp(0.34 + f * 0.6 + scan * 0.06, 0.0, 1.0) * uOpacity, uLight));
      }`,
  })
  holos.add(m)
  return m
}

// Pointer events reach the canvas through the page root, so a click on a
// button or panel also raycasts into the world. Ignore those.
export const fromUI = (e) => !!e.nativeEvent?.target?.closest?.('[data-ui], a, button')
