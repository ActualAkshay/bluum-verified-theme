type HighlightContent = { heading?: string; emphasis?: string; points?: string[]; image_url?: string }
type CurrentLot = { lot: string; purity?: string; url: string }

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

const icons = ["/images/themes/verified/approach-icons/workspace_premium.svg", "/images/themes/verified/science-genetics.png", "/images/themes/verified/product-highlight-experiment.png", "/images/themes/verified/approach-icons/qr_code_2.svg", "/images/themes/verified/product-highlight-dropper.png", "/images/themes/verified/product-highlight-hematology.png"]

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
