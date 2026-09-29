# Bankz · Video de marca (Remotion)

Video de 16 s a 60 fps y 150 BPM, en 16:9 y 9:16, hecho según el brief "Bankz · Video de marca en motion graphics" (v1, 29/09/2026). Es un solo plano continuo: se teclea "¿Estás seguro?", la música se corta y en el drop la marca responde. Cierra con "Estás seguro.".

## Uso

```bash
cd bankz-motion
npm install
python3 scripts/make_audio.py        # regenera pista y SFX (requiere numpy)
npx remotion studio                  # preview
# render (en este contenedor se usa el Chromium preinstalado):
export REMOTION_CHROME=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx remotion render Bankz16x9 out/bankz-16x9.mp4 --codec=h264 --crf=15 --pixel-format=yuv420p --concurrency=4 --browser-executable=$REMOTION_CHROME
npx remotion render Bankz9x16 out/bankz-9x16.mp4 --codec=h264 --crf=15 --pixel-format=yuv420p --concurrency=4 --browser-executable=$REMOTION_CHROME
npx remotion still Bankz16x9 out/placa-final-16x9.png --frame=900 --browser-executable=$REMOTION_CHROME
npx remotion still Bankz9x16 out/placa-final-9x16.png --frame=900 --browser-executable=$REMOTION_CHROME
node scripts/stills.mjs Bankz16x9 240,432,864   # stills de revisión en out/review
```

Fuera de este contenedor se puede omitir `--browser-executable`. En ese caso Remotion descarga su propio Chrome.

## Corte de 12 s (sección 13 del brief)

Composiciones `Bankz12s16x9` y `Bankz12s9x16`: 720 frames, 30 beats.

```bash
npx remotion render Bankz12s16x9 out/bankz-12s-16x9.mp4 --codec=h264 --crf=15 --pixel-format=yuv420p --concurrency=4 --browser-executable=$REMOTION_CHROME
npx remotion render Bankz12s9x16 out/bankz-12s-9x16.mp4 --codec=h264 --crf=15 --pixel-format=yuv420p --concurrency=4 --browser-executable=$REMOTION_CHROME
```

- **B1–B18:** iguales al corte largo. El Acto 3 y la rueda se eliminan.
- **B19 (f432):** inversión a negro y se clava "Agendá tu visita.". Los chips salen de borroso.
- **B19½:** aparecen el prefijo "WhatsApp" y el cursor.
- **B20–B21:** tecleo del número, del primer carácter en f456 al último en f503. Son 12 caracteres en 2 beats, así que va a unos 14 car/s en lugar de 12.
- **B22:** entra "bankz.ar".
- **B23:** entra "@bankzarg".
- **B24:** el bloque late.
- **B25–B30:** el cierre del Acto 5 remapeado (`toLong` en `timing.ts`). B25–B28 van 1:1, la placa final dura un beat menos y B30 va 1:1. El loop se cumple: f719 = f0.
- **Audio:** `beat-150-12s.wav` tiene la misma estructura, con el cuerpo hasta B29 y el golpe final en B28. En f432 no se suma el hit: el impacto grave ya marca la inversión y evita que el audio sature.

## Estructura

| Archivo | Qué hace |
|---|---|
| `src/timing.ts` | 150 BPM, 24 f por beat, `beat(n)`, velocidades de tecleo, ventanas de motion blur |
| `src/theme.ts` | Los dos únicos hex. Inversiones duras en f240 y f432 |
| `src/layout.ts` | Tamaños, zonas seguras y geometría compartida por formato |
| `src/Camera.tsx` | Zoom por keyframes, golpes, paneos, deriva continua y seguimiento del caret (4 f de retraso) |
| `src/components/` | `Txt` y `Caret`, `Aro` y `QMark` (trazo SVG del "?"), `BoxFace`, `Brand`, `MotionBlur` |
| `src/scenes/` | Los 5 actos del guion. `04b-VisitaCorta` es el bloque de CTA del corte de 12 s |
| `src/frame.ts` | `useFrame()`: frame actual con remapeo opcional (cierre del corte de 12 s) |
| `src/Sfx.tsx` | Pista y SFX. Los clicks salen de la misma tabla de tecleo que el video |
| `public/brand/` | Logotipo horizontal e isotipo oficiales en negro y blanco. Son los mismos trazados que usa bankz.ar |
| `public/fonts/` | Alexandria variable (la de bankz.ar), servida local |
| `scripts/make_audio.py` | Pista de 150 BPM con el corte en f96 y el drop en f240, y los SFX |

## Decisiones tomadas donde el brief no alcanzaba

1. **Logotipo vertical.** No está en el repo. En Drive, los archivos `LOGOTIPO-VERTICAL-*.pdf` contienen solo el isotipo (están mal nombrados). La placa final 9:16 usa por ahora el **logotipo horizontal** (ancho 640 px, centro en 540, 800). Cuando esté el SVG vertical oficial, basta con agregarlo a `public/brand/` y cambiar `logo` en `layout.ts`.
2. **Centro del contenido en 9:16:** y = 880 (centro de la zona segura 260–1500), no 960. El punto del loop también está ahí.
3. **Motion blur:** es la misma técnica que `CameraMotionBlur` (shutter 180°), pero con muestras centradas en el frame. Así no hay un salto de ¾ de frame al entrar o salir de un barrido. Usa 10 muestras en lugar de 6, porque con 6 los barridos rápidos dejaban copias visibles. La marca queda fuera del motion blur: solo cambia de opacidad, posición y escala.
4. **Tamaños que el brief no fija:**
   - Subtítulo: 52 / 44 px.
   - Rueda: 112 / 100 px.
   - Etiquetas en la fila de B22: 36/28 px (16:9) y 32/26 px (9:16). A 56/44 px las etiquetas de BKZ 1 y BKZ 2 se pisan.
   - "WhatsApp" va al 60 % de opacidad y el número al 100 %.
5. **Chips:** contorno de 2 px, radio 6 px (el radio de la web es 4 px), solo texto.
6. **Cara de caja:** alto = primer número, ancho = segundo. Placa y cerraduras quedan agrupadas al 55 % del alto.
7. **Audio:** la pista y los SFX son sintetizados (kick, rim, hats, bajo en La y cola). Sirven para el timing y suenan sobrios, pero no son la música definitiva. Para reemplazarlos, se cambia `public/audio/beat-150.wav` por otro archivo con la misma estructura.

## A confirmar con Manuel antes de publicar

- **Medidas de BKZ 5:** el brief dice 51×27×60 y eso es lo que se usó. `CLAUDE.md` §18 registra un conflicto (52×27×55). Confirmar con el proveedor.
- **"Acceso biométrico":** Cronos Control tenía la configuración pendiente al 25/09. Si la huella no está operativa al publicar, el chip pasa a "Acceso controlado" (`CHIPS` en `layout.ts`).
- **"Doble llave":** confirmar que sigue vigente.
- **Orden de las medidas:** se asumió alto × ancho × profundidad.
- **Música definitiva.**

## QA hecho

- Solo `#05090A` y `#F9F9F9` en `src/`. Los grises salen de la opacidad.
- Loop: el frame 959 y el frame 0 son idénticos píxel a píxel en ambos formatos.
- `BASE_K` quedó calibrado superponiendo el glifo "?" de Alexandria 500 y el trazo SVG: coinciden.
- Duración y fps de los MP4: 960 frames, 60 fps, 16,00 s (el contenedor marca 16,064 s por el padding de AAC).
- Audio: corte total entre f96 y el primer click, silencio total en B10 y en los últimos 6 frames, pico en -1,96 dBFS.
