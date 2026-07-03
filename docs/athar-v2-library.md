# Athar Library V2

Athar Library V2 is an isolated local content and selection system. It is intentionally not connected to the current Athar card yet.

## Current safe scope

- Location: `src/athar-v2`
- Status: isolated build area
- Current card design: untouched
- Current card export as image: untouched
- Current sharing flow: untouched
- Current middle-card tap behavior: untouched
- Old content system: untouched

## Supported content types only

1. Short Quran ayahs.
2. Short trusted duas.
3. Short authentic hadiths.
4. Short tafsir and meaning summaries for ayahs from trusted sources.

No independent prophetic-guidance section, action section, emotional-state selection, or random API display is included.

## Selection logic

Moment and religious timing are classified first:

- Friday.
- Friday last-hour window.
- Sunday night preparation for Monday.
- Monday fasting reminder.
- Ramadan.
- Ramadan last-night window.
- Arafah when trusted Hijri input is supplied.
- Normal morning/evening/generic windows.

Then V2 builds a suitable pool, removes recently shown IDs when provided, and selects the strongest local item by priority and weight.

## Files

- `types.ts`: strict shared types.
- `library.ts`: initial trusted local library.
- `moment.ts`: moment and occasion classifier.
- `picker.ts`: selection engine.
- `validate.ts`: local quality checks.
- `index.ts`: public API export.

## Future integration checklist

Before connecting V2 to the live card:

1. Expand and review the local content library.
2. Add deterministic tests for major occasions.
3. Store recent item IDs locally to strengthen non-repetition.
4. Connect V2 behind a feature flag.
5. Confirm the visual card, export image flow, and share flow stay unchanged.
6. Only then replace the old content source.
