import {fit, measure} from './text';

export type Aspect = '16x9' | '9x16';

export type Layout = {
  aspect: Aspect;
  W: number;
  H: number;
  cx: number; // centro del contenido
  cy: number;
  maxLine: number; // 88 % del ancho util
  lineLen: number; // linea de B2
  size: {
    question: number;
    title: number;
    boveda: number;
    sub: number;
    chip: number;
    boxName: number;
    boxDim: number;
    rowName: number;
    rowDim: number;
    wheel: number;
    cta: number;
    contact: number;
    closing: number;
  };
  aro: {r: number; stroke: number};
  isoDocked: {cx: number; cy: number; size: number};
  logo: {cx: number; cy: number; w: number};
};

const L169: Layout = {
  aspect: '16x9',
  W: 1920,
  H: 1080,
  cx: 960,
  cy: 540,
  maxLine: 1680 * 0.88,
  lineLen: 1680 * 0.6,
  size: {
    question: 176,
    title: 128,
    boveda: 96,
    sub: 52,
    chip: 36,
    boxName: 56,
    boxDim: 44,
    rowName: 36,
    rowDim: 28,
    wheel: 112,
    cta: 128,
    contact: 64,
    closing: 72,
  },
  aro: {r: 180, stroke: 28},
  // Alto 96 px con la esquina en (120, 120).
  isoDocked: {cx: 168, cy: 168, size: 96},
  // Logotipo horizontal centrado en (960, 460), alto 180 px.
  logo: {cx: 960, cy: 460, w: (180 * 1740) / 520},
};

// 9:16: zona segura x 72-936 / y 260-1500. El contenido se centra en x = 540 con lineas de
// hasta 760 px (quedan dentro de 72-936) y en y = 880 (centro de la zona segura).
const L916: Layout = {
  aspect: '9x16',
  W: 1080,
  H: 1920,
  cx: 540,
  cy: 880,
  maxLine: 864 * 0.88,
  lineLen: 1240 * 0.6,
  size: {
    question: 168,
    title: 116,
    boveda: 80,
    sub: 44,
    chip: 40,
    boxName: 56,
    boxDim: 44,
    rowName: 32,
    rowDim: 26,
    wheel: 100,
    cta: 116,
    contact: 56,
    closing: 64,
  },
  aro: {r: 160, stroke: 24},
  // Alto 96 px, arriba centrado, borde superior en y = 300.
  isoDocked: {cx: 540, cy: 348, size: 96},
  // No hay logotipo vertical oficial en el repo: se usa el horizontal (ver README).
  logo: {cx: 540, cy: 800, w: 640},
};

export const getLayout = (a: Aspect) => (a === '16x9' ? L169 : L916);

// ---------- Geometria compartida entre escenas ----------

export type Line = {text: string; start: number; left: number; y: number};

export const QUESTION = '¿Estás seguro?';

export const questionGeom = (L: Layout) => {
  const S0 = L.size.question;
  if (L.aspect === '16x9') {
    const S = fit(QUESTION, S0, 500, L.maxLine);
    const w = measure(QUESTION, S, 500);
    return {S, lines: [{text: QUESTION, start: 0, left: L.cx - w / 2, y: L.cy}] as Line[]};
  }
  const l1 = '¿Estás';
  const l2 = 'seguro?';
  const S = Math.min(fit(l1, S0, 500, L.maxLine), fit(l2, S0, 500, L.maxLine));
  const lh = S * 1.08;
  return {
    S,
    lines: [
      {text: l1, start: 0, left: L.cx - measure(l1, S, 500) / 2, y: L.cy - lh / 2},
      {text: l2, start: 7, left: L.cx - measure(l2, S, 500) / 2, y: L.cy + lh / 2},
    ] as Line[],
  };
};

export const CHIPS = ['Monitoreo 24/7', 'Acceso biométrico', 'Doble llave', 'Seguro por caja'];

export type Rect = {x: number; y: number; w: number; h: number};

export const chipRects = (L: Layout): Rect[] => {
  const S = L.size.chip;
  const padX = 0.72 * S;
  const h = S + 1.1 * S;
  const ws = CHIPS.map((c) => measure(c, S, 400) + 2 * padX);
  if (L.aspect === '16x9') {
    const gap = 20;
    let x = 120;
    return ws.map((w) => {
      const r = {x, y: 860 - h / 2, w, h};
      x += w + gap;
      return r;
    });
  }
  const gap = 16;
  return ws.map((w, i) => ({x: L.cx - w / 2, y: 1030 - h / 2 + i * (h + gap), w, h}));
};

// Acto 2: posiciones verticales de titulos y subtitulo.
export const act2Geom = (L: Layout) => {
  if (L.aspect === '16x9') {
    const St = fit('Cajas de seguridad', L.size.title, 500, L.maxLine);
    const Sb = Math.min(fit('Bóveda de estándar bancario', L.size.boveda, 500, L.maxLine), L.size.boveda);
    const topA = 376;
    return {
      align: 'left' as const,
      x: 120,
      titleA: {S: St, lines: [{text: 'Cajas de seguridad', y: topA + St * 0.5}, {text: 'privadas.', y: topA + St * 1.56}]},
      titleB: {S: Sb, lines: [{text: 'Bóveda de estándar bancario', y: topA + Sb * 0.5}, {text: 'certificada.', y: topA + Sb * 1.6}]},
      sub: {S: fit('San Martín 133, Bahía Blanca.', L.size.sub, 400, L.maxLine), y: 712},
    };
  }
  const tA = ['Cajas de', 'seguridad', 'privadas.'];
  const tB = ['Bóveda de', 'estándar bancario', 'certificada.'];
  const St = Math.min(...tA.map((t) => fit(t, L.size.title, 500, L.maxLine)));
  const Sb = Math.min(...tB.map((t) => fit(t, L.size.boveda, 500, L.maxLine)));
  const top = 482;
  return {
    align: 'center' as const,
    x: L.cx,
    titleA: {S: St, lines: tA.map((text, i) => ({text, y: top + St * (0.5 + i * 1.06)}))},
    titleB: {S: Sb, lines: tB.map((text, i) => ({text, y: top + Sb * (0.5 + i * 1.1)}))},
    sub: {S: fit('San Martín 133, Bahía Blanca.', L.size.sub, 400, L.maxLine), y: 920},
  };
};

export const MODELS = [
  {name: 'BKZ 1', h: 9, w: 7, dim: '9×7×55 cm'},
  {name: 'BKZ 2', h: 9, w: 22, dim: '9×22×55 cm'},
  {name: 'BKZ 3', h: 12, w: 22, dim: '12×22×55 cm'},
  {name: 'BKZ 4', h: 25, w: 22, dim: '25×22×55 cm'},
  {name: 'BKZ 5', h: 51, w: 27, dim: '51×27×60 cm'},
];

// Acto 3, B19-B21: una cara a 14 px/cm con el bloque (cara + etiquetas) centrado.
export const SINGLE_PX = 14;
export const singleBlock = (L: Layout, hPx: number) => {
  const gap1 = 40;
  const gap2 = 12;
  const total = hPx + gap1 + L.size.boxName + gap2 + L.size.boxDim;
  const top = L.cy - total / 2;
  const bottom = top + hPx;
  const nameY = bottom + gap1 + L.size.boxName / 2;
  const dimY = nameY + L.size.boxName / 2 + gap2 + L.size.boxDim / 2;
  return {top, bottom, nameY, dimY, cx: L.cx};
};

// Acto 3, B22: las cinco caras a escala real entre si.
export const rowGeom = (L: Layout) => {
  const px = L.aspect === '16x9' ? 12 : 10;
  const nameS = L.size.rowName;
  const dimS = L.size.rowDim;
  const place = (idx: number[], bottom: number, gap: number) => {
    const total = idx.reduce((a, i) => a + MODELS[i].w * px, 0) + gap * (idx.length - 1);
    let x = L.cx - total / 2;
    return idx.map((i) => {
      const w = MODELS[i].w * px;
      const h = MODELS[i].h * px;
      const r = {i, x, y: bottom - h, w, h, nameY: bottom + 22 + nameS / 2, dimY: bottom + 22 + nameS + 10 + dimS / 2};
      x += w + gap;
      return r;
    });
  };
  if (L.aspect === '16x9') {
    const faces = place([0, 1, 2, 3, 4], 820, 70);
    return {px, nameS, dimS, titleX: faces[0].x, titleAlign: 'left' as const, titleY: 250, faces};
  }
  return {px, nameS, dimS, titleX: L.cx, titleAlign: 'center' as const, titleY: 400, faces: [...place([0, 1, 2], 690, 60), ...place([3, 4], 1350, 80)]};
};

// Acto 4: posiciones verticales.
export const act4Geom = (L: Layout) => {
  if (L.aspect === '16x9') {
    return {wheelY: L.cy, planY: 250, ctaLines: [{text: 'Agendá tu visita.', y: 410}], waY: 600, webY: 700, igY: 790};
  }
  return {
    wheelY: L.cy,
    planY: 540,
    ctaLines: [
      {text: 'Agendá', y: 690},
      {text: 'tu visita.', y: 812},
    ],
    waY: 990,
    webY: 1080,
    igY: 1170,
  };
};

export const WA_PREFIX = 'WhatsApp ';
export const WA_NUMBER = '291 448-5665';

export const fitTitle = (L: Layout, text: string) => fit(text, L.size.title, 500, L.maxLine);
