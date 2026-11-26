"""Export a design SVG to everything the print shop / Illustrator needs.

    python export.py design.svg --outdir out/ --name lion-tee [--films] [--dpi 300]

Writes:
  NAME.ai    PDF-compatible Illustrator file (opens directly in Adobe Illustrator)
  NAME.pdf   vector PDF
  NAME.eps   EPS (needs pdftocairo)
  NAME.svg   cleaned copy
  NAME.png   preview at --dpi
  films/NAME-screen-N-<hex>.pdf  (with --films) one black film per colour layer,
             with registration marks, for screen printing
Note: colours are RGB. Set them as Spot swatches in Illustrator before sending to print.
"""
import argparse
import os
import re
import shutil
import subprocess
import cairosvg

ap = argparse.ArgumentParser()
ap.add_argument("svg")
ap.add_argument("--outdir", required=True)
ap.add_argument("--name", required=True)
ap.add_argument("--films", action="store_true")
ap.add_argument("--dpi", type=int, default=150)
a = ap.parse_args()

os.makedirs(a.outdir, exist_ok=True)
base = os.path.join(a.outdir, a.name)
svg = open(a.svg, encoding="utf-8").read()
shutil.copy(a.svg, base + ".svg")
cairosvg.svg2pdf(bytestring=svg.encode(), write_to=base + ".pdf")
shutil.copy(base + ".pdf", base + ".ai")
cairosvg.svg2png(bytestring=svg.encode(), write_to=base + ".png", dpi=a.dpi)
if shutil.which("pdftocairo"):
    subprocess.run(["pdftocairo", "-eps", base + ".pdf", base + ".eps"], check=False)
made = [base + e for e in (".ai", ".pdf", ".eps", ".svg", ".png") if os.path.exists(base + e)]

if a.films:
    os.makedirs(os.path.join(a.outdir, "films"), exist_ok=True)
    vb = re.search(r'viewBox="([^"]+)"', svg).group(1).split()
    w, h = float(vb[2]), float(vb[3])
    m = max(w, h) * 0.06
    r = m * 0.3
    marks = "".join(
        f'<g stroke="#000" stroke-width="{r/6:.2f}" fill="none"><circle cx="{x}" cy="{y}" r="{r:.2f}"/>'
        f'<line x1="{x - r*1.5}" y1="{y}" x2="{x + r*1.5}" y2="{y}"/><line x1="{x}" y1="{y - r*1.5}" x2="{x}" y2="{y + r*1.5}"/></g>'
        for x, y in [(w / 2, -m / 2), (w / 2, h + m / 2), (-m / 2, h / 2), (w + m / 2, h / 2)])
    head = re.search(r"<svg[^>]*>", svg).group(0)
    head = re.sub(r'viewBox="[^"]+"', f'viewBox="{-m} {-m} {w + 2*m} {h + 2*m}"', head)
    head = re.sub(r'\s(width|height)="[^"]+"', "", head)
    for n, (attrs, body) in enumerate(re.findall(r"<g ([^>]*data-color[^>]*)>(.*?)</g>", svg, re.S), 1):
        hexc = re.search(r'data-color="([^"]+)"', attrs).group(1)
        body = re.sub(r'fill="[^"]*"', 'fill="#000000"', body)
        label = f'<text x="0" y="{h + m*0.8}" font-size="{m*0.3:.1f}" font-family="sans-serif">{a.name} screen {n} {hexc}</text>'
        film = f'{head}<rect x="{-m}" y="{-m}" width="{w+2*m}" height="{h+2*m}" fill="#fff"/>{body}{marks}{label}</svg>'
        p = os.path.join(a.outdir, "films", f"{a.name}-screen-{n}-{hexc.lstrip('#')}.pdf")
        cairosvg.svg2pdf(bytestring=film.encode(), write_to=p)
        made.append(p)
print("\n".join(made))
