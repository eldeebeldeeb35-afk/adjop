"""Google Fonts library (≈2,000 free families) straight from github.com/google/fonts.

    python fontlib.py catalog                      # build/refresh the catalogue (~3 s, 20 MB)
    python fontlib.py search --category DISPLAY --min-weight 800 [--subset arabic] [--name rub]
    python fontlib.py get "Rubik" --weight 900 --out fonts/   # download, static instance at that weight
    python fontlib.py get "Archivo Black" --out fonts/

Cache: ~/.cache/hamdy-fonts (catalogue + downloaded files). Only GitHub is needed, which is
reachable from cloud sessions; on Hamdy's computer the same works.
Categories: SANS_SERIF, SERIF, DISPLAY, HANDWRITING, MONOSPACE.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import urllib.request

CACHE = os.path.expanduser("~/.cache/hamdy-fonts")
REPO = os.path.join(CACHE, "gf")
CATALOG = os.path.join(CACHE, "catalog.json")
RAW = "https://raw.githubusercontent.com/google/fonts/main/"


def build_catalog():
    os.makedirs(CACHE, exist_ok=True)
    if not os.path.isdir(REPO):
        subprocess.run(["git", "clone", "-q", "--depth", "1", "--filter=blob:none", "--sparse",
                        "https://github.com/google/fonts.git", REPO], check=True)
    else:
        subprocess.run(["git", "-C", REPO, "pull", "-q", "--depth", "1"], check=False)
    subprocess.run(["git", "-C", REPO, "sparse-checkout", "set", "--no-cone",
                    "/ofl/*/METADATA.pb", "/apache/*/METADATA.pb", "/ufl/*/METADATA.pb"], check=True)
    fams = []
    for lic in ("ofl", "apache", "ufl"):
        base = os.path.join(REPO, lic)
        for d in sorted(os.listdir(base)):
            p = os.path.join(base, d, "METADATA.pb")
            if not os.path.exists(p):
                continue
            t = open(p, encoding="utf-8").read()
            name = re.search(r'^name: "([^"]+)"', t, re.M)
            if not name:
                continue
            files = [{"file": f"{lic}/{d}/{fn}", "weight": int(w), "style": st}
                     for st, w, fn in re.findall(r'fonts \{[^}]*?style: "(\w+)"[^}]*?weight: (\d+)[^}]*?filename: "([^"]+)"', t, re.S)]
            axes = {tag: (float(lo), float(hi)) for tag, lo, hi in
                    re.findall(r'axes \{\s*tag: "(\w+)"\s*min_value: ([\d.]+)\s*max_value: ([\d.]+)', t)}
            weights = sorted({f["weight"] for f in files})
            if "wght" in axes:
                weights = [int(axes["wght"][0]), int(axes["wght"][1])]
            fams.append({
                "name": name.group(1),
                "category": (re.search(r'^category: "(\w+)"', t, re.M) or [None, ""])[1],
                "subsets": re.findall(r'^subsets: "([\w-]+)"', t, re.M),
                "files": files, "axes": axes, "min_weight": min(weights), "max_weight": max(weights),
            })
    json.dump(fams, open(CATALOG, "w"))
    return fams


def catalog():
    if not os.path.exists(CATALOG):
        return build_catalog()
    return json.load(open(CATALOG))


def search(category=None, min_weight=0, subset=None, name=None):
    out = []
    for f in catalog():
        if category and f["category"] not in category.split(","):
            continue
        if f["max_weight"] < min_weight:
            continue
        if subset and subset not in f["subsets"]:
            continue
        if name and name.lower() not in f["name"].lower():
            continue
        out.append(f)
    return out


def download(relpath):
    dst = os.path.join(CACHE, "files", relpath)
    if not os.path.exists(dst):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        url = RAW + "/".join(urllib.request.quote(p) for p in relpath.split("/"))
        with urllib.request.urlopen(url, timeout=60) as r, open(dst + ".part", "wb") as w:
            w.write(r.read())
        os.replace(dst + ".part", dst)
    return dst


def pick_file(fam, weight=None, italic=False):
    """(path, variation) for the family file closest to `weight` (default: heaviest)."""
    want = weight or fam["max_weight"]
    files = [f for f in fam["files"] if (f["style"] == "italic") == italic] or fam["files"]
    if "wght" in fam["axes"]:
        f = files[0]
        lo, hi = fam["axes"]["wght"]
        return download(f["file"]), {"wght": max(lo, min(hi, want))}
    f = min(files, key=lambda f: abs(f["weight"] - want))
    return download(f["file"]), {}


def static_instance(path, variation, out_path):
    """Freeze a variable font at `variation` so any tool (fontTools glyph outlines, Illustrator) sees one weight."""
    from fontTools.ttLib import TTFont
    font = TTFont(path)
    if variation and "fvar" in font:
        from fontTools.varLib import instancer
        font = instancer.instantiateVariableFont(font, variation)
    font.save(out_path)
    return out_path


def find(name):
    for f in catalog():
        if f["name"].lower() == name.lower():
            return f
    raise SystemExit(f"no family named {name!r}; try: fontlib.py search --name ...")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("catalog")
    s = sub.add_parser("search")
    s.add_argument("--category")
    s.add_argument("--min-weight", type=int, default=0)
    s.add_argument("--subset")
    s.add_argument("--name")
    g = sub.add_parser("get")
    g.add_argument("family")
    g.add_argument("--weight", type=int)
    g.add_argument("--italic", action="store_true")
    g.add_argument("--out", default=".")
    a = ap.parse_args()
    if a.cmd == "catalog":
        print(len(build_catalog()), "families ->", CATALOG)
    elif a.cmd == "search":
        r = search(a.category, a.min_weight, a.subset, a.name)
        for f in r:
            print(f'{f["name"]:32s} {f["category"]:12s} {f["min_weight"]}-{f["max_weight"]}  {"arabic" if "arabic" in f["subsets"] else ""}')
        print(len(r), "families", file=sys.stderr)
    else:
        fam = find(a.family)
        path, var = pick_file(fam, a.weight, a.italic)
        os.makedirs(a.out, exist_ok=True)
        w = int(var.get("wght", a.weight or fam["max_weight"]))
        out = os.path.join(a.out, f'{fam["name"].replace(" ", "")}-{w}.ttf')
        print(static_instance(path, var, out))
