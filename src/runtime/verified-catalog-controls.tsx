import { useState } from "react"
import type { VerifiedCatalogCategory, VerifiedCatalogSort, VerifiedCategoryOption, VerifiedPriceRange } from "./verified-catalog"

type Props = {
  category: VerifiedCatalogCategory
  categories: VerifiedCategoryOption[]
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

function ControlIcon({ sort = false }: { sort?: boolean }) {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{sort ? <path d="m8 8 4-4 4 4M8 16l4 4 4-4" /> : <path d="m5 9 7 7 7-7" />}</svg>
}

export function VerifiedCatalogControls(props: Props) {
  const [searchOpen, setSearchOpen] = useState(false)
  const categoryLabel = props.categories.find(({ id }) => id === props.category)?.name || "Category"
  const priceLabel = props.priceRanges.find(({ id }) => id === props.priceRange)?.label || "Price"
  const sortLabels = { "title-asc": "Sort By", "title-desc": "Name: Z–A", "price-asc": "Price: low to high", "price-desc": "Price: high to low" }
  return (
    <div className="verified-catalog-controls">
      <div className="verified-catalog-controls__filters">
        {props.categories.length > 1 && <label className="verified-catalog-control">
          <ControlIcon /><span aria-hidden="true">{categoryLabel}</span>
          <select aria-label="Category" value={props.category} onChange={(event) => props.onCategoryChange(event.target.value)}>
            <option value="all">All products</option>
            {props.categories.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>}
        <label className="verified-catalog-control">
          <ControlIcon /><span aria-hidden="true">{priceLabel}</span>
          <select aria-label="Price" value={props.priceRange} onChange={(event) => props.onPriceRangeChange(event.target.value)}>
            <option value="all">All prices</option>
            {props.priceRanges.map((range) => <option key={range.id} value={range.id}>{range.label}</option>)}
          </select>
        </label>
        <button className="verified-catalog-search-toggle" type="button" aria-label="Search compounds" aria-expanded={searchOpen || Boolean(props.search)} aria-controls="verified-catalog-search" onClick={() => setSearchOpen(!searchOpen)}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
        </button>
        <label className="verified-catalog-control verified-catalog-control--sort">
          <ControlIcon sort /><span aria-hidden="true">{sortLabels[props.sort]}</span>
          <select aria-label="Sort by" value={props.sort} onChange={(event) => props.onSortChange(event.target.value as VerifiedCatalogSort)}>
            <option value="title-asc">Name: A–Z</option>
            <option value="title-desc">Name: Z–A</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>
      <label id="verified-catalog-search" className="verified-catalog-search" hidden={!searchOpen && !props.search}>
        <span className="sr-only">Search compounds</span>
        <input type="search" value={props.search} onChange={(event) => props.onSearchChange(event.target.value)} placeholder="Search compounds" />
      </label>
      <p className="sr-only" role="status" aria-live="polite">{props.count} {props.count === 1 ? "product" : "products"}{props.loading ? " · Loading more…" : ""}</p>
    </div>
  )
}
