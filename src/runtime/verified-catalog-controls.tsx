import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import * as Accordion from "@radix-ui/react-accordion"
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

function FilterPopover({ label, text = label, children }: { label: string; text?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const id = useId()
  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent | FocusEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener("pointerdown", dismiss)
    document.addEventListener("focusin", dismiss)
    return () => {
      document.removeEventListener("pointerdown", dismiss)
      document.removeEventListener("focusin", dismiss)
    }
  }, [open])
  return <div ref={root} className="verified-filter-popover" onKeyDown={(event) => {
    if (event.key === "Escape" && open) { event.stopPropagation(); setOpen(false); trigger.current?.focus() }
  }}>
    <button ref={trigger} type="button" className="verified-catalog-control" aria-label={label} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}><ControlIcon /><span>{text}</span></button>
    {open && <div id={id} className="verified-filter-popover__content" role="group" aria-label={`${label} options`}>{children}</div>}
  </div>
}

function CategoryChoices({ categories, selected, onChange }: { categories: VerifiedCategoryOption[]; selected: string[]; onChange: (value: string[]) => void }) {
  return <div className="verified-filter-choices">{categories.map(({ id, name, count }) => <label key={id} className="verified-filter-choice">
    <input type="checkbox" checked={selected.includes(id)} onChange={() => onChange(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id])} />
    <span>{name} ({count})</span>
  </label>)}</div>
}

function PriceChoices({ ranges, selected, onChange, includeAll = true }: { ranges: VerifiedPriceRange[]; selected: string; onChange: (value: string) => void; includeAll?: boolean }) {
  const name = useId()
  return <div className="verified-filter-choices">{[...(includeAll ? [{ id: "all", label: "All prices" }] : []), ...ranges].map(({ id, label }) => <label key={id} className="verified-filter-choice">
    <input type="radio" name={name} value={id} checked={selected === id} onChange={() => onChange(id)} /><span>{label}</span>
  </label>)}</div>
}

export function VerifiedCatalogControls(props: Props) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [draftCategories, setDraftCategories] = useState<string[]>([])
  const [draftPrice, setDraftPrice] = useState("all")
  const showCategories = props.categories.length > 1
  const selected = showCategories ? props.categories.filter(({ id }) => props.category.includes(id)) : []
  const validDraft = showCategories ? draftCategories.filter((id) => props.categories.some((category) => category.id === id)) : []
  const selectedCount = selected.length + Number(props.priceRange !== "all")
  const draftCount = validDraft.length + Number(draftPrice !== "all")
  const priceLabel = props.priceRanges.find(({ id }) => id === props.priceRange)?.label || "Price"
  const sortLabels = { "title-asc": "Sort By", "title-desc": "Name: Z–A", "price-asc": "Price: low to high", "price-desc": "Price: high to low" }
  const searchId = useId()
  useEffect(() => {
    if (!mobileOpen) return
    const desktop = window.matchMedia("(min-width: 1024px)")
    const closeOnDesktop = () => { if (desktop.matches) setMobileOpen(false) }
    desktop.addEventListener("change", closeOnDesktop)
    return () => desktop.removeEventListener("change", closeOnDesktop)
  }, [mobileOpen])
  return (
    <div className="verified-catalog-controls">
      <div className="verified-catalog-controls__filters">
        <div className="verified-catalog-desktop-filters">
          {showCategories && <FilterPopover label="Category">
            {selected.length > 0 && <button className="verified-filter-clear" type="button" aria-label="Clear categories" onClick={() => props.onCategoryChange([])}>Clear</button>}
            <CategoryChoices categories={props.categories} selected={props.category} onChange={props.onCategoryChange} />
          </FilterPopover>}
          {selected.map(({ id, name, count }) => <button key={id} type="button" className="verified-filter-chip" aria-label={`Remove ${name}`} onClick={() => props.onCategoryChange(props.category.filter((value) => value !== id))}><span aria-hidden="true">×</span>{name} ({count})</button>)}
          <FilterPopover label="Price" text={priceLabel}>
            {props.priceRange !== "all" && <button className="verified-filter-clear" type="button" aria-label="Clear price filter" onClick={() => props.onPriceRangeChange("all")}>Clear</button>}
            <PriceChoices ranges={props.priceRanges} selected={props.priceRange} onChange={props.onPriceRangeChange} includeAll={false} />
          </FilterPopover>
        </div>
        <Dialog.Root open={mobileOpen} onOpenChange={(open) => {
          if (open) { setDraftCategories([...props.category]); setDraftPrice(props.priceRange) }
          setMobileOpen(open)
        }}>
          <Dialog.Trigger className="verified-catalog-control verified-catalog-mobile-filter" aria-label="Filters"><ControlIcon /><span>Filters{selectedCount > 0 ? ` (${selectedCount})` : ""}</span></Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="verified-filter-overlay" />
            <Dialog.Content className="verified-filter-sheet" data-storefront-theme="verified" aria-describedby={undefined}>
              <header className="verified-filter-sheet__header"><Dialog.Title>Filters</Dialog.Title><Dialog.Close aria-label="Close filters"><span aria-hidden="true">×</span></Dialog.Close></header>
              <div className="verified-filter-sheet__body">
                <Accordion.Root type="multiple" defaultValue={["category", "price"]}>
                  {showCategories && <Accordion.Item value="category" className="verified-filter-group">
                    <Accordion.Header><Accordion.Trigger>Category<span aria-hidden="true" /></Accordion.Trigger></Accordion.Header>
                    <Accordion.Content>
                      {validDraft.length > 0 && <button className="verified-filter-clear" type="button" aria-label="Clear categories" onClick={() => setDraftCategories([])}>Clear</button>}
                      <CategoryChoices categories={props.categories} selected={validDraft} onChange={setDraftCategories} />
                    </Accordion.Content>
                  </Accordion.Item>}
                  <Accordion.Item value="price" className="verified-filter-group">
                    <Accordion.Header><Accordion.Trigger>Price<span aria-hidden="true" /></Accordion.Trigger></Accordion.Header>
                    <Accordion.Content>
                      {draftPrice !== "all" && <button className="verified-filter-clear" type="button" aria-label="Clear price filter" onClick={() => setDraftPrice("all")}>Clear</button>}
                      <PriceChoices ranges={props.priceRanges} selected={draftPrice} onChange={setDraftPrice} includeAll={false} />
                    </Accordion.Content>
                  </Accordion.Item>
                </Accordion.Root>
              </div>
              <footer className="verified-filter-sheet__footer">
                <button type="button" onClick={() => { setDraftCategories([]); setDraftPrice("all") }}>Clear all</button>
                <button type="button" onClick={() => { props.onCategoryChange(validDraft); props.onPriceRangeChange(draftPrice); setMobileOpen(false) }}>Apply filters{draftCount > 0 ? ` (${draftCount})` : ""}</button>
              </footer>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        <button className="verified-catalog-search-toggle" type="button" aria-label="Search compounds" aria-expanded={searchOpen || Boolean(props.search)} aria-controls={searchId} onClick={() => setSearchOpen(!searchOpen)}>
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
        </button>
        <label className="verified-catalog-control verified-catalog-control--sort">
          <ControlIcon sort /><span aria-hidden="true">{sortLabels[props.sort]}</span>
          <select aria-label="Sort by" value={props.sort} onChange={(event) => props.onSortChange(event.target.value as VerifiedCatalogSort)}>
            <option value="title-asc">Name: A–Z</option><option value="title-desc">Name: Z–A</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>
      <div className="verified-catalog-mobile-chips">{selected.map(({ id, name, count }) => <button key={id} type="button" className="verified-filter-chip" aria-label={`Remove ${name}`} onClick={() => props.onCategoryChange(props.category.filter((value) => value !== id))}><span aria-hidden="true">×</span>{name} ({count})</button>)}{props.priceRange !== "all" && <button type="button" className="verified-filter-chip" aria-label="Remove price filter" onClick={() => props.onPriceRangeChange("all")}><span aria-hidden="true">×</span>{priceLabel}</button>}</div>
      <label id={searchId} className="verified-catalog-search" hidden={!searchOpen && !props.search}>
        <span className="sr-only">Search compounds</span><input type="search" value={props.search} onChange={(event) => props.onSearchChange(event.target.value)} placeholder="Search compounds" />
      </label>
      <p className="sr-only" role="status" aria-live="polite">{props.count} {props.count === 1 ? "product" : "products"}{props.loading ? " · Loading more…" : ""}</p>
    </div>
  )
}
