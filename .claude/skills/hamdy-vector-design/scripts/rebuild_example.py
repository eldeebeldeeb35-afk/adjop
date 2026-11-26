"""Rebuild the ESK★II back print as clean one-colour vector geometry (white ink on red).

Shapes are listed back to front. Each front shape cuts a gap (no ink) around itself into
the shapes behind it, which gives the overlapped-sticker look. K is an outline letter.
"""
import math
import sys
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from shapely.geometry import Polygon, box
from shapely.ops import unary_union
from shapely import affinity

FONT, OUT = sys.argv[1], sys.argv[2]
INK = "#ffffff"


class Flat(BasePen):
    def __init__(self, gs):
        super().__init__(gs)
        self.contours, self.cur = [], []

    def _moveTo(self, p):
        self.cur = [p]

    def _lineTo(self, p):
        self.cur.append(p)

    def _curveToOne(self, p1, p2, p3):
        p0 = self.cur[-1]
        for i in range(1, 13):
            t = i / 12
            mt = 1 - t
            self.cur.append(tuple(mt**3 * a + 3 * mt * mt * t * b + 3 * mt * t * t * c + t**3 * d
                                  for a, b, c, d in zip(p0, p1, p2, p3)))

    def _qCurveToOne(self, p1, p2):
        p0 = self.cur[-1]
        for i in range(1, 11):
            t = i / 10
            mt = 1 - t
            self.cur.append(tuple(mt * mt * a + 2 * mt * t * b + t * t * c for a, b, c in zip(p0, p1, p2)))

    def _closePath(self):
        if len(self.cur) > 2:
            self.contours.append(self.cur)
        self.cur = []

    _endPath = _closePath


font = TTFont(FONT)
gs = font.getGlyphSet()
cmap = font.getBestCmap()
cap = font["OS/2"].sCapHeight


def glyph(ch, x):
    pen = Flat(gs)
    name = cmap[ord(ch)]
    gs[name].draw(pen)
    g = None
    for c in pen.contours:
        p = Polygon(c).buffer(0)
        g = p if g is None else g.symmetric_difference(p)
    # flip y (font y-up -> svg y-down), baseline at y=0
    g = affinity.scale(g, 1, -1, origin=(0, 0))
    return affinity.translate(g, x, 0), gs[name].width


gap = cap * 0.045     # red gap between overlapping shapes
ring = cap * 0.07     # K outline thickness

E, wE = glyph("E", 0)
S, wS = glyph("S", wE * 0.86)
K, wK = glyph("K", wE * 0.86 + wS * 0.9)
kx1 = K.bounds[2]

# star: fat 5-point star, sits a bit lower than the letters and overlaps K
R = cap * 0.74
cx, cy = kx1 + R * 0.3, -cap * 0.42
pts = []
for i in range(10):
    r = R if i % 2 == 0 else R * 0.47
    a = -math.pi / 2 + i * math.pi / 5
    pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
star = Polygon(pts)

# two tall bars, taller than the letters
bw = cap * 0.36
b1x = cx + R * 0.62
bars = [box(b1x, -cap * 1.3, b1x + bw, 0), box(b1x + bw + gap * 1.6, -cap * 1.42, b1x + 2 * bw + gap * 1.6, 0)]

soft = lambda g, r: g.buffer(-r, join_style=1).buffer(r, join_style=1)
rr = cap * 0.045
E, S, K = soft(E, rr), soft(S, rr), soft(K, rr * 0.6)
bars = [soft(b, rr) for b in bars]
star = soft(star, cap * 0.025)

# (outer shape that cuts the gap, ink of this shape), back to front
K_outer = K.buffer(ring, join_style=1)
layers = [
    (E, E),
    (S, S),
    (K_outer, K_outer.difference(K)),
    (bars[0], bars[0]),
    (bars[1], bars[1]),
    (star, star),
]
ink = []
for i, (outer, shape) in enumerate(layers):
    front = unary_union([o.buffer(gap, join_style=1) for o, _ in layers[i + 1:]]) if i + 1 < len(layers) else None
    ink.append(shape.difference(front) if front is not None else shape)
art = unary_union(ink).buffer(0)

# drop anything thinner than 0.5 mm at the final print width (won't hold on the screen)
minx, miny, maxx, maxy = art.bounds
t = 0.25 * (maxx - minx) / 320  # 0.25 mm half-width in design units (print is 320 mm wide)
art = art.buffer(-t, join_style=1).buffer(t, join_style=1)
art = unary_union([g for g in getattr(art, "geoms", [art]) if g.area > (40 * t) ** 2])
minx, miny, maxx, maxy = art.bounds
pad = cap * 0.05
art = affinity.translate(art, -minx + pad, -miny + pad)
W, H = maxx - minx + 2 * pad, maxy - miny + 2 * pad


def ring_d(coords):
    c = list(coords)
    return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in c[:-1]) + " Z"


geoms = getattr(art, "geoms", [art])
d = " ".join(ring_d(p.exterior.coords) + " " + " ".join(ring_d(h.coords) for h in p.interiors) for p in geoms)
width_cm = 32
with open(OUT, "w") as f:
    f.write(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" '
            f'width="{width_cm}cm" height="{width_cm * H / W:.2f}cm" viewBox="0 0 {W:.1f} {H:.1f}">\n'
            f'<g id="screen-1" inkscape:groupmode="layer" inkscape:label="screen 1 white" data-color="{INK}">\n'
            f'<path fill="{INK}" fill-rule="evenodd" d="{d}"/>\n</g>\n</svg>\n')
print(OUT, f"{width_cm} x {width_cm * H / W:.1f} cm")
