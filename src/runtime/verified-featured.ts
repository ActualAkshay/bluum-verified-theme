import type { HttpTypes } from "@medusajs/types"

/** Merchandising fallback only; live Medusa unit-sales rankings take priority. */
export const VERIFIED_FEATURED_FALLBACK_HANDLES = [
  "tb-500", "selank", "melanotan-ii", "semax", "ipamorelin", "sermorelin", "igf-1-lr3",
] as const

export const VERIFIED_FEATURED_LOOKBACK_DAYS = 90
/** Featured carousel length and the size of the "Bestsellers" ranking. */
export const VERIFIED_FEATURED_LIMIT = 8

export function featuredLookbackDays(value: unknown): number {
  const days = Number(value)
  return Number.isInteger(days) && days >= 1 && days <= 365 ? days : VERIFIED_FEATURED_LOOKBACK_DAYS
}

/** Backorder permission isn't physical stock. Missing stock data fails closed. */
export function isFeaturedProductInStock(product: HttpTypes.StoreProduct): boolean {
  return Boolean(product.id && product.handle && product.title) && (product.variants || []).some((variant) =>
    variant.manage_inventory === false ||
    (variant.manage_inventory === true && typeof variant.inventory_quantity === "number" && variant.inventory_quantity > 0),
  )
}

export function selectVerifiedFeaturedProducts(
  products: HttpTypes.StoreProduct[],
  rankedIds: readonly string[],
  limit = VERIFIED_FEATURED_LIMIT,
  fallbackHandles: readonly string[] = VERIFIED_FEATURED_FALLBACK_HANDLES,
): HttpTypes.StoreProduct[] {
  const available = products.filter(isFeaturedProductInStock)
  const byId = new Map(available.map((product) => [product.id, product]))
  const byHandle = new Map(available.map((product) => [product.handle, product]))
  const selected = new Map<string, HttpTypes.StoreProduct>()
  for (const product of [
    ...rankedIds.map((id) => byId.get(id)),
    ...fallbackHandles.map((handle) => byHandle.get(handle)),
  ]) {
    if (product) selected.set(product.id, product)
  }
  return Array.from(selected.values()).slice(0, Math.max(0, limit))
}

/** Only live unit-sales rankings earn the badge; curated fallbacks never do. */
export function verifiedBestsellerIds(rankedIds: readonly string[], count = VERIFIED_FEATURED_LIMIT): Set<string> {
  return new Set(rankedIds.slice(0, Math.max(0, count)))
}
