/* ============================================================
   AURA · TOTEM V2 · Lógica de desenho técnico
   (V2 — alinhado à Ficha Técnica AURA Totem V4)
   ============================================================ */

const PRINCIPAL = {
  altura: 1650,

  base: {
    formato: "quadrada",
    lado: 400,
    altura: 60,
    raio_cantos: 80,
    furo_central: { l: 120, p: 130 },
    furo_cabo: 25
  },

  coluna: {
    largura: 120,
    profundidade: 130,
    altura: 990,
    y_inicio: 60,
    y_fim: 1050,
    raio_cantos: 20,
    canal_led: { largura: 15, prof: 5 },
    esp_parede: 15,
    interno: { l: 60, p: 60 }
  },

  cabeca: {
    largura: 340,
    altura: 600,
    profundidade: 180,
    raio: 170,
    y_inicio: 1050,
    y_fim: 1650,
    moldura: 20,
    caixilho: 40,        // largura da borda do quadro estrutural CE (janela vazada interna)
    led_canal: { largura: 10, prof: 8, offset_borda: 18 }
  },

  camera: {
    modelo: "Canon EOS Rebel T7",
    lente: "Canon EF-S 18-55mm IS",
    furo: 68,
    aro: 95,
    aro_prof: 8,
    cy: 1570,
    cx: 170,
    espaco: { l: 150, a: 100, p: 90 }
  },

  monitor: {
    modelo: "15.6\" touchscreen",
    // Moldura física do monitor montado EM PÉ (retrato): 22 cm × 36 cm
    moldura_l: 220,
    moldura_a: 360,
    // Área ativa visível (a tela que acende) — 15.6" 16:9 girado p/ retrato
    rec_l: 194,
    rec_a: 345,
    // REGULAGEM: a borda inferior do monitor é mais grossa que a superior
    // (o monitor não é um retângulo simétrico). Este valor (mm) desloca o
    // RECORTE da tela visível para CIMA em relação ao centro da moldura,
    // para mostrar só a área ativa. Ajustar testando com o monitor real:
    // aumentar se a borda de baixo for mais grossa.
    offset_y: 6,
    rebaixo: 4,
    recuo: 3,
    cy: 1305,   // centro Y da MOLDURA do monitor (altura a partir do chão)
    cx: 170,
    inclinacao: 0
  },

  mini_pc: { l: 130, p: 130, a: 50, cy: 1305 }
};

const IMPRESSORA = {
  altura: 920,
  modelo: "DNP DS620A / Fujifilm ASK-400",
  manutencao: "frontal",
  // Corpo da impressora (DS620A = ASK-400 rebatizada): mesma carcaça
  impressora_unit: { l: 275, p: 366, a: 170, peso: 12 },

  base: {
    formato: "quadrada",
    lado: 350,
    altura: 60,
    raio_cantos: 80,
    furo_central: { l: 120, p: 120 },
    furo_cabo: 25
  },

  coluna: {
    largura: 120,
    profundidade: 120,
    altura: 610,
    y_inicio: 60,
    y_fim: 670,
    raio_cantos: 20,
    canal_led: { largura: 15, prof: 5 }
  },

  caixa: {
    largura: 360,        // V3: 320 → 360 (corpo 275 + folga p/ ar e cabos)
    altura: 250,
    profundidade: 420,   // V3: corpo 366 (~37 cm) + folga; traseira F2 ventilada
    raio_cantos: 40,
    caixilho: 40,        // largura da borda do quadro estrutural FE
    y_inicio: 670,
    y_fim: 920,
    slot: { l: 180, a: 15, cy: 805 }   // centro 135 mm (13,5 cm) acima da base da caixa (y_inicio 670)
  }
};

const config = {
  escala: 0.32,
  cotas: true,
  leds: true,
  internos: true,
  rotulos: false
};

const SVG_NS = "http://www.w3.org/2000/svg";

/* ============== HELPERS SVG ============== */

function el(tag, attrs = {}, children = []) {
  const n = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  for (const c of children) n.appendChild(c);
  return n;
}

const px = (mm) => mm * config.escala;

function defs() {
  const d = el("defs");

  const filter = el("filter", { id: "led-glow", x: "-50%", y: "-50%", width: "200%", height: "200%" });
  filter.appendChild(el("feGaussianBlur", { stdDeviation: "2", result: "blur" }));
  filter.appendChild(el("feMerge", {}, [
    el("feMergeNode", { in: "blur" }),
    el("feMergeNode", { in: "SourceGraphic" })
  ]));
  d.appendChild(filter);

  const arr = el("marker", { id: "arrow", viewBox: "0 0 10 10", refX: 5, refY: 5, markerWidth: 5, markerHeight: 5, orient: "auto" });
  arr.appendChild(el("path", { d: "M 0 0 L 10 5 L 0 10 z", fill: "#6b6258" }));
  d.appendChild(arr);

  return d;
}

function novoSvg(id, w, h, mt = 40, ms = 60, mb = 50) {
  const svg = document.getElementById(id);
  if (!svg) return null;
  svg.innerHTML = "";
  const sw = px(w) + ms * 2;
  const sh = px(h) + mt + mb;
  svg.setAttribute("width", sw);
  svg.setAttribute("height", sh);
  svg.setAttribute("viewBox", `0 0 ${sw} ${sh}`);
  svg.appendChild(defs());
  const g = el("g", { transform: `translate(${ms}, ${mt})` });
  svg.appendChild(g);
  return g;
}

/* ============== FORMAS ============== */

/* Path stadium: retângulo com 2 lados semicirculares (vertical) */
function stadiumPath(cx, cy, w, h) {
  const r = w / 2;
  const topY = cy - h / 2;
  const botY = cy + h / 2;
  return `
    M ${cx - r} ${topY + r}
    A ${r} ${r} 0 0 1 ${cx + r} ${topY + r}
    L ${cx + r} ${botY - r}
    A ${r} ${r} 0 0 1 ${cx - r} ${botY - r}
    Z
  `;
}

/* ============== COTAS ============== */

function cotaH(g, x1, x2, y, txt, opts = {}) {
  if (!config.cotas && !opts.force) return;
  const off = opts.offset ?? 20;
  const dir = opts.dir ?? 1; // 1=acima, -1=abaixo
  const yy = px(y) - off * dir;

  g.appendChild(el("line", { x1: px(x1), y1: px(y), x2: px(x1), y2: yy + (dir > 0 ? 3 : -3), class: "cota-linha" }));
  g.appendChild(el("line", { x1: px(x2), y1: px(y), x2: px(x2), y2: yy + (dir > 0 ? 3 : -3), class: "cota-linha" }));
  g.appendChild(el("line", {
    x1: px(x1), y1: yy, x2: px(x2), y2: yy,
    class: "cota-linha", "marker-start": "url(#arrow)", "marker-end": "url(#arrow)"
  }));

  const t = el("text", { x: (px(x1) + px(x2)) / 2, y: yy - 4, "text-anchor": "middle", class: "cota-texto" });
  t.textContent = txt;
  g.appendChild(t);
}

function cotaV(g, y1, y2, x, txt, opts = {}) {
  if (!config.cotas && !opts.force) return;
  const off = opts.offset ?? 20;
  const dir = opts.dir ?? 1;
  const xx = px(x) + off * dir;

  g.appendChild(el("line", { x1: px(x), y1: px(y1), x2: xx - (dir > 0 ? 3 : -3), y2: px(y1), class: "cota-linha" }));
  g.appendChild(el("line", { x1: px(x), y1: px(y2), x2: xx - (dir > 0 ? 3 : -3), y2: px(y2), class: "cota-linha" }));
  g.appendChild(el("line", {
    x1: xx, y1: px(y1), x2: xx, y2: px(y2),
    class: "cota-linha", "marker-start": "url(#arrow)", "marker-end": "url(#arrow)"
  }));

  const t = el("text", {
    x: xx + (dir > 0 ? 4 : -4), y: (px(y1) + px(y2)) / 2 + 3,
    "text-anchor": dir > 0 ? "start" : "end", class: "cota-texto"
  });
  t.textContent = txt;
  g.appendChild(t);
}

function rotulo(g, x, y, txt, cls = "label") {
  const t = el("text", { x: px(x), y: px(y), class: cls });
  t.textContent = txt;
  g.appendChild(t);
}

/* ============================================================
   VISTAS — MÓDULO PRINCIPAL
   ============================================================ */

function renderPrincipalFrontal() {
  const T = PRINCIPAL;
  const larguraDesenho = T.base.lado; // 400
  const g = novoSvg("p-frontal", larguraDesenho, T.altura, 55, 70, 70);
  if (!g) return;
  const altoT = T.altura;
  const centroX = larguraDesenho / 2;

  // === BASE QUADRADA (vista frontal) ===
  const baseY = altoT - T.base.altura;
  g.appendChild(el("rect", {
    x: px(centroX - T.base.lado / 2), y: px(baseY),
    width: px(T.base.lado), height: px(T.base.altura),
    rx: px(6), ry: px(6),
    class: "estrutura"
  }));

  // === COLUNA ===
  const colX = centroX - T.coluna.largura / 2;
  const colY = altoT - T.coluna.y_fim;
  g.appendChild(el("rect", {
    x: px(colX), y: px(colY),
    width: px(T.coluna.largura), height: px(T.coluna.altura),
    rx: px(T.coluna.raio_cantos), ry: px(T.coluna.raio_cantos),
    class: "estrutura"
  }));

  // Painel madeira frontal (toda a coluna)
  g.appendChild(el("rect", {
    x: px(colX + 4), y: px(colY + 4),
    width: px(T.coluna.largura - 8), height: px(T.coluna.altura - 8),
    rx: px(T.coluna.raio_cantos - 4), ry: px(T.coluna.raio_cantos - 4),
    class: "madeira"
  }));

  // Canal LED vertical
  if (config.leds) {
    g.appendChild(el("line", {
      x1: px(centroX), y1: px(colY + 10),
      x2: px(centroX), y2: px(colY + T.coluna.altura - 10),
      class: "led-linha"
    }));
    if (config.rotulos) rotulo(g, centroX + 12, colY + T.coluna.altura / 2, "LED 990mm", "label-led");
  }

  // === CABEÇA (stadium 320×480 R160) ===
  const cabCy = altoT - (T.cabeca.y_inicio + T.cabeca.altura / 2);
  const stadium = stadiumPath(px(centroX), px(cabCy), px(T.cabeca.largura), px(T.cabeca.altura));
  g.appendChild(el("path", { d: stadium, class: "estrutura" }));

  // Moldura interna (offset 18mm para distância do LED)
  const stadiumInt = stadiumPath(px(centroX), px(cabCy), px(T.cabeca.largura - 36), px(T.cabeca.altura - 36));
  g.appendChild(el("path", { d: stadiumInt, fill: "#f5ede0", stroke: "#bda687", "stroke-width": 0.8 }));

  // LED perimetral (offset 18 + 5 = 23mm do externo, centro do canal)
  if (config.leds) {
    const ofs = T.cabeca.led_canal.offset_borda * 2 + T.cabeca.led_canal.largura;
    const ledPath = stadiumPath(px(centroX), px(cabCy), px(T.cabeca.largura - ofs), px(T.cabeca.altura - ofs));
    g.appendChild(el("path", { d: ledPath, fill: "none", class: "led-linha", "stroke-width": 3 }));
  }

  // Câmera (furo lente + aro decorativo)
  const camCy = altoT - T.camera.cy;
  // Aro decorativo ⌀95
  g.appendChild(el("circle", {
    cx: px(centroX), cy: px(camCy), r: px(T.camera.aro / 2),
    fill: "#e8dcc6", stroke: "#a89178", "stroke-width": 0.8
  }));
  // Furo lente ⌀68
  g.appendChild(el("circle", {
    cx: px(centroX), cy: px(camCy), r: px(T.camera.furo / 2),
    class: "tela"
  }));
  g.appendChild(el("circle", {
    cx: px(centroX), cy: px(camCy), r: px(T.camera.furo / 2 - 4),
    fill: "#444", stroke: "none"
  }));

  // Monitor montado em pé (retrato)
  const M = T.monitor;
  // Moldura física do monitor (rebaixo onde o monitor encaixa) — tracejada
  const molX = centroX - M.moldura_l / 2;
  const molY = altoT - M.cy - M.moldura_a / 2;
  g.appendChild(el("rect", {
    x: px(molX), y: px(molY),
    width: px(M.moldura_l), height: px(M.moldura_a),
    fill: "none", stroke: "#9e8a6f", "stroke-width": 0.6, "stroke-dasharray": "2 2"
  }));
  // Recorte da tela visível (área ativa) — deslocado p/ cima pela regulagem (offset_y)
  const recCy = M.cy + M.offset_y;
  const monX = centroX - M.rec_l / 2;
  const monY = altoT - recCy - M.rec_a / 2;
  g.appendChild(el("rect", {
    x: px(monX), y: px(monY),
    width: px(M.rec_l), height: px(M.rec_a),
    class: "tela"
  }));

  if (config.rotulos) {
    rotulo(g, centroX + T.camera.aro / 2 + 6, camCy + 3, "⌀68 lente / ⌀95 aro", "label-small");
    rotulo(g, monX + 6, monY + 14, "Tela 15.6\"", "label-small");
  }

  // === COTAS ===
  cotaH(g, centroX - T.base.lado / 2, centroX + T.base.lado / 2, altoT + 8, "400", { dir: -1, offset: 20 });
  cotaH(g, colX, colX + T.coluna.largura, altoT - T.coluna.y_inicio + 10, "120", { dir: -1, offset: 20 });
  cotaH(g, centroX - T.cabeca.largura / 2, centroX + T.cabeca.largura / 2, altoT - T.cabeca.y_fim - 10, String(T.cabeca.largura));

  cotaV(g, altoT, 0, larguraDesenho, String(T.altura), { offset: 30 });
  cotaV(g, altoT, altoT - T.base.altura, 0, "60", { dir: -1, offset: 25 });
  cotaV(g, altoT - T.coluna.y_inicio, altoT - T.coluna.y_fim, 0, "990", { dir: -1, offset: 25 });
  cotaV(g, altoT - T.cabeca.y_inicio, altoT - T.cabeca.y_fim, larguraDesenho, String(T.cabeca.altura), { offset: 30 });
  cotaV(g, altoT, altoT - T.camera.cy, larguraDesenho, String(T.camera.cy), { offset: 55 });
  cotaV(g, altoT, altoT - recCy, larguraDesenho, String(recCy), { offset: 80 });
}

function renderPrincipalLateral() {
  const T = PRINCIPAL;
  const larguraDesenho = T.cabeca.profundidade + 20;
  const g = novoSvg("p-lateral", larguraDesenho, T.altura, 55, 50, 50);
  if (!g) return;
  const altoT = T.altura;
  const cx = larguraDesenho / 2;

  // Base (lateral mostra profundidade total = lado)
  const baseY = altoT - T.base.altura;
  g.appendChild(el("rect", {
    x: px(cx - T.base.lado / 2 * 0.4), y: px(baseY),
    width: px(T.base.lado * 0.4), height: px(T.base.altura),
    rx: px(6),
    class: "estrutura"
  }));

  // Coluna (visão lateral mostra profundidade)
  g.appendChild(el("rect", {
    x: px(cx - T.coluna.profundidade / 2), y: px(altoT - T.coluna.y_fim),
    width: px(T.coluna.profundidade), height: px(T.coluna.altura),
    rx: px(T.coluna.raio_cantos),
    class: "estrutura"
  }));

  // Cabeça (vista lateral = retângulo arredondado vertical)
  g.appendChild(el("rect", {
    x: px(cx - T.cabeca.profundidade / 2), y: px(altoT - T.cabeca.y_fim),
    width: px(T.cabeca.profundidade), height: px(T.cabeca.altura),
    rx: px(15),
    class: "estrutura"
  }));

  // Frente
  rotulo(g, cx - T.cabeca.profundidade / 2 - 20, altoT / 2, "← FRENTE", "label-small");

  // Componentes internos
  if (config.internos) {
    // Monitor (próximo da frente)
    g.appendChild(el("rect", {
      x: px(cx - T.cabeca.profundidade / 2 + 18), y: px(altoT - T.monitor.cy - T.monitor.moldura_a / 2),
      width: px(30), height: px(T.monitor.moldura_a),
      class: "componente"
    }));
    // Câmera
    g.appendChild(el("rect", {
      x: px(cx - T.camera.espaco.p / 2), y: px(altoT - T.camera.cy - T.camera.espaco.a / 2),
      width: px(T.camera.espaco.p), height: px(T.camera.espaco.a),
      class: "componente"
    }));
    // Mini PC
    g.appendChild(el("rect", {
      x: px(cx + T.cabeca.profundidade / 2 - T.mini_pc.p - 5), y: px(altoT - T.mini_pc.cy - T.mini_pc.a / 2),
      width: px(T.mini_pc.p * 0.6), height: px(T.mini_pc.a),
      class: "componente"
    }));
  }

  // Cotas
  cotaH(g, cx - T.cabeca.profundidade / 2, cx + T.cabeca.profundidade / 2, altoT - T.cabeca.y_fim - 10, "180");
  cotaH(g, cx - T.coluna.profundidade / 2, cx + T.coluna.profundidade / 2, altoT - T.coluna.y_inicio + 10, "130", { dir: -1, offset: 20 });
  cotaV(g, altoT, 0, larguraDesenho, String(altoT), { offset: 25 });
}

function renderPrincipalSuperior() {
  const T = PRINCIPAL;
  const w = T.base.lado + 60;
  const g = novoSvg("p-superior", w, w, 30, 30, 30);
  if (!g) return;
  const cx = w / 2;

  // Base quadrada com cantos arredondados R80
  g.appendChild(el("rect", {
    x: px(cx - T.base.lado / 2), y: px(cx - T.base.lado / 2),
    width: px(T.base.lado), height: px(T.base.lado),
    rx: px(T.base.raio_cantos), ry: px(T.base.raio_cantos),
    class: "estrutura"
  }));

  // Coluna projetada (centro)
  g.appendChild(el("rect", {
    x: px(cx - T.coluna.largura / 2), y: px(cx - T.coluna.profundidade / 2),
    width: px(T.coluna.largura), height: px(T.coluna.profundidade),
    rx: px(T.coluna.raio_cantos),
    fill: "rgba(196, 168, 130, 0.4)", stroke: "#8b6f4f", "stroke-width": 0.8, "stroke-dasharray": "3 2"
  }));

  // Furo cabo (traseira)
  g.appendChild(el("circle", {
    cx: px(cx), cy: px(cx + T.base.lado / 2 - 40), r: px(T.base.furo_cabo / 2),
    class: "recorte"
  }));

  // Indicação FRENTE
  rotulo(g, cx - 30, 0, "↑ FRENTE", "label-small");

  // Cotas
  cotaH(g, cx - T.base.lado / 2, cx + T.base.lado / 2, w - 5, "400", { dir: -1, offset: 15 });
  cotaH(g, cx - T.coluna.largura / 2, cx + T.coluna.largura / 2, cx - T.coluna.profundidade / 2 - 8, "120");
}

/* ============================================================
   VISTAS — MÓDULO IMPRESSORA
   ============================================================ */

function renderImpressoraFrontal() {
  const T = IMPRESSORA;
  const w = T.caixa.largura + 60;
  const g = novoSvg("i-frontal", w, T.altura, 55, 60, 60);
  if (!g) return;
  const cx = w / 2;
  const altoT = T.altura;

  // Base quadrada
  const baseY = altoT - T.base.altura;
  g.appendChild(el("rect", {
    x: px(cx - T.base.lado / 2), y: px(baseY),
    width: px(T.base.lado), height: px(T.base.altura),
    rx: px(6), ry: px(6),
    class: "estrutura"
  }));

  // Coluna
  const colY = altoT - T.coluna.y_fim;
  g.appendChild(el("rect", {
    x: px(cx - T.coluna.largura / 2), y: px(colY),
    width: px(T.coluna.largura), height: px(T.coluna.altura),
    rx: px(T.coluna.raio_cantos),
    class: "estrutura"
  }));
  // Painel madeira
  g.appendChild(el("rect", {
    x: px(cx - T.coluna.largura / 2 + 3), y: px(colY + 3),
    width: px(T.coluna.largura - 6), height: px(T.coluna.altura - 6),
    rx: px(T.coluna.raio_cantos - 3),
    class: "madeira"
  }));
  // LED vertical
  if (config.leds) {
    g.appendChild(el("line", {
      x1: px(cx), y1: px(colY + 8), x2: px(cx), y2: px(colY + T.coluna.altura - 8),
      class: "led-linha"
    }));
  }

  // Caixa (retângulo com cantos arredondados, 320×250)
  const caixaY = altoT - T.caixa.y_fim;
  g.appendChild(el("rect", {
    x: px(cx - T.caixa.largura / 2), y: px(caixaY),
    width: px(T.caixa.largura), height: px(T.caixa.altura),
    rx: px(T.caixa.raio_cantos),
    class: "estrutura"
  }));
  // Painel madeira interno
  g.appendChild(el("rect", {
    x: px(cx - T.caixa.largura / 2 + 12), y: px(caixaY + 12),
    width: px(T.caixa.largura - 24), height: px(T.caixa.altura - 24),
    rx: px(T.caixa.raio_cantos - 8),
    class: "madeira"
  }));

  // Slot saída
  const slotY = altoT - T.caixa.slot.cy - T.caixa.slot.a / 2;
  g.appendChild(el("rect", {
    x: px(cx - T.caixa.slot.l / 2), y: px(slotY),
    width: px(T.caixa.slot.l), height: px(T.caixa.slot.a),
    fill: "#2d2d2d", stroke: "#000", "stroke-width": 0.8
  }));

  // Porta frontal INTEIRA (F1 basculante) — dobradiça à esquerda, trava à direita
  const cxL = cx - T.caixa.largura / 2;
  [0.3, 0.7].forEach(fr => {
    g.appendChild(el("rect", {
      x: px(cxL + 4), y: px(caixaY + T.caixa.altura * fr - 14),
      width: px(7), height: px(28), fill: "#8b6f4f"
    }));
  });
  g.appendChild(el("circle", { cx: px(cx + T.caixa.largura / 2 - 14), cy: px(caixaY + T.caixa.altura / 2), r: px(6), fill: "#444" }));

  if (config.rotulos) {
    rotulo(g, cx + T.caixa.slot.l / 2 + 6, slotY + 8, "Saída foto", "label-small");
    rotulo(g, cxL + 14, caixaY + 30, "Porta frontal INTEIRA", "label-small");
  }

  // Cotas
  cotaH(g, cx - T.caixa.largura / 2, cx + T.caixa.largura / 2, caixaY - 5, String(T.caixa.largura));
  cotaH(g, cx - T.base.lado / 2, cx + T.base.lado / 2, altoT + 5, "350", { dir: -1, offset: 20 });
  cotaV(g, altoT, 0, w, "920", { offset: 25 });
  cotaV(g, altoT - T.caixa.y_inicio, altoT - T.caixa.y_fim, w, "250", { offset: 25 });
  cotaV(g, altoT - T.coluna.y_inicio, altoT - T.coluna.y_fim, 0, "610", { dir: -1, offset: 25 });
}

function renderImpressoraLateral() {
  const T = IMPRESSORA;
  const w = T.caixa.profundidade + 40;
  const g = novoSvg("i-lateral", w, T.altura, 55, 40, 40);
  if (!g) return;
  const cx = w / 2;
  const altoT = T.altura;

  // Base
  g.appendChild(el("rect", {
    x: px(cx - T.base.lado / 2 * 0.4), y: px(altoT - T.base.altura),
    width: px(T.base.lado * 0.4), height: px(T.base.altura),
    rx: px(6), class: "estrutura"
  }));

  // Coluna
  g.appendChild(el("rect", {
    x: px(cx - T.coluna.profundidade / 2), y: px(altoT - T.coluna.y_fim),
    width: px(T.coluna.profundidade), height: px(T.coluna.altura),
    rx: px(T.coluna.raio_cantos), class: "estrutura"
  }));

  // Caixa (V3: 560 mm de profundidade)
  g.appendChild(el("rect", {
    x: px(cx - T.caixa.profundidade / 2), y: px(altoT - T.caixa.y_fim),
    width: px(T.caixa.profundidade), height: px(T.caixa.altura),
    rx: px(T.caixa.raio_cantos), class: "estrutura"
  }));

  // Corpo da impressora DS620A/ASK-400 (366 prof × 170 alt) embutido + folga traseira
  if (config.internos) {
    const U = T.impressora_unit;
    g.appendChild(el("rect", {
      x: px(cx - T.caixa.profundidade / 2 + 18), y: px(altoT - T.caixa.y_inicio - 18 - U.a),
      width: px(U.p), height: px(U.a),
      class: "componente"
    }));
    rotulo(g, cx - T.caixa.profundidade / 2 + 24, altoT - T.caixa.y_inicio - 28, "DS620A/ASK-400", "label-small");
    rotulo(g, cx - T.caixa.profundidade / 2 - 18, altoT - T.caixa.y_fim + 18, "FRENTE →", "label-small");
  }

  cotaH(g, cx - T.caixa.profundidade / 2, cx + T.caixa.profundidade / 2, altoT - T.caixa.y_fim - 8, String(T.caixa.profundidade));
  cotaH(g, cx - T.coluna.profundidade / 2, cx + T.coluna.profundidade / 2, altoT - T.coluna.y_inicio + 10, "120", { dir: -1, offset: 20 });
  cotaV(g, altoT, 0, w, "920", { offset: 20 });
}

/* ============================================================
   CONJUNTO — ambos lado a lado
   ============================================================ */

function renderConjunto() {
  const svg = document.getElementById("conjunto");
  if (!svg) return;
  svg.innerHTML = "";

  const escala = 0.18;
  const espac = 200; // mm entre módulos
  const w_total = PRINCIPAL.base.lado + espac + IMPRESSORA.base.lado;
  const w = w_total * escala + 60;
  const h = PRINCIPAL.altura * escala + 60;

  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.appendChild(defs());

  const g = el("g", { transform: `translate(30, 30)` });
  svg.appendChild(g);

  const xPrinc = PRINCIPAL.base.lado / 2;
  const xImpr = PRINCIPAL.base.lado + espac + IMPRESSORA.base.lado / 2;

  // === Principal silhueta ===
  function silhuetaPrincipal() {
    const T = PRINCIPAL;
    // Base quadrada
    g.appendChild(el("rect", {
      x: (xPrinc - T.base.lado / 2) * escala, y: (T.altura - T.base.altura) * escala,
      width: T.base.lado * escala, height: T.base.altura * escala,
      rx: 4, class: "estrutura"
    }));
    // Coluna
    g.appendChild(el("rect", {
      x: (xPrinc - T.coluna.largura / 2) * escala, y: (T.altura - T.coluna.y_fim) * escala,
      width: T.coluna.largura * escala, height: T.coluna.altura * escala,
      rx: T.coluna.raio_cantos * escala, class: "estrutura"
    }));
    // Cabeça
    const stad = stadiumPath(
      xPrinc * escala, (T.altura - T.cabeca.y_inicio - T.cabeca.altura / 2) * escala,
      T.cabeca.largura * escala, T.cabeca.altura * escala
    );
    g.appendChild(el("path", { d: stad, class: "estrutura" }));

    // Tela (área visível, deslocada pela regulagem offset_y)
    g.appendChild(el("rect", {
      x: (xPrinc - T.monitor.rec_l / 2) * escala, y: (T.altura - (T.monitor.cy + T.monitor.offset_y) - T.monitor.rec_a / 2) * escala,
      width: T.monitor.rec_l * escala, height: T.monitor.rec_a * escala,
      class: "tela"
    }));
    // Câmera
    g.appendChild(el("circle", {
      cx: xPrinc * escala, cy: (T.altura - T.camera.cy) * escala,
      r: T.camera.furo / 2 * escala, fill: "#2d2d2d"
    }));
  }

  function silhuetaImpressora() {
    const T = IMPRESSORA;
    // base quadrada
    g.appendChild(el("rect", {
      x: (xImpr - T.base.lado / 2) * escala,
      y: (PRINCIPAL.altura - T.altura + T.altura - T.base.altura) * escala,
      width: T.base.lado * escala, height: T.base.altura * escala,
      rx: 4, class: "estrutura"
    }));
    // coluna
    g.appendChild(el("rect", {
      x: (xImpr - T.coluna.largura / 2) * escala,
      y: (PRINCIPAL.altura - T.altura + T.altura - T.coluna.y_fim) * escala,
      width: T.coluna.largura * escala, height: T.coluna.altura * escala,
      rx: T.coluna.raio_cantos * escala, class: "estrutura"
    }));
    // caixa
    g.appendChild(el("rect", {
      x: (xImpr - T.caixa.largura / 2) * escala,
      y: (PRINCIPAL.altura - T.altura + T.altura - T.caixa.y_fim) * escala,
      width: T.caixa.largura * escala, height: T.caixa.altura * escala,
      rx: T.caixa.raio_cantos * escala, class: "estrutura"
    }));
    // slot
    g.appendChild(el("rect", {
      x: (xImpr - T.caixa.slot.l / 2) * escala,
      y: (PRINCIPAL.altura - T.altura + T.altura - T.caixa.slot.cy - T.caixa.slot.a / 2) * escala,
      width: T.caixa.slot.l * escala, height: T.caixa.slot.a * escala,
      fill: "#2d2d2d"
    }));
  }

  silhuetaPrincipal();
  silhuetaImpressora();

  // Labels
  const t1 = el("text", { x: xPrinc * escala, y: PRINCIPAL.altura * escala + 18, "text-anchor": "middle", class: "label-small" });
  t1.textContent = "PRINCIPAL · " + PRINCIPAL.altura;
  g.appendChild(t1);
  const t2 = el("text", { x: xImpr * escala, y: PRINCIPAL.altura * escala + 18, "text-anchor": "middle", class: "label-small" });
  t2.textContent = "IMPRESSORA · 920";
  g.appendChild(t2);
}

/* ============================================================
   PLANO DE CORTE — peças individuais
   ============================================================ */

const PECAS_PRINCIPAL = [
  { cod: "A1", nome: "Tampo base (quadrado)", mat: "MDF 18 mm", esp: 18, l: 400, a: 400, qtd: 1, obs: "Quadrado 400×400 com cantos R80, furo central 120×130 (encaixe coluna)", desenha: dBaseQuadFuro },
  { cod: "A2", nome: "Fundo base (quadrado)", mat: "MDF 18 mm", esp: 18, l: 400, a: 400, qtd: 1, obs: "Quadrado 400×400 com cantos R80, furo ⌀25 traseiro (passagem cabo)", desenha: dBaseQuadCabo },
  { cod: "A3a", nome: "Paredes laterais base (longas)", mat: "MDF 15 mm", esp: 15, l: 370, a: 24, qtd: 2, obs: "Réguas retas — altura interna útil 24 mm. 2 paredes longas (lateral)", desenha: dRetSimples },
  { cod: "A3b", nome: "Paredes laterais base (curtas)", mat: "MDF 15 mm", esp: 15, l: 340, a: 24, qtd: 2, obs: "Réguas retas — 2 paredes curtas (frente/trás), encaixam entre as longas", desenha: dRetSimples },
  { cod: "B1", nome: "Frontal coluna", mat: "MDF 15 mm", esp: 15, l: 120, a: 990, qtd: 1, obs: "Canaleta LED central: 15×5×990 mm", desenha: dColunaFrontal },
  { cod: "B1-L", nome: "Lâmina madeira frontal", mat: "Lâmina 0.6 mm", esp: 0.6, l: 120, a: 990, qtd: 1, obs: "Carvalho/freijó natural. Colar antes de fresar canaleta", desenha: dRetSimples },
  { cod: "B2", nome: "Traseiro coluna", mat: "MDF 15 mm", esp: 15, l: 120, a: 990, qtd: 1, obs: "Removível - parafusos M4 (acesso manutenção)", desenha: dRetSimples },
  { cod: "B3", nome: "Laterais coluna", mat: "MDF 15 mm", esp: 15, l: 100, a: 990, qtd: 2, obs: "Largura = 130 − 2×15 = 100 mm (coluna 130 mm de profundidade)", desenha: dRetSimples },
  { cod: "C1", nome: "Frontal cabeça (FIXO)", mat: "MDF 18 mm", esp: 18, l: 340, a: 600, qtd: 1, obs: "Stadium 340×600 R170 FIXO (não abre — mantém o enquadramento). Carrega câmera + tela + LED. Furo lente ⌀68 + rebaixo aro ⌀95×8 (centro 80 mm do topo). Monitor 15.6\" EM PÉ: rebaixo moldura 220×360×4 + recorte tela 194×345 deslocado 6 mm p/ cima. Canal LED perimetral 10×8 a 18 mm da borda", desenha: dCabecaFrontal },
  { cod: "CE", nome: "Estrutural cabeça (quadro vazado)", mat: "MDF 18 mm", esp: 18, l: 340, a: 600, qtd: 1, obs: "OSSO da cabeça. Stadium 340×600 R170 VAZADO (janela interna 260×520, caixilho 40 mm). Fixa o C1 na frente, recebe a dobradiça da porta traseira C2 e apoia na base reta interna G2, que parafusa direto no topo da coluna", desenha: dCabecaEstrutural },
  { cod: "C2", nome: "Traseiro cabeça (PORTA basculante)", mat: "MDF 15 mm", esp: 15, l: 340, a: 600, qtd: 1, obs: "Stadium 340×600 R170. Abre PELA TRASEIRA numa dobradiça lateral fixada no CE. O Mini PC fica montado nela (sai junto ao abrir). Lado oposto: fecho magnético + trava", desenha: dCabecaTraseira },
  { cod: "C3-P", nome: "Pele lateral cabeça", mat: "MDF flex 3 mm", esp: 3, l: 1588, a: 180, qtd: 1, obs: "Perímetro stadium 340×600 R170 = ~1588 mm × 180 mm altura. Cola PVA + grampos finos", desenha: dTira },
  { cod: "H1", nome: "Haste lateral esquerda", mat: "MDF 15 mm", esp: 15, l: 90, a: 40, qtd: 1, obs: "Espaçador C1 → CE (90 = distância frontal-estrutural)", desenha: dRetSimples },
  { cod: "H2", nome: "Haste lateral direita", mat: "MDF 15 mm", esp: 15, l: 90, a: 40, qtd: 1, obs: "Espaçador C1 → CE", desenha: dRetSimples },
  { cod: "H3", nome: "Haste inferior esquerda", mat: "MDF 15 mm", esp: 15, l: 90, a: 40, qtd: 1, obs: "Espaçador C1 → CE (reforço inferior)", desenha: dRetSimples },
  { cod: "H4", nome: "Haste inferior direita", mat: "MDF 15 mm", esp: 15, l: 90, a: 40, qtd: 1, obs: "Espaçador C1 → CE (reforço inferior)", desenha: dRetSimples },
  { cod: "H5", nome: "Haste superior (arco)", mat: "MDF 15 mm", esp: 15, l: 90, a: 40, qtd: 1, obs: "Espaçador C1 → CE (topo do arco stadium)", desenha: dRetSimples },
  { cod: "C4", nome: "Suporte monitor", mat: "MDF 15 mm", esp: 15, l: 240, a: 20, qtd: 2, obs: "Barras horizontais no C1 (1 acima + 1 abaixo da moldura do monitor)", desenha: dRetSimples },
  { cod: "C5", nome: "Suporte câmera", mat: "MDF 15 mm", esp: 15, l: 140, a: 130, qtd: 1, obs: "Fixo no C1 (140 largura × 130 profundidade). Furo rosca 1/4\" a 10 mm da borda frontal (câmera recuada 1 cm) para a Canon EOS Rebel T7", desenha: dSuporteCamera },
  { cod: "G1", nome: "Encaixe coluna ↔ base (interno)", mat: "MDF 18 mm", esp: 18, l: 140, a: 150, qtd: 1, obs: "Quadro interno escondido na base. Centra a coluna no soquete 120×130. 4× parafuso-conector M6 + insertos", desenha: dFlangeUniao },
  { cod: "G2", nome: "Base de fixação reta da cabeça (interna)", mat: "MDF 18 mm", esp: 18, l: 130, a: 130, qtd: 1, obs: "BASE RETA por DENTRO da cabeça, sobre o topo da coluna. A cabeça conecta DIRETO na coluna (sem placa de transição aparente): furo passa-cabo ⌀30 + 3–4 parafusos M6 REMOVÍVEIS", desenha: dFlangeCabo }
];

const PECAS_IMPRESSORA = [
  { cod: "D1", nome: "Tampo base impressora", mat: "MDF 18 mm", esp: 18, l: 350, a: 350, qtd: 1, obs: "Quadrado 350×350 cantos R80, furo central 120×120 (encaixe coluna)", desenha: dBaseQuadFuroImpr },
  { cod: "D2", nome: "Fundo base impressora", mat: "MDF 18 mm", esp: 18, l: 350, a: 350, qtd: 1, obs: "Quadrado 350×350 cantos R80, furo ⌀25 traseiro", desenha: dBaseQuadCaboImpr },
  { cod: "D3a", nome: "Paredes laterais base impr. (longas)", mat: "MDF 15 mm", esp: 15, l: 320, a: 24, qtd: 2, obs: "Réguas retas — 2 paredes longas", desenha: dRetSimples },
  { cod: "D3b", nome: "Paredes laterais base impr. (curtas)", mat: "MDF 15 mm", esp: 15, l: 290, a: 24, qtd: 2, obs: "Réguas retas — 2 paredes curtas (encaixam entre as longas)", desenha: dRetSimples },
  { cod: "E1", nome: "Frontal coluna impr.", mat: "MDF 15 mm", esp: 15, l: 120, a: 610, qtd: 1, obs: "Canaleta LED central: 15×5×610 mm", desenha: dColunaFrontal },
  { cod: "E1-L", nome: "Lâmina madeira coluna impr.", mat: "Lâmina 0.6 mm", esp: 0.6, l: 120, a: 610, qtd: 1, obs: "Carvalho/freijó", desenha: dRetSimples },
  { cod: "E2", nome: "Traseiro coluna impr.", mat: "MDF 15 mm", esp: 15, l: 120, a: 610, qtd: 1, obs: "Removível", desenha: dRetSimples },
  { cod: "E3", nome: "Laterais coluna impr.", mat: "MDF 15 mm", esp: 15, l: 90, a: 610, qtd: 2, obs: "Largura = 120 − 2×15 = 90 mm", desenha: dRetSimples },
  { cod: "F1", nome: "Frontal caixa (PORTA basculante)", mat: "MDF 18 mm", esp: 18, l: 360, a: 250, qtd: 1, obs: "Cantos R40. PAINEL FRONTAL INTEIRO abre numa dobradiça lateral (gira no FE). Mantém o slot da foto 180×15. Acesso frontal total à impressora DS620A/ASK-400", desenha: dCaixaFrontal },
  { cod: "F1-L", nome: "Lâmina madeira caixa", mat: "Lâmina 0.6 mm", esp: 0.6, l: 360, a: 250, qtd: 1, obs: "Mesmo recorte do slot. Colada no F1 (porta)", desenha: dRetSimples },
  { cod: "FE", nome: "Estrutural caixa (quadro vazado)", mat: "MDF 18 mm", esp: 18, l: 360, a: 250, qtd: 1, obs: "Quadro R40 VAZADO (caixilho 40 mm) fixo na caixa. Recebe a dobradiça do F1 e a trava. Equivalente ao CE da cabeça", desenha: dCaixaEstrutural },
  { cod: "F2", nome: "Traseiro caixa (ventilado)", mat: "MDF 15 mm", esp: 15, l: 360, a: 250, qtd: 1, obs: "Cantos R40. Grelha de ventilação + folga p/ a passada do papel dye-sub. Removível (imãs + fechadura)", desenha: dCaixaTraseiraVent },
  { cod: "F3", nome: "Laterais caixa impr.", mat: "MDF 15 mm", esp: 15, l: 384, a: 250, qtd: 2, obs: "Profundidade interna = 420 − 18 − 18 = 384 mm. Cantos R40 nas bordas", desenha: dRetSimples },
  { cod: "F4", nome: "Topo da caixa impr.", mat: "MDF 15 mm", esp: 15, l: 324, a: 384, qtd: 1, obs: "Encaixa entre F1, F2 e F3 (324 = 360 − 2×18)", desenha: dRetSimples },
  { cod: "F5", nome: "Fundo da caixa impr.", mat: "MDF 15 mm", esp: 15, l: 324, a: 384, qtd: 1, obs: "Furo central 120×120 (encaixe coluna) + furo passa-cabo", desenha: dRetFuro },
  { cod: "G1", nome: "Encaixe coluna ↔ base impr. (interno)", mat: "MDF 18 mm", esp: 18, l: 140, a: 150, qtd: 1, obs: "Quadro interno escondido na base. Centra a coluna no soquete 120×120. 4× parafuso-conector M6 + insertos", desenha: dFlangeUniao },
  { cod: "G2", nome: "Base de fixação reta da caixa (interna)", mat: "MDF 18 mm", esp: 18, l: 130, a: 130, qtd: 1, obs: "BASE RETA por DENTRO da caixa, sobre o topo da coluna. A caixa conecta DIRETO na coluna: furo passa-cabo ⌀30 + 3–4 parafusos M6 REMOVÍVEIS", desenha: dFlangeCabo }
];

/* ===== DESENHOS DAS PEÇAS ===== */

function escalaCanvas(l, a, maxW = 240, maxH = 180) {
  return Math.min(maxW / l, maxH / a, 0.6);
}

function pieceSvg(p) {
  const esc = escalaCanvas(p.l, p.a);
  const pad = 36;
  const w = p.l * esc + pad * 2;
  const h = p.a * esc + pad * 2;

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.appendChild(defs());

  const g = el("g", { transform: `translate(${pad}, ${pad})` });
  svg.appendChild(g);

  p.desenha(g, p, esc);

  // Cotas externas
  cotaHCanvas(g, 0, p.l, p.a, esc, String(p.l), 1);
  cotaVCanvas(g, 0, p.a, p.l, esc, String(p.a), 1);

  return svg;
}

function cotaHCanvas(g, x1, x2, y, esc, txt, dir = 1) {
  const off = 16;
  const yy = y * esc + off * dir;
  g.appendChild(el("line", { x1: x1 * esc, y1: y * esc, x2: x1 * esc, y2: yy - (dir > 0 ? 3 : -3), class: "cota-linha" }));
  g.appendChild(el("line", { x1: x2 * esc, y1: y * esc, x2: x2 * esc, y2: yy - (dir > 0 ? 3 : -3), class: "cota-linha" }));
  g.appendChild(el("line", { x1: x1 * esc, y1: yy, x2: x2 * esc, y2: yy, class: "cota-linha", "marker-start": "url(#arrow)", "marker-end": "url(#arrow)" }));
  const t = el("text", { x: (x1 + x2) * esc / 2, y: yy + (dir > 0 ? 11 : -4), "text-anchor": "middle", class: "cota-texto" });
  t.textContent = txt;
  g.appendChild(t);
}

function cotaVCanvas(g, y1, y2, x, esc, txt, dir = 1) {
  const off = 16;
  const xx = x * esc + off * dir;
  g.appendChild(el("line", { x1: x * esc, y1: y1 * esc, x2: xx - (dir > 0 ? 3 : -3), y2: y1 * esc, class: "cota-linha" }));
  g.appendChild(el("line", { x1: x * esc, y1: y2 * esc, x2: xx - (dir > 0 ? 3 : -3), y2: y2 * esc, class: "cota-linha" }));
  g.appendChild(el("line", { x1: xx, y1: y1 * esc, x2: xx, y2: y2 * esc, class: "cota-linha", "marker-start": "url(#arrow)", "marker-end": "url(#arrow)" }));
  const t = el("text", { x: xx + (dir > 0 ? 4 : -4), y: (y1 + y2) * esc / 2 + 4, "text-anchor": dir > 0 ? "start" : "end", class: "cota-texto" });
  t.textContent = txt;
  g.appendChild(t);
}

/* === Desenhos individuais === */

function dRetSimples(g, p, esc) {
  g.appendChild(el("rect", { x: 0, y: 0, width: p.l * esc, height: p.a * esc, class: "estrutura" }));
}

function dRetFuro(g, p, esc) {
  g.appendChild(el("rect", { x: 0, y: 0, width: p.l * esc, height: p.a * esc, class: "estrutura" }));
  const fl = 120, fa = 120;
  const fx = (p.l - fl) / 2;
  const fy = (p.a - fa) / 2;
  g.appendChild(el("rect", { x: fx * esc, y: fy * esc, width: fl * esc, height: fa * esc, class: "recorte" }));
  const t = el("text", { x: p.l * esc / 2, y: p.a * esc / 2 + 4, "text-anchor": "middle", class: "cota-texto" });
  t.textContent = "120×120";
  g.appendChild(t);
}

/* === Base quadrada com cantos R80 (substitui dDiscoFuro V1) === */
function dBaseQuadFuro(g, p, esc) {
  g.appendChild(el("rect", {
    x: 0, y: 0, width: p.l * esc, height: p.a * esc,
    rx: 80 * esc, ry: 80 * esc, class: "estrutura"
  }));
  const fl = 120, fa = 130;
  const fx = (p.l - fl) / 2;
  const fy = (p.a - fa) / 2;
  g.appendChild(el("rect", { x: fx * esc, y: fy * esc, width: fl * esc, height: fa * esc, class: "recorte" }));
  const t = el("text", { x: p.l * esc / 2, y: p.a * esc / 2 + 4, "text-anchor": "middle", class: "cota-texto" });
  t.textContent = "120×130";
  g.appendChild(t);
  const t2 = el("text", { x: p.l * esc / 2, y: p.a * esc / 2 + 18, "text-anchor": "middle", class: "label-small" });
  t2.textContent = "400×400 R80";
  g.appendChild(t2);
}

function dBaseQuadFuroImpr(g, p, esc) {
  g.appendChild(el("rect", {
    x: 0, y: 0, width: p.l * esc, height: p.a * esc,
    rx: 80 * esc, ry: 80 * esc, class: "estrutura"
  }));
  const fl = 120, fa = 120;
  const fx = (p.l - fl) / 2;
  const fy = (p.a - fa) / 2;
  g.appendChild(el("rect", { x: fx * esc, y: fy * esc, width: fl * esc, height: fa * esc, class: "recorte" }));
  const t = el("text", { x: p.l * esc / 2, y: p.a * esc / 2 + 4, "text-anchor": "middle", class: "cota-texto" });
  t.textContent = "120×120";
  g.appendChild(t);
  const t2 = el("text", { x: p.l * esc / 2, y: p.a * esc / 2 + 18, "text-anchor": "middle", class: "label-small" });
  t2.textContent = "350×350 R80";
  g.appendChild(t2);
}

function dBaseQuadCabo(g, p, esc) {
  g.appendChild(el("rect", {
    x: 0, y: 0, width: p.l * esc, height: p.a * esc,
    rx: 80 * esc, ry: 80 * esc, class: "estrutura"
  }));
  // Furo cabo na traseira, 60mm do centro
  g.appendChild(el("circle", { cx: (p.l / 2) * esc, cy: (p.a / 2 + 60) * esc, r: 12.5 * esc, class: "recorte" }));
  const t = el("text", { x: (p.l / 2) * esc, y: (p.a / 2 + 60) * esc + 14, "text-anchor": "middle", class: "cota-texto" });
  t.textContent = "⌀25";
  g.appendChild(t);
}

function dBaseQuadCaboImpr(g, p, esc) {
  g.appendChild(el("rect", {
    x: 0, y: 0, width: p.l * esc, height: p.a * esc,
    rx: 80 * esc, ry: 80 * esc, class: "estrutura"
  }));
  g.appendChild(el("circle", { cx: (p.l / 2) * esc, cy: (p.a / 2 + 50) * esc, r: 12.5 * esc, class: "recorte" }));
  const t = el("text", { x: (p.l / 2) * esc, y: (p.a / 2 + 50) * esc + 14, "text-anchor": "middle", class: "cota-texto" });
  t.textContent = "⌀25";
  g.appendChild(t);
}

function dTira(g, p, esc) {
  // Tira deitada (peça muito longa e fina). Vamos representar em escala compatível.
  g.appendChild(el("rect", { x: 0, y: 0, width: p.l * esc, height: p.a * esc, class: "estrutura" }));
  const t = el("text", { x: p.l * esc / 2, y: p.a * esc + 20, "text-anchor": "middle", class: "label-small" });
  t.textContent = "Tira curvada (vapor) ou borda PVC";
  g.appendChild(t);
}

function dColunaFrontal(g, p, esc) {
  g.appendChild(el("rect", { x: 0, y: 0, width: p.l * esc, height: p.a * esc, class: "estrutura" }));
  // canaleta LED central
  const canW = 15;
  g.appendChild(el("rect", {
    x: ((p.l - canW) / 2) * esc, y: 0,
    width: canW * esc, height: p.a * esc,
    fill: "rgba(255, 234, 167, 0.35)", stroke: "#d4a04a", "stroke-width": 0.8, "stroke-dasharray": "2 2"
  }));
  const t = el("text", { x: p.l * esc / 2, y: p.a * esc / 2 + 4, "text-anchor": "middle", class: "label-led", transform: `rotate(-90 ${p.l * esc / 2} ${p.a * esc / 2})` });
  t.textContent = "CANAL LED 15×5";
  g.appendChild(t);
}

function dColunaFrontalImpr(g, p, esc) {
  dColunaFrontal(g, p, esc);
}

function dCabecaFrontal(g, p, esc) {
  // C1: stadium 320×480 R160 + furo lente ⌀68 + aro ⌀95 + recorte monitor vertical + canal LED perimetral
  const cx = p.l / 2;
  const cy = p.a / 2;

  const stad = stadiumPath(cx * esc, cy * esc, p.l * esc, p.a * esc);
  g.appendChild(el("path", { d: stad, class: "estrutura" }));

  // Canal LED (a 18mm da borda)
  const ofs = 18 * 2 + 10;
  const stadLed = stadiumPath(cx * esc, cy * esc, (p.l - ofs) * esc, (p.a - ofs) * esc);
  g.appendChild(el("path", { d: stadLed, fill: "none", stroke: "#d4a04a", "stroke-width": 0.8, "stroke-dasharray": "3 2" }));

  // Posições medidas a partir do TOPO da cabeça
  const cab = PRINCIPAL.cabeca, cam = PRINCIPAL.camera, M = PRINCIPAL.monitor;
  const camY = cab.y_fim - cam.cy;                  // câmera (80mm do topo)
  const molY = cab.y_fim - M.cy;                    // centro da moldura
  const recY = cab.y_fim - (M.cy + M.offset_y);     // centro do recorte (regulagem)

  // Câmera: aro decorativo ⌀95 + furo lente ⌀68
  g.appendChild(el("circle", { cx: cx * esc, cy: camY * esc, r: cam.aro / 2 * esc, fill: "none", stroke: "#a89178", "stroke-width": 0.8, "stroke-dasharray": "2 2" }));
  g.appendChild(el("circle", { cx: cx * esc, cy: camY * esc, r: cam.furo / 2 * esc, class: "recorte" }));
  const t1 = el("text", { x: (cx + 52) * esc, y: camY * esc, class: "cota-texto" });
  t1.textContent = "⌀68 / aro ⌀95";
  g.appendChild(t1);

  // Moldura do monitor 220×360 (rebaixo, tracejada) — monitor em pé
  g.appendChild(el("rect", {
    x: (cx - M.moldura_l / 2) * esc, y: (molY - M.moldura_a / 2) * esc,
    width: M.moldura_l * esc, height: M.moldura_a * esc,
    fill: "none", stroke: "#9e8a6f", "stroke-width": 0.6, "stroke-dasharray": "2 2"
  }));
  // Recorte da tela visível (área ativa, deslocado p/ cima pela regulagem)
  g.appendChild(el("rect", {
    x: (cx - M.rec_l / 2) * esc, y: (recY - M.rec_a / 2) * esc,
    width: M.rec_l * esc, height: M.rec_a * esc,
    class: "recorte"
  }));
  const t2 = el("text", { x: cx * esc, y: recY * esc + 4, "text-anchor": "middle", class: "cota-texto" });
  t2.textContent = M.rec_l + "×" + M.rec_a + " (moldura " + M.moldura_l + "×" + M.moldura_a + ", rebaixo " + M.rebaixo + "mm)";
  g.appendChild(t2);

  // Cotas Y
  cotaVCanvas(g, 0, camY, p.l, esc, String(camY), 1);
  cotaVCanvas(g, 0, recY - M.rec_a / 2, -10, esc, String(recY - M.rec_a / 2), -1);
}

function dCabecaTraseira(g, p, esc) {
  const cx = p.l / 2;
  const cy = p.a / 2;
  const stad = stadiumPath(cx * esc, cy * esc, p.l * esc, p.a * esc);
  g.appendChild(el("path", { d: stad, class: "estrutura" }));

  // Porta magnética centralizada (margens ~35mm laterais, ~55mm topo/base)
  const portaW = p.l - 70, portaH = p.a - 110;
  g.appendChild(el("rect", {
    x: (cx - portaW / 2) * esc, y: (cy - portaH / 2) * esc,
    width: portaW * esc, height: portaH * esc,
    fill: "none", stroke: "#8b6f4f", "stroke-width": 1.0, "stroke-dasharray": "4 3"
  }));
  // Marcas de imãs nos 4 cantos
  [[cx - portaW / 2 + 15, cy - portaH / 2 + 15],
   [cx + portaW / 2 - 15, cy - portaH / 2 + 15],
   [cx - portaW / 2 + 15, cy + portaH / 2 - 15],
   [cx + portaW / 2 - 15, cy + portaH / 2 - 15]].forEach(([ix, iy]) => {
    g.appendChild(el("circle", { cx: ix * esc, cy: iy * esc, r: 5 * esc, fill: "#3d352a" }));
  });
  // Fechadura (centro)
  g.appendChild(el("circle", { cx: cx * esc, cy: cy * esc, r: 6 * esc, fill: "#444" }));

  const t = el("text", { x: cx * esc, y: (cy + 18) * esc, "text-anchor": "middle", class: "cota-texto" });
  t.textContent = "Porta " + portaW + "×" + portaH + " (imãs+fechadura)";
  g.appendChild(t);
}

function dSuporteCamera(g, p, esc) {
  g.appendChild(el("rect", { x: 0, y: 0, width: p.l * esc, height: p.a * esc, class: "estrutura" }));

  // Orientação: a LENTE aponta para o C1 (topo do desenho = frente do totem);
  // a TELA fica no lado oposto (fundo = borda de baixo, lado da porta C2).
  // Referência fixa: a TELA recua 10 mm da borda de FUNDO. O soquete do tripé
  // fica sob a lente, a ~52 mm da face da tela → é aí que vai o furo 1/4".
  const telaRecuo = 30;                       // tela a 30 mm da borda de FUNDO (câmera toda dentro)
  const roscaTela = 52;                       // soquete a ~52 mm da face da tela — MEDIR na câmera real
  const furoFundo = telaRecuo + roscaTela;    // = 82 mm da borda de fundo
  const furoRec = p.a - furoFundo;            // = 48 mm da borda frontal (topo)
  const fx = p.l / 2;                         // centro na largura
  const fy = furoRec;
  g.appendChild(el("circle", { cx: fx * esc, cy: fy * esc, r: 4 * esc, class: "componente" }));
  const t = el("text", { x: fx * esc, y: (fy + 12) * esc, "text-anchor": "middle", class: "label-small" });
  t.textContent = "rosca 1/4\"";
  g.appendChild(t);

  // Marcas de orientação
  const tf = el("text", { x: fx * esc, y: -4 * esc, "text-anchor": "middle", class: "cota-texto" });
  tf.textContent = "frente / lente (C1)";
  g.appendChild(tf);
  const tb = el("text", { x: fx * esc, y: (p.a + 12) * esc, "text-anchor": "middle", class: "cota-texto" });
  tb.textContent = "fundo / tela (C2)";
  g.appendChild(tb);

  // Cota do furo: da borda de FUNDO (referência da tela) até o centro da rosca
  const cotaX = p.l - 22;
  g.appendChild(el("line", {
    x1: cotaX * esc, y1: fy * esc, x2: cotaX * esc, y2: p.a * esc,
    class: "cota-linha", "marker-start": "url(#arrow)", "marker-end": "url(#arrow)"
  }));
  const tc = el("text", { x: (cotaX + 10) * esc, y: ((fy + p.a) / 2 + 3) * esc, "text-anchor": "start", class: "cota-texto" });
  tc.textContent = String(furoFundo);
  g.appendChild(tc);
}

function dCaixaFrontal(g, p, esc) {
  // F1: PORTA basculante inteira (360×250 R40). Dobradiça à esquerda, trava à direita + slot
  g.appendChild(el("rect", {
    x: 0, y: 0, width: p.l * esc, height: p.a * esc,
    rx: 40 * esc, ry: 40 * esc,
    class: "estrutura"
  }));

  // Dobradiça (lado esquerdo) — marcas
  [0.28, 0.72].forEach(fr => {
    g.appendChild(el("rect", {
      x: 2 * esc, y: (p.a * fr - 14) * esc,
      width: 8 * esc, height: 28 * esc,
      fill: "#8b6f4f", stroke: "#5c4a32", "stroke-width": 0.6
    }));
  });
  // Trava (lado direito) — marca
  g.appendChild(el("circle", { cx: (p.l - 14) * esc, cy: (p.a / 2) * esc, r: 6 * esc, fill: "#444" }));

  // Slot saída — centro 135mm da base (= 115mm do topo num painel de 250)
  const slotW = 180, slotH = 15;
  const slotX = (p.l - slotW) / 2;
  const slotY = (p.a - 135) - slotH / 2;
  g.appendChild(el("rect", {
    x: slotX * esc, y: slotY * esc,
    width: slotW * esc, height: slotH * esc,
    fill: "#2d2d2d"
  }));

  const t = el("text", { x: p.l * esc / 2, y: (slotY - 4) * esc, "text-anchor": "middle", class: "cota-texto" });
  t.textContent = "Slot 180×15";
  g.appendChild(t);

  // Cota da ALTURA do slot: centro 135 mm acima da base (borda inferior do painel)
  const slotCy = p.a - 135;          // centro do slot em mm (a partir do topo)
  const cotaX = p.l - 28;            // coluna da cota, à direita do slot
  g.appendChild(el("line", {
    x1: cotaX * esc, y1: slotCy * esc, x2: cotaX * esc, y2: p.a * esc,
    class: "cota-linha", "marker-start": "url(#arrow)", "marker-end": "url(#arrow)"
  }));
  g.appendChild(el("line", { x1: (slotX + slotW) * esc, y1: slotCy * esc, x2: cotaX * esc, y2: slotCy * esc, class: "cota-linha" }));
  const tA = el("text", { x: (cotaX + 5) * esc, y: ((slotCy + p.a) / 2) * esc, "text-anchor": "start", class: "cota-texto" });
  tA.textContent = "135 (da base)";
  g.appendChild(tA);

  const t2 = el("text", { x: p.l * esc / 2, y: (p.a / 2 + 30) * esc, "text-anchor": "middle", class: "cota-texto" });
  t2.textContent = "Porta frontal INTEIRA (dobradiça ←, trava →)";
  g.appendChild(t2);
}

function dCantoArredondado(g, p, esc) {
  g.appendChild(el("rect", {
    x: 0, y: 0, width: p.l * esc, height: p.a * esc,
    rx: 40 * esc, ry: 40 * esc,
    class: "estrutura"
  }));
}

/* === V3: quadro estrutural da cabeça (CE) — stadium vazado === */
function dCabecaEstrutural(g, p, esc) {
  const cx = p.l / 2, cy = p.a / 2;
  const cai = PRINCIPAL.cabeca.caixilho; // 40
  // Contorno externo stadium
  g.appendChild(el("path", { d: stadiumPath(cx * esc, cy * esc, p.l * esc, p.a * esc), class: "estrutura" }));
  // Janela interna vazada (stadium menor) — recorte
  g.appendChild(el("path", {
    d: stadiumPath(cx * esc, cy * esc, (p.l - cai * 2) * esc, (p.a - cai * 2) * esc),
    fill: "#efe7d8", stroke: "#bda687", "stroke-width": 0.8, "stroke-dasharray": "4 3"
  }));
  // Marca de dobradiça (esquerda) e trava (direita) no caixilho
  [-1, 1].forEach(s => {
    g.appendChild(el("rect", {
      x: (cx + s * (p.l / 2 - cai / 2) - 4) * esc, y: (cy - 16) * esc,
      width: 8 * esc, height: 32 * esc, fill: "#8b6f4f"
    }));
  });
  const t = el("text", { x: cx * esc, y: cy * esc + 4, "text-anchor": "middle", class: "cota-texto" });
  t.textContent = "janela " + (p.l - cai * 2) + "×" + (p.a - cai * 2);
  g.appendChild(t);
  const t2 = el("text", { x: cx * esc, y: (cy + 16) * esc, "text-anchor": "middle", class: "label-small" });
  t2.textContent = "caixilho " + cai + " mm · dobradiça ↔ trava";
  g.appendChild(t2);
}

/* === V3: quadro estrutural da caixa (FE) — retângulo R40 vazado === */
function dCaixaEstrutural(g, p, esc) {
  const cai = IMPRESSORA.caixa.caixilho; // 40
  g.appendChild(el("rect", { x: 0, y: 0, width: p.l * esc, height: p.a * esc, rx: 40 * esc, ry: 40 * esc, class: "estrutura" }));
  g.appendChild(el("rect", {
    x: cai * esc, y: cai * esc, width: (p.l - cai * 2) * esc, height: (p.a - cai * 2) * esc,
    rx: 12 * esc, ry: 12 * esc, fill: "#efe7d8", stroke: "#bda687", "stroke-width": 0.8, "stroke-dasharray": "4 3"
  }));
  // dobradiça (esq) + trava (dir)
  [0.3, 0.7].forEach(fr => g.appendChild(el("rect", { x: (cai / 2 - 4) * esc, y: (p.a * fr - 14) * esc, width: 8 * esc, height: 28 * esc, fill: "#8b6f4f" })));
  g.appendChild(el("circle", { cx: (p.l - cai / 2) * esc, cy: (p.a / 2) * esc, r: 6 * esc, fill: "#444" }));
  const t = el("text", { x: p.l * esc / 2, y: p.a * esc / 2 + 4, "text-anchor": "middle", class: "cota-texto" });
  t.textContent = "janela " + (p.l - cai * 2) + "×" + (p.a - cai * 2);
  g.appendChild(t);
}

/* === V3: traseira ventilada da caixa (F2) — grelha === */
function dCaixaTraseiraVent(g, p, esc) {
  g.appendChild(el("rect", { x: 0, y: 0, width: p.l * esc, height: p.a * esc, rx: 40 * esc, ry: 40 * esc, class: "estrutura" }));
  // Grelha de ventilação central
  const gw = p.l - 120, gh = p.a - 90;
  const gx = (p.l - gw) / 2, gy = (p.a - gh) / 2;
  const n = 7;
  for (let i = 0; i < n; i++) {
    const yy = gy + (gh / (n - 1)) * i;
    g.appendChild(el("line", { x1: gx * esc, y1: yy * esc, x2: (gx + gw) * esc, y2: yy * esc, stroke: "#8b6f4f", "stroke-width": 1.2 }));
  }
  const t = el("text", { x: p.l * esc / 2, y: (gy + gh + 14) * esc, "text-anchor": "middle", class: "label-small" });
  t.textContent = "grelha ventilação + folga papel";
  g.appendChild(t);
}

/* === V3: flanges de união entre módulos === */
function dFlangeUniao(g, p, esc) {
  g.appendChild(el("rect", { x: 0, y: 0, width: p.l * esc, height: p.a * esc, class: "estrutura" }));
  // soquete central (encaixe da coluna)
  const sw = 120, sh = 130;
  g.appendChild(el("rect", { x: ((p.l - sw) / 2) * esc, y: ((p.a - sh) / 2) * esc, width: sw * esc, height: sh * esc, class: "recorte" }));
  // 4 furos de parafuso-conector M6
  [[18, 18], [p.l - 18, 18], [18, p.a - 18], [p.l - 18, p.a - 18]].forEach(([ix, iy]) =>
    g.appendChild(el("circle", { cx: ix * esc, cy: iy * esc, r: 4 * esc, fill: "#444" })));
  const t = el("text", { x: p.l * esc / 2, y: p.a * esc / 2 + 4, "text-anchor": "middle", class: "label-small" });
  t.textContent = "soquete + 4× M6";
  g.appendChild(t);
}

function dFlangeCabo(g, p, esc) {
  g.appendChild(el("rect", { x: 0, y: 0, width: p.l * esc, height: p.a * esc, class: "estrutura" }));
  // furo passa-cabo ⌀30 central
  g.appendChild(el("circle", { cx: (p.l / 2) * esc, cy: (p.a / 2) * esc, r: 15 * esc, class: "recorte" }));
  // 4 insertos M6
  [[18, 18], [p.l - 18, 18], [18, p.a - 18], [p.l - 18, p.a - 18]].forEach(([ix, iy]) =>
    g.appendChild(el("circle", { cx: ix * esc, cy: iy * esc, r: 4 * esc, fill: "#444" })));
  const t = el("text", { x: p.l * esc / 2, y: (p.a / 2 + 28) * esc, "text-anchor": "middle", class: "label-small" });
  t.textContent = "⌀30 passa-cabo + 4× M6";
  g.appendChild(t);
}

/* ===== Render peças ===== */

function renderPlanoCorte() {
  ["cut-grid-principal", "cut-grid-impressora"].forEach((id, i) => {
    const cont = document.getElementById(id);
    if (!cont) return;
    cont.innerHTML = "";
    const lista = i === 0 ? PECAS_PRINCIPAL : PECAS_IMPRESSORA;

    lista.forEach(p => {
      const card = document.createElement("article");
      card.className = "cut-piece";

      const head = document.createElement("div");
      head.className = "cut-head";
      head.innerHTML = `
        <div>
          <span class="cut-code">${p.cod}</span>
          <div class="cut-name">${p.nome}</div>
          <div class="cut-dim">${p.l} × ${p.a} mm</div>
        </div>
        <div style="text-align:right">
          <div class="cut-code" style="background:#b8956a">×${p.qtd}</div>
        </div>
      `;
      card.appendChild(head);

      const cv = document.createElement("div");
      cv.className = "cut-canvas";
      cv.appendChild(pieceSvg(p));
      card.appendChild(cv);

      const info = document.createElement("div");
      info.className = "cut-info";
      info.innerHTML = `<span class="badge">${p.mat}</span> ${p.obs}`;
      card.appendChild(info);

      cont.appendChild(card);
    });
  });
}

/* ============================================================
   LISTA DE PEÇAS
   ============================================================ */

function renderListas() {
  ["lista-principal", "lista-impressora"].forEach((id, i) => {
    const tbody = document.getElementById(id);
    if (!tbody) return;
    tbody.innerHTML = "";
    const lista = i === 0 ? PECAS_PRINCIPAL : PECAS_IMPRESSORA;
    lista.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.cod}</td>
        <td>${p.nome}</td>
        <td>${p.mat}</td>
        <td>${p.l} × ${p.a}</td>
        <td>${p.qtd}</td>
        <td>${p.obs}</td>
      `;
      tbody.appendChild(tr);
    });
  });

  // Totais
  const all = [...PECAS_PRINCIPAL, ...PECAS_IMPRESSORA];
  const mdf = all.filter(p => p.mat.startsWith("MDF"));
  const laminas = all.filter(p => p.mat.startsWith("Lâmina"));

  const totalMdf = mdf.reduce((s, p) => s + p.qtd, 0);
  const totalLaminas = laminas.reduce((s, p) => s + p.qtd, 0);

  const area18 = mdf.filter(p => p.esp === 18).reduce((s, p) => s + (p.l * p.a * p.qtd), 0) / 1_000_000;
  const area15 = mdf.filter(p => p.esp === 15).reduce((s, p) => s + (p.l * p.a * p.qtd), 0) / 1_000_000;

  document.getElementById("total-mdf").textContent = totalMdf;
  document.getElementById("total-laminas").textContent = totalLaminas;
  document.getElementById("area-18").innerHTML = area18.toFixed(2) + '<span class="unit">m²</span>';
  document.getElementById("area-15").innerHTML = area15.toFixed(2) + '<span class="unit">m²</span>';
}

/* ============================================================
   MANUAL DE MONTAGEM — 12 etapas
   ============================================================ */

const ETAPAS = [
  { titulo: "Verificação das Peças", meta: "Pré-montagem", desc: "Conferir todas as peças recebidas contra a lista V3 (inclui os novos quadros estruturais CE/FE, as bases de fixação internas G1/G2 e a caixa da impressora redimensionada). Identificar com fita-crepe e caneta." },
  { titulo: "Acabamento (ANTES da montagem)", meta: "1-2 dias", desc: "É muito mais fácil laquear e laminar antes de montar.", itens: [
    "Lâminas (B1-L, E1-L, F1-L): colar com cola de contato. Prensar com grampos 24h. Lixar bordas.",
    "Peças laqueadas: aplicar massa, lixar 180, primer/selador, lixar 320, 2 demãos de laca PU fosca bege/creme (4h entre demãos).",
    "Não laquear: peças internas C4, C5 e bordas de junção (recebem cola)."
  ]},
  { titulo: "Montagem da Base Principal (quadrada)", meta: "Etapa 3", desc: "Ordem: A2 (fundo) → A3a/A3b (paredes laterais retas) → A1 (tampo). Base 400×400 R80, 60 mm de altura.", itens: [
    "Colocar A2 (fundo 18 mm) sobre superfície plana.",
    "Colar 4 réguas A3a (370×24, longas) e A3b (340×24, curtas) formando perímetro interno de 24 mm de altura. PVA + grampos. Secar 2h.",
    "Colar A1 (tampo 18 mm) sobre as paredes. Verificar alinhamento do furo central 120×130.",
    "Reforçar com 4 parafusos 3.5×20 por baixo.",
    "Posicionar contrapeso de aço (3–5 kg) sobre A2.",
    "Colar feltros antiderrapantes embaixo de A2."
  ]},
  { titulo: "Montagem da Coluna Principal", meta: "Etapa 4", desc: "Coluna é uma caixa de MDF autoportante: B3+B3 (laterais) → B1 (frontal) → B2 (traseiro parafusado). Colada e parafusada sobre a base.", itens: [
    "Pré-furar bordas de B3 com broca 2.5 mm.",
    "Colar e parafusar B3 esquerda em B1. Verificar esquadro.",
    "Colar e parafusar B3 direita em B1. Espaço interno útil 60×60 mm para a fiação.",
    "NÃO colar B2 — apenas posicionar para verificar encaixe (fica removível para manutenção).",
    "Encaixar e colar o conjunto B1+B3+B3 sobre o furo central do tampo A1 (120×130). Reforçar com cantoneiras internas + 4 parafusos 3.5×30 por baixo de A1.",
    "Conferir esquadro e prumo da coluna."
  ]},
  { titulo: "Instalação do LED da Coluna", meta: "Etapa 5", desc: "Cortar fita LED COB 1060 mm e instalar na canaleta de B1.", itens: [
    "Inserir difusor acrílico leitoso (15 mm) na canaleta.",
    "Colar fita LED com adesivo voltado para o fundo.",
    "Encaixar difusor sobre a fita, rente à superfície.",
    "Deixar sobra de fio inferior (driver na base) e superior (LED da cabeça)."
  ]},
  { titulo: "Montagem da Cabeça (3 painéis + porta traseira)", meta: "Etapa 6", desc: "V3: C1 frontal FIXO (câmera+tela) → quadro estrutural CE (osso) → C2 porta traseira basculante (Mini PC) → pele C3-P. A cabeça abre PELA TRASEIRA.", itens: [
    "C1 (FIXO): parafusar C4 inferior/superior (suportes do monitor) e C5 (suporte câmera, rosca 1/4\" da Canon) por dentro do C1. Câmera e tela ficam no C1 — não abrem.",
    "Parafusar as hastes H1-H5 (90×40 mm) ligando o C1 ao quadro estrutural CE (espaçamento frontal→estrutural).",
    "CE (estrutural, quadro vazado 260×520, caixilho 40 mm): é o osso. A janela vazada deixa o corpo da câmera e o chicote atravessarem.",
    "C2 (PORTA traseira): montar a dobradiça (piano oculta ou 2× caneco) numa borda lateral do CE; fixar o C2 nela. Lado oposto: fecho magnético + trava push. O Mini PC monta NA porta C2 (sai junto ao abrir).",
    "Envolver a lateral com C3-P (MDF flex 3 mm, ~1588 × 180 mm): cola PVA + grampos finos. Deixar a fresta da dobradiça/abertura traseira livre.",
    "A cabeça conecta DIRETO no topo da coluna pela base de fixação reta G2 (interna, por dentro da cabeça), com 3–4 parafusos M6 removíveis — sem placa de transição aparente."
  ]},
  { titulo: "Instalação do LED da Cabeça", meta: "Etapa 7", desc: "Fita LED perimetral ~1444 mm no canal de C1 (canal a 18 mm da borda externa).", itens: [
    "Inserir difusor acrílico leitoso (10 mm) no canal perimetral.",
    "Colar fita LED contornando todo o perímetro (~1444 mm).",
    "Conectar aos fios que sobem da coluna.",
    "Testar acendimento antes de fechar."
  ]},
  { titulo: "Fixação da Cabeça na Coluna", meta: "Etapa 8", desc: "Encaixar cabeça sobre o topo da coluna — cabeça encaixa 20 mm sobre o topo.", itens: [
    "Posicionar cabeça centralizada (coluna 120 mm dentro dos 340 mm de largura da cabeça).",
    "Parafusar a base de C1/H3/H4 nas laterais B3 da coluna: 4 parafusos 3.5×30 (esta fixação parafusada é o que sustenta a cabeça).",
    "Reforçar com cantoneiras internas entre as hastes inferiores e o topo da coluna.",
    "Passar cabos LED pela coluna e verificar conexões."
  ]},
  { titulo: "Instalação dos Componentes Eletrônicos", meta: "Etapa 9", desc: "Tudo pela porta traseira basculante C2 aberta.", itens: [
    "Mini PC: suporte VESA montado NA porta traseira C2 (sai junto quando a porta abre).",
    "Monitor 15.6\" touchscreen EM PÉ: encaixar na moldura 220×360 entre os suportes C4 (rebaixo de 4 mm na frente para a tela ficar embutida). A tela visível 194×345 fica deslocada 6 mm p/ cima — ajustar a regulagem (monitor.offset_y) conforme a borda inferior real. Conectar HDMI + USB + toque ao Mini PC.",
    "Câmera Canon EOS Rebel T7 + lente EF-S 18–55mm: rosquear no 1/4\" do C5. Apontar lente para o furo ⌀68 (aro decorativo ⌀95 embutido 8 mm).",
    "Organizar cabos. Descer alimentação pelo interior da coluna.",
    "Driver LED 24V dentro da base, ao lado do contrapeso.",
    "Teste geral: ligar energia, testar monitor, câmera, LEDs."
  ]},
  { titulo: "Fechamento", meta: "Etapa 10", desc: "Fixar painéis com sistema magnético + fechadura.", itens: [
    "C2 (porta traseira): fechar na dobradiça + fecho magnético/trava push. Abre e fecha quantas vezes precisar.",
    "B2 (traseira coluna): parafusos M4 nos insertos. SEM cola.",
    "Conferir que todas as portas magnéticas fecham firmemente."
  ]},
  { titulo: "Montagem do Módulo Impressora", meta: "Etapa 11", desc: "Mesma lógica do principal, mas a caixa abre PELA FRENTE (porta F1 inteira no quadro FE). Caixa dimensionada para a DNP DS620A / Fujifilm ASK-400 (mesma impressora).", itens: [
    "Base 350×350 R80: D2 → D3a/D3b (paredes) → D1 (tampo). Contrapeso recomendado (caixa profunda — ver nota de estabilidade).",
    "Coluna 610 mm: E3+E3 → E1 → colar e parafusar sobre o furo central do tampo D1 → LED vertical (610 mm).",
    "Caixa 360×250×420: F5 (fundo, furo 120×120) → F3+F3 (laterais, 384×250) → F4 (topo) → FE (quadro estrutural fixo na frente) → F1 (porta basculante inteira na dobradiça do FE).",
    "Encaixar caixa sobre a coluna: a caixa conecta DIRETO no topo da coluna pela base de fixação reta G2 (interna), com 3–4 parafusos M6 removíveis.",
    "Instalar a impressora DS620A/ASK-400 (corpo 275×366×170): manutenção FRONTAL abrindo a porta F1 inteira. Traseira F2 ventilada dá saída ao papel dye-sub.",
    "Fechar: E2 (parafusos M4) + F2 (traseira ventilada, imãs + fechadura). F1 fecha na trava da frente."
  ]},
  { titulo: "Posicionamento Final", meta: "Etapa 12", desc: "Posicionar e conectar os dois módulos.", itens: [
    "Posicionar totem principal no local desejado.",
    "Posicionar impressora ao lado (~30 cm de distância).",
    "Conectar USB entre Mini PC e impressora ASK-400 (canaleta de chão ou sob tapete).",
    "Conectar ambos na tomada 220V.",
    "Teste final: foto → tela → impressão.",
    "Peso final estimado: 25–30 kg (principal) + 12–15 kg (impressora)."
  ]}
];

function renderSteps() {
  const cont = document.getElementById("steps-container");
  if (!cont) return;
  cont.innerHTML = "";
  ETAPAS.forEach((etapa, i) => {
    const step = document.createElement("div");
    step.className = "step-v2";
    const itensHtml = etapa.itens ? `<ol>${etapa.itens.map(it => `<li>${it}</li>`).join("")}</ol>` : "";
    step.innerHTML = `
      <div class="step-num">${String(i + 1).padStart(2, "0")}</div>
      <div class="step-content">
        <h4><span class="step-meta">${etapa.meta}</span>${etapa.titulo}</h4>
        <p>${etapa.desc}</p>
        ${itensHtml}
      </div>
    `;
    cont.appendChild(step);
  });
}

/* ===== Checklist de verificação ===== */

function renderChecklist() {
  const cont = document.getElementById("checklist-container");
  if (!cont) return;
  cont.innerHTML = "";
  [...PECAS_PRINCIPAL, ...PECAS_IMPRESSORA].forEach((p, i) => {
    const id = `chk-${p.cod}`;
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" id="${id}">
      <span class="check-code">${p.cod}</span>
      <span>${p.nome} <span style="color:var(--ink-faint)">(${p.qtd}× · ${p.l}×${p.a})</span></span>
    `;
    cont.appendChild(label);
  });
}

/* ============================================================
   TABS + EVENTOS
   ============================================================ */

function setupTabs() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("panel-" + tab.dataset.tab).classList.add("active");
    });
  });
}

function setupToggles() {
  // Apenas chips do toolbar global (com data-toggle). Os chips do painel 3D
  // (.three-toolbar) são tratados por totem-3d.js.
  document.querySelectorAll(".chip[data-toggle]").forEach(chip => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("active");
      config[chip.dataset.toggle] = chip.classList.contains("active");
      renderAll();
    });
  });
}

function setupEscala() {
  const sl = document.getElementById("escala");
  const v = document.getElementById("escala-valor");
  sl.addEventListener("input", e => {
    config.escala = parseFloat(e.target.value);
    v.textContent = config.escala.toFixed(2);
    document.getElementById("meta-escala").textContent = `1:${Math.round(1 / config.escala)}`;
    renderAll();
  });
  document.getElementById("meta-escala").textContent = `1:${Math.round(1 / config.escala)}`;
}

function renderAll() {
  renderPrincipalFrontal();
  renderPrincipalLateral();
  renderPrincipalSuperior();
  renderImpressoraFrontal();
  renderImpressoraLateral();
  renderConjunto();
  renderPlanoCorte();
  renderListas();
  renderSteps();
  renderChecklist();
}

setupTabs();
setupToggles();
setupEscala();
renderAll();

/* Expor constantes V2 + listas de peças para o módulo 3D (totem-3d.js) */
window.PRINCIPAL = PRINCIPAL;
window.IMPRESSORA = IMPRESSORA;
window.PECAS_PRINCIPAL = PECAS_PRINCIPAL;
window.PECAS_IMPRESSORA = PECAS_IMPRESSORA;
