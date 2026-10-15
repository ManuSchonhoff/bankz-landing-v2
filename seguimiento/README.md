# Bankz Seguimiento

Material de arranque del sistema de seguimiento de venta (herramienta interna, no forma parte de la landing bankz.ar).

- `BRIEF.md`: brief completo para Claude Code.
- `estetica-vidrio.md`: especificación de estilo de referencia.
- `seed.json`: datos iniciales.
- `tracker.html`: prototipo funcional (lógica de cálculo y PDF).
- `logo_dark.png`, `logo_white.png`: logos.
- `referencia-impronta.png`: referencia de composición únicamente.

## Paleta

Blanco y negro Bankz. Sin verde, menta, crema ni dorado. Negro Medianoche `#05090A`, Blanco Nieve `#F9F9F9` y grises (`#1A2124`, `#0E1315`, `#4A5255`, `#8C9497`, `#A1A1A6`). Lo positivo se marca en Blanco Nieve (oscuro) o Negro Medianoche (claro), peso 600. El rojo `#FF3B30` queda solo para alertas. Detalle en la sección 10 de `BRIEF.md`.

## Despliegue

La carpeta está excluida del deploy de la landing (`.vercelignore`). La app va en su propio proyecto de Vercel, detrás de contraseña.
