export type VerifiedCatalogCategory = "all" | "best-sellers" | "blends" | "solutions"
export type VerifiedCatalogSort = "title-asc" | "title-desc" | "price-asc" | "price-desc"
export type VerifiedPriceRange = { id: string; label: string; min: number; max: number }

type PricedProduct = {
  title?: string | null
  variants?: Array<{
    calculated_price?: { calculated_amount?: number | null; currency_code?: string | null } | null
  }> | null
}

/** Medusa v2 calculated amounts are in currency units, not cents. */
export function verifiedStartingPrice(product: PricedProduct, currencyCode: string): number | null {
  const amounts = (product.variants || []).flatMap(({ calculated_price: price }) =>
    typeof price?.calculated_amount === "number" &&
    Number.isFinite(price.calculated_amount) && price.calculated_amount >= 0 &&
    price.currency_code?.toLowerCase() === currencyCode.toLowerCase()
      ? [price.calculated_amount]
      : [],
  )
  return amounts.length ? Math.min(...amounts) : null
}

export function verifiedPriceRanges(currencyCode: string): VerifiedPriceRange[] {
  if (!currencyCode) return []
  const step = currencyCode.toLowerCase() === "gbp" ? 40 : currencyCode.toLowerCase() === "dkk" ? 350 : 50
  const format = (amount: number) => new Intl.NumberFormat(undefined, {
    style: "currency", currency: currencyCode, maximumFractionDigits: 0,
  }).format(amount)
  return [
    { id: "low", label: `Under ${format(step)}`, min: 0, max: step },
    { id: "mid", label: `${format(step)} – under ${format(step * 2)}`, min: step, max: step * 2 },
    { id: "high", label: `${format(step * 2)} and above`, min: step * 2, max: Infinity },
  ]
}

export function matchesVerifiedPrice(product: PricedProduct, currencyCode: string, range?: VerifiedPriceRange) {
  if (!range) return true
  const price = verifiedStartingPrice(product, currencyCode)
  return price !== null && price >= range.min && price < range.max
}

export function sortVerifiedProducts<T extends PricedProduct>(products: T[], sort: VerifiedCatalogSort, currencyCode: string): T[] {
  return [...products].sort((a, b) => {
    const byTitle = (a.title || "").localeCompare(b.title || "")
    if (sort === "title-asc") return byTitle
    if (sort === "title-desc") return -byTitle
    const aPrice = verifiedStartingPrice(a, currencyCode)
    const bPrice = verifiedStartingPrice(b, currencyCode)
    // Unpriced items must never appear cheapest or hide priced products.
    if (aPrice === null) return bPrice === null ? byTitle : 1
    if (bPrice === null) return -1
    return (sort === "price-asc" ? aPrice - bPrice : bPrice - aPrice) || byTitle
  })
}
