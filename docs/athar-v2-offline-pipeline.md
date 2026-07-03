# Athar V2 Offline-first Pipeline

This document records the accepted source architecture for Athar V2.

## Decision

Athar V2 display must be offline-first. The card must not fetch live religious content APIs when the user opens the app.

## Accepted model

External APIs and GitHub datasets may be used only during preparation, cleaning, verification, and build-time generation.

The runtime card reads from a local generated static asset:

`public/data/athar-v2/athar-db.json`

## Source stack

- Al Quran Cloud: seed Quran ayah data only.
- Tanzil: verify Quran text.
- Edhafe: short tafsir and meanings.
- Morning And Evening Adhkar DB: morning/evening adhkar.
- MuslimKit: daily duas and adhkar categories.
- Hadith JSON Dataset: raw source for filtered short authentic hadith only.
- Dorar verification: preparation/sanitization only, not runtime display.

## Runtime rule

No live display fetch. No random API content on app open. Local V2 DB is the primary display source.
