/* ============================================================
   AURA · TOTEM V2 · Modelo 3D (Three.js UMD)
   Peças individuais (A1..F5) com tooltip via raycaster.
   Lê PRINCIPAL/IMPRESSORA/ESTRUTURA + PECAS_PRINCIPAL/IMPRESSORA do window.
   ============================================================ */

const OrbitControls = THREE.OrbitControls;

let scene, camera, renderer, controls;
let principalGroup, impressoraGroup;
let raycaster, mouse;
const pieces = [];     // meshes alvo do raycaster (com userData)
const leds = [];
const tubos = [];
const madeira = [];
let isExploded = false;
let initialized = false;
let tooltip, legend, containerEl;

const COLORS = {
  base: 0xD4C5B2,
  baseEdge: 0xC4B5A0,
  madeira: 0xC4A882,
  tela: 0x0d1224,
  led: 0xFFEAA7,
  ledHot: 0xffd97a,
  tubo: 0x3D352A,
  porta: 0xb8956a,
  ground: 0xe8e2d6,
  bg: 0x2a2620,
  haste: 0xa89178
};

/* ============== UTILS ============== */

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color, roughness: opts.roughness ?? 0.7, metalness: opts.metalness ?? 0.05, ...opts
  });
}

function emissiveMat(color = COLORS.ledHot, intensity = 1.0) {
  return new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: intensity, roughness: 0.45
  });
}

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function stadium(w, h) {
  const r = w / 2;
  const yTop = h / 2 - r;
  const yBot = -h / 2 + r;
  const s = new THREE.Shape();
  s.moveTo(r, yBot);
  s.lineTo(r, yTop);
  s.absarc(0, yTop, r, 0, Math.PI, false);
  s.lineTo(-r, yBot);
  s.absarc(0, yBot, r, Math.PI, 2 * Math.PI, false);
  return s;
}

function findPeca(cod) {
  const all = [...(window.PECAS_PRINCIPAL || []), ...(window.PECAS_IMPRESSORA || [])];
  return all.find(p => p.cod === cod);
}

function pcInfo(cod, extras = {}) {
  const p = findPeca(cod);
  if (p) {
    return {
      cod: p.cod, nome: p.nome, mat: p.mat,
      l: p.l, a: p.a, qtd: p.qtd, obs: p.obs,
      ...extras
    };
  }
  return { cod, ...extras };
}

function piece(geometry, material, info, opts = {}) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = opts.castShadow !== false;
  mesh.receiveShadow = opts.receiveShadow !== false;
  mesh.userData = info || {};
  if (info && info.cod) pieces.push(mesh);
  return mesh;
}

/* ============== INIT ============== */

function initThree() {
  if (initialized) return;
  containerEl = document.getElementById('three-container');
  if (!containerEl || !window.PRINCIPAL) return;
  initialized = true;

  tooltip = document.getElementById('three-tooltip');
  legend  = document.getElementById('three-legend');

  const w = containerEl.clientWidth;
  const h = containerEl.clientHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.bg);
  scene.fog = new THREE.Fog(COLORS.bg, 4000, 11000);

  camera = new THREE.PerspectiveCamera(35, w / h, 10, 18000);
  camera.position.set(1900, 1400, 2900);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if (THREE.SRGBColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;
  else if (THREE.sRGBEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
  containerEl.appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0xfff4e0, 0.55));
  const sun = new THREE.DirectionalLight(0xffffff, 1.15);
  sun.position.set(1500, 2800, 1800);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -2200, right: 2200, top: 2800, bottom: -300, near: 100, far: 7000 });
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xb8a98c, 0.35);
  fill.position.set(-1800, 900, -1200);
  scene.add(fill);

  // Ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), mat(COLORS.ground, { roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 850, 0);
  controls.minDistance = 600;
  controls.maxDistance = 7000;
  controls.maxPolarAngle = Math.PI * 0.495;

  // Raycaster
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  renderer.domElement.addEventListener('mousemove', onMouseMove);
  renderer.domElement.addEventListener('mouseleave', hideTooltip);

  buildPrincipal();
  buildImpressora();

  setupToolbar();
  window.addEventListener('resize', onResize);
  animate();
}

/* ============== MÓDULO PRINCIPAL ============== */

function buildPrincipal() {
  const T = window.PRINCIPAL;
  const group = new THREE.Group();

  const bege = mat(COLORS.base, { roughness: 0.55 });
  const begeEdge = mat(COLORS.baseEdge, { roughness: 0.6 });
  const hasteMat = mat(COLORS.haste, { roughness: 0.6 });
  const peleMat = mat(COLORS.base, { roughness: 0.5, side: THREE.DoubleSide });
  const tuboMat = mat(COLORS.tubo, { roughness: 0.6, metalness: 0.75 });
  const madeiraMat = mat(COLORS.madeira, { roughness: 0.4 });

  // Coletores para grupos lógicos (explodir/filtrar)
  const cabecaItems = [];
  const colunaItems = [];
  const baseItems   = [];

  /* === BASE QUADRADA 400×60×400 R80 === */
  // A1 tampo 18mm
  const a1 = piece(
    new THREE.ExtrudeGeometry(roundedRect(T.base.lado, T.base.lado, T.base.raio_cantos), { depth: 18, bevelEnabled: false }),
    bege, pcInfo('A1')
  );
  a1.rotation.x = -Math.PI / 2;
  a1.position.y = 60;
  group.add(a1); baseItems.push(a1);

  // A2 fundo 18mm
  const a2 = piece(
    new THREE.ExtrudeGeometry(roundedRect(T.base.lado, T.base.lado, T.base.raio_cantos), { depth: 18, bevelEnabled: false }),
    bege, pcInfo('A2')
  );
  a2.rotation.x = -Math.PI / 2;
  a2.position.y = 18;
  group.add(a2); baseItems.push(a2);

  // A3a longas (×2): 370 × 24 × 15 ao longo de X (frente/trás)
  for (let i = 0; i < 2; i++) {
    const w = piece(new THREE.BoxGeometry(370, 24, 15), begeEdge, pcInfo('A3a'));
    w.position.set(0, 30, i === 0 ? 192.5 : -192.5);
    group.add(w); baseItems.push(w);
  }
  // A3b curtas (×2): 15 × 24 × 340 ao longo de Z (esquerda/direita), entre as longas
  for (let i = 0; i < 2; i++) {
    const w = piece(new THREE.BoxGeometry(15, 24, 340), begeEdge, pcInfo('A3b'));
    w.position.set(i === 0 ? 192.5 : -192.5, 30, 0);
    group.add(w); baseItems.push(w);
  }

  /* === COLUNA 120×990×130 === */
  const colY = T.coluna.y_inicio + T.coluna.altura / 2;

  // B1 frontal 120 × altura × 15 — em z = +57.5
  const b1 = piece(new THREE.BoxGeometry(120, T.coluna.altura, 15), bege, pcInfo('B1'));
  b1.position.set(0, colY, 57.5);
  group.add(b1); colunaItems.push(b1);

  // B1-L lâmina madeira 120 × altura × 1 (na frente de B1)
  const b1l = piece(new THREE.BoxGeometry(120, T.coluna.altura, 1), madeiraMat, pcInfo('B1-L'));
  b1l.position.set(0, colY, 65.5);
  madeira.push(b1l);
  group.add(b1l); colunaItems.push(b1l);

  // B2 traseiro 120 × altura × 15
  const b2 = piece(new THREE.BoxGeometry(120, T.coluna.altura, 15), bege, pcInfo('B2'));
  b2.position.set(0, colY, -57.5);
  group.add(b2); colunaItems.push(b2);

  // B3 laterais (×2): 15 × altura × 100, x = ±52.5
  for (let i = 0; i < 2; i++) {
    const b3 = piece(new THREE.BoxGeometry(15, T.coluna.altura, 100), bege, pcInfo('B3'));
    b3.position.set(i === 0 ? -52.5 : 52.5, colY, 0);
    group.add(b3); colunaItems.push(b3);
  }

  // LED vertical coluna
  const ledCol = new THREE.Mesh(
    new THREE.BoxGeometry(8, T.coluna.altura - 40, 1.5),
    emissiveMat(COLORS.ledHot, 0.95)
  );
  ledCol.position.set(0, colY, 66.3);
  ledCol.userData = { cod: 'LED-Col', nome: 'LED vertical da coluna', mat: 'Fita LED COB 24V 3000K', l: T.coluna.altura, a: 8 };
  pieces.push(ledCol); leds.push(ledCol);
  group.add(ledCol); colunaItems.push(ledCol);

  /* === CABEÇA stadium 320×550×180 === */
  const cabY = T.cabeca.y_inicio + T.cabeca.altura / 2;
  const cabFront = T.cabeca.profundidade / 2;  // +90

  // C1 frontal stadium 18mm
  const c1 = piece(
    new THREE.ExtrudeGeometry(stadium(T.cabeca.largura, T.cabeca.altura), { depth: 18, bevelEnabled: false }),
    bege, pcInfo('C1')
  );
  c1.position.set(0, cabY, cabFront - 18);
  group.add(c1); cabecaItems.push(c1);

  // C2 traseiro stadium 15mm
  const c2 = piece(
    new THREE.ExtrudeGeometry(stadium(T.cabeca.largura, T.cabeca.altura), { depth: 15, bevelEnabled: false }),
    bege, pcInfo('C2')
  );
  c2.position.set(0, cabY, -cabFront);
  group.add(c2); cabecaItems.push(c2);

  // Hastes H1-H5 (15 × 40 × hLen onde hLen = 180-18-15 = 147; tooltip mostra 144)
  const hLen = T.cabeca.profundidade - 18 - 15;
  const hX = T.cabeca.largura / 2 - 30; // 130
  const hY1 = cabY;
  const hY2 = T.cabeca.y_inicio + 70;
  const hY3 = T.cabeca.y_fim - 70;
  const hConfigs = [
    { cod: 'H1', pos: [-hX, hY1, 0] },
    { cod: 'H2', pos: [ hX, hY1, 0] },
    { cod: 'H3', pos: [-hX, hY2, 0] },
    { cod: 'H4', pos: [ hX, hY2, 0] },
    { cod: 'H5', pos: [ 0,  hY3, 0] }
  ];
  hConfigs.forEach(c => {
    const h = piece(new THREE.BoxGeometry(15, 40, hLen), hasteMat, pcInfo(c.cod));
    h.position.set(...c.pos);
    group.add(h); cabecaItems.push(h);
  });

  /* C3-P pele lateral (aproximada por 2 caps + 2 paredes) — toda com mesma userData */
  // Cap superior — semicírculo apontando para +Y após rotation.x = PI/2
  const capTop = piece(
    new THREE.CylinderGeometry(T.cabeca.largura / 2, T.cabeca.largura / 2, T.cabeca.profundidade, 48, 1, true, Math.PI, Math.PI),
    peleMat, pcInfo('C3-P')
  );
  capTop.rotation.x = Math.PI / 2;
  capTop.position.set(0, T.cabeca.y_fim - T.cabeca.largura / 2, 0);
  group.add(capTop); cabecaItems.push(capTop);

  // Cap inferior — semicírculo apontando para -Y
  const capBot = piece(
    new THREE.CylinderGeometry(T.cabeca.largura / 2, T.cabeca.largura / 2, T.cabeca.profundidade, 48, 1, true, 0, Math.PI),
    peleMat, pcInfo('C3-P')
  );
  capBot.rotation.x = Math.PI / 2;
  capBot.position.set(0, T.cabeca.y_inicio + T.cabeca.largura / 2, 0);
  group.add(capBot); cabecaItems.push(capBot);

  // Paredes laterais retas (entre os caps)
  const sideH = T.cabeca.altura - T.cabeca.largura; // segmento reto da stadium
  if (sideH > 0) {
    const sideGeom = new THREE.PlaneGeometry(T.cabeca.profundidade, sideH);
    [-1, 1].forEach(sign => {
      const s = piece(sideGeom, peleMat, pcInfo('C3-P'));
      s.rotation.y = sign * Math.PI / 2;
      s.position.set(sign * T.cabeca.largura / 2, cabY, 0);
      s.castShadow = false;
      group.add(s); cabecaItems.push(s);
    });
  }

  // LED perimetral (faixa + máscara)
  const ofs = T.cabeca.led_canal.offset_borda;
  const cw  = T.cabeca.led_canal.largura;
  const ledRing = new THREE.Mesh(
    new THREE.ShapeGeometry(stadium(T.cabeca.largura - ofs * 2, T.cabeca.altura - ofs * 2)),
    emissiveMat(COLORS.led, 1.2)
  );
  ledRing.position.set(0, cabY, cabFront + 0.5);
  ledRing.userData = { cod: 'LED-Cab', nome: 'LED perimetral da cabeça', mat: 'Fita LED COB 24V 3000K', obs: 'A 18 mm da borda, ~1053 mm de perímetro' };
  pieces.push(ledRing); leds.push(ledRing);
  group.add(ledRing); cabecaItems.push(ledRing);

  const ledMask = new THREE.Mesh(
    new THREE.ShapeGeometry(stadium(T.cabeca.largura - (ofs + cw) * 2, T.cabeca.altura - (ofs + cw) * 2)),
    bege
  );
  ledMask.position.set(0, cabY, cabFront + 1.0);
  group.add(ledMask); cabecaItems.push(ledMask);

  // Monitor
  const mon = new THREE.Mesh(
    new THREE.PlaneGeometry(T.monitor.rec_l, T.monitor.rec_a),
    new THREE.MeshStandardMaterial({
      color: COLORS.tela, emissive: 0x101a3e, emissiveIntensity: 0.28,
      roughness: 0.2, metalness: 0.05
    })
  );
  mon.position.set(0, T.monitor.cy, cabFront + 1.5);
  mon.userData = { cod: 'MON', nome: 'Monitor Touch 15.6"', mat: 'LCD vertical', l: T.monitor.rec_l, a: T.monitor.rec_a, obs: 'Recuo 3 mm + rebaixo 4 mm na moldura' };
  pieces.push(mon);
  group.add(mon); cabecaItems.push(mon);

  // Câmera Canon T7 — aro + furo + lente
  const aro = new THREE.Mesh(
    new THREE.RingGeometry(T.camera.furo / 2, T.camera.aro / 2, 64),
    mat(0xe8dcc6, { roughness: 0.55 })
  );
  aro.position.set(0, T.camera.cy, cabFront + 2.0);
  aro.userData = { cod: 'CAM', nome: 'Câmera Canon EOS Rebel T7', mat: 'Aro ⌀95 + furo ⌀68', obs: 'Lente EF-S 18-55mm IS. Rebaixo aro 8 mm de profundidade' };
  pieces.push(aro);
  group.add(aro); cabecaItems.push(aro);

  const furo = new THREE.Mesh(
    new THREE.CircleGeometry(T.camera.furo / 2, 48),
    mat(0x202020, { roughness: 0.35, metalness: 0.4 })
  );
  furo.position.set(0, T.camera.cy, cabFront + 2.1);
  group.add(furo); cabecaItems.push(furo);

  const lente = new THREE.Mesh(
    new THREE.CylinderGeometry(T.camera.furo / 2 - 2, T.camera.furo / 2 - 5, 40, 32),
    mat(0x0e0e10, { roughness: 0.2, metalness: 0.55 })
  );
  lente.rotation.x = Math.PI / 2;
  lente.position.set(0, T.camera.cy, cabFront + 20);
  lente.userData = { cod: 'CAM', nome: 'Lente Canon EF-S 18-55mm', mat: 'Conjunto óptico', obs: 'Fixada via parafuso 1/4" UNC no suporte C5' };
  pieces.push(lente);
  group.add(lente); cabecaItems.push(lente);

  /* === TUBOS T1 (2× 20×20×1600) === */
  const t1Len = window.ESTRUTURA?.tubos_principal?.comprimento ?? 1600;
  for (let i = 0; i < 2; i++) {
    const t = piece(new THREE.BoxGeometry(20, t1Len, 20), tuboMat, pcInfo('T1'));
    t.position.set(i === 0 ? -16 : 16, t1Len / 2, 0);
    t.visible = false;
    tubos.push(t);
    group.add(t);
  }

  group.userData = { cabecaItems, colunaItems, baseItems };
  group.position.set(-475, 0, 0);
  principalGroup = group;
  scene.add(group);
}

/* ============== MÓDULO IMPRESSORA ============== */

function buildImpressora() {
  const T = window.IMPRESSORA;
  const group = new THREE.Group();

  const bege = mat(COLORS.base, { roughness: 0.55 });
  const begeEdge = mat(COLORS.baseEdge, { roughness: 0.6 });
  const tuboMat = mat(COLORS.tubo, { roughness: 0.6, metalness: 0.75 });
  const madeiraMat = mat(COLORS.madeira, { roughness: 0.4 });

  const baseItems = [], colunaItems = [], caixaItems = [];

  /* === BASE QUADRADA 350×60×350 R80 === */
  const d1 = piece(
    new THREE.ExtrudeGeometry(roundedRect(T.base.lado, T.base.lado, T.base.raio_cantos), { depth: 18, bevelEnabled: false }),
    bege, pcInfo('D1')
  );
  d1.rotation.x = -Math.PI / 2;
  d1.position.y = 60;
  group.add(d1); baseItems.push(d1);

  const d2 = piece(
    new THREE.ExtrudeGeometry(roundedRect(T.base.lado, T.base.lado, T.base.raio_cantos), { depth: 18, bevelEnabled: false }),
    bege, pcInfo('D2')
  );
  d2.rotation.x = -Math.PI / 2;
  d2.position.y = 18;
  group.add(d2); baseItems.push(d2);

  // D3a longas (×2): 320 × 24 × 15
  for (let i = 0; i < 2; i++) {
    const w = piece(new THREE.BoxGeometry(320, 24, 15), begeEdge, pcInfo('D3a'));
    w.position.set(0, 30, i === 0 ? 167.5 : -167.5);
    group.add(w); baseItems.push(w);
  }
  // D3b curtas (×2): 15 × 24 × 290
  for (let i = 0; i < 2; i++) {
    const w = piece(new THREE.BoxGeometry(15, 24, 290), begeEdge, pcInfo('D3b'));
    w.position.set(i === 0 ? 167.5 : -167.5, 30, 0);
    group.add(w); baseItems.push(w);
  }

  /* === COLUNA 120×610×120 === */
  const colY = T.coluna.y_inicio + T.coluna.altura / 2;

  const e1 = piece(new THREE.BoxGeometry(120, T.coluna.altura, 15), bege, pcInfo('E1'));
  e1.position.set(0, colY, 52.5);
  group.add(e1); colunaItems.push(e1);

  const e1l = piece(new THREE.BoxGeometry(120, T.coluna.altura, 1), madeiraMat, pcInfo('E1-L'));
  e1l.position.set(0, colY, 60.5);
  madeira.push(e1l);
  group.add(e1l); colunaItems.push(e1l);

  const e2 = piece(new THREE.BoxGeometry(120, T.coluna.altura, 15), bege, pcInfo('E2'));
  e2.position.set(0, colY, -52.5);
  group.add(e2); colunaItems.push(e2);

  for (let i = 0; i < 2; i++) {
    const e3 = piece(new THREE.BoxGeometry(15, T.coluna.altura, 90), bege, pcInfo('E3'));
    e3.position.set(i === 0 ? -52.5 : 52.5, colY, 0);
    group.add(e3); colunaItems.push(e3);
  }

  // LED coluna impressora
  const ledCol = new THREE.Mesh(
    new THREE.BoxGeometry(8, T.coluna.altura - 30, 1.5),
    emissiveMat(COLORS.ledHot, 0.9)
  );
  ledCol.position.set(0, colY, 61.3);
  ledCol.userData = { cod: 'LED-Col2', nome: 'LED vertical da coluna impressora', mat: 'Fita LED COB 24V 3000K', l: T.coluna.altura, a: 8 };
  pieces.push(ledCol); leds.push(ledCol);
  group.add(ledCol); colunaItems.push(ledCol);

  /* === CAIXA 320×250×400 R40 === */
  // Decompor em F1 (frontal 18mm) + F2 (traseiro 15mm) + F3×2 (laterais) + F4 (topo) + F5 (fundo)
  const caixaCenterY = T.caixa.y_inicio + T.caixa.altura / 2;
  const caixaFront = T.caixa.profundidade / 2;  // +200

  // F1 frontal 320×250×18 (cantos R40)
  const f1 = piece(
    new THREE.ExtrudeGeometry(roundedRect(T.caixa.largura, T.caixa.altura, T.caixa.raio_cantos), { depth: 18, bevelEnabled: false }),
    bege, pcInfo('F1')
  );
  f1.position.set(0, caixaCenterY, caixaFront - 18);
  group.add(f1); caixaItems.push(f1);

  // F1-L lâmina madeira 320×250×1
  const f1l = piece(new THREE.BoxGeometry(T.caixa.largura - 20, T.caixa.altura - 20, 1), madeiraMat, pcInfo('F1-L'));
  f1l.position.set(0, caixaCenterY, caixaFront + 0.5);
  madeira.push(f1l);
  group.add(f1l); caixaItems.push(f1l);

  // F2 traseiro 320×250×15
  const f2 = piece(
    new THREE.ExtrudeGeometry(roundedRect(T.caixa.largura, T.caixa.altura, T.caixa.raio_cantos), { depth: 15, bevelEnabled: false }),
    bege, pcInfo('F2')
  );
  f2.position.set(0, caixaCenterY, -caixaFront);
  group.add(f2); caixaItems.push(f2);

  // F3 laterais (×2): 15 × 250 × 364
  for (let i = 0; i < 2; i++) {
    const f3 = piece(new THREE.BoxGeometry(15, T.caixa.altura, 364), bege, pcInfo('F3'));
    f3.position.set(i === 0 ? -152.5 : 152.5, caixaCenterY, 0);
    group.add(f3); caixaItems.push(f3);
  }

  // F4 topo 284 × 15 × 364
  const f4 = piece(new THREE.BoxGeometry(284, 15, 364), bege, pcInfo('F4'));
  f4.position.set(0, T.caixa.y_fim - 7.5, 0);
  group.add(f4); caixaItems.push(f4);

  // F5 fundo 284 × 15 × 364 (com furo central, ignorado no 3D)
  const f5 = piece(new THREE.BoxGeometry(284, 15, 364), bege, pcInfo('F5'));
  f5.position.set(0, T.caixa.y_inicio + 7.5, 0);
  group.add(f5); caixaItems.push(f5);

  // Slot saída foto (visual)
  const slot = new THREE.Mesh(
    new THREE.PlaneGeometry(T.caixa.slot.l, T.caixa.slot.a),
    mat(0x0e0e10, { roughness: 0.4 })
  );
  slot.position.set(0, T.caixa.slot.cy, caixaFront + 1.5);
  slot.userData = { cod: 'SLOT', nome: 'Slot de saída da foto', mat: 'Abertura 180×15 mm', obs: 'Posicionado a ~120 mm do topo da caixa' };
  pieces.push(slot);
  group.add(slot); caixaItems.push(slot);

  // Porta frontal magnética 280×220
  const porta = new THREE.Mesh(
    new THREE.PlaneGeometry(280, 220),
    new THREE.MeshStandardMaterial({
      color: COLORS.porta, roughness: 0.6,
      transparent: true, opacity: 0.45, side: THREE.DoubleSide
    })
  );
  porta.position.set(0, caixaCenterY, caixaFront + 1);
  porta.userData = { cod: 'PORTA-F1', nome: 'Porta magnética frontal (F1)', mat: '280×220 mm', obs: 'Imãs neodímio + fechadura push-lock. Acesso à impressora ASK-400' };
  pieces.push(porta);
  group.add(porta); caixaItems.push(porta);

  /* === TUBOS T2 (2× 20×20×850) === */
  const t2Len = window.ESTRUTURA?.tubos_impressora?.comprimento ?? 850;
  for (let i = 0; i < 2; i++) {
    const t = piece(new THREE.BoxGeometry(20, t2Len, 20), tuboMat, pcInfo('T2'));
    t.position.set(i === 0 ? -16 : 16, T.base.altura + t2Len / 2 - 30, 0);
    t.visible = false;
    tubos.push(t);
    group.add(t);
  }

  group.userData = { caixaItems, colunaItems, baseItems };
  group.position.set(475, 0, 0);
  impressoraGroup = group;
  scene.add(group);
}

/* ============== TOOLTIP (RAYCASTER) ============== */

function onMouseMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(pieces, false);

  if (hits.length > 0) {
    const info = hits[0].object.userData;
    if (info && info.cod) {
      showTooltip(info, event.clientX, event.clientY);
      return;
    }
  }
  hideTooltip();
}

function showTooltip(info, mx, my) {
  if (!tooltip || !containerEl) return;
  const rect = containerEl.getBoundingClientRect();
  const x = mx - rect.left + 14;
  const y = my - rect.top + 14;
  const dimLabel = (info.l != null && info.a != null) ? `${info.l} × ${info.a} mm` : '';
  const qtdLabel = info.qtd ? ` · ×${info.qtd}` : '';
  const obsLabel = info.obs ? `<div class="tt-obs">${info.obs}</div>` : '';

  tooltip.innerHTML = `
    <div><span class="tt-cod">${info.cod}</span><span class="tt-nome">${info.nome || ''}</span></div>
    <div class="tt-meta">${info.mat || ''}${dimLabel ? ' · ' + dimLabel : ''}${qtdLabel}</div>
    ${obsLabel}
  `;
  tooltip.hidden = false;

  // Limit position inside container
  const tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
  const maxX = containerEl.clientWidth - tw - 8;
  const maxY = containerEl.clientHeight - th - 8;
  tooltip.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
  tooltip.style.top  = Math.max(0, Math.min(y, maxY)) + 'px';

  // Hide legend hint once user has hovered
  if (legend) legend.style.opacity = '0.25';
}

function hideTooltip() {
  if (tooltip) tooltip.hidden = true;
}

/* ============== TOOLBAR ============== */

function setupToolbar() {
  const ledsBtn = document.getElementById('t3d-leds');
  ledsBtn?.addEventListener('click', () => {
    ledsBtn.classList.toggle('active');
    const on = ledsBtn.classList.contains('active');
    leds.forEach(l => {
      l.visible = on;
      l.material.emissiveIntensity = on ? 1.1 : 0;
    });
  });

  const madBtn = document.getElementById('t3d-madeira');
  madBtn?.addEventListener('click', () => {
    madBtn.classList.toggle('active');
    const on = madBtn.classList.contains('active');
    madeira.forEach(m => { m.visible = on; });
  });

  const tubBtn = document.getElementById('t3d-tubos');
  tubBtn?.addEventListener('click', () => {
    tubBtn.classList.toggle('active');
    const on = tubBtn.classList.contains('active');
    tubos.forEach(t => { t.visible = on; });
    // semi-transparent shell when tubos visible
    [principalGroup, impressoraGroup].forEach(g => {
      if (!g) return;
      const all = [...(g.userData.colunaItems || []), ...(g.userData.cabecaItems || []), ...(g.userData.caixaItems || [])];
      all.forEach(m => {
        if (!m.material || m.userData?.cod?.startsWith('LED')) return;
        m.material.transparent = on;
        m.material.opacity = on ? 0.4 : 1.0;
        m.material.needsUpdate = true;
      });
    });
  });

  const explBtn = document.getElementById('t3d-explodir');
  explBtn?.addEventListener('click', () => {
    explBtn.classList.toggle('active');
    isExploded = explBtn.classList.contains('active');
    explode();
  });

  document.getElementById('t3d-reset')?.addEventListener('click', () => {
    camera.position.set(1900, 1400, 2900);
    controls.target.set(0, 850, 0);
    controls.update();
  });
}

function explode() {
  const apply = (items, off) => {
    items.forEach(m => {
      if (m.userData.baseY === undefined) m.userData.baseY = m.position.y;
      m.position.y = m.userData.baseY + off;
    });
  };
  if (principalGroup) {
    apply(principalGroup.userData.cabecaItems || [], isExploded ? 320 : 0);
  }
  if (impressoraGroup) {
    apply(impressoraGroup.userData.caixaItems || [], isExploded ? 250 : 0);
  }
}

/* ============== LOOP + LIFECYCLE ============== */

function onResize() {
  if (!containerEl || !renderer) return;
  const w = containerEl.clientWidth;
  const h = containerEl.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function tryInit() {
  const c = document.getElementById('three-container');
  if (!c) return;
  if (c.clientWidth === 0 || c.clientHeight === 0) {
    requestAnimationFrame(tryInit);
    return;
  }
  if (!initialized) initThree();
  else onResize();
}

document.querySelector('.tab[data-tab="3d"]')?.addEventListener('click', () => {
  requestAnimationFrame(tryInit);
});
