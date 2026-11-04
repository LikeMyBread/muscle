# Muscle Memory — Agent Guidelines

Interactive 3D human anatomy atlas and spaced repetition training app for artists.

## Quick Reference

- **Development server:** `npm run dev` (`http://localhost:5173/`)
- **Typecheck:** `npm run typecheck` (`tsc --noEmit`)
- **Unit & integration tests:** `npm test` (`vitest run`)
- **Asset validation:** `npm run muscle:validate-assets`
- **Presubmit check:** `npm run presubmit` (`typecheck && test && validate-assets`)
- **App entry points:** `index.html`, `src/muscle/main.tsx`, `src/muscle/App.tsx`
- **Curriculum & Study:** `src/muscle/curriculum/`, `src/muscle/study/`, `src/muscle/store/`
- **3D Canvas & Models:** `src/muscle/components/canvas/`, `public/muscle/models/`

## Core Architecture & Invariants

1. **Local-First Persistence:** User progress, review queues, and mastery state persist locally in IndexedDB via Dexie (`muscle-memory` database in `src/muscle/db/muscleDb.ts`).
2. **Deterministic SRS Logic:** Spaced repetition algorithms (SM-2 calculations, deck planning, module gatekeeper) live as pure functions in `src/muscle/srs/`.
3. **Canvas Performance Guardrails:**
   - Use `frameloop="demand"` (never run a continuous frame loop).
   - Raycasting uses BVH on geometry (`three-mesh-bvh`).
   - Material pooling: Lambert materials via `acquireAnatomyMaterial` pool (`src/muscle/components/canvas/anatomyMaterialPool.ts`).
   - Manifest triangle budgets (≤ 25k tris per mesh, ≤ 80k per region).
   - Per-mesh subscription hooks (`useAnatomyMeshFlags`) instead of top-level canvas Zustand subscriptions.
   - Detailed rules in [`docs/rules/muscle-canvas-perf.md`](docs/rules/muscle-canvas-perf.md).
4. **Split-Plane Écorché:** The full-body model splits at the sagittal plane into peelable study muscles (+X) and complete reference skeleton/anatomy (−X) without skin overlay artifacts ([ADR 0018](docs/adr/0018-muscle-memory-no-skin-overlay.md)).
5. **Runtime 3D Assets:** All models live in `public/muscle/models/` with `manifest.json`. Never delete or corrupt the manifest; validate with `npm run muscle:validate-assets`.

## Documentation Index

- [`README.md`](README.md) — Getting started, scripts, and project structure
- [`docs/README.md`](docs/README.md) — Documentation index (ADRs, QA protocols, skills)
- [`docs/MUSCLE_QA.md`](docs/MUSCLE_QA.md) — Comprehensive QA checklist and protocol
- [`docs/rules/muscle-canvas-perf.md`](docs/rules/muscle-canvas-perf.md) — 3D canvas performance rules
- [`docs/skills/muscle-anatomy-export.md`](docs/skills/muscle-anatomy-export.md) — Z-Anatomy Blender asset pipeline
- [`src/muscle/AGENTS.md`](src/muscle/AGENTS.md) — Module-level agent context and pitfalls
- [`src/muscle/DESIGN.md`](src/muscle/DESIGN.md) — UI theme tokens and design system
- [`src/muscle/CUJs.md`](src/muscle/CUJs.md) — Critical user journeys and latency budgets
