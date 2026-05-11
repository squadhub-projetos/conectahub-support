# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (HMR enabled)
npm run build     # type-check with tsc, then bundle with Vite
npm run lint      # ESLint
npm run preview   # serve the production build locally
```

No test runner is configured.

## Stack

React 19 + TypeScript 6 + Vite 8. Single-page app, no router.

## Architecture

The app shell is `src/main.tsx` → `src/App.tsx`. There is currently one component (`App`). Add new components under `src/components/` as the project grows.

**Styling**: plain CSS with CSS custom properties. Global tokens (colors, typography, spacing) live in `src/index.css` under `:root`. Component-scoped styles go in a co-located `.css` file (e.g. `App.css`). Light/dark themes are handled via `@media (prefers-color-scheme: dark)` — do not use inline styles or a CSS-in-JS library.

**SVG icons**: stored as a sprite in `public/icons.svg` and referenced via `<use href="/icons.svg#icon-id">`. Add new icons to that sprite rather than importing SVGs as React components.

**Static assets**: images and other assets under `src/assets/` are bundled by Vite; files under `public/` are served verbatim at the root path.

## TypeScript

`tsconfig.app.json` enables `noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly`. The build will fail on unused variables/parameters and on TypeScript-only syntax that cannot be erased (e.g. `const enum`). Fix these rather than disabling the rules.
