"""Pista y SFX del video v2 (150 BPM, 48 kHz, mono). Uso: python3 scripts/make_audio_v2.py
Estructura (brief v2, seccion 7): build en B1-B8, corte total en B9 (f192), silencio hasta el drop
en B14 (f312), cuerpo hasta B39, golpe final en f888 y cola que muere en B40; silencio en los
ultimos 6 frames."""
import numpy as np
import make_audio as A

SR, SPB, FPS = A.SR, A.SPB, A.FPS
DUR = 16.0
rng = np.random.default_rng(11)


def riser(t0, t1):
    n = int((t1 - t0) * SR)
    k = np.arange(n) / n
    noise = rng.standard_normal(n)
    y = np.zeros(n)
    acc = 0.0
    for i in range(n):  # pasa-bajos que se abre: "algo que sube"
        a = 0.01 + 0.25 * k[i] ** 2
        acc += a * (noise[i] - acc)
        y[i] = acc
    return y * (k ** 1.6) * 0.5


def bed():
    y = np.zeros(int(DUR * SR))
    # Build B1-B8
    for b in range(0, 8):
        A.add(y, b * SPB, A.kick(0.7 + 0.03 * b))
        if b >= 2:
            A.add(y, b * SPB + SPB / 2, A.hat(0.09))
        if b >= 4:
            A.add(y, b * SPB + SPB / 4, A.hat(0.05))
            A.add(y, b * SPB + 3 * SPB / 4, A.hat(0.05))
            A.add(y, b * SPB + SPB / 2, A.bass(55.0, 150, amp=0.22))
        if b >= 6:
            A.add(y, b * SPB, A.rim(0.18))
    A.add(y, 2 * SPB, riser(2 * SPB, 8 * SPB))
    # Cuerpo B14-B39
    notes = [55.0] * 8 + [43.65] * 4 + [49.0] * 4
    for b in range(13, 39):
        rel = b - 13
        A.add(y, b * SPB, A.kick(0.95 if rel % 4 == 0 else 0.85))
        if rel % 4 in (1, 3):
            A.add(y, b * SPB, A.rim(0.26))
        for s in range(4):
            A.add(y, b * SPB + s * SPB / 4, A.hat(0.11 if s == 2 else 0.05, dec=170 if s != 2 else 110))
        f = notes[rel % 16]
        A.add(y, b * SPB + SPB / 2, A.bass(f, 180))
        A.add(y, b * SPB + 3 * SPB / 4, A.bass(f, 90, amp=0.22))
    # Golpe final (placa, f888) con cola
    n = int(SR * 1.4)
    k = np.arange(n) / SR
    tail = A.lowpass(rng.standard_normal(n), 0.08) * np.exp(-k * 3.2) * 0.9 + np.sin(2 * np.pi * 55 * k) * np.exp(-k * 2.6) * 0.5
    A.add(y, 888 / FPS, np.tanh(tail))
    t = np.arange(len(y)) / SR
    g = np.ones_like(y)
    cut, back, ramp = 192 / FPS, 312 / FPS, 2 / FPS
    g = np.where(t >= cut, np.clip(1 - (t - cut) / ramp, 0, 1), g)
    g = np.where(t >= back, 1.0, g)
    f0, f1 = 936 / FPS, 954 / FPS
    g = g * np.where(t >= f0, np.clip(1 - (t - f0) / (f1 - f0), 0, 1) ** 2, 1)
    return y * g


def whoosh():
    n = int(SR * 0.42)
    k = np.arange(n) / n
    noise = rng.standard_normal(n)
    y = np.zeros(n)
    acc = 0.0
    for i in range(n):
        a = 0.03 + 0.3 * np.sin(np.pi * k[i]) ** 2
        acc += a * (noise[i] - acc)
        y[i] = acc
    env = np.sin(np.pi * np.clip(k * 1.15, 0, 1)) ** 2
    return A.highpass(y, 0.9) * env


def dial():
    n = int(SR * 0.018)
    k = np.arange(n) / SR
    return (np.sin(2 * np.pi * 2100 * k) + 0.6 * np.sin(2 * np.pi * 5300 * k)) * np.exp(-k * 420) * 0.5


if __name__ == '__main__':
    A.write('beat-150-v2.wav', bed(), peak=0.8)
    A.write('whoosh.wav', whoosh(), peak=0.7)
    A.write('dial.wav', dial(), peak=0.7)
