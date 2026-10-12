# Fortune's Weave Build Companion

React 19 + Tailwind CSS 4 + Vite, with a charcoal theme and a shared, data-driven character workspace. This is a static browser application; no account or backend is required.

## Local development

```sh
npm install
npm run dev
```

Open http://localhost:4173. `npm run build` produces `dist/`; `npm run preview` serves that production build at the same port. Stop the dev server before starting preview. Run `npm test` for progression, migration and source-switch compatibility checks.

## Features

- Independent rosters and progression for Cai, Dietrich, Theodora and Leda
- Automatic mandatory members; optional members can be removed and re-added without losing their progress
- Main-team favourites and roster search
- Searchable portrait picker, with persistent spoiler reveals and Added state
- Optional run part, chapter and Renown context
- Current class, optional character level, and relevant skill ranks
- Separate certification and mastery records; next goals derived from the selected guide
- Game8 Beginner-to-Master routes for all 18 mandatory characters, with alternative branches
- Shared character workspace with progress, loadout/abilities, guide notes and source links
- Responsive mobile workspace and keyboard-accessible native dialogs
- Migration from the old browser tracker and original Cai progress on the same origin

## Data and shared components

The UI contains no per-character page templates:

- `src/CharacterWorkspace.jsx` renders every character and source guide through the same component.
- `src/components.jsx` includes reusable portrait, dialog, field and achievement controls.
- `src/catalog.js` defines characters, path rosters, roles, Game8 branch choices and companion coaching.
- `src/classData.js` holds source-checked class facts, targets, rewards and uncertainty notes.
- `src/equipmentData.js` holds sourced weapon examples, requirements and companion training advice.
- `src/sourceData.js` is the publisher/reference registry.
- `src/buildData.js` assembles guides from those modules.
- `src/additionalGuides.js` is the data-only extension point for another publisher's builds.
- `src/model.js` implements browser-state migration, normalization, rank comparison and next-goal logic.

To add another publisher, register it in `sourceData.js`, then add a guide object to `additionalGuides.js` using its documented shape. A guide has a unique ID, character ID, source ID, title, class IDs, URL, verification date, role, coaching and loadout. No component duplication is needed. Add genuinely new class facts to `classData.js` with stable class IDs. Known classes keep the same ID across publishers.

Skill ranks, certifications, masteries and compatible milestones belong to the path's character, not to the publisher. Changing sources or branches preserves shared progress; progress for other classes remains available when returning to the original guide. Earning mastery also records certification. Undoing certification clears contradictory mastery and current-class records.

## Evidence and limits

Game8's recommendations page is marked work in progress. Class data was checked against individual Game8 pages on 12 October 2026, but not independently verified in-game. Ideal levels are recommendations. Multiple listed secondary weapon targets do not always clarify AND/OR, so the UI flags them and never calculates an exam pass chance. Routes cover Beginner through Master; Divine classes and late-game merging are outside this version.

Build names, roles, equipment suggestions and training coaching are companion interpretations, distinct from source class recommendations. Serenes Forest supplies ability context; a Tialla Physic milestone is labelled community evidence. Some claims remain uncertain. Full spell learnsets and exact equipment calculators are not included.

The catalog contains 63 named characters. The 18 mandatory characters have prebuilt guides; remaining characters support manual class/rank tracking. Portraits are unavailable for Eshmel, Hong Hua and Troy and use explicit placeholders after Reveal. Mandatory roster assignments and original artwork were gathered from the owner's reference at https://ffrecruiter.lovable.app/. Character artwork belongs to Nintendo / Intelligent Systems and its respective rights holders. Optimized portrait copies are in `assets/portraits`; the original images are retained.

There are no recruitment costs, conditions, or recruitment filters. Adding means recruited. The picker does not validate route availability. There is no export/import or cloud sync. Clearing browser storage removes saves, and localhost saves do not transfer to GitHub Pages. The old `cai.html` reference is retained in the production output; its subsequent standalone updates remain separate from the new tracker after migration.

## GitHub Pages

`.github/workflows/pages.yml` installs locked dependencies, runs tests, builds `dist/`, and deploys with GitHub Pages Actions. Set the repository's Pages source to **GitHub Actions** when publication is approved. Relative build paths and hash navigation support the repository subdirectory without server rewrites.

No remote push or deployment has been performed for this rebuild; publication waits for the owner's explicit approval.
