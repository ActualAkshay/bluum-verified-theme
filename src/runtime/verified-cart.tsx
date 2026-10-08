import { Thumbnail } from "@/components/ui/thumbnail"
import { useDeleteLineItem, useUpdateLineItem } from "@/lib/hooks/use-cart"
import { createCartActionGuard } from "@/lib/cart-action-guard"
import { canonicalProductName } from "@/lib/product-name"
import { getCartDrawerSubtotal, getLineItemSubtotalBeforeDiscount } from "@/lib/utils/cart"
import { formatPrice } from "@/lib/utils/price"
import { isDisplayableVariantTitle } from "@/lib/utils/product"
import { Minus, Plus, Trash } from "@medusajs/icons"
import type { HttpTypes } from "@medusajs/types"
import { useRef, useState } from "react"

/** The drawer shows the subtotal only; the order total is shown at checkout. */
export const VerifiedCartTotals = ({cart, pending = false}: {cart: HttpTypes.StoreCart; pending?: boolean}) => {
  const total = formatPrice({amount:getCartDrawerSubtotal(cart),currency_code:cart.currency_code || "usd"})
  return <div className="verified-cart-totals" aria-busy={pending}><div><span>Subtotal</span><span>{pending ? "Updating…" : total}</span></div><p>Shipping & taxes calculated at checkout</p></div>
}

/** Item subtotal is before discounts; total includes discounts and tax. */
export const verifiedCartLinePrices = (item: HttpTypes.StoreCartLineItem) => {
  const original = Math.max(0, getLineItemSubtotalBeforeDiscount(item))
  const discount = Math.max(0, (item.discount_total ?? 0) - (item.discount_tax_total ?? 0))
  const { total, tax_total: taxTotal } = item
  const actual = typeof total === "number" && Number.isFinite(total) && typeof taxTotal === "number" && Number.isFinite(taxTotal)
    ? Math.max(0, total - taxTotal)
    : Math.max(0, original - discount)
  return { original, actual }
}

export const VerifiedCartLineItem = ({ item, cart, disabled = false }: {
  item: HttpTypes.StoreCartLineItem
  cart: HttpTypes.StoreCart
  disabled?: boolean
}) => {
  const update = useUpdateLineItem()
  const remove = useDeleteLineItem()
  const guard = useRef(createCartActionGuard()).current
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const busy = disabled || pending || update.isPending || remove.isPending

  const changeQuantity = async (quantity: number) => {
    if (busy) return
    await guard.run(async () => {
      setPending(true)
      setFailed(false)
      try {
        if (quantity <= 0) await remove.mutateAsync({ line_id: item.id })
        else await update.mutateAsync({ line_id: item.id, quantity })
      } catch {
        // The drawer's mutation-cache listener also announces failures after
        // an optimistic delete has unmounted this row.
        setFailed(true)
      } finally {
        setPending(false)
      }
    })
  }

  return <VerifiedCartItemView item={item} cart={cart} busy={busy} error={failed} onQuantityChange={(quantity) => void changeQuantity(quantity)} />
}

/** Presentation-only surface for non-transactional previews and component tests. */
export const VerifiedCartItemView = ({ item, cart, busy = false, error = false, onQuantityChange }: {
  item: HttpTypes.StoreCartLineItem
  cart: HttpTypes.StoreCart
  busy?: boolean
  error?: boolean
  onQuantityChange: (quantity: number) => void
}) => {
  const productName = canonicalProductName(item.product_title || item.title)
  const prices = verifiedCartLinePrices(item)
  const price = (amount: number) => formatPrice({ amount, currency_code: cart.currency_code || "usd" })
  return <article className="verified-cart-item" data-testid="cart-item" aria-label={productName} aria-busy={busy}>
    <Thumbnail thumbnail={item.thumbnail} alt={productName} fallback="brand" className="verified-cart-item__image" />
    <div className="verified-cart-item__details">
      <h3 className="verified-cart-item__title">{productName}</h3>
      {isDisplayableVariantTitle(item.variant_title) && <p className="verified-cart-item__variant">{item.variant_title}</p>}
    </div>
    <div className="verified-cart-item__price" aria-label={`Item total ${price(prices.actual)}`}>
      {prices.original > prices.actual && <del><span className="sr-only">Original price </span>{price(prices.original)}</del>}
      <span>{price(prices.actual)}</span>
    </div>
    <div className="verified-cart-item__quantity" role="group" aria-label={`Quantity for ${productName}`}>
      <button type="button" disabled={busy} aria-label={`Decrease quantity of ${productName}`} onClick={() => onQuantityChange(Math.max(0, item.quantity - 1))}><Minus aria-hidden="true" /></button>
      <span aria-live="polite" aria-atomic="true">{item.quantity}</span>
      <button type="button" disabled={busy} aria-label={`Increase quantity of ${productName}`} onClick={() => onQuantityChange(item.quantity + 1)}><Plus aria-hidden="true" /></button>
    </div>
    <button type="button" className="verified-cart-item__remove" disabled={busy} aria-label={`Remove ${productName} from cart`} onClick={() => onQuantityChange(0)}><Trash aria-hidden="true" /><span>Remove</span></button>
    {error && <p className="verified-cart-item__error" role="alert">We couldn&apos;t update this item. Please try again.</p>}
  </article>
}
