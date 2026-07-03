# Athar V2 Source Import Runbook

To fetch and rebuild the offline-first database from external sources during preparation only, run:

```bash
node scripts/import-athar-v2-all.mjs
```

This runs:

1. `scripts/import-athar-v2-quran.mjs`
2. `scripts/import-athar-v2-adhkar.mjs`
3. `scripts/merge-athar-v2-imports.mjs`
4. `scripts/validate-athar-v2-db.mjs`

Outputs:

- `data/athar-v2/imported/quran-short.json`
- `data/athar-v2/imported/adhkar-short.json`
- `public/data/athar-v2/athar-db.json`

Runtime rule:

The app must not fetch live external religious APIs when the user opens the card. Imports are preparation/build-time only.
