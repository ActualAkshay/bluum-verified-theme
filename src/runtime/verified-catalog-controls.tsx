import type { VerifiedCatalogCategory, VerifiedCatalogSort, VerifiedPriceRange } from "./verified-catalog"

type Props = {
  category: VerifiedCatalogCategory
  onCategoryChange: (value: VerifiedCatalogCategory) => void
  priceRange: string
  priceRanges: VerifiedPriceRange[]
  onPriceRangeChange: (value: string) => void
  sort: VerifiedCatalogSort
  onSortChange: (value: VerifiedCatalogSort) => void
  search: string
  onSearchChange: (value: string) => void
  count: number
  loading: boolean
}

export function VerifiedCatalogControls(props: Props) {
  return (
    <div className="verified-catalog-controls mb-9 grid gap-5">
      <label className="verified-catalog-search grid gap-2 max-w-md">
        <span className="sr-only">Search compounds</span>
        <input type="search" value={props.search} onChange={(event) => props.onSearchChange(event.target.value)} placeholder="Search compounds" className="min-h-11 w-full rounded-full border border-bluum-charcoal/20 bg-transparent px-5 outline-offset-4" />
      </label>
      <div className="verified-catalog-controls__filters flex flex-wrap items-end gap-x-8 gap-y-4">
        <label className="verified-catalog-control grid min-w-0 gap-1">
          <span className="text-sm">Category</span>
          <select value={props.category} onChange={(event) => props.onCategoryChange(event.target.value as VerifiedCatalogCategory)} className="min-h-11 max-w-full border-b border-bluum-charcoal/30 bg-transparent pr-8 outline-offset-4">
            <option value="all">All products</option>
            <option value="best-sellers">Best sellers</option>
            <option value="blends">Blends</option>
            <option value="solutions">Solutions</option>
          </select>
        </label>
        <label className="verified-catalog-control grid min-w-0 gap-1">
          <span className="text-sm">Starting price</span>
          <select value={props.priceRange} onChange={(event) => props.onPriceRangeChange(event.target.value)} className="min-h-11 max-w-full border-b border-bluum-charcoal/30 bg-transparent pr-8 outline-offset-4">
            <option value="all">All prices</option>
            {props.priceRanges.map((range) => <option key={range.id} value={range.id}>{range.label}</option>)}
          </select>
        </label>
        <label className="verified-catalog-control verified-catalog-control--sort grid min-w-0 gap-1 sm:ml-auto">
          <span className="text-sm">Sort by</span>
          <select value={props.sort} onChange={(event) => props.onSortChange(event.target.value as VerifiedCatalogSort)} className="min-h-11 max-w-full border-b border-bluum-charcoal/30 bg-transparent pr-8 outline-offset-4">
            <option value="title-asc">Name: A–Z</option>
            <option value="title-desc">Name: Z–A</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>
      <p className="verified-catalog-count text-sm text-bluum-charcoal/65" role="status" aria-live="polite">{props.count} {props.count === 1 ? "product" : "products"}{props.loading ? " · Loading more…" : ""}</p>
    </div>
  )
}
