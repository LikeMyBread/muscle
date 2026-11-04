# Muscle Memory

Interactive 3D human anatomy atlas and spaced repetition study app. Features both an exploratory **Reference Mode** and a guided single-pane **Study Mode** following the artist anatomy curriculum.

## Quick Start

```bash
npm install     # Install dependencies
npm run dev     # Starts dev server on http://localhost:5173/
```

## Available Scripts

- `npm run dev` - Start the Vite development server.
- `npm run build` - Typecheck with `tsc` and produce a production bundle in `dist/`.
- `npm run preview` - Preview the production build locally.
- `npm run typecheck` - Run TypeScript compiler checks without emitting files.
- `npm test` - Run all 48 Vitest suites (257 tests covering curriculum, geometry, SRS, coverage, and renderers).
- `npm run test:fast` - Run Vitest test suites non-interactively.
- `npm run test:watch` - Run Vitest in interactive watch mode.
- `npm run presubmit` - Run full pre-commit verification (typecheck, test suite, asset validation).

### Muscle Anatomy Pipeline & Validation Scripts

- `npm run muscle:validate-assets` - Validate `manifest.json` against curriculum node definitions and triangle performance budgets.
- `npm run muscle:coverage` - Generate and assert anatomy coverage ledger.
- `npm run muscle:inventory` - Report runtime mesh inventory (bones, muscles, and atlas fills).
- `npm run muscle:sync-bridge` - Regenerate `src/muscle/curriculum/zAnatomyBridge.ts` from `tools/muscle-anatomy/z_anatomy_name_map.csv`.
- `npm run muscle:sync-atlas-registry` - Sync `atlasMeshRegistry.ts` against `manifest.json`.
- `npm run muscle:audit-export` - Audit export coverage for meshes and report missing structures.
- `npm run muscle:export-glbs` - Procedurally generate fallback region GLBs without Blender.
- `npm run muscle:verify-links` - Verify external Wikipedia reference links.

## Project Structure

```text
muscle/
├── public/
│   ├── icons/
│   │   └── favicon-muscle.svg
│   ├── muscle/
│   │   └── models/               # Lazy-loaded 3D GLBs and manifest.json
│   └── styles/
│       └── shared.css            # Base shared styles and custom properties
├── src/
│   ├── muscle/
│   │   ├── anatomy/              # Coverage ledgers, scene keys, mesh audits
│   │   ├── components/           # 3D Canvas, workout panels, controls, hud
│   │   ├── curriculum/           # Anatomical curriculum nodes & study groups
│   │   ├── db/                   # IndexedDB storage via Dexie
│   │   ├── debug/                # Anatomy debug dock registry
│   │   ├── routes/               # URL query parsing (?module=...)
│   │   ├── srs/                  # SM-2 spaced repetition & module gatekeeper
│   │   ├── store/                # Zustand application store
│   │   ├── types/                # Types for nodes, meshes, manifest, terms
│   │   ├── App.tsx               # App root layout
│   │   ├── main.tsx              # React DOM entry point
│   │   └── muscle.css            # App layout and canvas styles
│   └── shared/                   # Minimal shared utilities (theme, logger, crash log, dock)
├── tools/
│   └── muscle-anatomy/           # Offline Python export tools and name maps
├── docs/                         # ADRs, QA protocols, performance rules, and export skills
├── e2e/                          # Reference Playwright smoke specs for muscle
├── scripts/                      # Muscle asset validation & sync scripts
├── index.html                    # HTML entry point
├── package.json                  # Isolated dependencies & scripts
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite bundler & Vitest test configuration
```

## Documentation

Comprehensive project documentation is indexed in [`docs/README.md`](docs/README.md):
- **ADRs**: [`docs/adr/0015-muscle-memory-local-first-anatomy.md`](docs/adr/0015-muscle-memory-local-first-anatomy.md) & [`docs/adr/0018-muscle-memory-no-skin-overlay.md`](docs/adr/0018-muscle-memory-no-skin-overlay.md)
- **QA Checklist**: [`docs/MUSCLE_QA.md`](docs/MUSCLE_QA.md)
- **3D Canvas Performance**: [`docs/rules/muscle-canvas-perf.md`](docs/rules/muscle-canvas-perf.md)
- **Blender Export Pipeline**: [`docs/skills/muscle-anatomy-export.md`](docs/skills/muscle-anatomy-export.md)
- **Curriculum & Design**: [`src/muscle/curriculum/ARTIST_CURRICULUM.md`](src/muscle/curriculum/ARTIST_CURRICULUM.md), [`src/muscle/CUJs.md`](src/muscle/CUJs.md), [`src/muscle/DESIGN.md`](src/muscle/DESIGN.md), and [`tools/muscle-anatomy/ANATOMY_COVERAGE.md`](tools/muscle-anatomy/ANATOMY_COVERAGE.md).

