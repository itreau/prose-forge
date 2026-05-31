# ProseForge

A design-oriented writing environment built for creative writers who care as much about atmosphere as they do about words.

ProseForge transforms the editor into a customizable creative space where visuals, themes, and workflows can be tailored to match the writer's mood and process. At its core is a modern rich-text editor designed for drafting stories, novels, scripts, journals, and long-form content.

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **ProseMirror** via `@nytimes/react-prosemirror`
- **Tailwind v4**
- **Three.js** / R3F (for future immersive writing spaces)
- **Effect** (for functional pipelines and error handling)

## Getting Started

```sh
bun install
bun run dev
```

## Commands

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `bun run dev`    | Start dev server with HMR          |
| `bun run build`  | Typecheck + production build       |
| `bun run lint`   | ESLint across the whole project    |
| `tsc -b`         | Typecheck only                     |

## Project Structure

```
src/
  app/           App-level components and layout
  editor/        ProseMirror editor module
  components/    Shared UI components
  hooks/         Custom React hooks
  assets/        Static assets
```

## Editor Keyboard Shortcuts

| Shortcut         | Action        |
| ---------------- | ------------- |
| `Cmd/Ctrl+B`     | Bold          |
| `Cmd/Ctrl+I`     | Italic        |
| `Cmd/Ctrl+``     | Inline code   |
| `Cmd+Shift+7`    | Heading 1     |
| `Cmd+Shift+8`    | Heading 2     |
| `Cmd+Shift+9`    | Heading 3     |
| `Cmd+Shift+\`   | Code block    |
| `Cmd/Ctrl+Z`     | Undo          |
| `Cmd/Ctrl+Shift+Z` | Redo       |

## Roadmap

- [x] ProseMirror rich-text editor foundation
- [ ] Immersive writing spaces (animated backgrounds, themes)
- [ ] Plugin system for extensibility
- [ ] Theme marketplace
- [ ] Local-first document storage