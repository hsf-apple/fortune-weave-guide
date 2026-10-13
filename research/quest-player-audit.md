# Quest checklist player audit — 13 October 2026

The approved first version is a separate website page reached from Sidebar → Adventure → Quest checklist. It uses hash navigation and does not place quests inside character workspaces.

Implemented: independent per-path browser saves, check/uncheck completion, completed/remaining counts, search by names/requesters/objectives/locations/rewards, filters for type/completion/part/exact unlock chapter, deadline-only view, clear filters, empty feedback, expandable location/rewards/requirements, and individual Game8 guide links.

Source: https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/618792

The public collection has 174 entries in seven types. Its snapshot is game8-quest-collection.json. Individual public guides were fetched for all entries. Shared Perform guide pages do not have the same information table, so their details remain unknown rather than inferred. The extracted structured snapshot is quest-details.json. Coverage: 154 locations, 142 reward records, 18 reported Renown prerequisites. The checklist displays recorded deadline dates per path as in-game dates.

Collection chapter values remain the reported unlock chapter. They do not establish current availability or prove that other requirements are met. Missing or dash values remain unknown, including 27 entries without any route chapter. No Part II entries are present in the source collection; game coverage is not claimed complete. Unknown deadlines never imply unlimited time. Additional requirements are partial; links provide the full guide. The source has not been independently verified in-game.

scripts/import-quests.mjs combines the structured snapshots into src/questData.js offline. scripts/extract-quest-details.mjs extracts facts from the ignored research/quest-pages cache; manually review source format changes before regenerating. Build and runtime never fetch Game8.

Completion starts filtered to incomplete; the Completed or All quests views let the player undo a check. Names can contain spoilers. Multiple statuses, personal notes, spoiler gating, export/import and cloud sync are outside this first version.

Validation: production build; model/data regression tests including reload/path independence, stable quest IDs, route-specific deadline dates and known prerequisite extraction; browser checks of sidebar navigation, search, completion persistence and expanded details. The temporary completion used during browser verification was restored.
