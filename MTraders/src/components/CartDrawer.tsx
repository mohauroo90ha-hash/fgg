"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, ShoppingBag, Minus, Plus } from "lucide-react";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { formatPrice } from "@/lib/helpers";
import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/PlaceholderImage";

export function CartDrawer() {
  const { cartOpen, closeCart } = useUI();
  const { items, removeItem, setQuantity, subtotal, count } = useCart();

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <ShoppingBag className="h-5 w-5" /> Your Cart ({count()})
              </h2>
              <button
                onClick={closeCart}
                className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <ShoppingBag className="h-12 w-12 text-zinc-300" />
                <p className="text-zinc-500">Your cart is empty.</p>
                <Link href="/" onClick={closeCart}>
                  <Button variant="accent">Start shopping</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId || "default"}`}
                      className="flex gap-3 rounded-lg border border-zinc-100 p-2"
                    >
                      <Link
                        href={`/product/${item.productSlug}`}
                        className="h-20 w-20 shrink-0 overflow-hidden rounded-md"
                      >
                        <PlaceholderImage
                          src={item.image}
                          alt={item.productName}
                          label={item.productName.charAt(0)}
                          className="h-20 w-20"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/product/${item.productSlug}`}
                              className="line-clamp-1 text-sm font-semibold hover:text-accent-dark"
                            >
                              {item.productName}
                            </Link>
                            {Object.keys(item.attributes).length > 0 && (
                              <p className="mt-0.5 text-xs text-zinc-500">
                                {Object.entries(item.attributes)
                                  .map(([k, v]) => `${v}`)
                                  .join(" · ")}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.productId, item.variantId)}
                            className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                            aria-label="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center rounded-md border border-zinc-200">
                            <button
                              className="p-1.5 text-zinc-500 hover:text-brand"
                              onClick={() =>
                                setQuantity(item.productId, item.variantId, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              className="p-1.5 text-zinc-500 hover:text-brand"
                              onClick={() =>
                                setQuantity(item.productId, item.variantId, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-bold">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-200 px-5 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-zinc-600">Subtotal</span>
                    <span className="text-lg font-bold">{formatPrice(subtotal())}</span>
                  </div>
                  <Link href="/checkout" onClick={closeCart} className="block">
                    <Button className="w-full" size="lg">
                      Checkout
                    </Button>
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="mt-2 block text-center text-sm text-zinc-500 hover:text-brand"
                  >
                    View full cart
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
