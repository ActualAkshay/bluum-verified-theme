import type { ReactNode } from "react"
type HighlightContent = { heading?: string; emphasis?: string; points?: string[]; image_url?: string }
type CurrentLot = { lot: string; purity?: string; url: string; endotoxin?: boolean }

const text = (value: unknown): string => typeof value === "string" ? value.trim() : ""
const safeImage = (value: unknown) => {
  const url = text(value)
  return /^(https:\/\/|\/(?!\/))/.test(url) ? url : ""
}

/** Product-authored content wins. Never reuse one compound's research claims on another. */
export const resolveHighlightContent = (handle: string, metadata: Record<string, unknown>, researchHtml: string) => {
  const native = (metadata.product_highlights || {}) as HighlightContent
  const supplied = Array.isArray(native.points) ? native.points.map(text).filter(Boolean).slice(0, 4) : []
  const researchHeadings = [...researchHtml.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi)]
    .map((match) => match[1].replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim())
    .filter(Boolean).slice(0, 4)
  const design = handle === "5-amino-1mq"
  return {
    heading: text(native.heading) || (design ? "Targeting NNMT" : "Exploring"),
    emphasis: text(native.emphasis) || (design ? "pathways" : "the research"),
    points: supplied.length ? supplied : design ? ["Studying targeted NNMT inhibition", "Investigating NAD+ related processes", "Helps examine methylation demand", "Supports research into cellular metabolism"] : researchHeadings,
    image: safeImage(native.image_url) || "/images/themes/verified/product-highlights-vial.png",
  }
}

const icons = ["/images/themes/verified/approach-icons/workspace_premium.svg", "/images/themes/verified/science-genetics.svg", "/images/themes/verified/product-highlight-experiment.svg", "/images/themes/verified/approach-icons/qr_code_2.svg", "/images/themes/verified/product-highlight-dropper.svg", "/images/themes/verified/product-highlight-hematology.svg"]

export const VerifiedProductHighlights = ({ title, handle, metadata, researchHtml, currentLot }: {
  title: string; handle: string; metadata: Record<string, unknown>; researchHtml: string; currentLot?: CurrentLot
}) => {
  const content = resolveHighlightContent(handle, metadata, researchHtml)
  const item = (label: string, index: number, href?: string) => (
    <li key={index} className={`verified-product-highlight verified-product-highlight--${index}`}>
      <img src={icons[index]} alt="" width="24" height="24" loading="lazy" />
      {href ? <a href={href} target="_blank" rel="noreferrer" aria-label={currentLot ? `${label} — lot ${currentLot.lot}` : label}>{label}</a> : <span>{label}</span>}
    </li>
  )
  return <section data-product-section="highlights" className="verified-product-highlights" aria-label={`About ${title}`}>
    <header><p>About {title}</p><h2>{content.heading} <em>{content.emphasis}</em></h2></header>
    <div className="verified-product-highlights__grid">
      <ul className="verified-product-highlights__left">
        {item(currentLot?.purity ? `Supplied at ${currentLot.purity} purity` : "Current-lot purity unavailable", 0, currentLot?.purity ? currentLot.url : undefined)}
        {content.points.slice(0, 2).map((point, index) => item(point, index + 1))}
      </ul>
      <img className="verified-product-highlights__art" src={content.image} alt="Bluum research vial with flower petals" width="1086" height="1448" loading="lazy" decoding="async" />
      <ul className="verified-product-highlights__right">
        {item(currentLot ? "Batch-specific data you can verify" : "Browse available batch reports", 3, currentLot?.url || `/pages/coa-lookup?compound=${encodeURIComponent(handle)}`)}
        {content.points.slice(2, 4).map((point, index) => item(point, index + 4))}
      </ul>
    </div>
  </section>
}

const proofIcon = (path: string) => <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>
const shieldIcon = proofIcon("M12 3.25 5.25 5.9v5.35c0 4.2 2.85 7.75 6.75 9 3.9-1.25 6.75-4.8 6.75-9V5.9L12 3.25ZM8.9 12.05l2.15 2.15 4.1-4.2")
const microscopeIcon = proofIcon("M6 20h12M8 17h8M12 17v-3M9.5 4.5l3 1.5-3 6-3-1.5 3-6ZM12.5 9.5a4.5 4.5 0 0 1 2.5 8")
const qrIcon = proofIcon("M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2M14 18h2v2M18 18h2v2")

/** Figma PDP gallery proof tiles. Every claim comes from the selected variant's current lot. */
export const VerifiedProofTiles = ({ currentLot }: { currentLot?: CurrentLot }) => {
  const purity = currentLot?.purity
  const proof = [
    purity && { label: `${purity} verified purity`, icon: shieldIcon },
    currentLot?.endotoxin && { label: "Endotoxin screened", icon: microscopeIcon },
    { label: "QR-linked COA", icon: qrIcon },
  ].filter(Boolean) as { label: string; icon: ReactNode }[]
  return <div className="verified-proof-tiles" aria-label="Batch documentation">
    <figure className="verified-proof-tile verified-proof-tile--purity">
      <img src="/images/themes/verified/pdp-proof-purity.webp" alt="" width="574" height="574" loading="lazy" decoding="async" />
      <figcaption>{purity ? <>{purity}<br />verified purity</> : <>Third-party<br />tested</>}</figcaption>
    </figure>
    <figure className="verified-proof-tile verified-proof-tile--match">
      <img src="/images/themes/verified/pdp-proof-match.webp" alt="" width="574" height="574" loading="lazy" decoding="async" />
      <figcaption><strong>Proof to match</strong><ul>{proof.map((item) => <li key={item.label}><span>{item.icon}</span>{item.label}</li>)}</ul></figcaption>
    </figure>
    <figure className="verified-proof-tile verified-proof-tile--data">
      <img src="/images/themes/verified/pdp-proof-data.webp" alt="" width="574" height="574" loading="lazy" decoding="async" />
      <figcaption><strong>Verified by data</strong><span>{purity ? `${purity} purity. ` : ""}Batch-specific documentation.</span></figcaption>
    </figure>
    <figure className="verified-proof-tile">
      <img src="/images/themes/verified/pdp-proof-lab.webp" alt="" width="574" height="574" loading="lazy" decoding="async" />
    </figure>
  </div>
}
