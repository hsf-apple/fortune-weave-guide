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

## Planner redesign (review branch)

`codex/gamer-planner-layout` uses the dark palette with an open party page and hidden navigation drawer. Path tabs sit above the roster. The shared character workspace separates Next steps, Edit plan, Class details, Loadout & abilities, Character stats, and Guide notes.

Each member may store `customPlan` with an ordered class route, role, notes, and personal checklist. Reference replacement asks for confirmation before clearing these custom fields. It does not clear current class, level, ranks, certifications, masteries, or equipment progress. Source guide data remains separate from the user's plan. This iteration is awaiting visual review; tests are deferred at the user's request.

### Reference-first custom planning

New members start with an empty custom plan. Selecting a reference opens a route preview; applying copies it into the custom plan rather than making the user track the guide itself. The preview can expand into a side-by-side editor with per-class copy controls. Full override clears plan classes, role, notes and personal tasks while preserving character records and earned progress. Guide notes belong to the reference panel. Shared `ClassTabs.jsx` drives class selection in both Next steps and Class details. The class drag grip supports mouse/touch pointer dragging and arrow keys.

`startingData.js` holds path-specific sourced starting records. Current source coverage is partial: Cai and Tialla have reported Level 1 Commoner defaults on Cai's path; Dietrich has a reported Noble class. Starting ranks and other missing records remain unknown. All reported defaults are flagged as not independently verified. Existing user-entered values are retained.

### Independent loadout and ability planner

`LoadoutWorkspace.jsx` renders all characters through a shared component. Each path/member owns a `loadout` record independent of `customPlan`. Equipment and ability goals, recorded ownership/learning, current equipped choices, and manual catalog entries persist separately. Class-plan changes and reset do not clear these fields. Equipment-plan and ability-goal resets clear only their goal lists; current choices and recorded ownership/learning remain.

Class-profile checks are reported data, not an exact legality engine. The catalog supports weapons, a documented spell milestone, manual spells/equipment/mounts, all existing class mastery rewards, character-specific upgrades/diadems, and reported skill-rank/mount-bond abilities. Profile data from the supplied TypeScript files is retained as plain JavaScript in `loadoutCatalog.js`; uncertain acquisition/effects stay labeled. Slot limits, mount species rules, and complete item/spell coverage are not enforced. Gear previously marked Prepared is migrated to owned entries.

Guide suggestions are explicit per-item copies. A guide override defaults to classes only and offers an explicit checkbox to replace planned equipment/mastery goals as well. Actual equipped selections, owned gear, learned abilities and character stats stay saved. The PR preparation checks pass all 15 data/model regression tests and the production build; visual browser testing remains a separate review.

### Source coverage (12 October 2026)

The local library contains 411 references across all 63 characters. Game8 English, Game8 Japan, KeenGamer and the source-linked fan encyclopedia each cover the full roster. FortunesWeave.co.uk provides 61 explicit routes; AllThingsHow covers 22 characters and Mobalytics 19 through the reviewed build/team articles. References distinguish full class directions, chosen alternatives, partial training targets and keep-native advice. KeenGamer entries outside the original detailed import are endgame targets, not invented full routes.

Data lives in plain JavaScript, using the same character workspace and planner components for every publisher. Publisher filtering derives from actual guide data. Japanese class names map to stable shared IDs. `research/build-source-coverage.json` records coverage and unresolved aliases; `research/source-review-status.json` describes checks and limitations. `scripts/import-guide-coverage.mjs` regenerates the expanded data from short structured research records. The collector is a manual research tool and is never run by the site or build.

Fan encyclopedia references distinguish AI-generated ideas from translated Game8 Japan material. Source agreement is not independent in-game verification. New The Godhand details, fixed-class claims, Divine assignments and class-exam disputes remain explicitly reported. Applying a reference requires an explicit action; empty keep-native advice cannot erase a custom route. Character stats, earned progress and actual loadout stay saved.

Equipment and ability coverage remains partial. Unrecorded source suggestions are not interpreted as empty legal loadouts. Starting ranks remain unknown where not documented. No recruitment rules were added. PR preparation passed 15 data/model regression tests and the production build. Source/class-ID consistency and local Vite transforms were also checked. Publishing to GitHub Pages happens after the PR is merged to main.

### Build decision notes (13 October 2026)

All 411 references receive companion-written role/endpoint labels and decision notes through `guideEditorial.js`. Notes explain team needs, reported training strengths/weaknesses, investment, role changes, useful stopping points, per-class purpose and mastery rewards. Alternative previews retain each publisher’s route and stable IDs. Character skill preferences live in `characterTraining.js`, separate from future combat-stat research. The choice explanations are interpretations of recorded class profiles, not quotations or performance guarantees. Existing saved plans and reference IDs remain intact.
