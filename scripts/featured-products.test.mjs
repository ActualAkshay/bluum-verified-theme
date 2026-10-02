import assert from "node:assert/strict"
import test from "node:test"
import { featuredLookbackDays, selectVerifiedFeaturedProducts } from "../src/runtime/verified-featured.ts"

const product = (id, stock = 10, extra = {}) => ({
  id, handle: id, title: id,
  variants: [{ manage_inventory: true, inventory_quantity: stock, ...extra }],
})

test("ranks stocked products by supplied unit-sales order, never catalog recency", () => {
  const products = [product("newest"), product("third"), product("first"), product("second")]
  assert.deepEqual(selectVerifiedFeaturedProducts(products, ["first", "second", "third"]).map((p) => p.id), ["first", "second", "third"])
})

test("excludes sold-out and backorder-only products but accepts any stocked variant", () => {
  const products = [product("sold", 0), product("backorder", 0, { allow_backorder: true }), product("negative", -1), {
    ...product("mixed", 0), variants: [product("sold", 0).variants[0], product("available").variants[0]],
  }]
  assert.deepEqual(selectVerifiedFeaturedProducts(products, ["sold", "backorder", "negative", "mixed"]).map((p) => p.id), ["mixed"])
})

test("uses the existing curated list for unavailable, empty or short rankings", () => {
  const products = [product("tb-500", 0), product("selank"), product("semax"), product("ipamorelin"), product("ranked")]
  assert.deepEqual(selectVerifiedFeaturedProducts(products, []).map((p) => p.id), ["selank", "semax", "ipamorelin"])
  assert.deepEqual(selectVerifiedFeaturedProducts(products, ["ranked", "selank", "ranked", "deleted"]).map((p) => p.id), ["ranked", "selank", "semax", "ipamorelin"])
})

test("never fills with arbitrary, unknown-stock, empty-variant or malformed products", () => {
  const unknown = { ...product("unknown"), variants: [{}] }
  const empty = { ...product("empty"), variants: [] }
  const untitled = { ...product("untitled"), title: null }
  assert.deepEqual(selectVerifiedFeaturedProducts([product("arbitrary"), unknown, empty, untitled], ["unknown", "empty", "untitled"]), [])
})

test("respects explicit untracked stock, curated order, limit and stable deduplication", () => {
  const products = [product("one", 0, { manage_inventory: false }), product("two"), product("three")]
  assert.deepEqual(selectVerifiedFeaturedProducts(products, ["one", "one"], 2, ["three", "two"]).map((p) => p.id), ["one", "three"])
  assert.deepEqual(selectVerifiedFeaturedProducts(products, ["one"], 0), [])
})

test("defaults to 90 days with a bounded configurable window", () => {
  assert.equal(featuredLookbackDays("30"), 30)
  assert.equal(featuredLookbackDays("365"), 365)
  for (const invalid of [undefined, "", 0, -1, 366, "ten", "2.5"]) assert.equal(featuredLookbackDays(invalid), 90)
})
