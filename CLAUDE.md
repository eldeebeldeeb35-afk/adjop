# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

Personal site for Hamdy Eldeeb (Arabic, `dir="rtl"`). The hero is a WebGL
particle portrait: thousands of gold stars draw his old look (long hair in a
bun) through two views (profile looking up, then facing us; the back view
`before-0` is not used) and re-arrange
into his current look (short hair, beard) on hover (desktop) or scroll (touch).
The current look then turns its head between left / front / right photos as
it leans toward the pointer (desktop). Hamdy tuned the portrait in the lab:
flat (no depth relief), no extra edge stars, 50k stars on desktop, no
automatic sway; these live as constants in `lib/samplePortrait.ts`,
`Hero.tsx` and `ParticleScene.tsx`.

The site has two pages:
- **Story page (`app/page.tsx`)**: hero, an "مين أنا" CV card (`About.tsx`: full
  name, job as a medical-equipment maintenance technician at Kafr El-Dawwar
  General Hospital, D.I.P, the series), the «لسه في رجوع» content track
  (`Journey.tsx`: how an episode is made, episodes, shorts), then contact. Nothing
  about colour separation lives here except the link to the work page.
- **Work page (`app/work/page.tsx`, `components/work/WorkPage.tsx`)**: D.I.P, his
  brand for clothing design, colour separation (for his own print shop and other
  print shops) and silk-screen printing. The hero (`DipHero.tsx`, `DipStars.tsx`)
  draws the D.I.P logo in gold stars from `public/dip/field.png` (signed distance +
  rounded height traced from his logo); fallback image `public/dip/logo-3d.webp`.
  Fixed prices live in `dipPricing` (`content/site.ts`): separation 35 EGP per
  colour (files only), film printing per A3 sheet (tracing paper 20, white 10).
  Silk-screen printing has no fixed price: the customer uploads the design and a
  quantity, Hamdy sets the price per piece in the admin page.
- **Customer accounts (`app/work/account/`, `components/work/Account.tsx`)** and
  **admin (`app/work/admin/`, `components/work/Admin.tsx`)**: Firebase Auth (Google,
  email) + Firestore (`customers`, `orders`, `admins`). Access rules and price checks
  are in `firestore.rules`; setup steps in `docs/firebase-setup.md`. Until
  `firebaseConfig` in `content/site.ts` is filled, the pages show a "not enabled" notice.
`Nav` and the phone-only `MobileBar` take per-page links/variants.

## Stack

Next.js 15 (App Router, static export to `out/`), React 19, TypeScript 5,
Tailwind CSS 4, React Three Fiber + custom GLSL shaders, GSAP (ScrollTrigger),
Framer Motion. No server of its own: customer accounts and orders use Firebase
(Auth + Firestore) from the browser.

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
GitHub Pages serves at https://eldeebeldeeb35-afk.github.io/adjop/. It also runs
every hour: `scripts/fetch-videos.mjs` reads the channel's public YouTube
feed and merges new episodes (titles with «لسه في رجوع» + "ح<n>") and shorts
(#shorts) into `content/videos.json` before the build. The merged file is not
committed back, so fix titles or add durations by editing `content/videos.json`.

## Repository layout

- `content/site.ts`: all copy and links; `content/videos.json`: episodes and shorts.
- `app/`: layout (fonts, metadata), page, `globals.css` (colour tokens in `@theme`)
- `components/hero/`: `Hero.tsx` (mode detection, hover/scroll driving, fallback),
  `ParticleScene.tsx` (R3F scene), `shaders.ts` (GLSL)
- `lib/samplePortrait.ts`: image → star positions (equalisation, local contrast,
  Sobel edges, importance sampling, Hilbert-order pairing)
- `components/sections/`: Nav, About, Journey, Contact, MobileBar; `components/work/`: WorkPage
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
- Work samples (photos) for a gallery on the work page
- Firebase project not created yet: `firebaseConfig` is empty (see `docs/firebase-setup.md`)
- Experience list is empty until provided
