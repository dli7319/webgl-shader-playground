# Contributing

Thanks for your interest in contributing! This is a small, focused codebase —
contributions of all sizes are welcome.

## Getting started

Requirements: Node.js 20+.

```sh
npm ci
npm run dev
```

The dev server hot-reloads. Open the printed URL in a browser.

## Before you open a PR

Run the full local suite and make sure it's green:

```sh
npm run format:check
npm run lint
npm test
npm run build
```

- Format new code with `npm run format` (Prettier).
- Keep pull requests focused: one topic per PR.
- Update the README if you change behavior users can see.

## PR flow

1. Branch from `master` (`feat/…`, `fix/…`, `refactor/…`, `docs/…`, `ci/…`).
2. Commit with clear, imperative messages.
3. Open a PR against `master` — fill in the template.
4. CI must be green before merging (squash merge).

## Reporting bugs

Use the issue tracker. Include: what you did, what you expected, what happened,
and your browser/OS. Screenshots help a lot for rendering bugs.

## Code style

- TypeScript strict-ish: prefer explicit types over `any` in new code.
- Prettier is the single source of truth for formatting.
- Keep the app dependency-light — this project deliberately avoids heavy
  frameworks where plain DOM/three.js will do.
