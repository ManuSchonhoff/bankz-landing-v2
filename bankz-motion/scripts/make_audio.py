"""Genera la pista y los SFX del video a 150 BPM (48 kHz, mono, 16 bit).

Uso: python3 scripts/make_audio.py   (requiere numpy)

La pista (beat-150.wav) ya trae la estructura del brief:
- B1-B4 (0,0-1,6 s): intro percusiva.
- B5 (1,6 s): corte total en 2 frames. Silencio hasta el drop.
- B11 (4,0 s): drop. Cuerpo hasta B39.
- B40 (15,6 s): cola que muere; silencio en los ultimos 6 frames.
Los SFX se ubican desde Remotion (src/Audio.tsx) con la misma tabla de tiempos del video.
"""
import os
import wave

import numpy as np

SR = 48000
BPM = 150
SPB = 60 / BPM  # 0,4 s
DUR = 16.0
FPS = 60
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')
rng = np.random.default_rng(7)


def t_of(n):
    return int(n * SR)


def env_exp(n, dec):
    k = np.arange(n) / SR
    return np.exp(-k * dec)


def highpass(x, a=0.95):
    y = np.zeros_like(x)
    prev_x = 0.0
    prev_y = 0.0
    for i, v in enumerate(x):
        prev_y = a * (prev_y + v - prev_x)
        prev_x = v
        y[i] = prev_y
    return y


def lowpass(x, a=0.2):
    y = np.zeros_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc)
        y[i] = acc
    return y


def kick(amp=0.9, f0=150, f1=46, ms=320):
    n = int(SR * ms / 1000)
    k = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-k * 38)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-k * 9)
    click = rng.standard_normal(n) * np.exp(-k * 900) * 0.25
    return amp * np.tanh(1.6 * (body + click))


def hat(amp=0.12, dec=140, ms=60):
    n = int(SR * ms / 1000)
    x = highpass(rng.standard_normal(n), 0.86)
    return amp * x * env_exp(n, dec)


def rim(amp=0.28):
    n = int(SR * 0.16)
    k = np.arange(n) / SR
    noise = highpass(rng.standard_normal(n), 0.7) * np.exp(-k * 38)
    tone = np.sin(2 * np.pi * 190 * k) * np.exp(-k * 30)
    return amp * np.tanh(1.2 * (0.7 * noise + 0.8 * tone))


def bass(freq, ms, amp=0.32):
    n = int(SR * ms / 1000)
    k = np.arange(n) / SR
    a = np.minimum(1, k / 0.004) * np.exp(-k * 7)
    x = np.sin(2 * np.pi * freq * k) + 0.35 * np.sin(2 * np.pi * 2 * freq * k)
    return amp * np.tanh(1.8 * x) * a


def add(buf, at, sig):
    i = t_of(at)
    j = min(len(buf), i + len(sig))
    if i < len(buf):
        buf[i:j] += sig[: j - i]


def make_bed(beats=40):
    # beats=40: corte de 16 s. beats=30: corte de 12 s (cuerpo hasta B29, golpe final en B28).
    dur = beats * SPB
    y = np.zeros(t_of(dur))
    # Intro B1-B4
    for b in range(0, 4):
        add(y, b * SPB, kick(0.75))
        add(y, b * SPB + SPB / 2, hat(0.10))
        if b >= 2:
            add(y, b * SPB + SPB / 4, hat(0.05))
            add(y, b * SPB + 3 * SPB / 4, hat(0.05))
    # Cuerpo B11-B39 (b = 10..38)
    notes = [55.0, 55.0, 55.0, 55.0, 55.0, 55.0, 55.0, 55.0, 43.65, 43.65, 43.65, 43.65, 49.0, 49.0, 49.0, 49.0]
    for b in range(10, beats - 1):
        rel = b - 10
        add(y, b * SPB, kick(0.95 if rel % 4 == 0 else 0.85))
        if rel % 4 in (1, 3):
            add(y, b * SPB, rim(0.26))
        for s in range(4):
            acc = 0.11 if s == 2 else 0.05
            add(y, b * SPB + s * SPB / 4, hat(acc, dec=170 if s != 2 else 110))
        f = notes[rel % 16]
        add(y, b * SPB + SPB / 2, bass(f, 180))
        add(y, b * SPB + 3 * SPB / 4, bass(f, 90, amp=0.22))
    # Golpe final en B37 con cola
    n = int(SR * 1.4)
    k = np.arange(n) / SR
    tail = lowpass(rng.standard_normal(n), 0.08) * np.exp(-k * 3.2) * 0.9
    tail += np.sin(2 * np.pi * 55 * k) * np.exp(-k * 2.6) * 0.5
    add(y, (beats - 4) * SPB, np.tanh(tail))
    # Corte total en B5 (f96) en 2 frames y vuelta en el drop (f240)
    t = np.arange(len(y)) / SR
    g = np.ones_like(y)
    cut, back = 96 / FPS, 240 / FPS
    ramp = 2 / FPS
    g = np.where(t >= cut, np.clip(1 - (t - cut) / ramp, 0, 1), g)
    g = np.where(t >= back, 1.0, g)
    # Cola: muere durante B40 y silencio en los ultimos 6 frames
    fade0, fade1 = (beats - 1) * SPB, (beats - 1) * SPB + 18 / FPS
    g = g * np.where(t >= fade0, np.clip(1 - (t - fade0) / (fade1 - fade0), 0, 1) ** 2, 1)
    y = y * g
    return y


def key(seed, f_body):
    r = np.random.default_rng(seed)
    n = int(SR * 0.06)
    k = np.arange(n) / SR
    press = highpass(r.standard_normal(n), 0.6) * np.exp(-k * 520)
    body = np.sin(2 * np.pi * f_body * k) * np.exp(-k * 90) * 0.5
    x = press + body
    rel = np.zeros(n)
    d = int(SR * 0.028)
    rel[d:] = (highpass(r.standard_normal(n - d), 0.6) * np.exp(-k[: n - d] * 700)) * 0.35
    return np.tanh(1.4 * (x + rel)) * 0.55


def key_low():
    n = int(SR * 0.12)
    k = np.arange(n) / SR
    press = highpass(rng.standard_normal(n), 0.5) * np.exp(-k * 400)
    body = np.sin(2 * np.pi * 110 * k) * np.exp(-k * 32)
    return np.tanh(1.3 * (0.6 * press + body)) * 0.7


def clack():
    n = int(SR * 0.35)
    k = np.arange(n) / SR
    x = np.zeros(n)
    for off, a in ((0.0, 1.0), (0.034, 0.7)):
        i = int(off * SR)
        kk = k[: n - i]
        part = sum(np.sin(2 * np.pi * fr * kk) * np.exp(-kk * d) * g
                   for fr, d, g in ((930, 40, 0.5), (1480, 55, 0.35), (2310, 70, 0.25), (3620, 90, 0.15)))
        part += highpass(rng.standard_normal(n - i), 0.5) * np.exp(-kk * 300) * 0.6
        part += np.sin(2 * np.pi * 85 * kk) * np.exp(-kk * 18) * 0.6
        x[i:] += a * part
    return np.tanh(1.2 * x) * 0.75


def thud():
    n = int(SR * 1.1)
    k = np.arange(n) / SR
    f = 42 + 60 * np.exp(-k * 14)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-k * 3.4)
    noise = lowpass(rng.standard_normal(n), 0.05) * np.exp(-k * 12) * 1.5
    return np.tanh(1.5 * (body + noise)) * 0.95


def tick():
    n = int(SR * 0.04)
    k = np.arange(n) / SR
    x = np.sin(2 * np.pi * 2600 * k) * np.exp(-k * 220) + highpass(rng.standard_normal(n), 0.5) * np.exp(-k * 900) * 0.4
    return x * 0.35


def hit():
    n = int(SR * 0.22)
    k = np.arange(n) / SR
    f = 70 + 90 * np.exp(-k * 30)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-k * 16) + highpass(rng.standard_normal(n), 0.6) * np.exp(-k * 160) * 0.35
    return np.tanh(1.4 * x) * 0.6


def write(name, y, peak=0.89):
    m = np.max(np.abs(y))
    if m > 0:
        y = y / m * peak
    path = os.path.join(OUT, name)
    with wave.open(path, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(y, -1, 1) * 32767).astype('<i2').tobytes())
    print('ok', name, round(len(y) / SR, 3), 's')


def placeholder():
    # Placeholder literal del brief (seccion 8), para calzar timing.
    y = np.zeros(int(SR * DUR))

    def h(at, f=1200, amp=0.35, ms=25, dec=180):
        i, n = int(at * SR), int(SR * ms / 1000)
        k = np.arange(n) / SR
        y[i:i + n] += amp * np.sin(2 * np.pi * f * k) * np.exp(-k * dec)
    for b in range(40):
        if 4 <= b <= 9:
            continue
        h(b * SPB, amp=0.6 if b == 10 else 0.35)
    h(10 * SPB, f=80, amp=0.9, ms=220, dec=12)
    return y


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    write('beat-150.wav', make_bed(40), peak=0.8)
    write('beat-150-placeholder.wav', placeholder(), peak=0.8)
    write('key-1.wav', key(1, 210))
    write('key-2.wav', key(2, 260))
    write('key-low.wav', key_low())
    write('clack.wav', clack())
    write('thud.wav', thud())
    write('tick.wav', tick())
    write('hit.wav', hit())
    # Al final, para no alterar el ruido (seed fija) de los archivos anteriores.
    write('beat-150-12s.wav', make_bed(30), peak=0.8)
