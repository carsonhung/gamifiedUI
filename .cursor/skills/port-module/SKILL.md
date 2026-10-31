---
name: port-module
description: Move a self-developed module out of spatial (c:\Users\kason\spatial\spatialclone) or StoryTelling (c:\Users\kason\StoryTelling) into a gamifiedUI package, then switch the host app to consume the package. Use when the user asks to extract, port, modularise or reuse code from those projects.
---

# Port a module and consume it back

## Candidates

| Module | Source | Target |
|---|---|---|
| Procedural UI sounds | spatial `frontend/src/lib/audio/proceduralSounds.ts` + `wav.ts`; StoryTelling `frontend/src/lib/audio/procedural.ts` | `gamifiedui-sfx` (merge both, keep tests) |
| Typewriter dialogue | StoryTelling `frontend/src/components/game/DialogueBox.vue` | `gamifiedui-vue` (store reads become props) |
| HP / meter bar | StoryTelling `components/game/HealthBar.vue` | already `gx-bar`; Vue wrapper only |
| Sprite frame to CSS | StoryTelling `frontend/src/game/atlas.ts` `atlasFrameStyle()` | `gx-sprite` / a `spriteFrameStyle()` helper |
| Whole-number zoom | StoryTelling `frontend/src/game/camera.ts` `fitZoom()` | `gamifiedui-utils` |
| Focus trap | spatial `frontend/src/composables/useFocusTrap.ts` | `gamifiedui-vue` (non-dialog popovers only; dialogs use native `<dialog>`) |
| Label auto-fit, CJK wrap | spatial `lib/three/labelText.ts`, `worldPanel.ts` `wrapText` | `gamifiedui-utils` |
| Perspective grid backdrop | spatial `frontend/src/layouts/AuthLayout.vue` styles | `gx-backdrop-grid` utility |

three.js / WebXR modules (frameGovernor, gpuTier, loaders, avatarAnimator, lipSync, xrInput)
go to the separate 3D repo, not here.

## Steps

1. Read the module, its test and every import. List host-specific imports (`@/constants/*`,
   stores, `@shared/types`, Vue refs in otherwise framework-free code).
2. Copy module + test into `packages/<pkg>/src/`. Turn each host import into an option or
   parameter whose default equals the host's current value; copy only the types you need.
3. Strip branding and domain wording; keep behaviour identical. Apply this repo's rules
   (`gx-` prefix, motion, accessibility, licence headers via package NOTICE).
4. Add Vitest to the package if missing; the ported tests must pass unchanged in intent.
5. CHANGELOG: "Ported from <project> `<path>`." Bump the package version.
6. In the host app: add the package dependency, replace the old file with a one-line
   re-export from the package, run the host's typecheck and tests, then update imports and
   delete the shim in a follow-up commit.
7. Never copy secrets, `.env*`, `credentials/`, Mixamo clips or non-CC0 assets.
