/* ============================================================
   AURA · TOTEM V2 · Modelo 3D (Three.js UMD)
   Peças individuais (A1..F5) com tooltip via raycaster.
   Lê PRINCIPAL/IMPRESSORA + PECAS_PRINCIPAL/IMPRESSORA do window.
   ============================================================ */

const OrbitControls = THREE.OrbitControls;

let scene, camera, renderer, controls;
let principalGroup, impressoraGroup;
let raycaster, mouse;
let groundMesh;
const pieces = [];     // meshes alvo do raycaster (com userData)
const leds = [];
const madeira = [];
let isExploded = false;
let initialized = false;
let tooltip, legend, containerEl;

// Acabamento branco (único). Paleta tunada para tone mapping ACES + ambiente refletido.
const COLORS = {
  base: 0xEDEAE3,      // branco quente suave (face/MDF pintado)
  baseEdge: 0xDED9CF,  // bordas/peças secundárias
  madeira: 0xC9AE86,   // lâmina de madeira (porta/coluna)
  tela: 0x0d1224,
  led: 0xFFE7B0,
  ledHot: 0xFFD98A,
  porta: 0xDCD7CE,
  ground: 0xC7C7CC,    // piso de estúdio neutro
  bg: 0x32333A,        // fundo escuro p/ contraste do branco
  haste: 0xD8D2C8
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

// Stadium externo com janela stadium interna vazada (quadro estrutural CE)
function stadiumFrame(wO, hO, wI, hI) {
  const s = stadium(wO, hO);
  s.holes.push(stadium(wI, hI));
  return s;
}

// Retângulo arredondado com janela interna vazada (quadro estrutural FE)
function roundedFrame(wO, hO, rO, wI, hI, rI) {
  const s = roundedRect(wO, hO, rO);
  s.holes.push(roundedRect(wI, hI, rI));
  return s;
}

// Furos (Path) para recortar dentro de uma Shape — espelham o plano de corte
function holeRect(cx, cy, w, h) {
  const p = new THREE.Path();
  p.moveTo(cx - w / 2, cy - h / 2);
  p.lineTo(cx + w / 2, cy - h / 2);
  p.lineTo(cx + w / 2, cy + h / 2);
  p.lineTo(cx - w / 2, cy + h / 2);
  p.closePath();
  return p;
}
function holeCircle(cx, cy, r) {
  const p = new THREE.Path();
  p.absarc(cx, cy, r, 0, Math.PI * 2, true);
  return p;
}

// Material de tinta PU (MDF laqueado): clearcoat sutil p/ um look mais real
function paintMat(color) {
  return new THREE.MeshPhysicalMaterial({
    color, roughness: 0.5, metalness: 0.0,
    clearcoat: 0.35, clearcoatRoughness: 0.45
  });
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

/* Conexão coluna → cabeça/caixa: SEM flanges externos. A cabeça/caixa conecta
   direto na coluna por uma BASE RETA interna (G2), fixada no topo da coluna com
   3–4 parafusos removíveis. Mais o duto de cabos escondido e o encaixe na base (G1).
   structItems: recebe a base + parafusos; o cabo fica fora p/ permanecer opaco. */
function addFlangesECabo(group, structItems, p) {
  const fmat = mat(0xC9BBA6, { roughness: 0.6 });

  // Duto de cabos (do topo da base até o centro da cabeça/caixa)
  const caboH = p.yHeadCenter - p.yBaseTop;
  const cabo = new THREE.Mesh(
    new THREE.BoxGeometry(14, caboH, 14),
    mat(0xcc6a2a, { roughness: 0.5, emissive: 0x2e1505, emissiveIntensity: 0.25 })
  );
  cabo.position.set(0, (p.yBaseTop + p.yHeadCenter) / 2, 0);
  cabo.userData = { cod: 'CABO', nome: 'Duto de cabos (escondido)', mat: 'HDMI + USB + 220V', obs: 'Desce pelo canal 60×60 da coluna e sai pela base (⌀25)' };
  pieces.push(cabo);
  group.add(cabo);

  // G1 — encaixe da coluna na base (interno, no tamanho da coluna, escondido na base)
  const g1 = piece(new THREE.BoxGeometry(120, 8, 130), fmat, pcInfo('G1'));
  g1.position.set(0, p.yBaseTop + 4, 0);
  group.add(g1); structItems.push(g1);

  // G2 — BASE DE FIXAÇÃO RETA, por DENTRO da cabeça/caixa, sobre o topo da coluna.
  // A cabeça/caixa parafusa direto aqui no topo da coluna (sem placa de transição aparente).
  const baseY = p.yColTop + p.mountUp;
  const gbase = piece(new THREE.BoxGeometry(130, 15, 130), fmat, pcInfo('G2'));
  gbase.position.set(0, baseY, 0);
  group.add(gbase); structItems.push(gbase);

  // 3–4 parafusos removíveis ligando a base reta ao topo da coluna
  const screwMat = mat(0x6b6e73, { metalness: 0.85, roughness: 0.3 });
  const sH = (baseY - p.yColTop) + 22;
  [[-42, 42], [42, 42], [-42, -42], [42, -42]].forEach(([sx, sz]) => {
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, sH, 16), screwMat);
    screw.position.set(sx, p.yColTop + sH / 2 - 7, sz);
    screw.userData = { cod: 'PARAF', nome: 'Parafuso removível M6', mat: 'Inox · 3–4 un.', obs: 'Fixam a cabeça/caixa direto no topo da coluna pela base reta interna G2' };
    pieces.push(screw);
    group.add(screw); structItems.push(screw);
  });
}

/* Dobradiça realista discreta: pequenos canecos metálicos ao longo do eixo do pivô.
   O pivô já está posicionado na linha da dobradiça, então os canecos vão em (0, y, 0). */
function addHinges(pivot, axisLen, count) {
  const hmat = mat(0x8a8d92, { metalness: 0.9, roughness: 0.35 });
  const knH = Math.min(55, (axisLen * 0.7) / (count * 1.6));
  for (let i = 0; i < count; i++) {
    const frac = count === 1 ? 0.5 : i / (count - 1);
    const k = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, knH, 16), hmat);
    k.position.set(0, (frac - 0.5) * axisLen * 0.62, 0);
    pivot.add(k);
  }
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
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  containerEl.appendChild(renderer.domElement);

  // Ambiente de estúdio refletido (reflexos suaves nas peças) via RoomEnvironment + PMREM
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new THREE.RoomEnvironment(renderer);
    scene.environment = pmrem.fromScene(roomEnv, 0.04).texture;
  } catch (e) {
    console.warn('RoomEnvironment indisponível, usando só luzes:', e);
  }

  // Lights
  // Ambiente hemisférico (gradiente céu/chão) — o environment cuida do resto
  const hemi = new THREE.HemisphereLight(0xffffff, 0x9aa0a8, 0.6);
  scene.add(hemi);
  scene.add(new THREE.AmbientLight(0xffffff, 0.12));
  // Key com sombra suave
  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  sun.position.set(1500, 2800, 1800);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -2200, right: 2200, top: 2800, bottom: -300, near: 100, far: 7000 });
  sun.shadow.bias = -0.0005;
  sun.shadow.radius = 6;
  scene.add(sun);
  // Fill frio + rim traseiro
  const fill = new THREE.DirectionalLight(0xcdd6e0, 0.6);
  fill.position.set(-1800, 900, -1200);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.5);
  rim.position.set(-600, 1400, -2200);
  scene.add(rim);

  // Ground
  groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), mat(COLORS.ground, { roughness: 0.55 }));
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

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

  const bege = paintMat(COLORS.base);
  const begeEdge = paintMat(COLORS.baseEdge);
  const hasteMat = mat(COLORS.haste, { roughness: 0.6 });
  const peleMat = paintMat(COLORS.base); peleMat.side = THREE.DoubleSide;
  const madeiraMat = mat(COLORS.madeira, { roughness: 0.4 });

  // Coletores para grupos lógicos (explodir/filtrar)
  const cabecaItems = [];
  const colunaItems = [];
  const baseItems   = [];

  /* === BASE QUADRADA 400×60×400 R80 (A2 fundo → A3 paredes → A1 tampo) === */
  // A2 fundo 18mm — com furo ⌀25 traseiro (passagem de cabo)
  const a2shape = roundedRect(T.base.lado, T.base.lado, T.base.raio_cantos);
  a2shape.holes.push(holeCircle(0, -(T.base.lado / 2 - 60), T.base.furo_cabo / 2));
  const a2 = piece(
    new THREE.ExtrudeGeometry(a2shape, { depth: 18, bevelEnabled: false }),
    bege, pcInfo('A2')
  );
  a2.rotation.x = -Math.PI / 2;
  a2.position.y = 18;
  group.add(a2); baseItems.push(a2);

  // A3a paredes longas (×2): 370 × 24, laterais — ao longo de Z em x = ±192.5
  for (let i = 0; i < 2; i++) {
    const w = piece(new THREE.BoxGeometry(15, 24, 370), begeEdge, pcInfo('A3a'));
    w.position.set(i === 0 ? -192.5 : 192.5, 30, 0);
    group.add(w); baseItems.push(w);
  }
  // A3b paredes curtas (×2): 340 × 24, frente/trás — ao longo de X em z = ±192.5 (entre as longas)
  for (let i = 0; i < 2; i++) {
    const w = piece(new THREE.BoxGeometry(340, 24, 15), begeEdge, pcInfo('A3b'));
    w.position.set(0, 30, i === 0 ? 192.5 : -192.5);
    group.add(w); baseItems.push(w);
  }

  // A1 tampo 18mm — com soquete central 120×130 (encaixe da coluna), igual ao plano de corte
  const a1shape = roundedRect(T.base.lado, T.base.lado, T.base.raio_cantos);
  a1shape.holes.push(holeRect(0, 0, T.base.furo_central.l, T.base.furo_central.p));
  const a1 = piece(
    new THREE.ExtrudeGeometry(a1shape, { depth: 18, bevelEnabled: false }),
    bege, pcInfo('A1')
  );
  a1.rotation.x = -Math.PI / 2;
  a1.position.y = 60;
  group.add(a1); baseItems.push(a1);

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

  /* === CABEÇA stadium 340×600×180 === */
  const cabY = T.cabeca.y_inicio + T.cabeca.altura / 2;
  const cabFront = T.cabeca.profundidade / 2;  // +90

  // C1 frontal stadium 18mm — recorte da janela do monitor (câmera removida da frente)
  const monLY = (T.monitor.cy + T.monitor.offset_y) - cabY;    // Y local do recorte do monitor
  const c1shape = stadium(T.cabeca.largura, T.cabeca.altura);
  c1shape.holes.push(holeRect(0, monLY, T.monitor.rec_l, T.monitor.rec_a));
  const c1 = piece(
    new THREE.ExtrudeGeometry(c1shape, { depth: 18, bevelEnabled: false }),
    bege, pcInfo('C1')
  );
  c1.position.set(0, cabY, cabFront - 18);
  group.add(c1); cabecaItems.push(c1);

  // CE estrutural — quadro stadium VAZADO (osso da cabeça), fixo.
  // Fica na TRASEIRA, encostado no C2 (a porta), que se prende nele pelas dobradiças.
  // A janela vazada dá acesso ao interior (câmera/cabos) quando a porta C2 abre.
  const caiC = T.cabeca.caixilho || 40;
  const ce = piece(
    new THREE.ExtrudeGeometry(
      stadiumFrame(T.cabeca.largura, T.cabeca.altura, T.cabeca.largura - caiC * 2, T.cabeca.altura - caiC * 2),
      { depth: 18, bevelEnabled: false }
    ),
    begeEdge, pcInfo('CE')
  );
  ce.position.set(0, cabY, -75);   // na TRASEIRA, encostado no C2 (recebe a dobradiça da porta); janela dá acesso ao interior
  group.add(ce); cabecaItems.push(ce);

  // Hastes H1-H5 — espaçadores ligando o C1 (face interna z=72) ao CE na traseira (face frontal z=-57)
  const hLen = 129;          // vão real C1 → CE (com o CE encostado na porta traseira C2)
  const hZ = 7.5;            // centro do vão C1↔CE (-57 → +72)
  const hX = T.cabeca.largura / 2 - 30; // 140 — no trecho reto da stadium (largura cheia)
  const hXLow = 100;                    // pares inferiores: a cabeça estreita no cap → recolher p/ dentro
  const hY1 = cabY;
  const hY2 = T.cabeca.y_inicio + 70;
  const hY3 = T.cabeca.y_fim - 70;
  const hConfigs = [
    { cod: 'H1', pos: [-hX, hY1] },
    { cod: 'H2', pos: [ hX, hY1] },
    { cod: 'H3', pos: [-hXLow, hY2] },
    { cod: 'H4', pos: [ hXLow, hY2] },
    { cod: 'H5', pos: [ 0,  hY3] }
  ];
  hConfigs.forEach(c => {
    const h = piece(new THREE.BoxGeometry(15, 40, hLen), hasteMat, pcInfo(c.cod));
    h.position.set(c.pos[0], c.pos[1], hZ);
    group.add(h); cabecaItems.push(h);
  });

  // C4 suportes do monitor (2 barras 240×20) fixas atrás do C1, acima/abaixo da moldura
  [T.monitor.cy + T.monitor.moldura_a / 2 + 15, T.monitor.cy - T.monitor.moldura_a / 2 - 15].forEach(yy => {
    const c4 = piece(new THREE.BoxGeometry(240, 20, 15), begeEdge, pcInfo('C4'));
    c4.position.set(0, yy, 62);
    group.add(c4); cabecaItems.push(c4);
  });

  // C3-P pele lateral — tubo stadium (parede 3 mm) extrudado nos 180 mm de profundidade,
  // exatamente o perímetro do plano de corte. Envolve as laterais; C1 (frente) e C2 (trás) fecham.
  const skin = piece(
    new THREE.ExtrudeGeometry(
      stadiumFrame(T.cabeca.largura, T.cabeca.altura, T.cabeca.largura - 6, T.cabeca.altura - 6),
      { depth: T.cabeca.profundidade, bevelEnabled: false }
    ),
    peleMat, pcInfo('C3-P')
  );
  skin.position.set(0, cabY, -cabFront);   // centrado na ALTURA da cabeça (estava caindo p/ y=0)
  group.add(skin); cabecaItems.push(skin);

  // LED perimetral — anel FINO emissivo (largura do canal, a 18 mm da borda)
  const ofs = T.cabeca.led_canal.offset_borda;
  const cw  = T.cabeca.led_canal.largura;
  const ledRing = new THREE.Mesh(
    new THREE.ShapeGeometry(stadiumFrame(
      T.cabeca.largura - ofs * 2, T.cabeca.altura - ofs * 2,
      T.cabeca.largura - (ofs + cw) * 2, T.cabeca.altura - (ofs + cw) * 2)),
    emissiveMat(COLORS.led, 1.4)
  );
  ledRing.position.set(0, cabY, cabFront + 0.3);
  ledRing.userData = { cod: 'LED-Cab', nome: 'LED perimetral da cabeça', mat: 'Fita LED COB 24V 3000K', obs: 'A 18 mm da borda, ~1444 mm de perímetro' };
  pieces.push(ledRing); leds.push(ledRing);
  group.add(ledRing); cabecaItems.push(ledRing);

  /* === MONITOR (corpo + tela visível) === */
  // Corpo físico do monitor (caixa atrás do painel frontal) — visível no raio-X
  const monBody = piece(
    new THREE.BoxGeometry(T.monitor.moldura_l, T.monitor.moldura_a, 28),
    mat(0x1a1a1e, { roughness: 0.5, metalness: 0.3 }),
    { cod: 'MON', nome: 'Monitor Touch 15.6" (em pé)', mat: 'Moldura ' + T.monitor.moldura_l + '×' + T.monitor.moldura_a, l: T.monitor.moldura_l, a: T.monitor.moldura_a, obs: 'LCD 15.6" touchscreen montado em pé · recuo 3 mm + rebaixo 4 mm' }
  );
  monBody.position.set(0, T.monitor.cy, 58);  // logo atrás da face interna do C1 (z=72)
  group.add(monBody); cabecaItems.push(monBody);

  // Tela visível (área ativa) na frente, deslocada p/ cima pela regulagem
  const mon = new THREE.Mesh(
    new THREE.PlaneGeometry(T.monitor.rec_l, T.monitor.rec_a),
    new THREE.MeshStandardMaterial({
      color: COLORS.tela, emissive: 0x101a3e, emissiveIntensity: 0.28,
      roughness: 0.2, metalness: 0.05
    })
  );
  mon.position.set(0, T.monitor.cy + T.monitor.offset_y, cabFront - T.monitor.recuo);  // recuada recuo mm no recorte
  mon.userData = { cod: 'MON', nome: 'Tela visível 15.6"', mat: 'Área ativa ' + T.monitor.rec_l + '×' + T.monitor.rec_a, l: T.monitor.rec_l, a: T.monitor.rec_a, obs: 'Recorte deslocado ' + T.monitor.offset_y + ' mm p/ cima (borda inferior mais grossa)' };
  pieces.push(mon);
  group.add(mon); cabecaItems.push(mon);

  // (Câmera removida da frente da cabeça a pedido — frente fica limpa, só a tela.)

  /* === PORTA TRASEIRA C2 (basculante) + Mini PC montado nela === */
  const hingeX = -T.cabeca.largura / 2 + 8;     // dobradiça na borda esquerda
  const doorPivot = new THREE.Group();
  doorPivot.position.set(hingeX, cabY, -cabFront);

  // C2 painel traseiro = a PORTA
  const c2 = piece(
    new THREE.ExtrudeGeometry(stadium(T.cabeca.largura, T.cabeca.altura), { depth: 15, bevelEnabled: false }),
    bege, pcInfo('C2')
  );
  c2.position.set(-hingeX, 0, 0);   // volta ao centro quando fechada
  c2.userData.isDoor = true;
  doorPivot.add(c2); cabecaItems.push(c2);

  // Mini PC montado NA porta (sai junto ao abrir)
  const mp = T.mini_pc;
  const miniPc = piece(
    new THREE.BoxGeometry(mp.l, mp.l, mp.a),
    mat(0x2b2b30, { roughness: 0.5, metalness: 0.35 }),
    { cod: 'MINIPC', nome: 'Mini PC (na porta traseira C2)', mat: 'Caixa ' + mp.l + '×' + mp.p + '×' + mp.a, l: mp.l, a: mp.a, obs: 'Montado na PORTA traseira C2 — sai junto quando ela abre. HDMI + USB para o monitor e a câmera' }
  );
  miniPc.position.set(-hingeX, mp.cy - cabY, 15 + mp.a / 2);
  miniPc.userData.isDoor = true;
  doorPivot.add(miniPc); cabecaItems.push(miniPc);

  // dobradiça realista discreta — 3 canecos metálicos na borda traseira
  addHinges(doorPivot, T.cabeca.altura, 3);
  group.add(doorPivot);

  /* === FLANGES DE UNIÃO + DUTO DE CABOS (MOD 02) === */
  addFlangesECabo(group, colunaItems, { yBaseTop: T.base.altura, yColTop: T.coluna.y_fim, yHeadCenter: cabY, mountUp: 30 });

  group.userData = { cabecaItems, colunaItems, baseItems, doorPivot };
  group.position.set(-475, 0, 0);
  principalGroup = group;
  scene.add(group);
}

/* ============== MÓDULO IMPRESSORA ============== */

function buildImpressora() {
  const T = window.IMPRESSORA;
  const group = new THREE.Group();

  const bege = paintMat(COLORS.base);
  const begeEdge = paintMat(COLORS.baseEdge);
  const madeiraMat = mat(COLORS.madeira, { roughness: 0.4 });

  const baseItems = [], colunaItems = [], caixaItems = [];

  /* === BASE QUADRADA 350×60×350 R80 === */
  const d1shape = roundedRect(T.base.lado, T.base.lado, T.base.raio_cantos);
  d1shape.holes.push(holeRect(0, 0, T.base.furo_central.l, T.base.furo_central.p));
  const d1 = piece(
    new THREE.ExtrudeGeometry(d1shape, { depth: 18, bevelEnabled: false }),
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

  /* === CAIXA 360×250×560 R40 (DS620A / ASK-400, abre pela FRENTE) === */
  const caixaCenterY = T.caixa.y_inicio + T.caixa.altura / 2;
  const caixaFront = T.caixa.profundidade / 2;     // +280
  const caiF = T.caixa.caixilho || 40;
  const interiorD = T.caixa.profundidade - 36;      // 524
  const f3x = T.caixa.largura / 2 - 7.5;            // 172.5

  // FE estrutural — quadro R40 VAZADO fixo (recebe a dobradiça do F1)
  const fe = piece(
    new THREE.ExtrudeGeometry(
      roundedFrame(T.caixa.largura, T.caixa.altura, T.caixa.raio_cantos,
                   T.caixa.largura - caiF * 2, T.caixa.altura - caiF * 2, 12),
      { depth: 18, bevelEnabled: false }
    ),
    begeEdge, pcInfo('FE')
  );
  fe.position.set(0, caixaCenterY, caixaFront - 36);
  group.add(fe); caixaItems.push(fe);

  // F2 traseiro (ventilado) 360×250×15
  const f2 = piece(
    new THREE.ExtrudeGeometry(roundedRect(T.caixa.largura, T.caixa.altura, T.caixa.raio_cantos), { depth: 15, bevelEnabled: false }),
    bege, pcInfo('F2')
  );
  f2.position.set(0, caixaCenterY, -caixaFront);
  group.add(f2); caixaItems.push(f2);

  // F3 laterais (×2): 15 × 250 × 524
  for (let i = 0; i < 2; i++) {
    const f3 = piece(new THREE.BoxGeometry(15, T.caixa.altura, interiorD), bege, pcInfo('F3'));
    f3.position.set(i === 0 ? -f3x : f3x, caixaCenterY, 0);
    group.add(f3); caixaItems.push(f3);
  }

  // F4 topo 324 × 15 × 524
  const f4 = piece(new THREE.BoxGeometry(T.caixa.largura - 36, 15, interiorD), bege, pcInfo('F4'));
  f4.position.set(0, T.caixa.y_fim - 7.5, 0);
  group.add(f4); caixaItems.push(f4);

  // F5 fundo 324 × 15 × 524
  const f5 = piece(new THREE.BoxGeometry(T.caixa.largura - 36, 15, interiorD), bege, pcInfo('F5'));
  f5.position.set(0, T.caixa.y_inicio + 7.5, 0);
  group.add(f5); caixaItems.push(f5);

  // Corpo da impressora DS620A/ASK-400 (275×170×366) — visível no raio-X
  const U = T.impressora_unit;
  const impr = piece(
    new THREE.BoxGeometry(U.l, U.a, U.p),
    mat(0x26262b, { roughness: 0.5, metalness: 0.3 }),
    { cod: 'IMPR', nome: 'Impressora DNP DS620A / Fujifilm ASK-400', mat: U.l + '×' + U.p + '×' + U.a + ' mm · ' + U.peso + ' kg', l: U.l, a: U.a, obs: 'Mesma impressora (ASK-400 = DS620A rebatizada). Manutenção FRONTAL pela porta F1. Empurrada p/ frente → folga traseira p/ a passada do papel dye-sub' }
  );
  impr.position.set(0, T.caixa.y_inicio + 18 + U.a / 2, -10);  // centrado na caixa de 420
  group.add(impr); caixaItems.push(impr);

  /* === PORTA FRONTAL F1 (inteira) — gira numa dobradiça lateral === */
  const ihingeX = -T.caixa.largura / 2 + 8;
  const doorPivot = new THREE.Group();
  doorPivot.position.set(ihingeX, caixaCenterY, caixaFront - 18);

  // F1 com RECORTE real do slot de saída da foto (espelha o plano de corte)
  const f1shape = roundedRect(T.caixa.largura, T.caixa.altura, T.caixa.raio_cantos);
  f1shape.holes.push(holeRect(0, T.caixa.slot.cy - caixaCenterY, T.caixa.slot.l, T.caixa.slot.a));
  const f1 = piece(
    new THREE.ExtrudeGeometry(f1shape, { depth: 18, bevelEnabled: false }),
    bege, pcInfo('F1')
  );
  f1.position.set(-ihingeX, 0, 0);
  f1.userData.isDoor = true;
  doorPivot.add(f1); caixaItems.push(f1);

  // F1-L lâmina madeira (na porta) — com o mesmo recorte do slot
  const f1lShape = roundedRect(T.caixa.largura - 20, T.caixa.altura - 20, Math.max(4, T.caixa.raio_cantos - 10));
  f1lShape.holes.push(holeRect(0, T.caixa.slot.cy - caixaCenterY, T.caixa.slot.l, T.caixa.slot.a));
  const f1l = piece(new THREE.ExtrudeGeometry(f1lShape, { depth: 1, bevelEnabled: false }), madeiraMat, pcInfo('F1-L'));
  f1l.position.set(-ihingeX, 0, 18.5);
  f1l.userData.isDoor = true;
  madeira.push(f1l);
  doorPivot.add(f1l); caixaItems.push(f1l);

  // Slot de saída da foto (no painel F1 / porta)
  const slot = new THREE.Mesh(
    new THREE.PlaneGeometry(T.caixa.slot.l, T.caixa.slot.a),
    mat(0x0e0e10, { roughness: 0.4 })
  );
  slot.position.set(-ihingeX, T.caixa.slot.cy - caixaCenterY, 2);
  slot.userData = { cod: 'SLOT', nome: 'Slot de saída da foto', mat: 'Abertura 180×15 mm', obs: 'No painel frontal F1 (porta) — abre junto', isDoor: true };
  pieces.push(slot);
  doorPivot.add(slot); caixaItems.push(slot);

  // dobradiça realista discreta — 2 canecos metálicos na borda frontal
  addHinges(doorPivot, T.caixa.altura, 2);
  group.add(doorPivot);

  /* === FLANGES DE UNIÃO + DUTO DE CABOS (MOD 02) === */
  addFlangesECabo(group, colunaItems, { yBaseTop: T.base.altura, yColTop: T.coluna.y_fim, yHeadCenter: caixaCenterY, mountUp: 20 });

  group.userData = { caixaItems, colunaItems, baseItems, doorPivot };
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

  // Raio-X: deixa a casca semi-transparente para ver os componentes internos
  // (monitor, câmera, mini PC). Mantém telas/LEDs/componentes opacos.
  const INTERNOS = new Set(['MON', 'CAM', 'MINIPC', 'IMPR', 'CABO', 'G1', 'G2', 'PARAF']);
  const xrayBtn = document.getElementById('t3d-internos');
  xrayBtn?.addEventListener('click', () => {
    xrayBtn.classList.toggle('active');
    const on = xrayBtn.classList.contains('active');
    [principalGroup, impressoraGroup].forEach(g => {
      if (!g) return;
      const all = [...(g.userData.colunaItems || []), ...(g.userData.cabecaItems || []), ...(g.userData.caixaItems || [])];
      all.forEach(m => {
        const cod = m.userData?.cod;
        if (!m.material || cod?.startsWith('LED') || INTERNOS.has(cod)) return;
        m.material.transparent = on;
        m.material.opacity = on ? 0.35 : 1.0;
        m.material.needsUpdate = true;
      });
    });
  });

  // Abrir portas (dobradiças): C2 traseira do totem + F1 frontal da impressora
  const portasBtn = document.getElementById('t3d-portas');
  portasBtn?.addEventListener('click', () => {
    portasBtn.classList.toggle('active');
    const open = portasBtn.classList.contains('active');
    if (principalGroup?.userData.doorPivot)  principalGroup.userData.doorPivot.rotation.y  = open ?  1.9 : 0; // abre p/ trás
    if (impressoraGroup?.userData.doorPivot) impressoraGroup.userData.doorPivot.rotation.y = open ? -1.9 : 0; // abre p/ frente
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
      if (m.userData.isDoor) return; // peças da porta movem na dobradiça, não na explosão
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
