import * as Accordion from "@radix-ui/react-accordion"
import type { HttpTypes } from "@medusajs/types"
import { Link } from "@tanstack/react-router"
import { getProductSpecificationRows } from "@/components/product/product-specifications"
import { getProductAboutContent, ProductResearchContent } from "@/components/product/product-shopify-content"
import { usePolicies } from "@/lib/hooks/use-policies"

export const VerifiedProductInformation = ({ product }: { product: HttpTypes.StoreProduct }) => {
  const rows = getProductSpecificationRows(product)
  const about = getProductAboutContent(product)
  const { data: policies } = usePolicies()
  const shipping = policies?.find((policy) => policy.handle === "shipping")
  const general = rows.filter((row) => /specification|application|appearance|chemical grade/i.test(row.label))
  const storage = rows.filter((row) => /storage|handling/i.test(row.label))
  const renderRows = (items: typeof rows) => <dl>{items.map((row, index) => <div key={`${row.label}-${index}`}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>
  const items = [
    { title: "General Information", content: general.length ? renderRows(general) : <p>{product.title} is supplied for laboratory research use only. Refer to the product label and available batch documentation for compound details.</p> },
    { title: "Description", content: <>{about.html ? <div dangerouslySetInnerHTML={{ __html: about.html }} /> : <p>{about.fallbackText || "Product description is not currently available."}</p>}<ProductResearchContent product={product} /></> },
    { title: "How do you ship?", content: <>{shipping?.body && <div dangerouslySetInnerHTML={{ __html: shipping.body }} />}<Link to="/policies/shipping-policy">View shipping policy</Link></> },
    { title: "Handling & Storage", content: storage.length ? renderRows(storage) : <p>Refer to the product label and batch documentation for handling and storage requirements. Contact us if these details are unavailable.</p> },
  ]
  return <Accordion.Root type="multiple" className="verified-product-information" aria-label="Product information">
    {items.map(({ title, content }) => <Accordion.Item key={title} value={title} className="verified-product-information__item">
      <Accordion.Header><Accordion.Trigger>{title}<span aria-hidden="true" className="verified-product-information__icon" /></Accordion.Trigger></Accordion.Header>
      <Accordion.Content><div className="verified-product-information__body">{content}</div></Accordion.Content>
    </Accordion.Item>)}
  </Accordion.Root>
}
