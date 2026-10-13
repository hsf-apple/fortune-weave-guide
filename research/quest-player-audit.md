# Quest checklist player audit — 13 October 2026

Source: https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/618792

Game8's public collection 868 contains 174 entries across Kindness, Subquest, Perform, Send Supplies, Paralogue, Challenge Letter and Recruitment. The local snapshot is game8-quest-collection.json; scripts/import-quests.mjs converts it into src/questData.js without network access at build time.

Player requirements implemented:

- A dedicated Adventure sidebar section with a Quest checklist destination.
- Check and uncheck quests; browser persistence and independent progress for Cai, Dietrich, Theodora and Leda.
- Search names, requesters and objectives; filter by type and completion.
- Completion count, accessible native checkboxes, empty results feedback.
- Part and selected-path chapter, ordered by part/chapter/name; individual Game8 guide links.

Evidence limits:

- 27 entries have no chapter listed on any path. A blank or dash is unknown, not confirmed unavailability. All entries remain visible so a player can still record completion.
- The collection lists Parts 1 and 3 only. It is not sufficient evidence of complete game coverage or an absence of Part 2 quests.
- Collection data has no deadlines, rewards or detailed unlock prerequisites. Do not infer these or claim the checklist determines whether a quest is currently available.
- Quest names and objectives are visible and can contain spoilers. No spoiler protection is included in this simple checklist.
- Saves remain in this browser and origin, without cloud sync.

Follow-up priorities if expanding scope: verify deadlines and unlock prerequisites from individual quest pages; reconcile missing chapters and Part 2 coverage; optionally hide completed entries by default or add spoiler controls. The current scope stays a checklist.
