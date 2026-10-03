import { CartDropdown } from "@/components/cart-dropdown"
import { PredictiveSearchTrigger } from "@/components/search/predictive-search-trigger"
import { useCustomer } from "@/lib/hooks/use-customer"
import { ExperimentContentBlock } from "@/components/experiment-provider"
import { sdk } from "@/lib/utils/sdk"
import { useQuery } from "@tanstack/react-query"
import { subscribeToNewsletter } from "@/lib/klaviyo"
import { Link, useLocation } from "@tanstack/react-router"
import { useEffect, useRef, useState, type FormEvent, type PropsWithChildren, type ReactNode } from "react"

const navigation = [
  { label: "Shop", href: "/collections/all" },
  { label: "Lab Reports", href: "/pages/coa-lookup" },
  { label: "Science", href: "/pages/about-us" },
  { label: "Contact Us", href: "/pages/contact" },
] as const

const MenuIcon = ({ open }: { open: boolean }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
    {open ? (
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    ) : (
      <path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    )}
  </svg>
)

const VerifiedNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { data: customer } = useCustomer()
  const wholesale = useQuery({
    queryKey: ["wholesale", "menu-status", customer?.id],
    queryFn: () => sdk.client.fetch<{ approved: boolean }>("/store/wholesale/status"),
    enabled: Boolean(customer?.id),
    staleTime: 5 * 60_000,
    retry: false,
  })
  const links = [
    ...navigation,
    ...(wholesale.data?.approved ? [{ label: "Wholesale", href: "/wholesale" }] : []),
  ]
  const headerRef = useRef<HTMLElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const header = headerRef.current
    const root = header?.closest<HTMLElement>('[data-storefront-theme="verified"]')
    if (!header || !root) return
    const measure = () => root.style.setProperty("--verified-sticky-height", `${header.getBoundingClientRect().height}px`)
    measure()
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure)
    observer?.observe(header)
    window.addEventListener("resize", measure)
    return () => { observer?.disconnect(); window.removeEventListener("resize", measure) }
  }, [])

  useEffect(() => setMenuOpen(false), [location.pathname])
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1000px)")
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false) }
    desktop.addEventListener("change", closeOnDesktop)
    return () => desktop.removeEventListener("change", closeOnDesktop)
  }, [])
  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return

    const menu = document.getElementById("verified-mobile-menu")
    const focusable = () => Array.from(
      menu?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) || [],
    ).filter((element) => element.getClientRects().length > 0)
    const fitMenu = () => {
      if (menu) menu.style.maxHeight = `${Math.max(0, window.innerHeight - menu.getBoundingClientRect().top - 16)}px`
    }
    const frame = requestAnimationFrame(() => { fitMenu(); focusable()[0]?.focus() })
    window.addEventListener("resize", fitMenu)
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(fitMenu)
    if (headerRef.current) observer?.observe(headerRef.current)

    const onKeyDown = (event: KeyboardEvent) => {
      // Portaled search/cart dialogs own their keyboard interaction until dismissed.
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) return
      if (event.key === "Escape") {
        event.preventDefault()
        setMenuOpen(false)
        menuTriggerRef.current?.focus()
        return
      }
      if (event.key !== "Tab") return
      const items = focusable()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      if ((event.target as Element)?.closest?.('[role="dialog"][aria-modal="true"]')) return
      if (headerRef.current?.contains(event.target as Node)) return
      setMenuOpen(false)
      menuTriggerRef.current?.focus()
    }

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("pointerdown", onPointerDown)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", fitMenu)
      observer?.disconnect()
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [menuOpen])

  return (
    <header ref={headerRef} className="verified-header" data-storefront-header>
      <ExperimentContentBlock slot="announcement" className="verified-experiment-announcement" />
      <Link to="/collections/all" className="verified-announcement">
        Free Shipping on orders above $200
      </Link>
      <div className="verified-nav-shell">
        <button
          ref={menuTriggerRef}
          type="button"
          className="verified-menu-trigger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="verified-mobile-menu"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <MenuIcon open={menuOpen} />
        </button>
        <nav className="verified-desktop-nav" aria-label="Primary navigation">
          {links.map((item) => (
            <Link key={item.label} to={item.href}>{item.label}</Link>
          ))}
        </nav>
        <Link to="/" className="verified-logo" aria-label="Bluum home">
          <img src="/images/bluum.svg" alt="Bluum" />
        </Link>
        <div className="verified-nav-actions">
          <PredictiveSearchTrigger />
          <CartDropdown />
          <Link
            to={customer ? "/account" : "/login"}
            search={customer ? undefined : { redirect: "/account" }}
            className="verified-sign-in"
          >
            {customer ? "Account" : "Sign In"}
          </Link>
        </div>
      </div>
      {menuOpen && (
        <nav id="verified-mobile-menu" className="verified-mobile-nav" aria-label="Mobile navigation">
          <button type="button" className="verified-mobile-close" onClick={() => { setMenuOpen(false); menuTriggerRef.current?.focus() }}>
            Close menu <MenuIcon open />
          </button>
          <div className="verified-mobile-search">
            <PredictiveSearchTrigger />
            <span>Search products</span>
          </div>
          {links.map((item) => (
            <Link key={item.label} to={item.href}>{item.label}</Link>
          ))}
          <Link
            to={customer ? "/account" : "/login"}
            search={customer ? undefined : { redirect: "/account" }}
          >
            {customer ? "Account" : "Sign In"}
          </Link>
        </nav>
      )}
    </header>
  )
}

const footerColumns = [
  {
    title: "Shop Products",
    links: [
      ["NAD+", "/products/nad"],
      ["5-Amino-1MQ", "/products/5-amino-1mq"],
      ["BPC-157", "/products/bpc-157"],
      ["Snap-8", "/products/snap-8"],
      ["TB-500", "/products/tb-500"],
      ["Tesamorelin", "/products/tesamorelin"],
      ["Shop All", "/collections/all"],
    ],
  },
  {
    title: "Learn",
    links: [
      ["Blog", "/blogs/research"],
      ["FAQ", "/pages/faq"],
      ["Science", "/pages/about-us"],
      ["Lab Reports", "/pages/coa-lookup"],
    ],
  },
  {
    title: "Customer Care",
    links: [
      ["Contact Us", "/pages/contact"],
      ["Terms of Service", "/policies/terms-of-service"],
      ["Privacy Policy", "/policies/privacy-policy"],
      ["Returns & Refunds", "/policies/refund-policy"],
      ["Shipping Policy", "/policies/shipping-policy"],
    ],
  },
] as const

const additionalFooterLinks = [
  ["Wholesale", "/wholesale-application"],
  ["Your privacy choices", "/pages/data-sharing-opt-out"],
  ["Waiver Agreement", "/pages/indemnity-waiver"],
  ["Payment & Billing Policy", "/pages/payment-billing-policy"],
] as const

const VerifiedFooter = () => {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus("sending")
    try {
      await subscribeToNewsletter(email, "Bluum Verified theme footer")
      setEmail("")
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  return (
    <footer id="verified-footer" className="verified-footer" data-storefront-footer>
      <div className="verified-footer-grid">
        <section className="verified-footer-signup" aria-label="Newsletter">
          <p className="verified-newsletter-intro">Stay in the loop on the latest products and discounts.</p>
          <form onSubmit={submit} className="verified-newsletter">
            <label className="sr-only" htmlFor="verified-footer-email">Your email</label>
            <input
              id="verified-footer-email"
              type="email"
              required
              autoComplete="email"
              placeholder="Your Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button type="submit" disabled={status === "sending"} aria-label="Subscribe"><img src="/images/themes/verified/footer-arrow-right.svg" alt="" /></button>
          </form>
          {status === "success" && <p className="verified-newsletter-status" role="status">Check your email to confirm.</p>}
          {status === "error" && <p className="verified-newsletter-status" role="alert">Please try again.</p>}
        </section>
        <div className="verified-footer-links">{footerColumns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2>{column.title}</h2>
            {column.links.map(([label, href]) => <Link key={label} to={href as string} resetScroll>{label}</Link>)}
          </nav>
        ))}</div>
      </div>
      <div className="verified-footer-brand">
        <img className="verified-footer-wordmark" src="/images/bluum.svg" alt="Bluum" />
        <p>© {new Date().getFullYear()}, Bluum</p>
        <ul className="verified-payment-methods" aria-label="Accepted payment methods">
          {[
            ["American Express", "american-express"],
            ["Apple Pay", "apple-pay"],
            ["Google Pay", "google-pay"],
            ["Visa", "visa"],
          ].map(([name, asset]) => <li key={asset}><img src={`/images/payment-${asset}.svg`} alt={name} width="38" height="24" loading="lazy" /></li>)}
        </ul>
      </div>
      <section className="verified-footer-disclaimer" aria-label="Product and FDA disclaimer">
        <p>All products sold are intended for laboratory and research purposes only. They are not for human consumption, veterinary use, or medical applications. You must be 21 years or older to purchase. By using this site, you agree to comply with all applicable laws and regulations regarding these products. Misuse of these products is strictly prohibited. The statements made within this website have not been evaluated by the US Food and Drug Administration. The statements and the products of this company are not intended to diagnose, treat, cure or prevent any disease. All products are sold for research, laboratory, or analytical purposes only, and are not for human consumption. Bluum is a chemical supplier. Bluum is not a compounding pharmacy or chemical compounding facility as defined under 503A of the Federal Food, Drug, and Cosmetic Act. Bluum is not an outsourcing facility as defined under 503B of the Federal Food, Drug, and Cosmetic Act.</p>
      </section>
      <details className="verified-footer-more">
        <summary>More information</summary>
        <div>
          <nav aria-label="Additional information">
            {additionalFooterLinks.map(([label, href]) => <Link key={label} to={href as string} resetScroll>{label}</Link>)}
          </nav>
          <address className="verified-footer-contact">
            <a href="mailto:hello@bluumpeptides.com">hello@bluumpeptides.com</a>
            <a href="sms:+16283037232">Text us: (628) 303-7232</a>
            <p>30 N Gould St Ste N<br />Sheridan, WY 82801</p>
            <a href="https://instagram.com/bluumpeptides" target="_blank" rel="noreferrer">Instagram</a>
          </address>
        </div>
      </details>
    </footer>
  )
}

/** Enhance native disclosures without replacing their keyboard or no-JS behavior. */
export const installVerifiedDisclosureMotion = (root: HTMLElement) => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
  const running = new Map<HTMLDetailsElement, {
    animation: Animation
    targetOpen: boolean
    overflow: string
    boxSizing: string
  }>()
  const finish = (details: HTMLDetailsElement) => {
    const state = running.get(details)
    if (!state) return
    running.delete(details)
    state.animation.onfinish = null
    state.animation.oncancel = null
    details.open = state.targetOpen
    state.animation.cancel()
    details.style.overflow = state.overflow
    details.style.boxSizing = state.boxSizing
  }
  const finishAll = () => { for (const details of running.keys()) finish(details) }
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return
    const summary = event.target.closest("summary")
    const details = summary?.parentElement
    if (!(details instanceof HTMLDetailsElement) || !root.contains(details)) return
    if (event.target.closest("a, button, input, select, textarea")) return
    // Absolutely positioned details are account menus, not expanding page panels.
    if (details.querySelector(':scope > [class~="absolute"]')) return
    if (reduced.matches || typeof details.animate !== "function") return
    event.preventDefault()
    const previous = running.get(details)
    const targetOpen = !(previous?.targetOpen ?? details.open)
    const from = details.getBoundingClientRect().height
    const overflow = previous?.overflow ?? details.style.overflow
    const boxSizing = previous?.boxSizing ?? details.style.boxSizing
    if (previous) {
      previous.animation.onfinish = null
      previous.animation.oncancel = null
      previous.animation.cancel()
    }
    details.open = true
    details.style.boxSizing = "border-box"
    const bounds = details.getBoundingClientRect()
    const styles = getComputedStyle(details)
    const to = targetOpen ? bounds.height : summary!.getBoundingClientRect().bottom - bounds.top
      + parseFloat(styles.paddingBottom || "0") + parseFloat(styles.borderBottomWidth || "0")
    details.style.overflow = "hidden"
    const animation = details.animate([{ height: `${from}px` }, { height: `${to}px` }], {
      duration: 280, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both",
    })
    running.set(details, { animation, targetOpen, overflow, boxSizing })
    animation.onfinish = () => finish(details)
    animation.oncancel = () => finish(details)
  }
  root.addEventListener("click", onClick)
  window.addEventListener("resize", finishAll)
  reduced.addEventListener("change", finishAll)
  return () => {
    root.removeEventListener("click", onClick)
    window.removeEventListener("resize", finishAll)
    reduced.removeEventListener("change", finishAll)
    finishAll()
  }
}

export const VerifiedTheme = ({
  children,
  header,
  chrome,
}: PropsWithChildren<{
  header: ReactNode
  chrome: "storefront" | "checkout" | "hidden"
}>) => {
  const location = useLocation()
  const shellRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (shellRef.current) return installVerifiedDisclosureMotion(shellRef.current)
  }, [location.pathname])
  const heroUnderlay = chrome === "storefront" && ["/", "/pages/about-us"].includes(location.pathname)
  return (
    <div ref={shellRef} className="verified-theme min-h-dvh flex flex-col" data-storefront-theme="verified" data-hero-underlay={heroUnderlay ? "true" : undefined}>
      <a href="#storefront-main" className="verified-skip-link">Skip to content</a>
      {chrome === "storefront" ? <VerifiedNavbar /> : chrome === "checkout" ? header : null}
      {children}
      {chrome === "storefront" ? <VerifiedFooter /> : null}
    </div>
  )
}
