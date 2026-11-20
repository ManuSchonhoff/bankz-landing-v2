// Promo "desde $54.000": 12 s, 150 BPM, 30 beats, 720 frames.
import {NEGRO, NIEVE} from '../theme';

export type Aspect = '16x9' | '9x16';
export const DURATION_P = 720;
export const SIZE_P: Record<Aspect, [number, number]> = {'16x9': [1920, 1080], '9x16': [1080, 1920]};
export const CENTER_P: Record<Aspect, [number, number]> = {'16x9': [960, 540], '9x16': [540, 880]};

// Eventos: inversion a blanco en el precio (B7, f144) y vuelta al negro en el DNI (B13, f288).
export const EVP = {drop: 144, back: 288, placa: 456, fade: 696} as const;
export const themeP = (f: number) => (f >= EVP.drop && f < EVP.back ? {bg: NIEVE, ink: NEGRO, brand: 'negro' as const} : {bg: NEGRO, ink: NIEVE, brand: 'blanco' as const});

