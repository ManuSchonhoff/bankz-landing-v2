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
