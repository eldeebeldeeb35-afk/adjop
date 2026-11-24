# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project status

Static personal website (plain HTML/CSS/JS, no build step, no dependencies),
written in Arabic with `dir="rtl"`. Intended for GitHub Pages.

## Project overview

Personal site for Hamdy Eldeeb: about section, the «لسه في رجوع» episode series
(12 weekly episodes, rendered from a config), latest YouTube uploads embed, and
links to his platforms.

## Build, run, and test

No install or build. Preview locally:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. There are no tests or linters yet.

Editing content: links, YouTube channel ID and series settings live in the `SITE`
object at the top of `assets/js/site.js`. An empty link hides its button.

## Code style


- Follow the conventions of whatever language/framework is introduced, and use its
  standard formatter (e.g. Prettier for JS/TS, Ruff/Black for Python).
- Keep changes small and focused; don't add unrelated refactors.
- Prefer clear names over comments; comment only non-obvious "why".
- Never commit secrets (`.env`, API keys, credentials). Add a `.gitignore` entry
  when introducing any file that may hold them.

## Repository layout

- `index.html`: the whole page (sections: hero, about, series, latest, platforms)
- `assets/css/style.css`: styles and colour tokens on `:root`
- `assets/js/site.js`: `SITE` config + link wiring, episode list, YouTube embed

## Git workflow

- Default remote: `origin` → `github.com/eldeebeldeeb35-afk/adjop`.
- Work on a feature branch, not directly on the default branch.
- Write commit messages in the imperative mood with a short summary line
  (e.g. "Add login form validation").
- Don't open pull requests unless asked.

## Open items

- Facebook, TikTok, Instagram and email links are still empty in `site.js`
- Deployment: enable GitHub Pages for the repository
