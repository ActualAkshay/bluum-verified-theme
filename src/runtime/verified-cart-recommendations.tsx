import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import type { HttpTypes } from "@medusajs/types"
import { Link } from "@tanstack/react-router"
import { useCartUpsellProducts } from "@/lib/hooks/use-products"
import { useThemeSettings } from "@/components/theme-settings-provider"
import { formatPrice } from "@/lib/utils/price"
import { getProductThumbnailUrl, getResponsiveProductImage } from "@/lib/product-image"
import { useCartDrawer } from "@/lib/hooks/use-cart-drawer"

export const VerifiedCartRecommendations = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  // Theme Customizer → Cart upsell: chosen products and collections, in order.
  const { items } = useThemeSettings().cart_upsell
  const { data } = useCartUpsellProducts({ items, region_id: cart.region_id })
  const products = (data || []).filter((product) => !cart.items?.some((item) => item.product_id === product.id))
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const { closeCart } = useCartDrawer()
  const product = products[index % Math.max(1, products.length)]
  if (!product) return null
  const variant = product.variants?.find((item) => typeof item.calculated_price?.calculated_amount === "number")
  const price = variant?.calculated_price
  const productImage = product.thumbnail || product.images?.[0]?.url
  const formattedPrice = price ? formatPrice({amount: price.calculated_amount!, currency_code: price.currency_code || cart.currency_code}) : null
  return <section className="verified-cart-pair" aria-label="Pair it with">
    <header><h3>Pair It With</h3><div><button aria-label="Previous recommendation" disabled={products.length < 2} onClick={() => setIndex((value) => (value - 1 + products.length) % products.length)}><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 8H3M7 4 3 8l4 4" /></svg></button><button aria-label="Next recommendation" disabled={products.length < 2} onClick={() => setIndex((value) => (value + 1) % products.length)}><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg></button></div></header>
    <div className="verified-cart-pair__product"><img src={productImage && getProductThumbnailUrl(productImage)} alt={product.title} /><div><h4>{product.title}</h4><p>{product.variants?.map((item) => item.title).filter((title) => title && title !== "Default Variant").join(" / ")}</p>{formattedPrice && <p>{formattedPrice}</p>}</div>
      <Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Trigger className="verified-cart-quick-view">Quick View</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="verified-cart-quick-overlay" /><Dialog.Content className="verified-cart-quick-dialog"><Dialog.Title>{product.title}</Dialog.Title><Dialog.Description>Select a size and view the full product details before adding to your cart.</Dialog.Description><img src={productImage && (getResponsiveProductImage(productImage)?.fallback ?? productImage)} alt={product.title} />{formattedPrice && <p>From {formattedPrice}</p>}<Link to="/products/$handle" params={{handle:product.handle}} onClick={() => {setOpen(false);closeCart()}}>View product</Link><Dialog.Close aria-label="Close quick view">Close</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>
    </div>
  </section>
}
