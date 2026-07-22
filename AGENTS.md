# marimo-blocks

React components for building an in-browser Python editor/notebook, powered by [marimo](https://github.com/marimo-team/marimo) and Pyodide. Published to npm as `@marimo-team/blocks`.

## Development

```bash
pnpm install
pnpm test        # vitest
pnpm lint        # biome check --write (autofix.ci runs this on PRs)
pnpm lint:ci     # biome check, no writes
pnpm typecheck   # tsc --noEmit
pnpm build       # tsc -> dist/
```
