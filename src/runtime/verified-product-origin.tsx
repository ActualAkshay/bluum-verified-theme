import { useId, type ReactNode } from "react"
import { Link } from "@tanstack/react-router"

// The eight proof badges, drawn as vectors so they stay sharp on 3x phone screens
// (the old 476px PNG went soft on iPhones). Labels follow each badge's arc.
const BADGES: Array<{ top: string; bottom: string; icon: ReactNode }> = [
  { top: "USA processed", bottom: "Research-ready", icon: <g><rect x="-15" y="-10" width="30" height="20" rx="1" /><path d="M-1-6.5h16M-1-3h16M-15 .5h30M-15 4h30M-15 7.5h30" /><rect x="-15" y="-10" width="14" height="10" fill="currentColor" stroke="none" opacity=".85" /></g> },
  { top: "Lot-specific data", bottom: "Every batch", icon: <g><rect x="-12" y="-12" width="9" height="9" /><rect x="3" y="-12" width="9" height="9" /><rect x="-12" y="3" width="9" height="9" /><path d="M3 3h4v4H3zM8 8h4v4H8zM8 3h4M3 12h4" /><rect x="-9.5" y="-9.5" width="4" height="4" fill="currentColor" /><rect x="5.5" y="-9.5" width="4" height="4" fill="currentColor" /><rect x="-9.5" y="5.5" width="4" height="4" fill="currentColor" /></g> },
  { top: "Compounds", bottom: "Research Catalog", icon: <text x="0" y="8" textAnchor="middle" fontSize="24" fill="currentColor" stroke="none" fontWeight="500">50+</text> },
  { top: "Heavy metals", bottom: "Lab tested", icon: <path d="M-4-13h8M-3-13v9l-9 14a2 2 0 0 0 1.7 3h20.6a2 2 0 0 0 1.7-3L3-4v-9M-7 3h14" /> },
  { top: "Quality controlled", bottom: "Before release", icon: <g><rect x="-12" y="-13" width="24" height="26" rx="2" /><path d="M-7-6h6M-7 0h6M-7 6h6M3 1l3 3 5-7" /></g> },
  { top: "Endotoxin", bottom: "Lab tested", icon: <g><circle cx="-9" cy="6" r="3" /><circle cx="0" cy="-2" r="3" /><circle cx="10" cy="-9" r="3" /><circle cx="9" cy="8" r="3" /><circle cx="-6" cy="-11" r="2.5" /><path d="M-7 4l5-4M2.5-3.8l5-3.4M2 0l5 6M-1.5-4.5l-3-4.5" /></g> },
  { top: "Same-day", bottom: "Shipping", icon: <g><path d="M0-13l12 6v14L0 13l-12-6V-7z" /><path d="M-12-7L0-1l12-6M0-1v14M-6-10l12 6" /></g> },
  { top: "Sterility tested", bottom: "Research-ready", icon: <g><path d="M-8-13h16M-5-13v21a5 5 0 0 0 10 0v-21M-5 0h10" /></g> },
]

const ProofBadges = ({ label }: { label: string }) => {
  const id = useId().replace(/:/g, "")
  return <svg className="verified-product-origin__badges" viewBox="0 0 476 247" role="img" aria-label={label} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    {BADGES.map(({ top, bottom, icon }, index) => {
      const cx = 56 + (index % 4) * 121.3
      const cy = index < 4 ? 58 : 189
      return <g key={top + bottom}>
        <circle cx={cx} cy={cy} r="53" strokeWidth="1.5" />
        <path id={`${id}t${index}`} d={`M${cx - 38} ${cy} A38 38 0 0 1 ${cx + 38} ${cy}`} stroke="none" />
        <path id={`${id}b${index}`} d={`M${cx - 46} ${cy} A46 46 0 0 0 ${cx + 46} ${cy}`} stroke="none" />
        <text fontSize="10" fill="currentColor" stroke="none" fontWeight="500" letterSpacing=".2"><textPath href={`#${id}t${index}`} startOffset="50%" textAnchor="middle">{top}</textPath></text>
        <text fontSize="10" fill="currentColor" stroke="none" fontWeight="500" letterSpacing=".2"><textPath href={`#${id}b${index}`} startOffset="50%" textAnchor="middle">{bottom}</textPath></text>
        <g transform={`translate(${cx} ${cy})`}>{icon}</g>
      </g>
    })}
  </svg>
}

/** PDP-specific Figma source-to-vial block; distinct from the Science page hero. */
export const VerifiedProductOrigin = () => <section className="verified-product-origin" aria-labelledby="verified-product-origin-title">
  <div className="verified-product-origin__copy">
    <p>From Source to Vial</p>
    <h2 id="verified-product-origin-title">Made in <em>the USA.</em><br />Verified <em>at every step.</em></h2>
    <Link to="/pages/about-us" className="verified-button">Explore the Science</Link>
  </div>
  <ProofBadges label="USA processed, lot-specific data, research catalog, heavy metals lab tested, quality controlled, endotoxin lab tested, same-day shipping, sterility tested" />
  <div className="verified-product-origin__art"><img src="/images/themes/verified/product-usa-art.png" alt="Petri dish with a plant sprig and laboratory pipette" width="665" height="570" loading="lazy" /></div>
</section>
