// Medicion de texto con canvas (misma fuente y kerning que el DOM).
// Solo se llama despues de que Alexandria termino de cargar (ver useFonts).
export const FONT = 'Alexandria';

// Centro de la caja (line-height 1) -> linea de base, en em. Calibrado con stills (ver QA).
export const BASE_K = 0.3585;

const cache = new Map<string, number>();
let ctx: CanvasRenderingContext2D | null = null;

export const measure = (text: string, size: number, weight: number) => {
  const k = `${weight}|${size}|${text}`;
  const hit = cache.get(k);
  if (hit !== undefined) return hit;
  if (!ctx) ctx = document.createElement('canvas').getContext('2d');
  ctx!.font = `${weight} ${size}px ${FONT}`;
  const w = ctx!.measureText(text).width;
  cache.set(k, w);
  return w;
};

// Auto-ajuste: si no entra en maxW se baja el cuerpo. Nunca se corta ni se comprime.
export const fit = (text: string, size: number, weight: number, maxW: number) =>
  Math.min(size, (size * maxW) / measure(text, size, weight));

// Geometria del "?" y del "." de Alexandria 500 (unidades de fuente, upm 1000).
export const GLYPH = {
  qDot: {x: 213.6, y: 60.2, r: 69},
  periodDot: {x: 112.4, y: 60.2, r: 69},
};
