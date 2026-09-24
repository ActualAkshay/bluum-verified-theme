# Bluum Verified theme audit

**Audited:** 2026-09-24

**Figma file:** `ZNbMTryLUq3YrcK9sex3L1`

**Release page:** `Final_update` (`257:3148`)

**Release:** `1.2.0`

**Activation status:** Preview only

## Verdict

🟢 The theme is safe to sync and preview.

🟢 The built-in Bluum theme (`current`) remains live.

🟢 The signed-off theme port is complete and ready for final preview review.

⚪ Completion does not activate the theme. Only the Themes UI may publish it.

## Page contract

| Page | Route | Figma node(s) | Visual QA | Functional QA | Result |
| --- | --- | --- | --- | --- | --- |
| Home | `/` | `257:11906`, `257:6141` | Desktop + mobile | CTAs, products, FAQ, comparison | 🟢 Pass |
| Shop | `/collections/all` | `257:11707` | Desktop + mobile | Search, filters, 49 live cards | 🟢 Pass |
| Product | `/products/$handle` | `257:5229` | BPC-157 desktop + mobile | Variants, bundles, cart, COA | 🟢 Pass |
| Cart | `/cart` | `257:8654` | Desktop + 390 × 844 | Loading, empty, error, line-item, summary state contract | 🟢 Pass |
| Account | `/account/*` | `257:11327` | OTP entry desktop + 390 × 844 | OTP, profile, orders, order detail, addresses state contract | 🟢 Pass |
| FAQ | `/pages/faq` | `257:11140` | Desktop + mobile | 19 questions, support CTA | 🟢 Pass |
| Lab Reports | `/pages/coa-lookup` | `257:10665` | Desktop + 390 × 844 | Initial, result, not-found, documents, keyboard combobox | 🟢 Pass |
| Science | `/pages/about-us` | `257:3171`, `257:6997` | Desktop + 390 × 844 | Dedicated Verified composition, accordions, CTAs | 🟢 Pass |
| Privacy | `/policies/privacy-policy` | `257:9772` | Desktop + 390 × 844 | Dynamic legal body, responsive reading layout, SEO | 🟢 Pass |
| Blog | `/blogs/research` | `257:10086`, `257:7649` | Desktop + responsive | Live article cards | 🟢 Pass |
| Article | `/blogs/research/$handle` | `257:10386`, `257:8380` | Desktop + responsive | Live content/SEO | 🟢 Pass |
| Contact | `/pages/contact` | `257:9919`, `257:7482` | Desktop + responsive | Form wiring/validation | 🟢 Pass |

The machine-readable contract is [`../design/pages.json`](../design/pages.json). The Medusa implementation repository contains the detailed evidence, accessibility findings, automated checks, and activation gate in `docs/figma-verified-theme-port-audit.md`.

## Closed findings

- 🟢 Canonical FAQ route and Bluum-specific FAQ content.
- 🟢 Floating-header clearance on secondary routes.
- 🟢 Preview-banner/header stacking at mobile and desktop sizes.
- 🟢 Mobile search plus Escape, focus containment, focus return, and outside-close navigation behavior.
- 🟢 Exact footer destinations.
- 🟢 Native comparison-table semantics.
- 🟢 Skip-to-content and Verified focus-visible treatment.

## Final QA notes

- All 12 mapped routes rendered with the `verified` wrapper at desktop and 390 × 844, with no horizontal overflow or route error boundary.
- The account entry and all public routes were checked visually. Authenticated account mutations were not executed because no dedicated non-production customer was supplied; existing Medusa hooks and mutation paths were retained.
- The Figma PDP subscription concept is formally excluded from this release. Medusa has no recurring billing or fulfillment model, so the theme does not advertise an unsupported subscription.
- The live policy body still contains legacy Shopify platform references. The theme correctly renders the dynamic policy; legal/platform copy must be updated by the policy owner in Medusa content before activation.
- The structured Figma API quota remained exhausted. The signed-in Figma canvas, frame inventory, route contract, and responsive browser rendering were used for the final comparison.

## Live-storefront safety evidence

An uncookied request to `https://bluumpeptides.com/` returned HTTP 200 with `Research-Grade Peptides, delivered`; it contained neither `data-storefront-theme="verified"` nor a Verified preview banner. A separate visual browser check showed the same original Bluum storefront.

Repository pushes, syncs, builds, deployments, audits, previews, and screenshots are not activation events. Only an explicit **Publish/Activate** confirmation in **Medusa Admin → Online Store → Themes** may change the live theme.
