# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project status

`adjop` is a new, empty repository: no source code, dependencies, or tooling yet.
The stack and purpose have not been decided. When the first code lands, update the
TODO sections below in the same change so this file stays accurate.

## Project overview

TODO: one or two sentences on what adjop does and who it is for.

## Build, run, and test

TODO: replace with the real commands once a stack is chosen. Keep these exact and
copy-pasteable, for example:

```bash
# install dependencies
# run locally
# run all tests
# run a single test
# lint / format / type-check
```

Until these exist, do not invent commands. If a task needs a build or test step,
set up the minimal tooling for the chosen stack and record the commands here.

## Code style

TODO: once a stack is chosen, record the formatter/linter and its config file.
Until then:

- Follow the conventions of whatever language/framework is introduced, and use its
  standard formatter (e.g. Prettier for JS/TS, Ruff/Black for Python).
- Keep changes small and focused; don't add unrelated refactors.
- Prefer clear names over comments; comment only non-obvious "why".
- Never commit secrets (`.env`, API keys, credentials). Add a `.gitignore` entry
  when introducing any file that may hold them.

## Repository layout

TODO: describe top-level directories once they exist.

## Git workflow

- Default remote: `origin` → `github.com/eldeebeldeeb35-afk/adjop`.
- Work on a feature branch, not directly on the default branch.
- Write commit messages in the imperative mood with a short summary line
  (e.g. "Add login form validation").
- Don't open pull requests unless asked.

## Open questions to settle (then delete this section)

- Language / framework and package manager
- Test framework and how to run a single test
- Lint/format tools and whether they run in CI
- Deployment target, if any
- Required environment variables (names only, never values)
