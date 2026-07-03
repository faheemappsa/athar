# Athar V2 Build-Time Pipeline

This folder documents the intended offline-first content pipeline for Athar V2.

The user-facing card must never fetch external religious APIs when the app opens. External datasets are accepted only during preparation or build-time seeding, then transformed into a local static database.

## Pipeline

```text
Approved datasets
  -> normalize text
  -> filter max length under 150 chars
  -> verify source and grade
  -> inject occasions and time tags
  -> emit athar-db.json under static assets
  -> React reads local data instantly
```

## Accepted source roles

- Quran seed: Al Quran Cloud.
- Quran verification: Tanzil.
- Tafsir: Edhafe, especially Muyassar and short Saadi meanings.
- Morning/evening adhkar: Seen Arabic DB.
- Daily duas and categorized adhkar: MuslimKit.
- Hadith: Hadith JSON as raw input only, filtered to short authentic Bukhari/Muslim texts.
- Dorar-style verification: preparation stage only, never a live app dependency.

## Hard rule

No live external API is allowed for Athar card display.
