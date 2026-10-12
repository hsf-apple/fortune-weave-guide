# Fortune's Weave Guide

A frontend-only character build tracker for **Fire Emblem: Fortune's Weave**, with independent browser-saved rosters for Cai, Dietrich, Theodora and Leda.

## Features

- Searchable portrait picker: adding a character means recruited, with no recruitment rules
- Automatic mandatory members, optional roster removal, persistent spoiler portrait reveals
- Cai's four-class progression, training priorities, certification targets, and mastery rewards
- Combat, equipment, and training-order notes from the owner's character build tracker
- Per-path browser-local stage tracking, with no account or backend
- Responsive and print-friendly layout

The guide flags uncertain certification details for in-game confirmation. The selected class path credits the [Game8 Cai guide](https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/624119).

## Run locally

Run `node preview.cjs`, then open http://localhost:4173. No build step or dependencies are required. Cai's original reference guide is at `cai.html`; its legacy progress is imported into the Cai tracker on first use. Later changes in the reference guide remain separate.

## Data and limitations

`data/tracker.js` separates characters, paths, sources and build guides. Each guide has a source, URL, verification note and stable class/mastery stage IDs. Compatible stages retain progress when changing builds; incompatible stages start fresh, and old progress remains available when switching back. Only Cai has a Game8 build initially. Missing guides are explicit, with no invented class routes.

Portraits and mandatory roster assignments come from the owner's design reference, https://ffrecruiter.lovable.app/. Game character artwork belongs to its respective rights holders. Roster assignments are not independently verified in-game. The optional picker is a manual roster catalog and does not validate route availability. Post-skip portraits are concealed until revealed. Fonts load from Google Fonts with local serif/sans fallbacks. All images are stored in this repository.

Saves use localStorage on the current origin, including optional members, selected builds, stage statuses and portrait reveals. Saves on localhost do not transfer to GitHub Pages. Clearing browser data removes saved progress; there is no export/import or cloud sync.

## Hosting

This repository is designed for GitHub Pages using the `main` branch and repository root.
