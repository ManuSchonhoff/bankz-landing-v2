// Solo dos hex en todo el proyecto. Los grises son opacidad de la tinta.
export const NEGRO = '#05090A'; // Negro Medianoche
export const NIEVE = '#F9F9F9'; // Blanco Nieve

export const OP = {full: 1, o60: 0.6, o30: 0.3, o12: 0.12} as const;

export type Theme = {bg: string; ink: string; brand: 'negro' | 'blanco'; inverted: boolean};

const DARK: Theme = {bg: NEGRO, ink: NIEVE, brand: 'blanco', inverted: false};
const LIGHT: Theme = {bg: NIEVE, ink: NEGRO, brand: 'negro', inverted: true};

// Inversiones en 1 frame, sin fundido: f240 a blanco, f432 a negro.
export const themeAt = (f: number): Theme => (f >= 240 && f < 432 ? LIGHT : DARK);
