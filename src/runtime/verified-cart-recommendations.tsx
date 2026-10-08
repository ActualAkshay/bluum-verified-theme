import { useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import type { HttpTypes } from "@medusajs/types"
import { Link } from "@tanstack/react-router"
import { useCartUpsellProducts } from "@/lib/hooks/use-products"
import { useThemeSettings } from "@/components/theme-settings-provider"
import { formatPrice } from "@/lib/utils/price"
import { getProductThumbnailUrl, getResponsiveProductImage } from "@/lib/product-image"
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer"
import { useAddToCart } from "@/lib/hooks/use-cart"
import { createCartActionGuard } from "@/lib/cart-action-guard"
import { getStoredCountryCode } from "@/lib/utils/region"
import { isDisplayableVariantTitle, isVariantInStock } from "@/lib/utils/product"

const priceOf = (variant: HttpTypes.StoreProductVariant | undefined, currency: string | undefined) => {
  const price = variant?.calculated_price
  return typeof price?.calculated_amount === "number"
    ? formatPrice({ amount: price.calculated_amount, currency_code: price.currency_code || currency || "usd" })
    : null
}

/** Quick View: pick a size and add it without leaving the cart; the full page stays one link away. */
const VerifiedQuickView = ({ product, cart, disabled, onDone }: { product: HttpTypes.StoreProduct; cart: HttpTypes.StoreCart; disabled: boolean; onDone: () => void }) => {
  const variants = product.variants || []
  const sizes = variants.filter((variant) => isDisplayableVariantTitle(variant.title))
  const [variantId, setVariantId] = useState(() => (variants.find((variant) => isVariantInStock(variant)) || variants[0])?.id)
  const variant = variants.find((item) => item.id === variantId)
  const addToCart = useAddToCart()
  const guard = useRef(createCartActionGuard()).current
  const { closeCart } = useCartDrawer()
  const image = product.thumbnail || product.images?.[0]?.url
  const canAdd = Boolean(variant?.id && isVariantInStock(variant))
  const add = async () => {
    if (!variant?.id || !canAdd || disabled) return
    try {
      await guard.run(async () => {
        await addToCart.mutateAsync({ variant_id: variant.id, quantity: 1, country_code: getStoredCountryCode() || "us", product, variant })
      })
      onDone()
    } catch {
      // The mutation's error state is announced below.
    }
  }
  return <Dialog.Content className="verified-cart-quick-dialog">
    <div className="verified-cart-quick-dialog__head"><Dialog.Title>{product.title}</Dialog.Title><Dialog.Close className="verified-cart-quick-dialog__x" aria-label="Close quick view"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="m4 4 8 8M12 4l-8 8" /></svg></Dialog.Close></div>
    <Dialog.Description className="sr-only">Choose a size and add it to your cart.</Dialog.Description>
    <img src={image && (getResponsiveProductImage(image)?.fallback ?? image)} srcSet={image ? getResponsiveProductImage(image)?.webpSrcSet : undefined} sizes="(min-width: 480px) 392px, calc(100vw - 72px)" alt={product.title} />
    {sizes.length > 0 && <fieldset className="verified-cart-quick-sizes"><legend>Size</legend><div>{sizes.map((item) => {
      const inStock = isVariantInStock(item)
      return <label key={item.id} data-selected={item.id === variantId || undefined} data-disabled={!inStock || undefined}><input type="radio" name={`quick-size-${product.id}`} value={item.id} checked={item.id === variantId} disabled={!inStock} onChange={() => setVariantId(item.id)} /><span>{item.title}</span>{!inStock && <span className="sr-only"> (sold out)</span>}</label>
    })}</div></fieldset>}
    <button type="button" className="verified-cart-quick-add" onClick={() => void add()} disabled={disabled || !canAdd || addToCart.isPending} aria-busy={addToCart.isPending}>
      {addToCart.isPending ? "Adding…" : canAdd ? <>Add to cart{priceOf(variant, cart.currency_code) && <span aria-hidden="true">·</span>}{priceOf(variant, cart.currency_code)}</> : "Sold out"}
    </button>
    {addToCart.isError && <p role="alert" className="verified-cart-quick-error">Unable to add this item. Please try again.</p>}
    <Link className="verified-cart-quick-details" to="/products/$handle" params={{ handle: product.handle }} onClick={() => { onDone(); closeCart() }}>View full details</Link>
  </Dialog.Content>
}

export const VerifiedCartRecommendations = ({ cart, disabled = false }: { cart: HttpTypes.StoreCart; disabled?: boolean }) => {
  // Theme Customizer → Cart upsell: chosen products and collections, in order.
  const { items } = useThemeSettings().cart_upsell
  const { data } = useCartUpsellProducts({ items, region_id: cart.region_id })
  const products = (data || []).filter((product) => !cart.items?.some((item) => item.product_id === product.id))
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const product = products[index % Math.max(1, products.length)]
  if (!product) return null
  const variant = product.variants?.find((item) => typeof item.calculated_price?.calculated_amount === "number")
  const productImage = product.thumbnail || product.images?.[0]?.url
  const formattedPrice = priceOf(variant, cart.currency_code)
  return <section className="verified-cart-pair" aria-label="Pair it with">
    <header><h3>Pair It With</h3><div><button aria-label="Previous recommendation" disabled={products.length < 2} onClick={() => setIndex((value) => (value - 1 + products.length) % products.length)}><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 8H3M7 4 3 8l4 4" /></svg></button><button aria-label="Next recommendation" disabled={products.length < 2} onClick={() => setIndex((value) => (value + 1) % products.length)}><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg></button></div></header>
    <div className="verified-cart-pair__product"><img src={productImage && getProductThumbnailUrl(productImage)} alt={product.title} /><div><h4>{product.title}</h4><p>{product.variants?.map((item) => item.title).filter((title) => title && title !== "Default Variant").join(" / ")}</p>{formattedPrice && <p>{formattedPrice}</p>}</div>
      <Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Trigger className="verified-cart-quick-view">Quick View</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="verified-cart-quick-overlay" />{open && <VerifiedQuickView key={product.id} product={product} cart={cart} disabled={disabled} onDone={() => setOpen(false)} />}</Dialog.Portal></Dialog.Root>
    </div>
  </section>
}
