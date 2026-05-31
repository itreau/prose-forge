# ProseForge

Immersive creative-writing environment. React 19 + TypeScript + Vite + Three.js + Effect + Tailwind v4.

## Commands

- **Dev:** `bun run dev`
- **Build:** `bun run build` — runs `tsc -b` then `vite build`
- **Lint:** `bun run lint` — eslint across whole project
- **Typecheck:** `tsc -b` (the build script runs this; run standalone to check types without bundling)
- **Install:** `bun install` (bun is the package manager — has a bun.lock)

No test runner is configured yet.

## Architecture

- Entry: `src/main.tsx` → `src/app/App.tsx`
- `src/app/` — app-level components and layout
- `src/components/` — shared UI components
- `src/editor/` — rich-text editor module
- `src/hooks/` — custom React hooks
- `src/assets/` — static assets

Product spec: `.opencode/spec.md`

## Key conventions

- **TypeScript strict:** `erasableSyntaxOnly` and `verbatimModuleSyntax` are enabled. No enums, no const enums, no namespaces with runtime value. Use `import type` for type-only imports.
- **Tailwind v4** via `@tailwindcss/vite` plugin — no `tailwind.config.*` file; use CSS `@import "tailwindcss"` (already in `src/index.css`).
- **Three.js / R3F:** `@react-three/fiber` and `@react-three/drei` are installed. 3D scene code lives in React components.
- **Effect:** `effect` library is available for functional error handling and pipelines.
- **Dark mode:** CSS custom properties toggle via `prefers-color-scheme` (no JS toggle). Theme vars are in `src/index.css` `:root`.

## Gotchas

- `tsc -b` uses project references (`tsconfig.app.json` + `tsconfig.node.json`). Don't add files outside `src/` to `tsconfig.app.json` or outside `vite.config.ts` to `tsconfig.node.json`.
- ESLint ignores `dist/` only. Other generated dirs (e.g. `node_modules/.vite`) may need manual ignore if they cause lint noise.