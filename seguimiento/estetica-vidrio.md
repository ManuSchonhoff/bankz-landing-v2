> **Bankz Seguimiento:** paleta pasada a blanco y negro Bankz (Negro Medianoche #05090A / Blanco Nieve #F9F9F9, grises). Donde la versión original de TrackeAR usaba verde o menta, acá va Blanco Nieve, Negro Medianoche o gris. Ante cualquier duda, manda la sección 10 de BRIEF.md.

Hacé el artifact con la estética "Vidrio" de TrackeAR Pro. Te paso el detalle exacto (sale del CSS real de nuestras piezas) y adjunto dos imágenes de referencia: el banner oscuro (widget de vidrio con la ganancia destacada) y el claro (ícono de la T y botón de vidrio).

## La idea
Estilo iOS 26 / Apple. Detrás de todo, un fondo con dos superficies curvas grandes que reciben luz en el borde. Encima, tarjetas de vidrio esmerilado como los widgets del iPhone. Mucho aire, tipografía grande y apretada, blanco y negro Bankz, sin verde. Modo claro y modo oscuro (prefers-color-scheme, tokens en :root).

## 1. Tipografía
- Inter de Google Fonts: `https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..800&display=swap`, con `font-optical-sizing:auto; -webkit-font-smoothing:antialiased`. Respaldo: -apple-system, "SF Pro Text", system-ui.
- Títulos: peso 700, letter-spacing -0.03em a -0.05em, line-height 1.05–1.1.
- Rótulos y texto secundario: peso 500–600, letter-spacing -0.01em a -0.02em.
- Números: `font-variant-numeric: tabular-nums`. Entero grande en 700 y -0.055em; decimales más chicos (la mitad del entero), peso 650.
- Rótulos chicos en mayúsculas: 12px, +0.04em. Sin itálicas. Una sola familia.

## 2. Colores
Claro:
- Fondo base: `radial-gradient(75% 65% at 50% 42%, #FFFFFF 0%, #F8F8FA 42%, #F1F1F4 100%)`
- Texto #1D1D1F (títulos #0A0A0A) · secundario #636366 · terciario #8E8E93 · líneas rgba(60,60,67,.14)

Oscuro:
- Fondo base: `radial-gradient(75% 65% at 52% 50%, #0C0D0D 0%, #050505 55%, #000000 100%)`
- Texto #F5F5F7 · secundario #A1A1A6 · rótulos rgba(235,235,245,.82) · líneas rgba(235,235,245,.14)

Acento (sin color, monocromo Bankz): Blanco Nieve #F9F9F9 (oscuro) / Negro Medianoche #05090A (claro), peso 600, SOLO para lo positivo: hecho, ganancia, "ahora". En oscuro lleva brillo: `text-shadow: 0 0 26px rgba(249,249,249,.30)`. Lo que no es positivo va en secundario gris. Rojo #FF3B30 solo para alertas. Nada de violeta ni azul.

## 3. Fondo (lo que el vidrio desenfoca)
Una capa fija detrás de todo (`position:fixed; inset:0; z-index:-1; overflow:hidden`) con dos círculos enormes que entran desde los bordes:
- **Superficie medianoche/nieve, abajo a la izquierda** (diámetro ~1,4 veces el ancho de pantalla, se ve solo su borde superior derecho).
- **Superficie grafito/perla, arriba a la derecha** (más chica, se ve su borde inferior izquierdo).

Rellenos (de la zona con luz hacia adentro):
- Claro: nieve `#D9DCDD → #E3E5E6 → #ECEDED → #F1F2F2`; perla `#EAEAEE → #E4E4E9 → #DDDDE2 → #D8D8DE`.
- Oscuro: medianoche `#1A2124 → #0E1315 → #05090A → #020303`; grafito `#1D1D20 → #121214 → #08080A → #030303`.

Cada superficie tiene un "filo" de luz en su borde: otro círculo igual encima, con `box-shadow` y `filter: blur(2.4px)`, y una máscara radial que lo apaga hacia los extremos (`mask: radial-gradient(60% 42% at 64% 9%, #000 0%, rgba(0,0,0,.8) 50%, transparent 100%)`):
- Claro, nieve: `inset 0 0 0 3px rgba(5,9,10,.55), inset 0 10px 64px rgba(5,9,10,.10), 0 0 44px rgba(5,9,10,.08)`
- Claro, perla: `inset 0 0 0 2.5px #FFFFFF, inset 0 -12px 60px rgba(255,255,255,.55), 0 0 30px rgba(0,0,0,.04)`
- Oscuro, medianoche: `inset 0 0 0 3px rgba(249,249,249,.85), inset 0 10px 70px rgba(249,249,249,.18), 0 0 56px rgba(249,249,249,.20)`
- Oscuro, grafito: `inset 0 0 0 2px rgba(255,255,255,.40), inset 0 -12px 64px rgba(255,255,255,.09), 0 0 40px rgba(255,255,255,.06)`

Reglas del fondo: las tarjetas pasan por encima del borde de las superficies (si no, el vidrio no tiene nada que desenfocar y se ve plano); nada de manchas de luz sueltas; el texto chico nunca encima de un filo.

## 4. Tarjeta de vidrio (widget de iOS)
Radio 22–28px; en Chrome sumá `corner-shape: superellipse(1.6)` para esquinas continuas.

Claro:
```css
.vidrio{position:relative;isolation:isolate;border-radius:24px;
  background:linear-gradient(180deg,rgba(255,255,255,.60) 0%,rgba(255,255,255,.38) 100%);
  -webkit-backdrop-filter:blur(24px) saturate(200%);backdrop-filter:blur(24px) saturate(200%);
  box-shadow:inset 0 1.5px 0 #FFFFFF, inset 0 -8px 18px rgba(255,255,255,.16),
             0 1px 2px rgba(0,0,0,.05), 0 6px 16px rgba(0,0,0,.05), 0 14px 30px rgba(0,0,0,.04);}
.vidrio::before{content:"";position:absolute;inset:0;border-radius:inherit;z-index:-1;pointer-events:none;
  background:radial-gradient(90% 85% at 0% 100%,rgba(5,9,10,.05),rgba(5,9,10,0) 100%), /* sombra tenue adentro, abajo a la izquierda */
             linear-gradient(180deg,rgba(255,255,255,.62) 0%,rgba(255,255,255,.14) 30%,rgba(255,255,255,0) 50%),
             linear-gradient(115deg,rgba(255,255,255,.42) 0%,rgba(255,255,255,0) 24%);}
.vidrio::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;padding:1.5px; /* filete que brilla arriba */
  background:linear-gradient(180deg,#FFFFFF 0%,rgba(255,255,255,.6) 30%,rgba(255,255,255,.4) 64%,rgba(255,255,255,.95) 100%);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;}
```
Oscuro (mismas pseudo-capas, otros valores):
```css
background:linear-gradient(180deg,rgba(62,62,66,.40) 0%,rgba(30,30,33,.50) 100%);
backdrop-filter:blur(30px) saturate(170%);
box-shadow:inset 0 1px 1px rgba(255,255,255,.10), 0 2px 4px rgba(0,0,0,.30), 0 12px 26px rgba(0,0,0,.36), 0 30px 60px rgba(0,0,0,.50);
/* ::before */ radial-gradient(90% 85% at 0% 100%,rgba(249,249,249,.06),rgba(249,249,249,0)),
               linear-gradient(150deg,rgba(255,255,255,.13) 0%,rgba(255,255,255,.03) 24%,rgba(255,255,255,0) 40%),
               radial-gradient(90% 46% at 50% 0%,rgba(255,255,255,.06),rgba(255,255,255,0) 80%);
/* ::after (filete) */ radial-gradient(70% 120% at 0% 0%,rgba(255,255,255,.72) 0%,rgba(255,255,255,.22) 45%,rgba(255,255,255,0) 100%),
               radial-gradient(60% 90% at 100% 100%,rgba(255,255,255,.22) 0%,rgba(255,255,255,0) 100%), rgba(255,255,255,.05);
```
Listas dentro de una tarjeta: filas separadas por 1px de `--lineas`, con sangría a la izquierda como en iOS.

## 5. Botones y píldoras
- **Botón de vidrio** (claro): alto 44–52px, `border-radius:999px`, `background:linear-gradient(180deg,rgba(255,255,255,.40),rgba(255,255,255,.22))`, `backdrop-filter:blur(22px) saturate(200%)`, sombra `inset 0 1.5px 0 #FFF, inset 0 -1.5px 1px rgba(255,255,255,.55), inset 0 -10px 22px rgba(255,255,255,.18), 0 1px 2px rgba(0,0,0,.06), 0 10px 24px rgba(0,0,0,.08)`, reflejo en `::before`: `linear-gradient(180deg,rgba(255,255,255,.78) 0%,rgba(255,255,255,.22) 34%,transparent 52%), linear-gradient(115deg,rgba(255,255,255,.5) 0%,transparent 22%)`. El principal lleva un tinte gris adentro: `radial-gradient(60% 120% at 82% 70%,rgba(5,9,10,.10),transparent)`.
- **Tecla sólida** (acción principal): en claro, negra con brillo `linear-gradient(180deg,#2E2E31 0%,#141416 48%,#0A0A0A 100%)`, `inset 0 1.5px 0 rgba(255,255,255,.26)`, texto #F5F5F7. En oscuro, la inversa: `linear-gradient(180deg,#FFFFFF 0%,#F0F0F3 55%,#E2E2E7 100%)` con texto #0A0A0A.
- **Chips de estado**: pastilla de vidrio chica (12–13px, peso 600).

## 6. Íconos y marca
- Íconos de línea estilo SF Symbols en SVG inline: trazo 1.75–2, puntas redondeadas, #3A3A3C en claro y #E5E5EA en oscuro. Sin emojis.
- Logo: la "T" en un cuadrado con esquinas de ícono de iOS (radio 26% del lado). En claro, cuadrado #0A0A0A con la T #F5F5F7; en oscuro, cuadrado #F5F5F7 con la T negra. Sombra de ícono de app: `0 1px 2px rgba(0,0,0,.30), 0 8px 18px rgba(0,0,0,.25)`.
- Nombre: "TrackeAR" en peso 600 + " Pro" en gris #8E8E93.

## 7. Movimiento
Transiciones de 160–240ms con ease-out; al tocar una tarjeta, `scale(.98)`; hover solo dentro de `@media (hover:hover)`; respetar `prefers-reduced-motion`.

## 8. Reglas
- Mucho aire: 16px de margen lateral en el celular y 24–32px en la compu; 12–16px entre tarjetas.
- Un solo título grande por pantalla; el resto en tarjetas de vidrio.
- Sin verde. Lo positivo, hecho o "ahora" se marca en Blanco Nieve (oscuro) / Negro Medianoche (claro) con peso 600; rojo solo para alertas.
- Contraste AA en todo el texto (por eso el secundario en claro es #636366).
- Prohibido: verde, crema, menta, dorado, degradés violeta/azul, vidrio sobre fondo plano (sin los arcos detrás no se nota), bordes gruesos, sombras duras, emojis, más de una tipografía.
- Tiene que verse bien a 375px de ancho, sin scroll horizontal.

## Para la agenda diaria (sugerencia)
Arriba, la fecha grande ("Miércoles 14") con un chip "Hoy" y un widget de vidrio con el resumen del día (por ejemplo "3 de 7 hechas", con el número en Blanco Nieve). Abajo, una línea de tiempo vertical: cada bloque horario es una tarjeta de vidrio con la hora a la izquierda en números tabulares; el bloque actual tiene un punto Blanco Nieve con brillo "ahora"; las tareas hechas, un tilde Blanco Nieve y el texto en gris secundario.
