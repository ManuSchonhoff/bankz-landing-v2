"""Pista del promo "desde $54.000" (12 s, 150 BPM). Uso: cd scripts && python3 make_audio_promo.py
Build en B1-B5, silencio en B6 (la camara se mete en la caja), drop en B7 (f144, precio),
cuerpo hasta B29, golpe en la placa (f456) y cola que muere en B30; silencio en los ultimos 6 f."""
import numpy as np
import make_audio as A
from make_audio_v2 import riser

SR, SPB, FPS = A.SR, A.SPB, A.FPS
DUR = 12.0
rng = np.random.default_rng(23)


def bed():
    y = np.zeros(int(DUR * SR))
    for b in range(0, 5):
        A.add(y, b * SPB, A.kick(0.72))
        if b >= 1:
            A.add(y, b * SPB + SPB / 2, A.hat(0.09))
        if b >= 3:
            A.add(y, b * SPB + SPB / 4, A.hat(0.05))
            A.add(y, b * SPB + 3 * SPB / 4, A.hat(0.05))
    A.add(y, 1 * SPB, riser(1 * SPB, 5 * SPB))
    notes = [55.0] * 8 + [43.65] * 4 + [49.0] * 4
    for b in range(6, 29):
        rel = b - 6
        A.add(y, b * SPB, A.kick(0.95 if rel % 4 == 0 else 0.85))
        if rel % 4 in (1, 3):
            A.add(y, b * SPB, A.rim(0.26))
        for s in range(4):
            A.add(y, b * SPB + s * SPB / 4, A.hat(0.11 if s == 2 else 0.05, dec=170 if s != 2 else 110))
        f = notes[rel % 16]
        A.add(y, b * SPB + SPB / 2, A.bass(f, 180))
        A.add(y, b * SPB + 3 * SPB / 4, A.bass(f, 90, amp=0.22))
    n = int(SR * 1.4)
    k = np.arange(n) / SR
    tail = A.lowpass(rng.standard_normal(n), 0.08) * np.exp(-k * 3.2) * 0.9 + np.sin(2 * np.pi * 55 * k) * np.exp(-k * 2.6) * 0.5
    A.add(y, 456 / FPS, np.tanh(tail) * 0.8)
    t = np.arange(len(y)) / SR
    g = np.ones_like(y)
    cut, back, ramp = 120 / FPS, 144 / FPS, 2 / FPS
    g = np.where(t >= cut, np.clip(1 - (t - cut) / ramp, 0, 1), g)
    g = np.where(t >= back, 1.0, g)
    f0, f1 = 696 / FPS, 714 / FPS
    g = g * np.where(t >= f0, np.clip(1 - (t - f0) / (f1 - f0), 0, 1) ** 2, 1)
    return y * g


if __name__ == '__main__':
    A.write('beat-150-promo.wav', bed(), peak=0.8)
