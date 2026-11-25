# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

Personal site for Hamdy Eldeeb (Arabic, `dir="rtl"`). The hero is a WebGL
particle portrait: thousands of gold stars draw his old look (long hair in a
bun) through three views (back, profile looking up, facing us) and re-arrange
into his current look (short hair, beard) on hover (desktop) or scroll (touch).
The current look then turns its head between left / front / right photos as
it leans toward the pointer (desktop). Hamdy tuned the portrait in the lab:
flat (no depth relief), no extra edge stars, 50k stars on desktop, no
automatic sway; these live as constants in `lib/samplePortrait.ts`,
`Hero.tsx` and `ParticleScene.tsx`.

Below the hero the page splits into two tracks:
- **Work («شغلي», `Professional.tsx`)**: Hamdy is a graphic designer doing colour
  separation for silk-screen garment printing and owns a garment print shop; he
  studied medical-equipment maintenance. Links to the "dip" Facebook page (his
  colour-separation portfolio) and to a print-shop page (`links.printShop`, empty
  until it exists, shown as "قريبًا").
- **Content («رحلتي», `Journey.tsx`)**: the «لسه في رجوع» series, how an episode
  is made ("من الفكرة لحد ما تشوفها"), episodes, shorts.
Then platforms and contact. The phone-only `MobileBar` swaps its actions per track.

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

Deployment: `.github/workflows/deploy.yml` runs on pushes to the default branch
(currently `claude/claude-md-setup-r52p5e`; there is no `main`), builds with
`NEXT_PUBLIC_BASE_PATH=/<repo>` and force-pushes `out/` to `gh-pages`, which
GitHub Pages serves at https://eldeebeldeeb35-afk.github.io/adjop/.

## Repository layout

- `content/site.ts`: all copy, links, episodes and shorts. Edit content here.
- `app/`: layout (fonts, metadata), page, `globals.css` (colour tokens in `@theme`)
- `components/hero/`: `Hero.tsx` (mode detection, hover/scroll driving, fallback),
  `ParticleScene.tsx` (R3F scene), `shaders.ts` (GLSL)
- `lib/samplePortrait.ts`: image → star positions (equalisation, local contrast,
  Sobel edges, importance sampling, Hilbert-order pairing)
- `components/sections/`: Nav, Crossroads, Professional, Journey, Contact
- `public/portraits/{before,after}-{0,1,2}.webp`: background-removed, identically
  framed views. Regenerate with `scripts/prepare_portraits.py` from the two
  three-panel composites (rembg + scipy); head positions and erase boxes are set
  per view in `VIEWS`. All six must keep the same size and head placement.

## Conventions

- Visual identity: dark warm background, gold `#d9ae5f`, the square-Kufic channel
  logo (`public/brand/logo.png`). Fonts match the logo: Reem Kufi (display and
  Latin), Noto Kufi Arabic (body); Amiri only for the Quran verse (`font-quran`).
  Do not introduce new palettes.
- Use only photos of Hamdy that he supplied (he provided AI-assisted views of
  himself); never substitute other people or generated faces of your own.
- Keep the WebGL fallback (`StaticPortrait`) working for no-WebGL and
  `prefers-reduced-motion`.
- Never commit secrets. Commit messages: imperative mood, short summary line.
- Work on a feature branch; don't open pull requests unless asked.

## Open items

- Email link is empty in `content/site.ts`
- Print-shop page link (`links.printShop`) and work samples for a gallery
- Experience list is empty until provided
