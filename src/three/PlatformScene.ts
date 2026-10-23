import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  CircleGeometry,
  Clock,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  Fog,
  Group,
  HemisphereLight,
  InstancedMesh,
  Line,
  LineBasicMaterial,
  LineSegments,
  Material,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
  RepeatWrapping,
  MeshBasicMaterial,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Diagrama 3D da arquitetura conceitual do APEX ONE.
 * Não é um modelo do carro: é uma maquete técnica procedural (plataforma, bateria, motores,
 * circuito térmico e fluxo aerodinâmico sobre um envelope de linhas).
 */

export type LayerId = 'all' | 'structure' | 'battery' | 'motors' | 'thermal' | 'aero';

interface LabelDef {
  layer: Exclude<LayerId, 'all'>;
  text: string;
  anchor: Vector3;
  el?: HTMLDivElement;
}

const RED = new Color('#ff3048');
const SILVER = new Color('#c5c9ce');
const WB = 1.36; // meia distância entre eixos
const TRACK = 0.86; // meia bitola

const CAMERA_PRESETS: Record<LayerId, { pos: [number, number, number]; target: [number, number, number] }> = {
  all: { pos: [4.6, 2.4, 4.8], target: [0, 0.45, 0] },
  structure: { pos: [3.8, 2.9, 3.6], target: [0, 0.4, 0] },
  battery: { pos: [1.8, 3.6, 2.6], target: [0, 0.2, 0] },
  motors: { pos: [3.6, 1.2, 3.2], target: [0.6, 0.3, 0] },
  thermal: { pos: [-1.2, 3.8, 3.4], target: [0, 0.3, 0] },
  aero: { pos: [5.4, 1.6, 2.2], target: [0, 0.6, 0] },
};

function carbonTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  g.fillStyle = '#121316';
  g.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const on = (x + y) % 4 < 2;
      g.fillStyle = on ? '#2e3136' : '#1a1c20';
      g.fillRect(x * 8, y * 8, 8, 8);
      g.fillStyle = 'rgba(255,255,255,0.05)';
      g.fillRect(x * 8, y * 8, 8, on ? 2 : 1);
    }
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(6, 4);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function radialTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, 'rgba(255,48,72,0.22)');
  grd.addColorStop(0.35, 'rgba(197,201,206,0.06)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  return new CanvasTexture(c);
}

/** Material de linha com traços que percorrem a curva (fluxo). */
function flowMaterial(colorA: Color, colorB: Color, speed: number, dash = 10): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uA: { value: colorA }, uB: { value: colorB }, uSpeed: { value: speed }, uDash: { value: dash } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uOpacity; uniform vec3 uA; uniform vec3 uB; uniform float uSpeed; uniform float uDash;
      varying vec2 vUv;
      void main(){
        float d = fract(vUv.x * uDash - uTime * uSpeed);
        float a = smoothstep(0.0, 0.15, d) * smoothstep(0.75, 0.35, d);
        vec3 c = mix(uA, uB, vUv.x);
        gl_FragColor = vec4(c * (0.35 + a), (0.18 + a * 0.82) * uOpacity);
      }`,
  });
}

/** Perfil lateral conceitual: altura do teto e meia-largura do envelope ao longo do comprimento. */
function envelope(x: number) {
  // x de -2.3 (traseira) a 2.3 (frente)
  const t = (x + 2.3) / 4.6;
  const roof = 0.42 + 0.72 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.92)), 1.6) * (t < 0.5 ? 1 : 0.92 + 0.08 * (1 - t));
  const top = x > 1.2 ? 0.42 + (roof - 0.42) * Math.max(0, 1 - (x - 1.2) / 1.35) : Math.max(roof, 0.68 - Math.max(0, -x - 1.6) * 0.3);
  const half = 0.98 - 0.22 * Math.pow(Math.abs(x) / 2.3, 3);
  return { top: Math.max(top, 0.42), half };
}

export class PlatformScene {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(32, 1, 0.1, 60);
  private controls: OrbitControls;
  private clock = new Clock();
  private raf = 0;
  private running = false;
  private layers: Record<Exclude<LayerId, 'all'>, Group>;
  private layerOpacity: Record<string, number> = {};
  private active: LayerId = 'all';
  private exploded = 0;
  private explodedTarget = 0;
  private flowMats: ShaderMaterial[] = [];
  private wheels: Object3D[] = [];
  private camGoal = { pos: new Vector3(), target: new Vector3() };
  private camAnimating = true;
  private labels: LabelDef[] = [];
  private resizeObs: ResizeObserver;
  private disposables: { dispose: () => void }[] = [];
  private pmrem: PMREMGenerator;
  // Qualidade adaptativa: reduz resolução e depois a animação contínua em dispositivos lentos
  private dpr: number;
  private frameEma = 1 / 60;
  private frameCount = 0;
  private lowPower = false;
  private parts: { battery: Group; motors: Group[]; envelope: Group } = { battery: new Group(), motors: [], envelope: new Group() };

  constructor(
    private canvas: HTMLCanvasElement,
    private labelLayer: HTMLElement,
    private opts: { reducedMotion: boolean; onInteract?: () => void },
  ) {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.dpr = dpr;
    this.renderer = new WebGLRenderer({ canvas, antialias: dpr < 1.5, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(dpr);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setClearColor('#070809');

    this.scene.fog = new Fog('#070809', 7, 16);
    this.pmrem = new PMREMGenerator(this.renderer);
    const env = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = env;
    this.disposables.push(env);

    this.scene.add(new HemisphereLight('#c5c9ce', '#070809', 0.6));
    const key = new DirectionalLight('#ffffff', 1.6);
    key.position.set(3, 5, 2);
    this.scene.add(key);
    const rim = new DirectionalLight('#ff3048', 1.2);
    rim.position.set(-4, 1.5, -3);
    this.scene.add(rim);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enableZoom = false; // não sequestra a rolagem da página
    this.controls.enablePan = false;
    this.controls.minPolarAngle = 0.25;
    this.controls.maxPolarAngle = 1.45;
    this.controls.autoRotate = !opts.reducedMotion;
    this.controls.autoRotateSpeed = 0.55;
    this.controls.addEventListener('start', () => {
      this.camAnimating = false;
      this.controls.autoRotate = false;
      opts.onInteract?.();
      this.kick();
    });
    this.controls.addEventListener('change', () => this.kick());

    this.layers = {
      structure: new Group(),
      battery: new Group(),
      motors: new Group(),
      thermal: new Group(),
      aero: new Group(),
    };
    for (const [k, g] of Object.entries(this.layers)) {
      g.name = k;
      this.layerOpacity[k] = 1;
      this.scene.add(g);
    }

    this.buildFloor();
    this.buildStructure();
    this.buildBattery();
    this.buildMotorsAndWheels();
    this.buildThermal();
    this.buildAero();
    this.buildLabels();

    const p = CAMERA_PRESETS.all;
    this.camera.position.set(p.pos[0] + 1.6, p.pos[1] + 0.8, p.pos[2] + 1.8);
    this.controls.target.set(...p.target);
    this.camGoal.pos.set(...p.pos);
    this.camGoal.target.set(...p.target);
    if (opts.reducedMotion) {
      this.camera.position.copy(this.camGoal.pos);
      this.camAnimating = false;
    }

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(canvas);
    this.resize();
    if (import.meta.env.DEV) (window as unknown as { __apexPlatform: unknown }).__apexPlatform = this;
  }

  /* ---------- Construção ---------- */

  private mat<T extends Material>(m: T): T {
    m.transparent = true;
    this.disposables.push(m);
    return m;
  }
  private geo<T extends BufferGeometry>(g: T): T {
    this.disposables.push(g);
    return g;
  }

  private buildFloor() {
    const tex = radialTexture();
    this.disposables.push(tex);
    const glow = new Mesh(this.geo(new PlaneGeometry(9, 9)), this.mat(new MeshBasicMaterial({ map: tex, depthWrite: false })));
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.001;
    this.scene.add(glow);

    // Grade técnica
    const pts: number[] = [];
    for (let i = -10; i <= 10; i++) {
      pts.push(i * 0.5, 0, -5, i * 0.5, 0, 5, -5, 0, i * 0.5, 5, 0, i * 0.5);
    }
    const g = this.geo(new BufferGeometry());
    g.setAttribute('position', new Float32BufferAttribute(pts, 3));
    const grid = new LineSegments(g, this.mat(new LineBasicMaterial({ color: '#242930', opacity: 0.55 })));
    this.scene.add(grid);
  }

  private buildStructure() {
    const g = this.layers.structure;
    const carbon = carbonTexture();
    this.disposables.push(carbon);
    // Assoalho / monocoque
    const tub = new Mesh(
      this.geo(new BoxGeometry(3.4, 0.08, 1.5)),
      this.mat(new MeshStandardMaterial({ map: carbon, color: '#ffffff', metalness: 0.4, roughness: 0.35, envMapIntensity: 0.9 })),
    );
    tub.position.y = 0.16;
    g.add(tub);
    // Arestas do habitáculo
    const cell = new BoxGeometry(1.5, 0.62, 1.3);
    const edges = new LineSegments(this.geo(new EdgesGeometry(cell)), this.mat(new LineBasicMaterial({ color: SILVER, opacity: 0.7 })));
    cell.dispose();
    edges.position.set(-0.05, 0.52, 0);
    g.add(edges);
    // Arco de proteção
    const hoop = new Mesh(this.geo(new TorusGeometry(0.62, 0.025, 8, 48, Math.PI)), this.mat(new MeshStandardMaterial({ color: '#c5c9ce', metalness: 1, roughness: 0.25 })));
    hoop.position.set(-0.55, 0.5, 0);
    hoop.rotation.y = Math.PI / 2;
    g.add(hoop);
    // Subchassis
    for (const x of [-1.55, 1.55]) {
      const frame = new BoxGeometry(0.9, 0.22, 1.1);
      const f = new LineSegments(this.geo(new EdgesGeometry(frame)), this.mat(new LineBasicMaterial({ color: SILVER, opacity: 0.45 })));
      frame.dispose();
      f.position.set(x * 0.98, 0.3, 0);
      g.add(f);
    }

    // Envelope da carroceria (linhas) — pertence à aerodinâmica visualmente, mas move-se na vista explodida
    const env = this.parts.envelope;
    const lineMat = this.mat(new LineBasicMaterial({ color: SILVER, opacity: 0.32 }));
    const ribs = 17;
    for (let i = 0; i < ribs; i++) {
      const x = -2.2 + (4.4 * i) / (ribs - 1);
      const { top, half } = envelope(x);
      const pts: Vector3[] = [];
      for (let k = 0; k <= 28; k++) {
        const a = (Math.PI * k) / 28; // 0..π (de um lado ao outro pelo topo)
        const s = Math.sin(a);
        const c = Math.cos(a);
        const z = Math.sign(c) * Math.pow(Math.abs(c), 0.55) * half;
        const y = 0.2 + Math.pow(s, 0.7) * (top - 0.2);
        pts.push(new Vector3(x, y, z));
      }
      env.add(new Line(this.geo(new BufferGeometry().setFromPoints(pts)), lineMat));
    }
    // Linhas longitudinais (assinatura de luz vermelha nas laterais e linha do teto)
    const redMat = this.mat(new LineBasicMaterial({ color: RED, opacity: 0.95 }));
    for (const side of [-1, 1]) {
      const pts: Vector3[] = [];
      for (let k = 0; k <= 60; k++) {
        const x = -2.25 + (4.5 * k) / 60;
        const { half, top } = envelope(x);
        pts.push(new Vector3(x, 0.36 + (top - 0.42) * 0.38, side * half * 0.99));
      }
      env.add(new Line(this.geo(new BufferGeometry().setFromPoints(new CatmullRomCurve3(pts).getPoints(120))), redMat));
    }
    const roofPts: Vector3[] = [];
    for (let k = 0; k <= 60; k++) {
      const x = -2.25 + (4.5 * k) / 60;
      roofPts.push(new Vector3(x, envelope(x).top, 0));
    }
    env.add(new Line(this.geo(new BufferGeometry().setFromPoints(roofPts)), this.mat(new LineBasicMaterial({ color: SILVER, opacity: 0.6 }))));
    this.layers.aero.add(env);
  }

  private buildBattery() {
    const g = this.parts.battery;
    const tray = new Mesh(this.geo(new BoxGeometry(2.1, 0.12, 1.24)), this.mat(new MeshStandardMaterial({ color: '#1a1d22', metalness: 0.9, roughness: 0.3 })));
    g.add(tray);
    const cols = 10;
    const rows = 4;
    const cellGeo = this.geo(new BoxGeometry(0.18, 0.07, 0.27));
    const cellMat = this.mat(new MeshStandardMaterial({ color: '#2a2e35', metalness: 0.8, roughness: 0.25, emissive: RED, emissiveIntensity: 0.12 }));
    const inst = new InstancedMesh(cellGeo, cellMat, cols * rows);
    const o = new Object3D();
    let n = 0;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        o.position.set(-0.94 + i * 0.209, 0.09, -0.45 + j * 0.3);
        o.updateMatrix();
        inst.setMatrixAt(n++, o.matrix);
      }
    }
    g.add(inst);
    const outline = new BoxGeometry(2.12, 0.14, 1.26);
    const e = new LineSegments(this.geo(new EdgesGeometry(outline)), this.mat(new LineBasicMaterial({ color: RED, opacity: 0.85 })));
    outline.dispose();
    g.add(e);
    g.position.y = 0.27;
    this.layers.battery.add(g);
  }

  private buildMotorsAndWheels() {
    const motorMat = this.mat(new MeshStandardMaterial({ color: '#9aa0a8', metalness: 1, roughness: 0.22 }));
    const ringMat = this.mat(new MeshStandardMaterial({ color: '#000', emissive: RED, emissiveIntensity: 2.2 }));
    const tireMat = this.mat(new MeshStandardMaterial({ color: '#0d0e10', roughness: 0.85, metalness: 0 }));
    const rimMat = this.mat(new MeshStandardMaterial({ color: '#3a3e45', metalness: 1, roughness: 0.3 }));
    const motorGeo = this.geo(new CylinderGeometry(0.17, 0.17, 0.32, 32));
    const ringGeo = this.geo(new TorusGeometry(0.172, 0.012, 8, 40));
    const tireGeo = this.geo(new TorusGeometry(0.31, 0.105, 16, 48));
    const rimGeo = this.geo(new CylinderGeometry(0.25, 0.25, 0.2, 40, 1, true));
    const spokeGeo = this.geo(new BoxGeometry(0.035, 0.46, 0.03));

    for (const x of [-WB, WB]) {
      for (const z of [-TRACK, TRACK]) {
        const motor = new Group();
        const body = new Mesh(motorGeo, motorMat);
        body.rotation.x = Math.PI / 2;
        motor.add(body);
        for (const dz of [-0.13, 0.13]) {
          const ring = new Mesh(ringGeo, ringMat);
          ring.position.z = dz;
          motor.add(ring);
        }
        motor.position.set(x, 0.34, z * 0.62);
        motor.userData.baseZ = z * 0.62;
        this.parts.motors.push(motor);
        this.layers.motors.add(motor);

        const wheel = new Group();
        wheel.add(new Mesh(tireGeo, tireMat));
        const rim = new Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        wheel.add(rim);
        const spokes = new Group();
        for (let s = 0; s < 5; s++) {
          const sp = new Mesh(spokeGeo, rimMat);
          sp.rotation.z = (s * Math.PI * 2) / 5;
          sp.position.z = z > 0 ? 0.06 : -0.06;
          spokes.add(sp);
        }
        wheel.add(spokes);
        wheel.position.set(x, 0.41, z);
        this.wheels.push(spokes);
        this.layers.structure.add(wheel);
      }
    }
    // Barramento de alta tensão (bateria → motores)
    const hv = flowMaterial(RED, new Color('#ffb0ba'), 0.5, 6);
    this.flowMats.push(hv);
    this.disposables.push(hv);
    for (const x of [-WB, WB]) {
      const curve = new CatmullRomCurve3([new Vector3(x * 0.72, 0.3, -0.5), new Vector3(x * 0.92, 0.34, 0), new Vector3(x * 0.72, 0.3, 0.5)]);
      const tube = new Mesh(this.geo(new TubeGeometry(curve, 40, 0.018, 6)), hv);
      this.layers.motors.add(tube);
    }
  }

  private buildThermal() {
    const hot = flowMaterial(new Color('#c5c9ce'), RED, 0.35, 14);
    this.flowMats.push(hot);
    this.disposables.push(hot);
    const loop = new CatmullRomCurve3(
      [
        new Vector3(2.05, 0.35, -0.6),
        new Vector3(1.3, 0.24, -0.66),
        new Vector3(0.5, 0.24, -0.66),
        new Vector3(-0.5, 0.24, -0.66),
        new Vector3(-1.35, 0.32, -0.55),
        new Vector3(-1.6, 0.4, 0),
        new Vector3(-1.35, 0.32, 0.55),
        new Vector3(-0.5, 0.24, 0.66),
        new Vector3(0.5, 0.24, 0.66),
        new Vector3(1.3, 0.24, 0.66),
        new Vector3(2.05, 0.35, 0.6),
        new Vector3(2.15, 0.4, 0),
      ],
      true,
    );
    this.layers.thermal.add(new Mesh(this.geo(new TubeGeometry(loop, 220, 0.03, 8, true)), hot));
    // Radiadores dianteiros
    for (const z of [-0.5, 0.5]) {
      const radGeo = new BoxGeometry(0.06, 0.26, 0.42);
      const rad = new LineSegments(this.geo(new EdgesGeometry(radGeo)), this.mat(new LineBasicMaterial({ color: SILVER, opacity: 0.9 })));
      radGeo.dispose();
      rad.position.set(2.0, 0.42, z);
      rad.rotation.z = -0.35;
      this.layers.thermal.add(rad);
      const fin = new Mesh(this.geo(new PlaneGeometry(0.26, 0.42)), this.mat(new MeshBasicMaterial({ color: '#c5c9ce', opacity: 0.12, side: DoubleSide, depthWrite: false })));
      fin.position.copy(rad.position);
      fin.rotation.set(0, Math.PI / 2, -0.35);
      this.layers.thermal.add(fin);
    }
  }

  private buildAero() {
    const n = 22;
    for (let i = 0; i < n; i++) {
      const z = -1.05 + (2.1 * i) / (n - 1);
      const lift = 0.06 + (i % 3) * 0.05;
      const pts: Vector3[] = [];
      for (let k = 0; k <= 40; k++) {
        const x = 3.4 - (6.8 * k) / 40;
        let y: number;
        if (x > 2.3) y = 0.45 + (x - 2.3) * 0.05;
        else if (x < -2.3) y = envelope(-2.3).top + lift + (x + 2.3) * -0.12;
        else {
          const { top, half } = envelope(x);
          const zf = Math.min(Math.abs(z) / half, 1);
          y = 0.2 + (top - 0.2) * Math.sqrt(Math.max(0, 1 - zf * zf * 0.92)) + lift;
        }
        pts.push(new Vector3(x, y, z * (1 + Math.max(0, -x - 2) * 0.05)));
      }
      const curve = new CatmullRomCurve3(pts);
      const m = flowMaterial(new Color('#f4f5f6'), i % 5 === 2 ? RED : SILVER, 0.22 + (i % 4) * 0.04, 3);
      this.flowMats.push(m);
      this.disposables.push(m);
      this.layers.aero.add(new Mesh(this.geo(new TubeGeometry(curve, 80, 0.006, 4)), m));
    }
    // Esteira traseira (difusor)
    const disc = new Mesh(this.geo(new CircleGeometry(0.5, 32)), this.mat(new MeshBasicMaterial({ color: RED, opacity: 0.08, depthWrite: false, side: DoubleSide })));
    disc.position.set(-2.45, 0.35, 0);
    disc.rotation.y = Math.PI / 2;
    this.layers.aero.add(disc);
  }

  private buildLabels() {
    const defs: Omit<LabelDef, 'el'>[] = [
      { layer: 'structure', text: 'Monocoque em carbono', anchor: new Vector3(-0.2, 0.84, 0.66) },
      { layer: 'structure', text: 'Arco de proteção', anchor: new Vector3(-0.55, 1.12, 0) },
      { layer: 'battery', text: 'Bateria estrutural · 118 kWh*', anchor: new Vector3(0.3, 0.36, 0.62) },
      { layer: 'motors', text: 'Motor dianteiro', anchor: new Vector3(WB, 0.52, TRACK * 0.62) },
      { layer: 'motors', text: 'Motor traseiro', anchor: new Vector3(-WB, 0.52, TRACK * 0.62) },
      { layer: 'thermal', text: 'Radiadores dianteiros', anchor: new Vector3(2.0, 0.62, 0.5) },
      { layer: 'thermal', text: 'Circuito de arrefecimento', anchor: new Vector3(-1.5, 0.42, 0.4) },
      { layer: 'aero', text: 'Fluxo sobre o envelope', anchor: new Vector3(0.2, 1.25, 0) },
      { layer: 'aero', text: 'Esteira do difusor', anchor: new Vector3(-2.45, 0.6, 0) },
    ];
    for (const d of defs) {
      const el = document.createElement('div');
      el.className = 'pointer-events-none absolute left-0 top-0 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] text-paper transition-opacity duration-500';
      el.innerHTML = `<span class="mr-2 inline-block h-1.5 w-1.5 rotate-45 bg-volt align-middle"></span>${d.text}`;
      el.style.opacity = '0';
      el.setAttribute('aria-hidden', 'true');
      this.labelLayer.appendChild(el);
      this.labels.push({ ...d, el });
    }
  }

  /* ---------- Estado ---------- */

  /** Afasta a câmera proporcionalmente em telas estreitas/verticais. */
  private distanceFactor() {
    const a = this.camera.aspect || 1.6;
    return a < 0.8 ? 1.75 : a < 1.2 ? 1.35 : a < 1.5 ? 1.12 : 1;
  }

  private setGoal(layer: LayerId) {
    const p = CAMERA_PRESETS[layer];
    const k = this.distanceFactor();
    this.camGoal.target.set(...p.target);
    this.camGoal.pos.set(...p.pos).sub(this.camGoal.target).multiplyScalar(k).add(this.camGoal.target);
  }

  setLayer(layer: LayerId) {
    this.active = layer;
    this.setGoal(layer);
    this.camAnimating = true;
    this.controls.autoRotate = false;
    if (this.opts.reducedMotion) {
      this.camera.position.copy(this.camGoal.pos);
      this.controls.target.copy(this.camGoal.target);
      this.camAnimating = false;
    }
    this.kick();
  }

  setExploded(on: boolean) {
    this.explodedTarget = on ? 1 : 0;
    if (this.opts.reducedMotion) this.exploded = this.explodedTarget;
    this.kick();
  }

  /* ---------- Ciclo de renderização ---------- */

  private resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Afasta a câmera em telas estreitas para manter o conjunto visível
    this.camera.fov = w / h < 1 ? 40 : w / h < 1.4 ? 36 : 32;
    this.camera.updateProjectionMatrix();
    if (this.camAnimating) this.setGoal(this.active);
    this.kick();
  }

  private applyOpacity(dt: number) {
    let changing = false;
    for (const [k, g] of Object.entries(this.layers)) {
      const target = this.active === 'all' || this.active === k ? 1 : 0.1;
      const cur = this.layerOpacity[k];
      const next = this.opts.reducedMotion ? target : MathUtils.damp(cur, target, 6, dt);
      if (Math.abs(next - target) > 0.002) changing = true;
      this.layerOpacity[k] = next;
      g.traverse((o) => {
        const m = (o as Mesh).material as Material | Material[] | undefined;
        if (!m) return;
        for (const mm of Array.isArray(m) ? m : [m]) {
          if (!mm.userData.baseOpacity) mm.userData.baseOpacity = (mm as Material & { opacity: number }).opacity ?? 1;
          if (mm instanceof ShaderMaterial) mm.uniforms.uOpacity.value = next;
          else mm.opacity = mm.userData.baseOpacity * next;
        }
      });
    }
    return changing;
  }

  private updateLabels() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    const v = new Vector3();
    for (const l of this.labels) {
      if (!l.el) continue;
      const show = this.active === l.layer || (this.active === 'all' && (l.layer === 'battery' || l.layer === 'aero'));
      v.copy(l.anchor);
      if (l.layer === 'battery') v.y -= this.exploded * 0.45;
      if (l.layer === 'aero' && l.text.startsWith('Fluxo')) v.y += this.exploded * 0.35;
      v.project(this.camera);
      const visible = show && v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
      l.el.style.opacity = visible ? '1' : '0';
      const x = (v.x * 0.5 + 0.5) * w;
      const y = (-v.y * 0.5 + 0.5) * h;
      const flip = x > w * 0.62;
      l.el.style.transform = `translate(${x}px, ${y}px) translate(${flip ? '-100%' : '0'}, -50%)`;
    }
  }

  private kick() {
    if (this.running && !this.raf) this.raf = requestAnimationFrame(this.loop);
  }

  private loop = () => {
    this.raf = 0;
    if (!this.running) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    let active = !this.opts.reducedMotion && !this.lowPower; // fluxo animado mantém o loop ativo
    this.adapt(dt);

    if (this.camAnimating) {
      this.camera.position.x = MathUtils.damp(this.camera.position.x, this.camGoal.pos.x, 3, dt);
      this.camera.position.y = MathUtils.damp(this.camera.position.y, this.camGoal.pos.y, 3, dt);
      this.camera.position.z = MathUtils.damp(this.camera.position.z, this.camGoal.pos.z, 3, dt);
      this.controls.target.lerp(this.camGoal.target, 1 - Math.exp(-3 * dt));
      if (this.camera.position.distanceTo(this.camGoal.pos) < 0.01) this.camAnimating = false;
      active = true;
    }
    if (Math.abs(this.exploded - this.explodedTarget) > 0.001) {
      this.exploded = MathUtils.damp(this.exploded, this.explodedTarget, 5, dt);
      active = true;
    }
    this.parts.battery.position.y = 0.27 - this.exploded * 0.45;
    for (const m of this.parts.motors) m.position.z = m.userData.baseZ * (1 + this.exploded * 0.55);
    this.parts.envelope.position.y = this.exploded * 0.35;

    if (this.applyOpacity(dt)) active = true;
    if (!this.opts.reducedMotion && !this.lowPower) {
      for (const m of this.flowMats) m.uniforms.uTime.value = t;
      for (const w of this.wheels) w.rotation.z = -t * 1.4;
    }
    if (this.controls.update(dt)) active = true;
    this.renderer.render(this.scene, this.camera);
    this.updateLabels();
    if ((active || this.controls.autoRotate) && !this.raf) this.raf = requestAnimationFrame(this.loop);
  };

  private adapt(dt: number) {
    if (dt <= 0 || this.lowPower) return;
    this.frameEma += (dt - this.frameEma) * 0.1;
    if (++this.frameCount % 45 !== 0 || this.frameEma < 1 / 28) return;
    if (this.dpr > 0.75) {
      this.dpr = Math.max(0.75, this.dpr * 0.75);
      this.renderer.setPixelRatio(this.dpr);
      this.resize();
    } else {
      this.lowPower = true; // mantém interação, mas desliga o fluxo animado contínuo
      this.controls.autoRotate = false;
    }
    this.frameEma = 1 / 60;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.kick();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  dispose() {
    this.stop();
    this.resizeObs.disconnect();
    this.controls.dispose();
    this.scene.traverse((o) => {
      const mesh = o as Mesh;
      mesh.geometry?.dispose?.();
      const m = mesh.material as Material | Material[] | undefined;
      if (m) for (const mm of Array.isArray(m) ? m : [m]) {
        for (const v of Object.values(mm)) if (v instanceof Texture) v.dispose();
        mm.dispose();
      }
    });
    for (const d of this.disposables) d.dispose();
    this.pmrem.dispose();
    for (const l of this.labels) l.el?.remove();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

