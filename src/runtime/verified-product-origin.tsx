import { Link } from "@tanstack/react-router"

/** PDP-specific Figma source-to-vial block; distinct from the Science page hero. */
export const VerifiedProductOrigin = () => <section className="verified-product-origin" aria-labelledby="verified-product-origin-title">
  <div className="verified-product-origin__copy">
    <p>From Source to Vial</p>
    <h2 id="verified-product-origin-title">Made in <em>the USA.</em><br />Verified <em>at every step.</em></h2>
    <Link to="/pages/about-us" className="verified-button">Explore the Science</Link>
  </div>
  <img className="verified-product-origin__badges" src="/images/themes/verified/product-usa-badges.png" alt="USA processed, lot-specific data, research catalog, heavy metals lab tested, quality controlled, endotoxin lab tested, same-day shipping, sterility tested" width="476" height="247" loading="lazy" />
  <div className="verified-product-origin__art"><img src="/images/themes/verified/product-usa-art.png" alt="Petri dish with a plant sprig and laboratory pipette" loading="lazy" /></div>
</section>
