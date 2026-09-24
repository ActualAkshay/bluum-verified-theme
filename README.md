# Bluum Verified theme

Design source and release manifest for the second Bluum Medusa storefront theme.

## Source

- Figma file: [Bluum Peptides Client — Copy](https://www.figma.com/design/ZNbMTryLUq3YrcK9sex3L1/Bluum-Peptides-Client--Copy-?node-id=257-3148&p=f)
- Release page: `257:3148` (`Final_update`)
- Desktop home: `257:11906`
- Mobile home: `257:6141`
- Desktop catalog: `257:11707`
- Desktop product: `257:5229`

The comprehensive Figma-to-route map is in [`design/pages.json`](design/pages.json). The latest page-by-page UX audit is in [`docs/figma-medusa-ux-audit.md`](docs/figma-medusa-ux-audit.md).

## Runtime contract

`bluum-theme.json` is the manifest consumed by the Bluum Medusa theme manager. The live renderer is compiled into the Medusa storefront and pinned to an exact commit from this repository; repository code is never executed remotely at runtime.

The theme owns storefront presentation only. Medusa remains the source of truth for catalog data, prices, inventory, customers, cart, checkout, analytics, and compliance content.

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
