# Muscle Memory Documentation Index

This directory contains architectural decision records (ADRs), QA protocols, performance rules, and pipeline references for the **Muscle Memory** app.

## Architecture Decision Records (ADRs)

- [`adr/0015-muscle-memory-local-first-anatomy.md`](adr/0015-muscle-memory-local-first-anatomy.md)
  *Context and decision on local-first architecture, Dexie IndexedDB persistence, SM-2 spaced repetition algorithms, and offline Blender/procedural asset generation.*
- [`adr/0018-muscle-memory-no-skin-overlay.md`](adr/0018-muscle-memory-no-skin-overlay.md)
  *Context and decision to remove the flawed skin scan overlay in favor of a dual-half écorché: peelable study half vs fixed, complete reference human.*

## QA & Testing Protocols

- [`MUSCLE_QA.md`](MUSCLE_QA.md)
  *Full manual and automated QA verification map: full-body sagittal split, layer peel depth, performance checks, and seed fixtures (`?e2eSeed=1`).*

## Rules & Performance Guardrails

- [`rules/muscle-canvas-perf.md`](rules/muscle-canvas-perf.md)
  *Non-negotiable 3D canvas performance rules: demand-frameloop, Lambert material pooling, BVH raycast geometry, and triangle budgets.*

## Skills & Asset Pipeline

- [`skills/muscle-anatomy-export.md`](skills/muscle-anatomy-export.md)
  *End-to-end workflow for exporting Z-Anatomy Blender models into region GLBs, running export audits, and validating manifests.*

## Core In-App Documentation

The following reference documents live alongside the source code in `src/` and `tools/`:

- [`src/muscle/CUJs.md`](../src/muscle/CUJs.md) — Critical User Journeys (CUJ-001: 3D study canvas; CUJ-002: active recall; CUJ-003: progressive unlocks).
- [`src/muscle/DESIGN.md`](../src/muscle/DESIGN.md) — UI & system design architecture.
- [`src/muscle/VERIFICATION_CHECKLIST.md`](../src/muscle/VERIFICATION_CHECKLIST.md) — Anatomical verification against Proko and OpenStax.
- [`src/muscle/curriculum/ARTIST_CURRICULUM.md`](../src/muscle/curriculum/ARTIST_CURRICULUM.md) — Canonical artist-facing curriculum specification.
- [`src/muscle/curriculum/NODE_AUTHORING.md`](../src/muscle/curriculum/NODE_AUTHORING.md) — Guide for adding and editing curriculum nodes.
- [`src/muscle/COPY_STYLE.md`](../src/muscle/COPY_STYLE.md) — Voice, tone, and terminology guidelines.
- [`src/muscle/ATTRIBUTION.md`](../src/muscle/ATTRIBUTION.md) — CC BY-SA 4.0 licenses and attribution for Z-Anatomy and OpenStax.
- [`tools/muscle-anatomy/README.md`](../tools/muscle-anatomy/README.md) — Blender export scripts and mesh name mapping documentation.
- [`tools/muscle-anatomy/ANATOMY_COVERAGE.md`](../tools/muscle-anatomy/ANATOMY_COVERAGE.md) — Coverage ledger tracking mesh names, waivers, and baselines.
