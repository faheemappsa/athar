# Athar V2 GitHub Action Import

A GitHub Actions workflow now exists at:

`.github/workflows/athar-v2-import.yml`

It runs the importer inside GitHub and commits generated output when content changes.

## What it runs

```bash
node scripts/import-athar-v2-all.mjs
```

## Outputs committed by the workflow

- `data/athar-v2/imported/quran-short.json`
- `data/athar-v2/imported/adhkar-short.json`
- `public/data/athar-v2/athar-db.json`

## Manual run

GitHub → Actions → Athar V2 Import → Run workflow.

Runtime remains offline-first. The app does not fetch external religious APIs when the card opens.
