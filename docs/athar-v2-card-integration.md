# Athar V2 Card Integration Notes

This document describes how V2 can be connected later without changing the current card design, layout, animations, image export, or sharing flow.

## Current status

V2 is still isolated. The live card has not been changed.

## Safe integration API

Use only these V2 functions for a future connection:

- `isAtharV2Enabled()`
- `createAtharV2RecentStore(read, write)`
- `runAtharV2Card(store)`

`runAtharV2Card` returns:

- `content.id`
- `content.text`
- `content.source`
- `content.kind`
- `content.time`
- `nextRecentIds`
- `meta.occasion`
- `meta.poolSize`
- `meta.reason`

## Integration rule

The card should keep the same JSX, styles, layout, animations, export, and share handlers. Only the content source may be switched behind a feature flag after V2 validation is complete.

## Feature flag behavior

- Flag off: old `getSmartAthar()` continues exactly as-is.
- Flag on: V2 returns card-compatible content.
- Any V2 error: fall back to old `getSmartAthar()`.

## Do not change yet

- Middle-card tap behavior.
- Export image generation.
- Share button flow.
- Name prompt flow.
- Existing analytics events, unless adding V2 metadata in a backward-compatible way.
