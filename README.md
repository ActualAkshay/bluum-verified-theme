# Bluum Verified theme

Presentation source, assets, and release manifest for the second Bluum Medusa storefront theme.

## Source

- Figma file: [Bluum Peptides Client — Copy](https://www.figma.com/design/ZNbMTryLUq3YrcK9sex3L1/Bluum-Peptides-Client--Copy-?node-id=257-3148&p=f)
- Release page: `257:3148` (`Final_update`)
- Desktop home: `257:3622`
- Mobile home: `257:6141`
- Desktop catalog: `257:11707`
- Desktop product: `257:5229`

The comprehensive Figma-to-route map is in [`design/pages.json`](design/pages.json). The latest page-by-page UX audit is in [`docs/figma-medusa-ux-audit.md`](docs/figma-medusa-ux-audit.md).

## Runtime contract

`bluum-theme.json` is the manifest consumed by the Bluum Medusa theme manager. The live renderer is compiled into the Medusa storefront and pinned to an exact commit from this repository; repository code is never executed remotely at runtime.

The theme owns storefront presentation only. Medusa remains the source of truth for catalog data, prices, inventory, customers, cart, checkout, analytics, and compliance content.

## Source ownership and local preview integration

Make theme presentation changes in `src/runtime/` in **this repository**. These React and CSS sources compile in the Medusa storefront, where their existing imports resolve to Medusa's shared commerce components. They are not a second commerce implementation or a standalone executable app.

The seven matching files in Medusa's `apps/storefront/src/themes/` and `src/styles/` are generated build snapshots. Do not edit those snapshots directly. Sync explicitly to a selected local storefront checkout:

```sh
npm run sync:storefront -- --storefront /absolute/path/to/bluum-medusa/apps/storefront
npm run sync:storefront -- --storefront /absolute/path/to/bluum-medusa/apps/storefront --check
npm run test:sync
```

`--check` performs no writes and exits with status 1 if any snapshot differs. Generated headers identify the source repository and its SHA-256 checksum, making repeated syncs deterministic. A sync accepts only seven fixed theme targets in a package named `storefront`; it rejects symlinks and unrecognized or manually modified snapshots. The four pre-migration files must exist and initial adoption accepts only their recorded checksums. Only the three explicitly listed additions (`verified-catalog-controls.tsx`, `verified-catalog.ts`, and `verified-support.tsx`) may be created, in existing directories. Review changes in both repositories and run storefront verification after syncing.

This command is local only: it does not access GitHub or Medusa APIs, change the theme manifest or active theme, push commits, deploy, or publish. The built-in **Bluum** theme (`current`) remains active throughout development. Use the Medusa Admin **Preview** action for the new theme. Only a separately authorized **Publish** action and confirmation in Medusa Admin → Online Store → Themes can activate it.

For safe public-data QA, Medusa includes `apps/storefront/scripts/preview-readonly-backend.mjs`. It binds `127.0.0.1:5180`, forwards public store reads to the fixed Medusa backend, and rejects all writes. Start the storefront on port 5176 with `VITE_MEDUSA_BACKEND_URL=http://127.0.0.1:5180` and the storefront's public publishable key. Open `http://localhost:5176/?bluum_preview_theme=verified`. Cart creation, authentication and checkout are deliberately unavailable; use mocked tests for those workflows. Direct external newsletter/back-in-stock services are not proxied and must not be submitted during QA.

## Original design assets

Science artwork is exported read-only from the original Figma file, desktop frame `257:3171` and mobile frame `257:6997`. The mobile hero, numbers, and USA scenes use their own exports rather than shrinking desktop imagery. Exported images live in `public/`; `design/assets.json` records their SHA-256 checksums.

After adding an export and its checksum, copy all managed assets without individual Save/upload steps:

```sh
npm run sync:assets -- --storefront /absolute/path/to/bluum-medusa/apps/storefront
npm run sync:assets -- --storefront /absolute/path/to/bluum-medusa/apps/storefront --check
npm run test:assets
```

This local sync rejects unknown overwrites and never changes activation. Assets ship with the normal storefront release; there is no separate manual CDN upload. Science keeps six unique FAQ questions (the design repeats its first question) and omits the design's illustrative fixed price so it cannot misrepresent current catalog pricing.

## Design system

- Canvas: `#fffdfb`
- Ink: `#231f1e`
- Display accent: Libre Baskerville italic
- UI type: Switzer
- Desktop canvas: 1512 px
- Mobile canvas: 393 px
- Primary actions: dark pill buttons
- Surfaces: soft gray cards, 24 px radius

Run `npm run validate` before publishing a release.

Publishing a Git commit or syncing this repository never activates the theme. Activation is a separate, explicit action in **Medusa Admin → Online Store → Themes**.
