# Athar V2 Completion Status

## Completed

- Isolated V2 folder under `src/athar-v2`.
- Strict content types: ayah, dua, hadith, tafsir.
- Moment classifier for normal day, Friday, Friday last-hour, Sunday night, Monday fasting, Ramadan, Ramadan last-night, and Arafah.
- Local catalog selection.
- Recent ID normalization.
- Card-compatible adapter.
- Card-ready service.
- Runtime with injected recent store.
- Feature flag helper.
- Self-test helper.
- Validation rules.
- Source policy.
- Library report helper.
- Safe integration documentation.

## Not connected yet

The current card is still using the old engine. This is intentional until V2 content and validation are fully reviewed.

## Remaining before live activation

1. Increase the trusted local catalog size.
2. Review every text and source item manually.
3. Run TypeScript build in the real repo environment.
4. Add feature-flagged fallback inside the old engine, not inside the card JSX.
5. Verify visual card output, image export, and sharing manually.
6. Keep old engine until V2 is confirmed in production.
