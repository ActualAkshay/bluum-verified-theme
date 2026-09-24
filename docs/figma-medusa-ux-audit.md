# Bluum Verified theme audit

**Audited:** 2026-09-24

**Figma file:** `ZNbMTryLUq3YrcK9sex3L1`

**Release page:** `Final_update` (`257:3148`)

**Release:** `1.1.0`

**Activation status:** Preview only

## Verdict

🟢 The theme is safe to sync and preview.

🟢 The built-in Bluum theme (`current`) remains live.

🟡 Bluum Verified is not approved for activation; shared secondary-page bodies and authenticated account states still require final sign-off.

## Page contract

| Page | Route | Figma node(s) | Visual QA | Functional QA | Result |
| --- | --- | --- | --- | --- | --- |
| Home | `/` | `257:11906`, `257:6141` | Desktop + mobile | CTAs, products, FAQ, comparison | 🟢 Pass |
| Shop | `/collections/all` | `257:11707` | Desktop + mobile | Search, filters, 49 live cards | 🟢 Pass |
| Product | `/products/$handle` | `257:5229` | BPC-157 desktop + mobile | Variants, bundles, cart, COA | 🟢 Pass |
| Cart | `/cart` | `257:8654` | Desktop + responsive | Shared cart workflow | 🟡 Partial |
| Account | `/account/*` | `257:11327` | OTP entry | Shared authenticated states | 🟡 Partial |
| FAQ | `/pages/faq` | `257:11140` | Desktop + mobile | 19 questions, support CTA | 🟢 Pass |
| Lab Reports | `/pages/coa-lookup` | `257:10665` | Desktop | Lot/compound lookup | 🟡 Partial |
| Science | `/pages/about-us` | `257:3171`, `257:6997` | Desktop + responsive | Static content/navigation | 🟡 Partial |
| Privacy | `/policies/privacy-policy` | `257:9772` | Desktop + responsive | Legal content/SEO | 🟡 Partial |
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

## Open activation gates

1. Sign off or independently port every page marked 🟡 Partial.
2. Decide whether the Figma subscription state is a real release requirement; do not represent it until Medusa has a working subscription model.
3. Test authenticated Account states with a dedicated test customer.
4. Add desktop/mobile screenshot regression baselines.
5. Repeat automated Figma pixel comparison when the structured-inspection quota is available.

## Live-storefront safety evidence

An uncookied request to `https://bluumpeptides.com/` returned HTTP 200 with `Research-Grade Peptides, delivered`; it contained neither `data-storefront-theme="verified"` nor a Verified preview banner. A separate visual browser check showed the same original Bluum storefront.

Repository pushes, syncs, builds, deployments, audits, previews, and screenshots are not activation events. Only an explicit **Publish/Activate** confirmation in **Medusa Admin → Online Store → Themes** may change the live theme.
