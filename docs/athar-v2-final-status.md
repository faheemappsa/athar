# Athar V2 Final Status

## Completed

- Offline-first V2 architecture.
- Static DB asset and build/validation scripts.
- Preview API route: `/api/athar-v2`.
- Card-ready formatter and smart source.
- Feature flag: `VITE_ATHAR_V2=1`.
- Card linked through smart source with one import change only.
- Current card UI, layout, animation, export image flow, and share flow kept unchanged.
- Legacy engine remains fallback when V2 is disabled or fails.
- Additional verified local content pack added to the unified catalog.

## Activation

Set this env variable in Vercel to test V2 on the live card:

`VITE_ATHAR_V2=1`

Without this variable, the legacy engine remains active.

## Notes

The large-scale automated import from external datasets is represented by the static DB pipeline and source stack. Runtime display remains local and does not fetch live external religious APIs.
