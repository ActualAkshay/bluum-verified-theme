import * as Accordion from "@radix-ui/react-accordion"
import { Link } from "@tanstack/react-router"

const principles = [
  {
    title: "Identity",
    body: "Mass-spectrometry evidence connects the compound in the vial to its documented molecular identity.",
    image: "/images/storefront/next-generation-compounds.png",
  },
  {
    title: "Purity",
    body: "Independent chromatography makes purity visible at the lot level instead of relying on a catalog-wide claim.",
    image: "/images/storefront/verified-purity.jpg",
  },
  {
    title: "Traceability",
    body: "A lot number links every vial to the reports available for that exact production batch.",
    image: "/images/storefront/home-hero-mobile.png",
  },
] as const

const process = [
  ["Selective Sourcing", "We work with qualified partners and review material against documented identity, purity, and handling standards before it reaches the catalog."],
  ["Lyophilisation", "Controlled freeze-drying supports stable research material and consistent handling from production through dispatch."],
  ["Fill + Finish", "Lot-controlled filling and labeling keep product identity connected to the records researchers need."],
  ["Secure Packaging & Shipping", "Protective packaging and tracked U.S. fulfillment help preserve the chain of custody through delivery."],
  ["Formulation & Purification", "Purification and formulation decisions are documented so laboratories can evaluate the material behind the headline purity number."],
] as const

const questions = [
  ["What does a certificate of analysis show?", "A CoA records the tests available for a specific lot. Depending on the compound, that can include identity, chromatographic purity, endotoxin screening, and supporting laboratory files."],
  ["Why is lot-level documentation important?", "A report is meaningful only when it can be connected to the batch in hand. Bluum keeps the lot number visible on the vial and searchable in Lab Reports."],
  ["Are these products intended for people or animals?", "No. Bluum products are supplied strictly for laboratory research and analytical use. They are not for human or veterinary use."],
] as const

export const VerifiedScience = () => (
  <main className="verified-secondary-page verified-science-page" data-theme-page="science">
    <section className="verified-science-hero">
      <div>
        <p className="verified-eyebrow">The science behind Bluum</p>
        <h1>Science you can <em>verify</em></h1>
        <p>Research inputs are only as useful as the evidence behind them. Bluum connects each available batch to the documentation laboratories need to evaluate identity, purity, and consistency.</p>
        <Link to="/pages/coa-lookup" className="verified-button">View Lab Reports</Link>
      </div>
      <img src="/images/storefront/verified-purity.jpg" alt="Research professional inspecting a Bluum vial" />
    </section>

    <section className="verified-section verified-science-principles" aria-labelledby="science-principles-title">
      <div className="verified-science-heading">
        <p className="verified-eyebrow">Evidence first</p>
        <h2 id="science-principles-title">Built for <em>repeatable research</em></h2>
        <p>Three connected controls make the product easier to assess before it enters a laboratory workflow.</p>
      </div>
      <div className="verified-science-card-grid">
        {principles.map((principle) => (
          <article key={principle.title}>
            <img src={principle.image} alt="" loading="lazy" />
            <div><h3>{principle.title}</h3><p>{principle.body}</p></div>
          </article>
        ))}
      </div>
    </section>

    <section className="verified-science-biology">
      <img src="/images/storefront/next-generation-compounds.png" alt="Bluum research products arranged for laboratory evaluation" loading="lazy" />
      <div>
        <p className="verified-eyebrow">Product biology</p>
        <h2>Measured beyond the <em>label</em></h2>
        <p>Purity alone does not establish identity, and a catalog image cannot establish either. Our reporting model keeps analytical evidence attached to the lot so researchers can review what was tested, when it was tested, and which vial the result represents.</p>
        <dl>
          <div><dt>100%</dt><dd>lot-linked report model</dd></div>
          <div><dt>99%+</dt><dd>purity across most products</dd></div>
          <div><dt>USA</dt><dd>lyophilized and fulfilled</dd></div>
        </dl>
      </div>
    </section>

    <section className="verified-section verified-science-process" aria-labelledby="quality-process-title">
      <div>
        <p className="verified-eyebrow">From source to shipment</p>
        <h2 id="quality-process-title">Our quality <em>process</em></h2>
      </div>
      <Accordion.Root type="single" collapsible defaultValue={process[0][0]} className="verified-science-process-list">
        {process.map(([title, body]) => (
          <Accordion.Item key={title} value={title}>
            <Accordion.Trigger><span>{title}</span><span aria-hidden="true">+</span></Accordion.Trigger>
            <Accordion.Content><p>{body}</p></Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>

    <section className="verified-science-made-in-usa">
      <img src="/images/storefront/fast-usa-shipping.jpg" alt="Bluum vial prepared for U.S. fulfillment" loading="lazy" />
      <div>
        <h2>Sourced and Lyophilised<br /><em>in the USA</em></h2>
        <Link to="/collections/all" className="verified-button">Shop Peptides</Link>
      </div>
    </section>

    <section className="verified-science-proof">
      <div>
        <p className="verified-eyebrow">Lot-level transparency</p>
        <h2>Scan the Label.<br /><em>See the Proof.</em></h2>
        <p>Find the lot number on your vial, then use Lab Reports to retrieve the documents available for that batch.</p>
        <Link to="/pages/coa-lookup" className="verified-button">Check the CoA</Link>
      </div>
      <img src="/images/storefront/home-hero-mobile.png" alt="Bluum vial with a lot label used to retrieve laboratory reports" loading="lazy" />
    </section>

    <section className="verified-section verified-science-questions">
      <h2>Questions,<br /><em>answered</em></h2>
      <Accordion.Root type="single" collapsible className="verified-faq-list">
        {questions.map(([question, answer]) => (
          <Accordion.Item key={question} value={question}>
            <Accordion.Trigger><span>{question}</span><span aria-hidden="true">+</span></Accordion.Trigger>
            <Accordion.Content>{answer}</Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>

    <section className="verified-support">
      <div><h2>Need help? Our<br />team is here.</h2><p>Get support with product documentation, lot lookup, or an existing order.</p><Link to="/pages/contact" className="verified-button">Contact Us</Link></div>
      <div className="verified-chat" aria-label="Example customer support conversation"><span>I need the report for my lot</span><span>We can help you find it.</span><span>Send us the lot number on your vial</span></div>
    </section>
  </main>
)
