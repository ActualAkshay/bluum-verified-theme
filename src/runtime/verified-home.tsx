import * as Accordion from "@radix-ui/react-accordion"
import ProductCard from "@/components/product-card"
import { useExperimentContent } from "@/components/experiment-provider"
import { useAgeGate } from "@/components/age-gate"
import { useProducts } from "@/lib/hooks/use-products"
import { useCategories } from "@/lib/hooks/use-categories"
import { bestSellingProductsQueryOptions, CATALOG_QUERY_PARAMS } from "@/lib/data/products"
import { useQuery } from "@tanstack/react-query"
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import type { HttpTypes } from "@medusajs/types"
import { Link, useLoaderData } from "@tanstack/react-router"
import { VerifiedSupport } from "./verified-support"
import { VerifiedQuestions } from "./verified-science"
import { featuredLookbackDays, selectVerifiedFeaturedProducts, verifiedBestsellerIds } from "./verified-featured"

const values = [
  {
    caption: "Tested for Endotoxins",
    image: "/images/themes/verified/compound-endotoxin.webp",
  },
  {
    caption: "Scan the Label. See the Proof.",
    image: "/images/themes/verified/compound-scan-background.webp",
    overlay: "/images/themes/verified/compound-scan-phone.webp",
  },
  {
    caption: "Independently Verified Purity",
    image: "/images/themes/verified/compound-purity.webp",
  },
  {
    caption: "Same Day Shipping Before 1pm",
    image: "/images/themes/verified/compound-shipping.webp",
  },
] as const

const approach = [
  ["Every lot tested", "Every batch is screened for bacterial endotoxins, helping reduce uncharacterized variables in sensitive research."],
  ["Scan the vial, see the COA", "Batch-specific reports keep the evidence connected to the compound in your hands."],
  ["US lyophilized & shipped", "Controlled domestic fulfillment makes handling and dispatch more consistent."],
  ["100% delivery guarantee", "Tracked delivery and responsive support protect every research order."],
] as const

const comparison = [
  ["Batch-specific COA access", true, true, false],
  ["99%+ purity across most products", true, false, false],
  ["Endotoxin screening included", true, false, false],
  ["USA sourced and lyophilized", true, false, true],
  ["Same-day in-stock dispatch", true, true, false],
  ["Single peptides and research blends", true, false, false],
  ["99%+ purity across most products", true, false, true],
] as const

const TrustIcon = ({ children }: { children: ReactNode }) => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
)
const trustIconImage = (name: string) => <img src={`/images/themes/verified/approach-icons/${name}.svg`} alt="" width="20" height="20" />
// Figma order; the strip loops, so the duplicate track is hidden from assistive technology.
const trustItems = [
  { label: "99%+ Purity", icon: <TrustIcon><path d="M12 3.25 5.25 5.9v5.35c0 4.2 2.85 7.75 6.75 9 3.9-1.25 6.75-4.8 6.75-9V5.9L12 3.25Z" /><path d="m8.9 12.05 2.15 2.15 4.1-4.2" /></TrustIcon> },
  { label: "Endotoxin Tested", icon: trustIconImage("biotech") },
  { label: "COA Available", icon: trustIconImage("qr_code_2") },
  { label: "Ships Today", icon: <TrustIcon><path d="M2.75 6.25h11v10h-11z" /><path d="M13.75 9.25h3.6l3.9 3.9v3.1h-7.5" /><circle cx="6.75" cy="17.25" r="1.75" fill="var(--verified-canvas)" /><circle cx="17" cy="17.25" r="1.75" fill="var(--verified-canvas)" /></TrustIcon> },
  { label: "USA Lyophilized", icon: trustIconImage("globe_location_pin") },
]

const approachIcons = ["biotech", "qr_code_2", "globe_location_pin", "workspace_premium"] as const
const categoryLabels = ["Peptides", "Bioregulators", "Blends", "Solutions"] as const

const VerifiedCategories = ({ region, catalogProducts, catalogPending, catalogError, retryCatalog }: {
  region: HttpTypes.StoreRegion; catalogProducts: HttpTypes.StoreProduct[]; catalogPending: boolean; catalogError: boolean; retryCatalog: () => void
}) => {
  const [selected, setSelected] = useState<string>("Peptides")
  const { data: categories = [], isPending: categoriesPending, isError: categoriesError, refetch: retryCategories } = useCategories({
    fields: "id,name,handle,*category_children",
    queryParams: { limit: 100 },
  })
  const category = categories.find((item) => item.name.toLowerCase() === selected.toLowerCase() || item.handle === selected.toLowerCase() || (selected === "Peptides" && item.handle === "research-peptides"))
  const categoryIds = category ? [category.id, ...(category.category_children || []).map((child) => child.id)] : []
  const { data, isPending, isError, refetch } = useProducts({
    query_params: { ...CATALOG_QUERY_PARAMS, limit: 1, category_id: categoryIds },
    region_id: region?.id,
    enabled: Boolean(category && region?.id),
  })
  // Match the existing storefront's Blends/Solutions catalog filters when no
  // dedicated Medusa category exists. Never invent bioregulator membership.
  const fallbackProduct = !category ? catalogProducts.find((item) => {
    const type = (item.type?.value || "").toLowerCase()
    const name = `${item.title || ""} ${item.handle || ""}`.replaceAll("-", " ").toLowerCase()
    if (selected === "Blends") return type.includes("blend") || /\b(?:blend(?:s)?|glow)\b/.test(name)
    if (selected === "Solutions") return type.includes("solution") || /\bsolution(?:s)?\b|\bbuffered saline\b|\bacid water\b/.test(name)
    return selected === "Bioregulators" && type.includes("bioregulator")
  }) : undefined
  const product = category ? data?.pages[0]?.products[0] : fallbackProduct
  const loading = categoriesPending || (category ? isPending : catalogPending)
  const failed = categoriesError || (category ? isError : catalogError)
  return (
    <section className="verified-categories" aria-labelledby="verified-categories-heading">
      <picture className="verified-categories-background">
        <source media="(max-width: 699px)" srcSet="/images/themes/verified/category-mobile-background.webp" />
        <img src="/images/themes/verified/category-glass-background.webp" alt="" loading="lazy" />
      </picture>
      <div className="verified-category-options">
        <h2 id="verified-categories-heading">Top Categories</h2>
        <div role="group" aria-label="Product categories">
          {categoryLabels.map((label) => <button key={label} type="button" aria-pressed={selected === label} aria-controls="verified-category-product" onClick={() => setSelected(label)}>{label}</button>)}
        </div>
      </div>
      <div id="verified-category-product" className="verified-category-product" aria-live="polite" aria-label={`${selected} product`}>
        {product ? <ProductCard key={`${selected}-${product.id}`} product={product} region={region} /> : (
          <div className="verified-category-state">
            <p>{failed ? "Products are temporarily unavailable." : loading ? "Loading products…" : `No ${selected.toLowerCase()} available right now.`}</p>
            {failed && <button type="button" onClick={() => void (categoriesError ? retryCategories() : category ? refetch() : retryCatalog())}>Try again</button>}
            <Link to="/collections/all">Browse all products</Link>
          </div>
        )}
      </div>
    </section>
  )
}

const Check = ({ value, highlighted = false }: { value: boolean; highlighted?: boolean }) => (
  <span role="img" aria-label={value ? "Yes" : "No"}>
    <img className="verified-comparison-mark" src={`/images/themes/verified/comparison-${value ? highlighted ? "check-light" : "check" : "cross"}.svg`} alt="" />
  </span>
)

const ArrowIcon = ({ direction }: { direction: "left" | "right" }) => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={direction === "left" ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"} />
  </svg>
)

/** Figma featured carousel: four cards in view; arrows and progress follow the real scroll position. */
const useCarouselScroll = (itemCount: number) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState({ start: true, end: true, thumb: 1, offset: 0 })
  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const max = Math.max(0, track.scrollWidth - track.clientWidth)
    const thumb = track.scrollWidth ? Math.min(1, track.clientWidth / track.scrollWidth) : 1
    setState({ start: track.scrollLeft <= 1, end: track.scrollLeft >= max - 1, thumb, offset: max ? (track.scrollLeft / max) * (1 - thumb) : 0 })
  }, [])
  useEffect(() => {
    measure()
    const track = trackRef.current
    if (!track || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => observer.disconnect()
  }, [measure, itemCount])
  const page = (direction: -1 | 1) => trackRef.current?.scrollBy({ left: direction * trackRef.current.clientWidth, behavior: "smooth" })
  return { trackRef, measure, page, ...state, scrollable: !(state.start && state.end) }
}

export const VerifiedHome = () => {
  const { region } = useLoaderData({ strict: false }) as { region: HttpTypes.StoreRegion }
  const { data, isPending, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useProducts({
    query_params: CATALOG_QUERY_PARAMS,
    region_id: region?.id,
  })
  const { data: rankedIds = [] } = useQuery(bestSellingProductsQueryOptions({
    days: featuredLookbackDays(import.meta.env.VITE_VERIFIED_FEATURED_LOOKBACK_DAYS),
  }))
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !isError) void fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage])
  const products = selectVerifiedFeaturedProducts(data?.pages.flatMap((page) => page.products) || [], rankedIds)
  const bestsellers = verifiedBestsellerIds(rankedIds)
  const carousel = useCarouselScroll(products.length)
  const { content: hero, ref: heroRef } = useExperimentContent("hero")
  const { visible: ageGateVisible } = useAgeGate()

  return (
    <div className="verified-home">
      <section ref={heroRef} className="verified-hero">
        {!ageGateVisible && (
          <picture className="verified-hero-picture" data-default-artwork={hero?.image_url ? undefined : "true"}>
            <source media="(max-width: 479px)" srcSet={hero?.image_url || "/images/themes/verified/hero-mobile-final.webp"} />
            <img
              data-bluum-lcp-candidate
              data-experiment-image
              src={hero?.image_url || "/images/themes/verified/hero-final.webp"}
              alt={hero?.image_alt || "Bluum research vial surrounded by white flowers"}
              fetchPriority="high"
            />
          </picture>
        )}
        <div className="verified-hero-copy">
          <p className="verified-rating" aria-label="Five out of five stars">★★★★★ <strong>15,000+ happy customers</strong></p>
          <h1>{hero?.text || <>Research<span className="verified-hero-mobile-break"><br /></span><span className="verified-hero-desktop-space"> </span>peptides, <em>verified</em></>}</h1>
          <Link to={hero?.button_href || "/collections/all"} className="verified-button">
            {hero?.button_label || "Shop Peptides"}
          </Link>
        </div>
      </section>

      <aside className="verified-trust-strip" aria-label="Research quality standards">
        <div className="verified-trust-strip__track">
          {/* Two identical halves of three copies each keep the -50% loop gap-free up to ~3100px wide. */}
          {[0, 1, 2, 3, 4, 5].map((copy) => <ul key={copy} aria-hidden={copy > 0 || undefined}>
            {trustItems.map(({ label, icon }) => <li key={label}>{icon}{label}</li>)}
          </ul>)}
        </div>
      </aside>

      <section className="verified-section verified-compounds" aria-labelledby="verified-compounds-heading">
        <h2 id="verified-compounds-heading">Find your <em>compound</em></h2>
        <div className="verified-compound-badges">
          <div>
            <img src="/images/themes/verified/compound-usa.webp" alt="" width="86" height="48" loading="lazy" />
            <span>Sourced &amp; Lyophilized<br />in the USA</span>
          </div>
          <div>
            <img src="/images/themes/verified/compound-flask.webp" alt="" width="57" height="58" loading="lazy" />
            <span>99% purity of formulas</span>
          </div>
        </div>
        <div className="verified-value-grid" role="group" aria-label="Compound quality highlights" tabIndex={0}>
          {values.map((value) => (
            <figure key={value.caption} className="verified-value-card">
              <img src={value.image} alt="" loading="lazy" />
              {"overlay" in value && <img className="verified-value-phone" src={value.overlay} alt="" loading="lazy" />}
              <figcaption>{value.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="verified-section verified-featured">
        <div className="verified-section-heading">
          <div><span>Popular Products</span><h2>Featured <em>Peptides</em></h2></div>
          <div className="verified-section-heading__actions">
            <Link to="/collections/all">View All Products</Link>
            {products.length > 0 && carousel.scrollable && <div className="verified-carousel-arrows">
              <button type="button" aria-label="Previous products" aria-controls="verified-featured-track" disabled={carousel.start} onClick={() => carousel.page(-1)}><ArrowIcon direction="left" /></button>
              <button type="button" aria-label="Next products" aria-controls="verified-featured-track" disabled={carousel.end} onClick={() => carousel.page(1)}><ArrowIcon direction="right" /></button>
            </div>}
          </div>
        </div>
        {products.length > 0 ? (
          <div className="verified-carousel">
            <div id="verified-featured-track" ref={carousel.trackRef} className="verified-product-grid verified-carousel-track" onScroll={carousel.measure}>
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} region={region} imageLoading={index < 2 ? "eager" : "lazy"} badge={bestsellers.has(product.id) ? "Bestsellers" : undefined} />
              ))}
            </div>
            {carousel.scrollable && <div className="verified-carousel-progress" aria-hidden="true">
              <span style={{ width: `${carousel.thumb * 100}%`, transform: `translateX(${(carousel.offset / carousel.thumb) * 100}%)` }} />
            </div>}
          </div>
        ) : isPending ? (
          <div className="verified-product-skeleton" aria-label="Loading featured products">
            {Array.from({ length: 4 }).map((_, index) => <span key={index} />)}
          </div>
        ) : (
          <div className="verified-featured-empty" role="status">
            <p>{isError ? "Featured products are temporarily unavailable." : "Explore the full research catalog."}</p>
            {isError && <button type="button" className="verified-button" onClick={() => void refetch()}>Try again</button>}
            <Link to="/collections/all">Browse all products</Link>
          </div>
        )}
      </section>

      <section id="verified-quality" className="verified-quality">
        <div className="verified-quality-copy">
          <h2>Purity meets <em>endotoxin control</em></h2>
          <p>Every batch is tested and documented to support cleaner, more consistent research inputs.</p>
          <dl>
            <div><dt>99.2<sup>%</sup></dt><dd>Average purity</dd></div>
            <div><dt>15,000<sup>+</sup></dt><dd>Orders shipped</dd></div>
            <div><dt>50<sup>+</sup></dt><dd>Compounds in catalog</dd></div>
            <div><dt>24<sup>hrs</sup></dt><dd>Order to dispatch</dd></div>
          </dl>
        </div>
        <img className="verified-quality-art" src="/images/themes/verified/purity-desktop-artwork.webp" alt="Hands holding a Bluum research vial behind frosted glass" width="1246" height="1155" loading="lazy" decoding="async" />
        <img className="verified-quality-mobile-art" src="/images/themes/verified/purity-mobile-artwork.webp" alt="Hands holding a Bluum research vial" loading="lazy" />
      </section>

      <section id="verified-approach" className="verified-section verified-approach">
        <div className="verified-approach-intro">
          <span>Our Approach</span>
          <h2>What make us <em>different</em></h2>
          <Link to="/pages/about-us" className="verified-button">Explore the Science</Link>
        </div>
        <Accordion.Root type="single" collapsible defaultValue="Every lot tested" className="verified-approach-list">
          {approach.map(([title, description], index) => (
            <Accordion.Item key={title} value={title}>
              <Accordion.Header>
                <Accordion.Trigger><img src={`/images/themes/verified/approach-icons/${approachIcons[index]}.svg`} alt="" loading="lazy" decoding="async" /><span>{title}</span><span className="verified-accordion-symbol" aria-hidden="true" /></Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content><div className="verified-accordion-body">{description}</div></Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
        <picture className="verified-approach-artwork">
          <source media="(max-width: 699px)" srcSet="/images/themes/verified/approach-molecule-mobile.webp" />
          <img className="verified-molecule" src="/images/themes/verified/approach-molecule.webp" alt="" loading="lazy" />
        </picture>
      </section>

      <section id="verified-proof" className="verified-proof">
        <div>
          <h2>Scan the Label.<br /><em>See the Proof.</em></h2>
          <div className="verified-proof-badges">
            <span><img src="/images/themes/verified/proof-lab.svg" alt="" loading="lazy" decoding="async" />Endotoxin Lab Tested</span>
            <span><img src="/images/themes/verified/proof-purity.svg" alt="" loading="lazy" decoding="async" />99% purity of formulas</span>
          </div>
          <p>Each Bluum product label carries a unique QR code. Scan it to pull up the batch-specific Certificate of Analysis for the exact lot in your hand. No account, no email gate, no waiting.</p>
          <Link to="/pages/coa-lookup" className="verified-button">Check the COA</Link>
        </div>
        <img className="verified-proof-phone" src="/images/themes/verified/proof-phone.webp" alt="Bluum vial QR code displayed inside a phone scanner" loading="lazy" />
      </section>

      <VerifiedCategories region={region} catalogProducts={data?.pages.flatMap((page) => page.products) || []} catalogPending={isPending} catalogError={isError} retryCatalog={() => void refetch()} />

      <section className="verified-section verified-comparison" aria-labelledby="verified-comparison-heading">
        <h2 id="verified-comparison-heading">How <img className="verified-inline-logo" src="/images/bluum.svg" alt="Bluum" /> compares</h2>
        <div className="verified-comparison-scroll">
          <table className="verified-comparison-table">
            <caption className="sr-only">Bluum product comparison</caption>
            <colgroup>
              <col className="verified-comparison-feature-col" />
              <col className="verified-comparison-bluum-col" />
              <col className="verified-comparison-vendor-col" />
              <col className="verified-comparison-general-col" />
            </colgroup>
            <thead>
              <tr className="verified-comparison-head">
                <th scope="col"><span className="sr-only">Feature</span></th>
                <th scope="col"><div><div className="verified-comparison-art-slot"><img className="verified-comparison-art verified-comparison-art--bluum" src="/images/themes/verified/comparison-bluum.webp" alt="" loading="lazy" decoding="async" /></div><img className="verified-comparison-logo" src="/images/bluum.svg" alt="Bluum" /></div></th>
                <th scope="col"><div><div className="verified-comparison-art-slot"><img className="verified-comparison-art verified-comparison-art--vial" src="/images/themes/verified/comparison-vial.webp" alt="" loading="lazy" decoding="async" /></div><span>Other peptide vendors</span></div></th>
                <th scope="col"><div><div className="verified-comparison-art-slot"><img className="verified-comparison-art verified-comparison-art--microscope" src="/images/themes/verified/comparison-microscope.webp" alt="" loading="lazy" decoding="async" /></div><span>General research vendors</span></div></th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(([label, bluum, vendor, general], index) => (
                <tr key={`${index}-${label}`}><th scope="row">{label}</th><td><Check value={bluum} highlighted /></td><td><Check value={vendor} /></td><td><Check value={general} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <hr className="verified-section-rule" />
      <VerifiedQuestions />

      <hr className="verified-section-rule" />
      <VerifiedSupport />
    </div>
  )
}
