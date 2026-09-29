// 150 BPM a 60 fps: 1 beat = 0,4 s = 24 frames. B1 arranca en f0.
export const FPS = 60;
export const BPM = 150;
export const FPB = 24;
export const DURATION = 960; // 16 s = 40 beats

export const beat = (n: number) => (n - 1) * FPB;

export const EVENTS = {
  musicCut: beat(5), // f96
  drop: beat(11), // f240, inversion a blanco
  toDark: beat(19), // f432, inversion a negro
  placa: beat(37), // f864
} as const;

// Tecleo de la pregunta: 9 car/s, el "?" (car. 14) cae exacto en f192.
export const Q_CPS = 9;
export const Q_CHARS = 14;
export const Q_T0 = beat(9) - ((Q_CHARS - 1) * FPS) / Q_CPS; // 105,33

// Tecleo del numero: 12 car/s, termina en f708.
export const WA_CPS = 12;
export const WA_CHARS = 12;
export const WA_T0 = 708 - ((WA_CHARS - 1) * FPS) / WA_CPS; // 653

export const typedCount = (f: number, t0: number, cps: number, total: number) => {
  if (f < t0) return 0;
  return Math.min(total, Math.floor(((f - t0) * cps) / FPS + 1e-6) + 1);
};

// Frame en que aparece el caracter i (para los clicks de audio).
export const charFrame = (i: number, t0: number, cps: number) => Math.ceil(t0 + (i * FPS) / cps - 1e-6);

// Ventanas con motion blur de camara (barridos B12, B15, B22, B25, B34 y la estela del drop).
export const MOTION_BLUR: [number, number][] = [
  [241, 248],
  [264, 278],
  [336, 350],
  [504, 518],
  [576, 590],
  [792, 806],
];

// ---------- Corte de 12 s (seccion 13 del brief): 30 beats = 720 frames ----------
export type Cut = '16' | '12';
export const DURATION_12 = 720;

// B19 (f432): inversion a negro + CTA. B19½: prefijo y cursor.
// B20-B21: tecleo del numero, del primer caracter en f456 al ultimo en f503
// (12 caracteres en 2 beats: ~14 car/s).
export const WA12 = {appear: 444, t0: 456, cps: (11 * FPS) / 47, end: 503, gone: 539};
export const WA16 = {appear: 648, t0: WA_T0, cps: WA_CPS, end: 708, gone: 744};

// Cierre en 6 beats (B25-B30): el Acto 5 del corte largo remapeado.
// B25-B28 1:1 (f576-661 -> f792-877), placa final estirada en un beat menos
// (f662-695 -> f878-935) y B30 1:1 (f696-719 -> f936-959). f719 = f959 = f0.
export const toLong = (f: number) => {
  if (f < 662) return f + 216;
  if (f < 696) return 878 + ((f - 662) * 58) / 34;
  return f + 240;
};

export const MOTION_BLUR_12: [number, number][] = [
  [241, 248],
  [264, 278],
  [336, 350],
  [576, 590],
];
