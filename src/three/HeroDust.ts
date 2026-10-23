import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Clock,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';

/**
 * Partículas de poeira suspensas no feixe de luz do hero (atmosfera, não o veículo).
 * Renderização em WebGL leve: um único draw call, pausa fora da tela, limpeza total no dispose().
 */
export class HeroDust {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new OrthographicCamera(-1, 1, 1, -1, 0, 10);
  private material: ShaderMaterial;
  private geometry: BufferGeometry;
  private clock = new Clock();
  private raf = 0;
  private running = false;
  private resizeObs: ResizeObserver;
  private mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  constructor(private canvas: HTMLCanvasElement, count = 900) {
    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setClearColor(0x000000, 0);

    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      // Concentra partículas no feixe central (distribuição gaussiana aproximada)
      const g = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
      pos[i * 3] = g * 1.6;
      pos[i * 3 + 1] = Math.random() * 2 - 1;
      pos[i * 3 + 2] = Math.random();
      seed[i * 4] = Math.random();
      seed[i * 4 + 1] = Math.random();
      seed[i * 4 + 2] = 0.4 + Math.random() * 1.6;
      seed[i * 4 + 3] = Math.random() < 0.05 ? 1 : 0; // algumas partículas vermelhas
    }
    this.geometry = new BufferGeometry();
    this.geometry.setAttribute('position', new BufferAttribute(pos, 3));
    this.geometry.setAttribute('seed', new BufferAttribute(seed, 4));

    this.material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uMouse: { value: [0, 0] },
        uPixel: { value: this.renderer.getPixelRatio() },
      },
      vertexShader: /* glsl */ `
        attribute vec4 seed;
        uniform float uTime; uniform float uAspect; uniform vec2 uMouse; uniform float uPixel;
        varying float vAlpha; varying float vRed;
        void main() {
          vec3 p = position;
          float t = uTime * 0.035 * seed.z;
          p.y = mod(p.y + 1.0 - t, 2.0) - 1.0;
          p.x += sin(uTime * 0.25 * seed.z + seed.x * 6.283) * 0.03;
          p.xy += uMouse * (0.02 + p.z * 0.05);
          // Cone de luz: mais denso e brilhante perto do topo
          float beam = smoothstep(0.75, 0.0, abs(p.x) / (0.25 + (1.0 - p.y) * 0.32));
          vAlpha = beam * (0.35 + 0.85 * seed.y) * smoothstep(-1.0, -0.4, p.y);
          vRed = seed.w;
          gl_Position = vec4(p.x / uAspect * 1.25, p.y, 0.0, 1.0);
          gl_PointSize = (1.6 + p.z * 3.4) * uPixel;
        }`,
      fragmentShader: /* glsl */ `
        varying float vAlpha; varying float vRed;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d) * vAlpha;
          vec3 c = mix(vec3(0.92, 0.94, 0.96), vec3(1.0, 0.19, 0.28), vRed);
          gl_FragColor = vec4(c * a, a);
        }`,
    });
    this.scene.add(new Points(this.geometry, this.material));

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(canvas);
    this.resize();
  }

  setMouse(x: number, y: number) {
    this.mouse.tx = x;
    this.mouse.ty = y;
  }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.canvas;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.material.uniforms.uAspect.value = w / h / (16 / 9);
    if (!this.running) this.renderer.render(this.scene, this.camera);
  }

  private loop = () => {
    if (!this.running) return;
    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.05;
    this.material.uniforms.uTime.value = this.clock.getElapsedTime();
    this.material.uniforms.uMouse.value = [this.mouse.x, this.mouse.y];
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.loop);
  };

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    this.clock.stop();
    cancelAnimationFrame(this.raf);
  }

  dispose() {
    this.stop();
    this.resizeObs.disconnect();
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
