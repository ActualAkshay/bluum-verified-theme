import { useEffect, useId, useRef, useState, type ReactNode } from "react"

type Props = {
  filters: ReadonlyArray<{ value: string; label: string }>
  active: string
  onFilterChange: (value: string) => void
  search: string
  onSearchChange: (value: string) => void
  count: number
  loading: boolean
}

// Dropdown used by the blog's category filter.
function ControlIcon({ sort = false }: { sort?: boolean }) {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{sort ? <path d="m8 8 4-4 4 4M8 16l4 4 4-4" /> : <path d="m5 9 7 7 7-7" />}</svg>
}

export function FilterPopover({ label, text = label, sort = false, align, children }: { label: string; text?: string; sort?: boolean; align?: "end"; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const id = useId()
  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent | FocusEvent) => {
      // Clicking an option's text can move focus to an ancestor (e.g. <main>); that is not "leaving".
      if (event.target instanceof Node && !root.current?.contains(event.target) && !event.target.contains(root.current)) setOpen(false)
    }
    document.addEventListener("pointerdown", dismiss)
    document.addEventListener("focusin", dismiss)
    return () => {
      document.removeEventListener("pointerdown", dismiss)
      document.removeEventListener("focusin", dismiss)
    }
  }, [open])
  return <div ref={root} className={`verified-filter-popover${align === "end" ? " verified-filter-popover--end" : ""}`} onKeyDown={(event) => {
    if (event.key === "Escape" && open) { event.stopPropagation(); setOpen(false); trigger.current?.focus() }
  }}>
    <button ref={trigger} type="button" className="verified-catalog-control" aria-label={label} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}><ControlIcon sort={sort} /><span>{text}</span></button>
    {open && <div id={id} className="verified-filter-popover__content" role="group" aria-label={`${label} options`} onClick={(event) => {
      // Single-choice menus (sort) close once an option is picked.
      if ((event.target as HTMLElement).closest("[data-close-popover]")) { setOpen(false); trigger.current?.focus() }
    }}>{children}</div>}
  </div>
}

/** Shop toolbar: the live store's search box and category chips, in Verified styling. */
export function VerifiedCatalogControls(props: Props) {
  const searchId = useId()
  return (
    <div className="verified-shop-tools">
      <label htmlFor={searchId} className="verified-shop-search">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
        <span className="sr-only">Search compounds</span>
        <input id={searchId} type="search" value={props.search} onChange={(event) => props.onSearchChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") props.onSearchChange("") }} placeholder="Search compounds" autoComplete="off" />
        {props.search && <button type="button" aria-label="Clear search" onClick={() => props.onSearchChange("")}>
          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 2l8 8M10 2l-8 8" /></svg>
        </button>}
      </label>
      <div className="verified-shop-chips" role="group" aria-label="Filter products">
        {props.filters.map(({ value, label }) => <button key={value} type="button" aria-pressed={props.active === value} onClick={() => props.onFilterChange(value)}>{label}</button>)}
      </div>
      <p className="sr-only" role="status" aria-live="polite">{props.count} {props.count === 1 ? "product" : "products"}{props.loading ? " · Loading more…" : ""}</p>
    </div>
  )
}
