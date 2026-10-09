import * as Accordion from "@radix-ui/react-accordion"
import { Link } from "@tanstack/react-router"
import { VerifiedSupport } from "./verified-support"

const standards = [
  { title: "Rigorous Testing", body: "Every batch is evaluated for purity, identity before release.", image: "/images/themes/verified/science-card-testing.webp" },
  { title: "Transparent Data", body: "Batch-specific documentation and COAs make verification simple.", image: "/images/themes/verified/science-card-transparency.webp" },
  { title: "Research Integrity", body: "We prioritize standards that support reliable laboratory work.", image: "/images/themes/verified/science-card-integrity.webp" },
  { title: "USA Quality Control", body: "Compounds are sourced and lyophilized in the USA.", image: "/images/themes/verified/science-card-usa.webp" },
] as const

const trust = [
  ["Quality Controlled", "/images/themes/verified/science-fact_check.webp"],
  ["Endotoxin Lab Tested", "/images/themes/verified/science-genetics.svg"],
  ["Batch & Lot Tracking", "/images/themes/verified/science-qr_code_2.webp"],
] as const

const process = [
  {
    title: "Selective Sourcing",
    body: "Raw peptide materials are sourced from FDA-registered, green-listed suppliers, then verified and third-party tested on receipt. Every lot is traceable from raw material to finished vial.",
    image: "/images/themes/verified/science-process-source.webp",
  },
  {
    title: "Lyophilization",
    body: "Controlled freeze-drying supports stable research material and consistent handling from production through dispatch.",
    image: "/images/themes/verified/science-process-lyophilization.webp",
  },
  {
    title: "Fill-Finish",
    body: "Lot-controlled filling and labeling keep product identity connected to the records researchers need.",
    image: "/images/themes/verified/science-process-fill.webp",
  },
  {
    title: "Secure Packaging & Shipping",
    body: "Protective packaging and tracked U.S. fulfillment help preserve the chain of custody through delivery.",
    image: "/images/themes/verified/science-process-shipping.webp",
  },
  {
    title: "Formulation & Purification",
    body: "Purification and formulation decisions are documented so laboratories can evaluate the material behind the headline purity number.",
    image: "/images/themes/verified/science-process-formulation.webp",
  },
] as const

const questions = [
  ["How is product purity verified?", "Review the batch-specific Certificate of Analysis for the analytical testing available for your lot, including chromatographic purity and identity results. Products are supplied for laboratory research only, not for human or veterinary use."],
  ["How do I access the COA?", "Scan the QR code on your vial or open Lab Reports and search using the product or lot number. Select the matching batch to review its available laboratory documents."],
  ["Are products endotoxin tested?", "Endotoxin screening is part of our quality controls. Check the report for your exact batch to see the available test results and supporting laboratory documentation."],
  ["When will my order ship?", "Dispatch depends on stock availability and order processing. Review our Shipping Policy for current terms, and use the tracking information provided when your order ships."],
  ["Are your products sourced in the USA?", "Compounds are sourced and lyophilized in the USA and shipped domestically with tracking. Batch-specific records connect each vial to the documentation available for that lot."],
  ["Can I speak with someone about my order?", "Yes. Contact our support team with your order number for help with an existing order, shipping, or finding documentation for your lot."],
] as const

export const VerifiedQuestions = () => (
  <section className="science-v2-faq verified-section" aria-labelledby="science-v2-faq-title">
    <div className="science-v2-faq-intro"><h2 id="science-v2-faq-title">Questions,<br /><em>answered</em></h2><img src="/images/themes/verified/science-faq-molecule.webp" width="426" height="426" alt="" loading="lazy" /></div>
    <Accordion.Root type="single" collapsible className="science-v2-faq-list">
      {questions.map(([question, answer]) => (
        <Accordion.Item key={question} value={question} className="science-v2-faq-item">
          <Accordion.Header><Accordion.Trigger><span>{question}</span><span className="science-v2-accordion-indicator" aria-hidden="true">+</span></Accordion.Trigger></Accordion.Header>
          <Accordion.Content><p>{answer}</p></Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  </section>
)

export const VerifiedScience = () => (
  <main className="verified-secondary-page verified-science-page science-v2-page" data-theme-page="science">
    <section className="science-v2-hero" aria-labelledby="science-v2-title">
      <picture className="science-v2-hero-art">
        <source media="(max-width: 699px)" srcSet="/images/themes/verified/science-hero-mobile.webp" />
        <img src="/images/themes/verified/science-hero-desktop.webp" alt="" fetchPriority="high" />
      </picture>
      <div className="science-v2-hero-copy">
        <p className="verified-eyebrow">Research-Grade Compounds</p>
        <h1 id="science-v2-title">Science you<span className="science-v2-desktop-break"><br /></span>{" "}can<span className="science-v2-mobile-break"><br /></span>{" "}<em>verify</em></h1>
        <p>Bluum is built around one simple standard: every compound should come with clear proof.</p>
      </div>
    </section>

    <section className="science-v2-standards verified-section" aria-label="Our research standards" tabIndex={0}>
      {standards.map((standard) => (
        <article className="science-v2-standard" key={standard.title}>
          <img src={standard.image} alt="" loading="lazy" />
          <div><h2>{standard.title}</h2><p>{standard.body}</p></div>
        </article>
      ))}
    </section>

    <section className="science-v2-statement verified-section" aria-labelledby="science-v2-statement-title">
      <h2 id="science-v2-statement-title">We combine rigorous analytical testing, batch-specific documentation, endotoxin screening, and transparent COA access to give researchers <em>greater confidence in every vial.</em></h2>
      <ul className="science-v2-trust">
        {trust.map(([label, image]) => <li key={label}><img src={image} alt="" loading="lazy" /><span>{label}</span></li>)}
      </ul>
    </section>

    <section className="science-v2-numbers" aria-labelledby="science-v2-numbers-title">
      <picture className="science-v2-numbers-art">
        <source media="(max-width: 699px)" srcSet="/images/themes/verified/science-numbers-mobile.webp" />
        <img src="/images/themes/verified/science-numbers-desktop.png" alt="" loading="lazy" />
      </picture>
      <div className="science-v2-numbers-intro">
        <h2 id="science-v2-numbers-title">Proof behind<br /><em>every compound</em></h2>
        <article className="science-v2-product-callout">
          <img src="/images/themes/verified/science-vial.png" alt="Bluum research peptide vial" loading="lazy" />
          <div><h3>Research-grade Peptides</h3><p>Tested, documented, research only.</p></div>
          <Link to="/collections/all" className="verified-button">Shop Now</Link>
        </article>
      </div>
      <div className="science-v2-stats">
        <p className="verified-eyebrow">Bluum by the Numbers</p>
        <dl>
          <div><dt>99.2<sup>%</sup></dt><dd>Average verified purity across tested compounds</dd></div>
          <div><dt>50<sup>+</sup></dt><dd>Compounds across multiple peptide and research categories</dd></div>
          <div><dt>15,000<sup>+</sup></dt><dd>Orders delivered to research customers nationwide</dd></div>
        </dl>
      </div>
    </section>

    <section className="science-v2-process verified-section" aria-labelledby="science-v2-process-title">
      <div className="science-v2-process-heading"><p className="verified-eyebrow">Bluum Workflow</p><h2 id="science-v2-process-title">Our quality <em>process</em></h2></div>
      <Accordion.Root type="single" collapsible defaultValue={process[0].title} className="science-v2-process-list">
        {process.map((step) => (
          <Accordion.Item key={step.title} value={step.title} className="science-v2-process-item">
            <Accordion.Header>
              <Accordion.Trigger>
                <img className="science-v2-process-illustration" src={step.image} alt="" loading="lazy" />
                <span>{step.title}</span><span className="science-v2-accordion-indicator" aria-hidden="true">+</span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content><div className="science-v2-process-detail"><p>{step.body}</p></div></Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>

    <section className="science-v2-usa" aria-labelledby="science-v2-usa-title">
      <picture className="science-v2-usa-art">
        <source media="(max-width: 699px)" srcSet="/images/themes/verified/science-usa-mobile.webp" />
        <img src="/images/themes/verified/science-usa-desktop.webp" alt="" loading="lazy" />
      </picture>
      <div className="science-v2-usa-copy">
        <h2 id="science-v2-usa-title">Sourced and Lyophilised<br /><em>in the USA</em></h2>
        <p>Each compound is lyophilised in the USA into a stable, research-ready powder, then shipped domestically with full tracking.</p>
        <Link to="/collections/all" className="verified-button">Shop Peptides</Link>
      </div>
    </section>

    <section className="science-v2-proof verified-section" aria-labelledby="science-v2-proof-title">
      <div className="science-v2-proof-copy">
        <h2 id="science-v2-proof-title">Scan the Label.<br /><em>See the Proof.</em></h2>
        <div className="science-v2-proof-badges">
          <span><img src="/images/themes/verified/approach-icons/globe_location_pin.svg" alt="" />USA Lyophilized</span>
          <span><img src="/images/themes/verified/approach-icons/qr_code_2.svg" alt="" />COA Available</span>
        </div>
        <p>Each Bluum product label carries a unique QR code. Scan it to pull up the batch-specific Certificate of Analysis for the exact lot in your hand. No account, no email gate, no waiting.</p>
        <Link to="/pages/coa-lookup" className="verified-button">Check the COA</Link>
      </div>
      <img className="science-v2-proof-art" src="/images/themes/verified/science-proof-panel.png" width="780" height="668" alt="Bluum vial QR code displayed inside a phone scanner" loading="lazy" />
    </section>

    <VerifiedQuestions />

    <VerifiedSupport />
  </main>
)
