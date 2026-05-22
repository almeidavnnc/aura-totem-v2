/* ============================================================
   AURA · TOTEM V2 · Lógica de desenho técnico
   (V2 — alinhado à Ficha Técnica AURA Totem V4)
   ============================================================ */

const PRINCIPAL = {
  altura: 1600,

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
    largura: 320,
    altura: 550,
    profundidade: 180,
    raio: 160,
    y_inicio: 1050,
    y_fim: 1600,
    moldura: 20,
    led_canal: { largura: 10, prof: 8, offset_borda: 18 }
  },

  camera: {
    modelo: "Canon EOS Rebel T7",
    lente: "Canon EF-S 18-55mm IS",
    furo: 68,
    aro: 95,
    aro_prof: 8,
    cy: 1520,
    cx: 160,
    espaco: { l: 150, a: 100, p: 90 }
  },

  monitor: {
    rec_l: 180,
    rec_a: 315,
    rebaixo: 4,
    recuo: 3,
    cy: 1280,
    cx: 160,
    inclinacao: 0
  },

  mini_pc: { l: 130, p: 130, a: 50, cy: 1280 }
};

const IMPRESSORA = {
  altura: 920,
  modelo: "ASK-400",
  manutencao: "frontal",

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
    largura: 320,
    altura: 250,
    profundidade: 400,
    raio_cantos: 40,
    y_inicio: 670,
    y_fim: 920,
    slot: { l: 180, a: 15, cy: 800 }
  }
};

const ESTRUTURA = {
  tubo_secao: 20,
  tubos_principal: { qtd: 2, comprimento: 1600 },
  tubos_impressora: { qtd: 2, comprimento: 850 }
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
  const g = novoSvg("p-frontal", larguraDesenho, T.altura, 30, 70, 70);
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

  // Monitor (tela com rebaixo)
  const monX = centroX - T.monitor.rec_l / 2;
  const monY = altoT - T.monitor.cy - T.monitor.rec_a / 2;
  // Rebaixo (área externa + 10mm)
  g.appendChild(el("rect", {
    x: px(monX - 5), y: px(monY - 5),
    width: px(T.monitor.rec_l + 10), height: px(T.monitor.rec_a + 10),
    fill: "none", stroke: "#9e8a6f", "stroke-width": 0.6, "stroke-dasharray": "2 2"
  }));
  g.appendChild(el("rect", {
    x: px(monX), y: px(monY),
    width: px(T.monitor.rec_l), height: px(T.monitor.rec_a),
    class: "tela"
  }));

  if (config.rotulos) {
    rotulo(g, centroX + T.camera.aro / 2 + 6, camCy + 3, "⌀68 lente / ⌀95 aro", "label-small");
    rotulo(g, monX + 6, monY + 14, "Monitor 15.6\"", "label-small");
  }

  // === COTAS ===
  cotaH(g, centroX - T.base.lado / 2, centroX + T.base.lado / 2, altoT + 8, "400", { dir: -1, offset: 20 });
  cotaH(g, colX, colX + T.coluna.largura, altoT - T.coluna.y_inicio + 10, "120", { dir: -1, offset: 20 });
  cotaH(g, centroX - T.cabeca.largura / 2, centroX + T.cabeca.largura / 2, altoT - T.cabeca.y_fim - 10, "320");

  cotaV(g, altoT, 0, larguraDesenho, "1600", { offset: 30 });
  cotaV(g, altoT, altoT - T.base.altura, 0, "60", { dir: -1, offset: 25 });
  cotaV(g, altoT - T.coluna.y_inicio, altoT - T.coluna.y_fim, 0, "990", { dir: -1, offset: 25 });
  cotaV(g, altoT - T.cabeca.y_inicio, altoT - T.cabeca.y_fim, larguraDesenho, "550", { offset: 30 });
  cotaV(g, altoT, altoT - T.camera.cy, larguraDesenho, "1520", { offset: 55 });
  cotaV(g, altoT, altoT - T.monitor.cy, larguraDesenho, "1280", { offset: 80 });
}

function renderPrincipalLateral() {
  const T = PRINCIPAL;
  const larguraDesenho = T.cabeca.profundidade + 20;
  const g = novoSvg("p-lateral", larguraDesenho, T.altura, 30, 50, 50);
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
      x: px(cx - T.cabeca.profundidade / 2 + 18), y: px(altoT - T.monitor.cy - T.monitor.rec_a / 2),
      width: px(30), height: px(T.monitor.rec_a),
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
  cotaV(g, altoT, 0, larguraDesenho, "1600", { offset: 25 });
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

  // Tubo estrutural 20×20 dentro da coluna (indicação)
  if (config.internos) {
    g.appendChild(el("rect", {
      x: px(cx - 10), y: px(cx - 10),
      width: px(20), height: px(20),
      fill: "#7a6a55", stroke: "#3d352a", "stroke-width": 0.6
    }));
  }

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
  const g = novoSvg("i-frontal", w, T.altura, 30, 60, 60);
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

  // Porta frontal magnética (F1) - 280×220 centralizada
  g.appendChild(el("rect", {
    x: px(cx - 140), y: px(caixaY + 15),
    width: px(280), height: px(220),
    fill: "none", stroke: "#9e8a6f", "stroke-width": 0.6, "stroke-dasharray": "3 2"
  }));

  if (config.rotulos) {
    rotulo(g, cx + T.caixa.slot.l / 2 + 6, slotY + 8, "Saída foto", "label-small");
    rotulo(g, cx - 130, caixaY + 30, "Porta frontal magnética", "label-small");
  }

  // Cotas
  cotaH(g, cx - T.caixa.largura / 2, cx + T.caixa.largura / 2, caixaY - 5, "320");
  cotaH(g, cx - T.base.lado / 2, cx + T.base.lado / 2, altoT + 5, "350", { dir: -1, offset: 20 });
  cotaV(g, altoT, 0, w, "920", { offset: 25 });
  cotaV(g, altoT - T.caixa.y_inicio, altoT - T.caixa.y_fim, w, "250", { offset: 25 });
  cotaV(g, altoT - T.coluna.y_inicio, altoT - T.coluna.y_fim, 0, "610", { dir: -1, offset: 25 });
}

function renderImpressoraLateral() {
  const T = IMPRESSORA;
  const w = T.caixa.profundidade + 40;
  const g = novoSvg("i-lateral", w, T.altura, 30, 40, 40);
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

  // Caixa (mais profunda agora — 400mm)
  g.appendChild(el("rect", {
    x: px(cx - T.caixa.profundidade / 2), y: px(altoT - T.caixa.y_fim),
    width: px(T.caixa.profundidade), height: px(T.caixa.altura),
    rx: px(T.caixa.raio_cantos), class: "estrutura"
  }));

  cotaH(g, cx - T.caixa.profundidade / 2, cx + T.caixa.profundidade / 2, altoT - T.caixa.y_fim - 8, "400");
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

    // Tela
    g.appendChild(el("rect", {
      x: (xPrinc - T.monitor.rec_l / 2) * escala, y: (T.altura - T.monitor.cy - T.monitor.rec_a / 2) * escala,
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
  t1.textContent = "PRINCIPAL · 1620";
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
  { cod: "C1", nome: "Frontal cabeça", mat: "MDF 18 mm", esp: 18, l: 320, a: 550, qtd: 1, obs: "Stadium 320×550 R160. Furo lente ⌀68 + rebaixo aro ⌀95×8 prof (centro 80 mm do topo). Recorte monitor 180×315 vertical (centro 320 mm topo) + rebaixo 190×325×4 prof. Canal LED perimetral 10×8 a 18 mm da borda", desenha: dCabecaFrontal },
  { cod: "C2", nome: "Traseiro cabeça", mat: "MDF 15 mm", esp: 15, l: 320, a: 550, qtd: 1, obs: "Stadium 320×550 R160. Porta magnética 260×470 incluída (imãs + fechadura)", desenha: dCabecaTraseira },
  { cod: "C3-P", nome: "Pele lateral cabeça", mat: "MDF flex 3 mm", esp: 3, l: 1465, a: 180, qtd: 1, obs: "Perímetro stadium 320×550 R160 = ~1465 mm × 180 mm altura. Cola PVA + grampos finos", desenha: dTira },
  { cod: "H1", nome: "Haste lateral esquerda", mat: "MDF 15 mm", esp: 15, l: 144, a: 40, qtd: 1, obs: "Estrutural — conecta C1 a C2 (144 = 180 prof − 2×18)", desenha: dRetSimples },
  { cod: "H2", nome: "Haste lateral direita", mat: "MDF 15 mm", esp: 15, l: 144, a: 40, qtd: 1, obs: "Estrutural — conecta C1 a C2", desenha: dRetSimples },
  { cod: "H3", nome: "Haste inferior esquerda", mat: "MDF 15 mm", esp: 15, l: 144, a: 40, qtd: 1, obs: "Estrutural — reforço inferior", desenha: dRetSimples },
  { cod: "H4", nome: "Haste inferior direita", mat: "MDF 15 mm", esp: 15, l: 144, a: 40, qtd: 1, obs: "Estrutural — reforço inferior", desenha: dRetSimples },
  { cod: "H5", nome: "Haste superior (arco)", mat: "MDF 15 mm", esp: 15, l: 144, a: 40, qtd: 1, obs: "Estrutural — topo do arco stadium", desenha: dRetSimples },
  { cod: "C4", nome: "Suporte monitor", mat: "MDF 15 mm", esp: 15, l: 220, a: 20, qtd: 2, obs: "Barras horizontais (1 acima + 1 abaixo do monitor 200 mm)", desenha: dRetSimples },
  { cod: "C5", nome: "Suporte câmera", mat: "MDF 15 mm", esp: 15, l: 160, a: 80, qtd: 1, obs: "Furo central rosca 1/4\" para fixar Canon EOS Rebel T7", desenha: dSuporteCamera },
  { cod: "T1", nome: "Tubo estrutural coluna", mat: "Tubo metálico 20×20", esp: 0, l: 1600, a: 20, qtd: 2, obs: "Esqueleto interno: tubo 20×20 mm — corre da base até dentro da cabeça (~1600 mm)", desenha: dTubo }
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
  { cod: "F1", nome: "Frontal caixa impr.", mat: "MDF 18 mm", esp: 18, l: 320, a: 250, qtd: 1, obs: "Cantos R40 + slot 180×15 + porta magnética 280×220 (frontal, manutenção da ASK-400)", desenha: dCaixaFrontal },
  { cod: "F1-L", nome: "Lâmina madeira caixa", mat: "Lâmina 0.6 mm", esp: 0.6, l: 320, a: 250, qtd: 1, obs: "Mesmo recorte do slot + porta", desenha: dRetSimples },
  { cod: "F2", nome: "Traseiro caixa impr.", mat: "MDF 15 mm", esp: 15, l: 320, a: 250, qtd: 1, obs: "Cantos R40. Porta magnética 240×280 (imãs + fechadura)", desenha: dCantoArredondado },
  { cod: "F3", nome: "Laterais caixa impr.", mat: "MDF 15 mm", esp: 15, l: 364, a: 250, qtd: 2, obs: "Profundidade interna = 400 − 18 − 18 = 364 mm. Cantos R40 nas bordas", desenha: dRetSimples },
  { cod: "F4", nome: "Topo da caixa impr.", mat: "MDF 15 mm", esp: 15, l: 284, a: 364, qtd: 1, obs: "Encaixa entre F1, F2 e F3 (284 = 320 − 2×18)", desenha: dRetSimples },
  { cod: "F5", nome: "Fundo da caixa impr.", mat: "MDF 15 mm", esp: 15, l: 284, a: 364, qtd: 1, obs: "Furo central 120×120 (encaixe coluna)", desenha: dRetFuro },
  { cod: "T2", nome: "Tubo estrutural coluna impr.", mat: "Tubo metálico 20×20", esp: 0, l: 850, a: 20, qtd: 2, obs: "Esqueleto interno: tubo 20×20 mm — corre da base até dentro da caixa (~850 mm)", desenha: dTubo }
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

/* === Tubo estrutural (representação fina) === */
function dTubo(g, p, esc) {
  // representação esquemática — tubo 20×20mm de comprimento p.l
  g.appendChild(el("rect", {
    x: 0, y: 0, width: p.l * esc, height: 20 * esc,
    fill: "#7a6a55", stroke: "#3d352a", "stroke-width": 0.6
  }));
  const t = el("text", { x: p.l * esc / 2, y: 20 * esc + 14, "text-anchor": "middle", class: "label-small" });
  t.textContent = "Tubo metálico 20×20 mm";
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

  // Câmera: aro decorativo ⌀95 + furo lente ⌀68 (centro a 80mm do topo)
  const camY = 80;
  g.appendChild(el("circle", { cx: cx * esc, cy: camY * esc, r: 47.5 * esc, fill: "none", stroke: "#a89178", "stroke-width": 0.8, "stroke-dasharray": "2 2" }));
  g.appendChild(el("circle", { cx: cx * esc, cy: camY * esc, r: 34 * esc, class: "recorte" }));
  const t1 = el("text", { x: (cx + 52) * esc, y: camY * esc, class: "cota-texto" });
  t1.textContent = "⌀68 / aro ⌀95";
  g.appendChild(t1);

  // Recorte monitor vertical (centro a 320mm do topo)
  const monY = 320;
  const monW = 180, monH = 315;
  // rebaixo 190×325 (linha tracejada externa)
  g.appendChild(el("rect", {
    x: (cx - (monW + 10) / 2) * esc, y: (monY - (monH + 10) / 2) * esc,
    width: (monW + 10) * esc, height: (monH + 10) * esc,
    fill: "none", stroke: "#9e8a6f", "stroke-width": 0.6, "stroke-dasharray": "2 2"
  }));
  g.appendChild(el("rect", {
    x: (cx - monW / 2) * esc, y: (monY - monH / 2) * esc,
    width: monW * esc, height: monH * esc,
    class: "recorte"
  }));
  const t2 = el("text", { x: cx * esc, y: monY * esc + 4, "text-anchor": "middle", class: "cota-texto" });
  t2.textContent = "180×315 (rebaixo 4mm)";
  g.appendChild(t2);

  // Cotas Y
  cotaVCanvas(g, 0, camY, p.l, esc, "80", 1);
  cotaVCanvas(g, 0, monY - monH / 2, -10, esc, String(monY - monH / 2), -1);
}

function dCabecaTraseira(g, p, esc) {
  const cx = p.l / 2;
  const cy = p.a / 2;
  const stad = stadiumPath(cx * esc, cy * esc, p.l * esc, p.a * esc);
  g.appendChild(el("path", { d: stad, class: "estrutura" }));

  // Porta magnética 260×470 centralizada (ajustada para cabeça 550)
  const portaW = 260, portaH = 470;
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
  t.textContent = "Porta 260×470 (imãs+fechadura)";
  g.appendChild(t);
}

function dSuporteCamera(g, p, esc) {
  g.appendChild(el("rect", { x: 0, y: 0, width: p.l * esc, height: p.a * esc, class: "estrutura" }));
  // furo central 1/4"
  g.appendChild(el("circle", { cx: p.l * esc / 2, cy: p.a * esc / 2, r: 4 * esc, class: "componente" }));
  const t = el("text", { x: p.l * esc / 2, y: p.a * esc / 2 + 14, "text-anchor": "middle", class: "label-small" });
  t.textContent = "rosca 1/4\"";
  g.appendChild(t);
}

function dCaixaFrontal(g, p, esc) {
  // F1: retângulo 320×250 com cantos R40 + slot 180×15 + porta frontal 280×220 (manutenção ASK-400)
  g.appendChild(el("rect", {
    x: 0, y: 0, width: p.l * esc, height: p.a * esc,
    rx: 40 * esc, ry: 40 * esc,
    class: "estrutura"
  }));

  // Porta frontal magnética 280×220 centralizada
  const portaW = 280, portaH = 220;
  const portaX = (p.l - portaW) / 2;
  const portaY = (p.a - portaH) / 2;
  g.appendChild(el("rect", {
    x: portaX * esc, y: portaY * esc,
    width: portaW * esc, height: portaH * esc,
    fill: "none", stroke: "#8b6f4f", "stroke-width": 0.8, "stroke-dasharray": "4 3"
  }));

  // Slot saída ~120mm do topo
  const slotW = 180, slotH = 15;
  const slotX = (p.l - slotW) / 2;
  const slotY = 120 - slotH / 2;
  g.appendChild(el("rect", {
    x: slotX * esc, y: slotY * esc,
    width: slotW * esc, height: slotH * esc,
    fill: "#2d2d2d"
  }));

  const t = el("text", { x: p.l * esc / 2, y: (slotY - 4) * esc, "text-anchor": "middle", class: "cota-texto" });
  t.textContent = "Slot 180×15";
  g.appendChild(t);
  const t2 = el("text", { x: p.l * esc / 2, y: (portaY + portaH + 12) * esc, "text-anchor": "middle", class: "cota-texto" });
  t2.textContent = "Porta frontal 280×220 (manutenção ASK-400)";
  g.appendChild(t2);
  cotaVCanvas(g, 0, slotY, -10, esc, String(slotY), -1);
}

function dCantoArredondado(g, p, esc) {
  g.appendChild(el("rect", {
    x: 0, y: 0, width: p.l * esc, height: p.a * esc,
    rx: 40 * esc, ry: 40 * esc,
    class: "estrutura"
  }));
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
  { titulo: "Verificação das Peças", meta: "Pré-montagem", desc: "Conferir todas as peças recebidas contra a lista V2 (módulo principal: 18 MDF + 1 lâmina + 2 tubos metálicos; módulo impressora: 14 MDF + 2 lâminas + 2 tubos). Identificar com fita-crepe e caneta." },
  { titulo: "Acabamento (ANTES da montagem)", meta: "1-2 dias", desc: "É muito mais fácil laquear e laminar antes de montar.", itens: [
    "Lâminas (B1-L, E1-L, F1-L): colar com cola de contato. Prensar com grampos 24h. Lixar bordas.",
    "Peças laqueadas: aplicar massa, lixar 180, primer/selador, lixar 320, 2 demãos de laca PU fosca bege/creme (4h entre demãos).",
    "Não laquear: peças internas C4, C5, tubos T1/T2 e bordas de junção (recebem cola)."
  ]},
  { titulo: "Montagem da Base Principal (quadrada)", meta: "Etapa 3", desc: "Ordem: A2 (fundo) → A3a/A3b (paredes laterais retas) → A1 (tampo). Base 400×400 R80, 60 mm de altura.", itens: [
    "Colocar A2 (fundo 18 mm) sobre superfície plana.",
    "Colar 4 réguas A3a (370×24, longas) e A3b (340×24, curtas) formando perímetro interno de 24 mm de altura. PVA + grampos. Secar 2h.",
    "Colar A1 (tampo 18 mm) sobre as paredes. Verificar alinhamento do furo central 120×130.",
    "Reforçar com 4 parafusos 3.5×20 por baixo.",
    "Posicionar contrapeso de aço (3–5 kg) sobre A2.",
    "Colar feltros antiderrapantes embaixo de A2."
  ]},
  { titulo: "Instalação do Tubo Estrutural (T1)", meta: "Etapa 4", desc: "Os 2 tubos metálicos 20×20×1600 mm formam o esqueleto que corre da base até dentro da cabeça.", itens: [
    "Posicionar 2 tubos T1 verticalmente no centro da base, espaçados ~30 mm.",
    "Fixar com cantoneiras em A2 (4 parafusos auto-atarraxantes 4.2×13 mm por tubo).",
    "Conferir esquadro e prumo — os tubos definem a rigidez de toda a coluna.",
    "Os painéis MDF da coluna (B1-B3) serão revestimento ao redor dos tubos."
  ]},
  { titulo: "Montagem da Coluna Principal", meta: "Etapa 5", desc: "Ordem: B3+B3 (laterais) → B1 (frontal) → B2 (traseiro parafusado). Painéis envolvem os tubos T1.", itens: [
    "Pré-furar bordas de B3 com broca 2.5 mm.",
    "Colar e parafusar B3 esquerda em B1. Verificar esquadro.",
    "Colar e parafusar B3 direita em B1.",
    "NÃO colar B2 — apenas posicionar para verificar encaixe.",
    "Deslizar conjunto B1+B3+B3 sobre os tubos T1. Espaço interno útil 60×60 mm.",
    "Fixar painéis nos tubos com parafusos para metal (cantoneiras internas)."
  ]},
  { titulo: "Instalação do LED da Coluna", meta: "Etapa 6", desc: "Cortar fita LED COB 1060 mm e instalar na canaleta de B1.", itens: [
    "Inserir difusor acrílico leitoso (15 mm) na canaleta.",
    "Colar fita LED com adesivo voltado para o fundo.",
    "Encaixar difusor sobre a fita, rente à superfície.",
    "Deixar sobra de fio inferior (driver na base) e superior (LED da cabeça)."
  ]},
  { titulo: "Montagem da Cabeça", meta: "Etapa 7", desc: "Ordem: suportes em C1 → hastes H1-H5 → C2 (porta magnética) → pele C3-P.", itens: [
    "C4 inferior: parafusar 15 mm abaixo do recorte do monitor (220 mm horizontal).",
    "C4 superior: parafusar 15 mm acima do recorte.",
    "C5: parafusar atrás do furo da câmera, alinhado ao centro. Verificar acesso ao parafuso 1/4\" da Canon EOS Rebel T7.",
    "Parafusar hastes H1-H5 (144×40 mm — note: 144 = 180 prof − 2×18) por dentro de C1.",
    "Encaixar C2 nas pontas das hastes. Instalar 16 imãs de neodímio ⌀10×3 mm (4 em C2 + 4 nas hastes) + 1 fechadura push-lock central. NÃO usar cola — C2 fica removível.",
    "Envolver toda a lateral com C3-P (MDF flex 3 mm, ~1296 × 180 mm): cola PVA + grampos finos."
  ]},
  { titulo: "Instalação do LED da Cabeça", meta: "Etapa 8", desc: "Fita LED perimetral ~1053 mm no canal de C1 (canal a 18 mm da borda externa).", itens: [
    "Inserir difusor acrílico leitoso (10 mm) no canal perimetral.",
    "Colar fita LED contornando todo o perímetro (~1053 mm).",
    "Conectar aos fios que sobem da coluna.",
    "Testar acendimento antes de fechar."
  ]},
  { titulo: "Fixação da Cabeça na Coluna", meta: "Etapa 9", desc: "Encaixar cabeça sobre o topo da coluna — cabeça encaixa 20 mm sobre o topo.", itens: [
    "Posicionar cabeça centralizada (coluna 120 mm dentro dos 320 mm de largura da cabeça).",
    "Os tubos T1 sobem ~20–40 mm para dentro da cabeça e fixam C1/hastes.",
    "Parafusar base de C1/H3/H4 nas laterais B3: 4 parafusos 3.5×30.",
    "Passar cabos LED pela coluna e verificar conexões."
  ]},
  { titulo: "Instalação dos Componentes Eletrônicos", meta: "Etapa 10", desc: "Tudo pela porta magnética traseira (sem C2).", itens: [
    "Mini PC: suporte VESA na traseira interna da cabeça.",
    "Monitor 15.6\" vertical: encaixar nos suportes C4 (rebaixo de 4 mm na frente para a tela ficar embutida). Conectar HDMI + USB ao Mini PC.",
    "Câmera Canon EOS Rebel T7 + lente EF-S 18–55mm: rosquear no 1/4\" do C5. Apontar lente para o furo ⌀68 (aro decorativo ⌀95 embutido 8 mm).",
    "Organizar cabos. Descer alimentação pelos tubos T1.",
    "Driver LED 24V dentro da base, ao lado do contrapeso.",
    "Teste geral: ligar energia, testar monitor, câmera, LEDs."
  ]},
  { titulo: "Fechamento", meta: "Etapa 11", desc: "Fixar painéis com sistema magnético + fechadura.", itens: [
    "C2 (traseira cabeça): encaixar com imãs + fechar fechadura central. SEM cola, SEM parafusos.",
    "B2 (traseira coluna): parafusos M4 nos insertos. SEM cola.",
    "Conferir que todas as portas magnéticas fecham firmemente."
  ]},
  { titulo: "Montagem do Módulo Impressora", meta: "Etapa 12", desc: "Mesma lógica do principal: base quadrada → tubos T2 → coluna → caixa para ASK-400 (manutenção FRONTAL).", itens: [
    "Base 350×350 R80: D2 → D3a/D3b (paredes) → D1 (tampo). Sem contrapeso.",
    "Tubos T2 (2× 20×20×850 mm): fixar verticalmente no centro da base.",
    "Coluna 610 mm: E3+E3 → E1 → colar na base → LED vertical (610 mm).",
    "Caixa 320×250×400: F5 (fundo, furo 120×120) → F3+F3 (laterais, 364×250) → F4 (topo) → F1 (frontal com lâmina, slot + porta).",
    "Encaixar caixa sobre coluna (F5 no topo). Parafusar por dentro.",
    "Instalar impressora ASK-400 — manutenção FRONTAL pela porta magnética 280×220 de F1.",
    "Fechar: E2 (parafusos M4) + F2 (porta magnética traseira 240×280 — imãs + fechadura)."
  ]},
  { titulo: "Posicionamento Final", meta: "Etapa 13", desc: "Posicionar e conectar os dois módulos.", itens: [
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
window.ESTRUTURA = ESTRUTURA;
window.PECAS_PRINCIPAL = PECAS_PRINCIPAL;
window.PECAS_IMPRESSORA = PECAS_IMPRESSORA;
