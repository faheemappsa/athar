# Athar V2 Complete Import Status

## Completed import paths

The GitHub Action now runs import preparation for all four approved content types:

1. Quran short ayahs.
2. Duas and adhkar.
3. Short verified hadith.
4. Short tafsir and meanings.

## Runner

`node scripts/run-athar-v2-import.mjs`

## Generated files

- `data/athar-v2/imported/quran-short.json`
- `data/athar-v2/imported/adhkar-short.json`
- `data/athar-v2/imported/hadith-short.json`
- `data/athar-v2/imported/tafsir-short.json`
- `public/data/athar-v2/athar-db.json`

## Runtime rule

The app remains offline-first. External source imports happen only in preparation/build workflows, never when the card opens.
