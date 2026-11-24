# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

Personal site for Hamdy Eldeeb (Arabic, `dir="rtl"`). The hero is a WebGL
particle portrait: thousands of gold stars draw his old photo (long tied hair)
and re-arrange into his current photo (short hair, beard) on hover (desktop) or
scroll (touch). Below it: "My Professional Work" and "My Creative Journey"
(the «لسه في رجوع» series, episodes, shorts), then platforms and contact.

## Stack

Next.js 15 (App Router, static export to `out/`), React 19, TypeScript 5,
Tailwind CSS 4, React Three Fiber + custom GLSL shaders, GSAP (ScrollTrigger),
Framer Motion. No backend.

## Build, run, and test

```bash
npm ci                 # install
npm run dev            # dev server on http://localhost:3000
npm run build          # static export into out/
npm run lint           # type-check (tsc --noEmit)
```

There is no test suite. Verify visual changes in a browser on desktop and phone
widths; headless Chromium needs `--use-angle=swiftshader --enable-unsafe-swiftshader`
for WebGL.

GitHub Pages: `.github/workflows/deploy.yml` builds with
`NEXT_PUBLIC_BASE_PATH=/<repo>` on push to `main` (or manual run).

## Repository layout

- `content/site.ts`: all copy, links, episodes and shorts. Edit content here.
- `app/`: layout (fonts, metadata), page, `globals.css` (colour tokens in `@theme`)
- `components/hero/`: `Hero.tsx` (mode detection, hover/scroll driving, fallback),
  `ParticleScene.tsx` (R3F scene), `shaders.ts` (GLSL)
- `lib/samplePortrait.ts`: image → star positions (equalisation, local contrast,
  Sobel edges, importance sampling, Hilbert-order pairing)
- `components/sections/`: Nav, Crossroads, Professional, Journey, Contact
- `public/portraits/{before,after}.webp`: background-removed, identically framed
  portraits. Regenerate with `scripts/prepare_portraits.py` (rembg + scipy);
  both files must keep the same size and head position.

## Conventions

- Visual identity: dark warm background, gold `#d9ae5f`, Amiri (display),
  Tajawal (body), Cormorant Garamond (Latin). Do not introduce new palettes.
- Only real photos of Hamdy in the portrait morph; never substitute others.
- Keep the WebGL fallback (`StaticPortrait`) working for no-WebGL and
  `prefers-reduced-motion`.
- Never commit secrets. Commit messages: imperative mood, short summary line.
- Work on a feature branch; don't open pull requests unless asked.

## Open items

- Facebook, TikTok, Instagram and email links are empty in `content/site.ts`
- Professional section copy is inferred; experience list is empty until provided
- Enable GitHub Pages (source: GitHub Actions) for deployment
