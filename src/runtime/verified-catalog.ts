export type VerifiedCatalogCategory = string[]
export type VerifiedCategoryOption = { id: string; name: string; count: number }
type CategorizedProduct = { id?: string; categories?: Array<{ id?: string; name?: string; handle?: string }> | null }

/** Use actual catalog memberships, never guesses based on product names. */
export function verifiedCatalogCategories(products: CategorizedProduct[]): VerifiedCategoryOption[] {
  const categories = new Map<string, VerifiedCategoryOption>()
  const memberships = new Map<string, Set<string | CategorizedProduct>>()
  for (const product of products) {
    for (const category of product.categories || []) {
      const id = category.id?.trim()
      const name = category.name?.trim()
      const generic = [name, category.handle].some((value) => /^(all|all products|frontpage)$/i.test(value?.trim() || ""))
      if (id && name && !generic) {
        const members = memberships.get(id) || new Set<string | CategorizedProduct>()
        members.add(product.id || product)
        memberships.set(id, members)
        categories.set(id, { id, name, count: members.size })
      }
    }
  }
  return [...categories.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function matchesVerifiedCategory(product: CategorizedProduct, categories: string[]): boolean {
  return categories.length === 0 || Boolean(product.categories?.some(({ id }) => id && categories.includes(id)))
}
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
