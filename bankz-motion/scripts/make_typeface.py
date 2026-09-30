"""Alexandria (woff2 variable) -> typeface.json de three.js (FontLoader), por peso.
Uso: python3 scripts/make_typeface.py   (requiere fonttools y brotli)"""
import json, os
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from fontTools.varLib.instancer import instantiateVariableFont

SRC = os.path.join(os.path.dirname(__file__), '..', 'public', 'fonts', 'alexandria-latin.woff2')
OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'v2', 'fonts')

class TypefacePen(BasePen):
    def __init__(self, gs):
        super().__init__(gs); self.o = []
    def _moveTo(self, p): self.o += ['m', p[0], p[1]]
    def _lineTo(self, p): self.o += ['l', p[0], p[1]]
    def _qCurveToOne(self, p1, p2): self.o += ['q', p2[0], p2[1], p1[0], p1[1]]
    def _curveToOne(self, p1, p2, p3): self.o += ['b', p3[0], p3[1], p1[0], p1[1], p2[0], p2[1]]
    def _closePath(self): pass

def fmt(v): return str(round(v, 1)) if isinstance(v, float) else str(v)

for w in (400, 500):
    f = instantiateVariableFont(TTFont(SRC), {'wght': w})
    gs = f.getGlyphSet(); cmap = f.getBestCmap(); hmtx = f['hmtx']
    glyphs = {}
    for cp, name in cmap.items():
        pen = TypefacePen(gs); gs[name].draw(pen)
        xs = [v for i, v in enumerate(pen.o) if isinstance(v, (int, float))][0::2] or [0]
        glyphs[chr(cp)] = {'ha': hmtx[name][0], 'x_min': min(xs), 'x_max': max(xs), 'o': ' '.join(fmt(v) for v in pen.o)}
    head = f['head']; hhea = f['hhea']
    data = {'glyphs': glyphs, 'familyName': 'Alexandria', 'ascender': hhea.ascent, 'descender': hhea.descent,
            'underlinePosition': -100, 'underlineThickness': 50,
            'boundingBox': {'xMin': head.xMin, 'yMin': head.yMin, 'xMax': head.xMax, 'yMax': head.yMax},
            'resolution': head.unitsPerEm, 'original_font_information': {'format': 0, 'fontFamily': 'Alexandria', 'fontSubfamily': str(w)},
            'cssFontWeight': str(w), 'cssFontStyle': 'normal'}
    p = os.path.join(OUT, f'alexandria-{w}.typeface.json')
    json.dump(data, open(p, 'w'), separators=(',', ':'))
    print(p, len(glyphs), os.path.getsize(p) // 1024, 'KB')
