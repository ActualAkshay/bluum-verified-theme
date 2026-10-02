# Bluum Verified theme audit

**Status updated:** 02 Oct 2026, 05:08 PM IST

**Figma file:** `ZNbMTryLUq3YrcK9sex3L1`

**Release page:** `Final_update` (`257:3148`)

**Manifest version:** `1.2.0`

**Release state:** Local iteration; not published

## Conclusion and evidence boundary

The theme contains the 12 mapped routes below. This iteration restores missing current-storefront capabilities and adds catalog controls, while leaving the built-in Bluum theme active. Local desktop and mobile inspection is complete for the 12 route families at the states noted below. Exact Figma fidelity and live commerce end-to-end sign-off remain incomplete; this is not a publication certificate.

Figma MCP quota blocked complete frame-by-frame exports. The prior comparison had detailed Shop and Product screenshots and the complete board overview. Exact visual parity for every frame and state remains unverified. Product, Shop, Science, and Privacy had reported gaps. The earlier blanket “Pass” and “port complete” claims have been withdrawn.

The source contract uses `mapped` to identify represented pages and components. This is a source-inventory status, not a visual, functional, accessibility, or release-approval result.

## Changes verified in this iteration

- Standalone theme ownership: seven React/CSS/helper files now live in `src/runtime/`. Explicit local sync creates checksum-verified Medusa build snapshots and never changes activation.
- Restored approved-customer Wholesale navigation, wholesale application, privacy choices, waiver and billing-policy links, contact details, Instagram, four payment marks, the complete existing product/FDA disclaimer, and the configured announcement slot.
- Added Verified-only category and starting-price dropdowns, price/name sorting, result counts, and the existing support section. Search, all 51 catalog products, pagination, quick-add, retry and empty states remain available.
- Product gallery now accepts every available product image in Verified instead of truncating to one. The tested 5-Amino-1MQ record supplies only one image; this does not supply the missing Figma editorial images.
- Search dialogs now escape the floating header, fill the viewport, retain keyboard containment and return focus correctly. Mobile search dismissal keeps the menu open; closing the menu releases its scroll lock. Crossing to desktop closes the mobile menu.
- Fixed mobile price-select overflow and the blurred mobile hero. The 292 × 170 thumbnail was replaced at the callsite by the existing 2334 × 1353 version of the same artwork; no image was invented or regenerated.
- Featured-product failure/empty states no longer show an indefinite loading skeleton. Science headline corrected to “Science you can verify.”

## Current browser evidence

Inspected at 1440 × 1000 and 390 × 844 in browser emulation: Home, Shop, Product, FAQ, Lab Reports, Science, Privacy, Blog, Article, Contact, guest Account entry, and the guarded Cart route. These are viewport/selected-section inspections, not pixel-diff validation of every offscreen element. Lazy images were not all forced to load.

Direct interactions: desktop and mobile predictive search, BPC results, mobile Escape/focus/scroll lock, category/starting-price/name/price sorting, 29 products under US$50, 51 unfiltered products, 50mg product variant and Buy 5 total US$308.75, FAQ accordion, lot 234532 result, and phone/email sign-in selection. No OTP or external forms were submitted.

Cart is deliberately write-blocked in this preview and shows its recoverable preparation error. Populated cart, promotions, quantity/removal errors, checkout states, customer-address persistence and auth-cache isolation are covered by mocked component/unit tests, not authenticated visual or live payment evidence.

The local adapter forwards public Medusa GET/HEAD reads only, strips customer credentials, and blocks mutations before forwarding. Direct external services such as Klaviyo are outside that adapter; do not submit newsletter/back-in-stock forms. This is not a full sandbox or payment flow. Earlier direct-production cart visits cannot be classified as read-only because the shared cart page automatically creates a cart.

## Page inventory and remaining verification

| Page | Route | Figma frame(s) | Prior evidence | Verification still required |
| --- | --- | --- | --- | --- |
| Home | `/` | Desktop `257:3622`; mobile `257:6141` | Desktop/mobile route rendering; CTAs and accordions | Complete section and responsive comparison against individual frames |
| Shop | `/collections/all` | Desktop `257:11707` | Detailed Figma screenshot; catalog filtering; desktop/mobile rendering | Resolve reported visual gaps; recheck catalog states and responsive parity |
| Product | `/products/$handle` | Desktop `257:5229` | Detailed Figma screenshot; variant/quantity controls; desktop/mobile rendering | Resolve reported visual gaps; check available, unavailable, and error states; cart writes not exercised |
| Cart | `/cart` | Desktop `257:8723`; mobile `257:8654` | Empty-state route rendering | Populated cart, mutations, discounts, failures, checkout continuity, and exact visual parity |
| Account | `/account/*` | Desktop entry `257:11327` | Public login-entry rendering | Authenticated profile, addresses, orders, order detail, mutations, and Figma state comparisons |
| FAQ | `/pages/faq` | Desktop `257:11140` | Route rendering and accordion interaction | Complete content and visual comparison |
| Lab Reports | `/pages/coa-lookup` | Desktop `257:10665` | Route rendering and read-only report lookup | Complete results, empty/error states, document links, and visual comparison |
| Science | `/pages/about-us` | Desktop `257:3171`; mobile `257:6997` | Route rendering and accordion interaction | Resolve reported copy/composition gaps; compare complete desktop/mobile frames |
| Privacy | `/policies/privacy-policy` | Desktop `257:9772` | Dynamic legal-body rendering | Design comparison; policy-owner review of legacy Shopify references |
| Blog | `/blogs/research` | Desktop `257:10086`; mobile `257:7649` | Article-list route rendering | Complete visual comparison and pagination/empty states |
| Article | `/blogs/research/$handle` | Desktop `257:10386`; mobile `257:8380` | Article route rendering | Complete visual comparison, long content, media, and related content |
| Contact | `/pages/contact` | Desktop `257:9919`; mobile `257:7482` | Route and form rendering | Complete visual comparison and submission success/error behavior; prior audit did not submit |

Home desktop was corrected from the section-label node `257:11906` to frame `257:3622`. Cart desktop was corrected from mobile frame `257:8654` to desktop frame `257:8723`; the mobile reference is now explicit.

The machine-readable inventory is [`../design/pages.json`](../design/pages.json). Runtime presentation sources live in this repository's `src/runtime/`; the Medusa copies are generated build snapshots. Shared commerce behavior stays in Medusa and must be included in regression coverage when the presentation changes.

## Recorded local QA, not a release certificate

Final iteration verification on 02 Oct 2026:

- Storefront `pnpm build`: 666 passing tests (448 Node + 218 Vitest), one skipped; client and server production bundles built successfully. The existing large-chunk warning remains.
- `pnpm exec tsc --noEmit`: passed.
- Read-only preview adapter: 9 tests passed.
- Backend theme service/Admin management safety: 11 tests passed.
- Standalone validation and 8 sync tests passed; all seven generated snapshots match their source checksums.
- Total: 694 passing automated tests, one skipped. Test counts do not certify exact Figma parity or replace authenticated/payment end-to-end tests.

The previous 2026-10-02 audit reported:

- All 12 mapped routes rendered on desktop and mobile without horizontal overflow or route error boundaries.
- 96 automated tests, TypeScript, and the production build passed at that revision.
- Mobile navigation, accordions, catalog filtering, product options, and laboratory-report lookup worked.
- Authenticated account, populated-cart writes, contact submission, checkout, and payment were not exercised. Physical-device coverage was not established.

These are historical test results. They must not be presented as proof that subsequent source edits passed or that untested states work.

## External and intentional boundaries

- The Figma subscription purchase concept is excluded because Medusa has no implemented recurring billing, fulfillment, or cancellation model. A visual-only subscription promise must not be displayed as a working purchase option.
- Medusa owns legal content. The previous privacy response contained legacy Shopify references; changing storefront presentation does not correct that source content or constitute legal approval.
- Figma MCP export access is required to close the complete frame-by-frame fidelity boundary. The board overview alone is insufficient evidence for an exact copy.

## Activation safety

A fresh read of `/store/themes/active` on 02 Oct 2026 returned `handle: current`, `renderer_key: current`, `name: Bluum`. No activation, deployment or push was performed during this iteration. Shared legal content and production integration settings were not modified.

Repository syncs, commits, builds, deployments, audits, previews, and screenshots are not activation events. Only a separately authorized **Publish** action and confirmation in **Medusa Admin → Online Store → Themes** may change the live theme.
