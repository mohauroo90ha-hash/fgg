"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/helpers";
import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/PlaceholderImage";

export default function CartPage() {
  const { items, removeItem, setQuantity, subtotal, count } = useCart();
  const shipping = subtotal() >= 99 || items.length === 0 ? 0 : 9.99;

  if (items.length === 0) {
    return (
      <div className="container-x flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-zinc-300" />
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-zinc-500">
          Looks like you haven't added anything yet.
        </p>
        <Link href="/" className="mt-6">
          <Button size="lg">Start shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <h1 className="mb-6 text-3xl font-black tracking-tight">
        Shopping Cart{" "}
        <span className="text-lg font-medium text-zinc-400">
          ({count()} items)
        </span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {items.map((item) => (
            <motion.div
              key={`${item.productId}-${item.variantId || "default"}`}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <Link
                href={`/product/${item.productSlug}`}
                className="h-28 w-28 shrink-0 overflow-hidden rounded-lg"
              >
                <PlaceholderImage
                  src={item.image}
                  alt={item.productName}
                  label={item.productName.charAt(0)}
                  className="h-28 w-28"
                />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/product/${item.productSlug}`}
                      className="font-semibold hover:text-accent-dark"
                    >
                      {item.productName}
                    </Link>
                    {item.brand && (
                      <p className="text-xs uppercase tracking-wider text-zinc-400">
                        {item.brand}
                      </p>
                    )}
                    {Object.keys(item.attributes).length > 0 && (
                      <p className="mt-1 text-sm text-zinc-500">
                        {Object.entries(item.attributes)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="rounded-md p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-lg border border-zinc-200">
                    <button
                      className="p-2 text-zinc-500 hover:text-brand"
                      onClick={() =>
                        setQuantity(item.productId, item.variantId, item.quantity - 1)
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      className="p-2 text-zinc-500 hover:text-brand"
                      onClick={() =>
                        setQuantity(item.productId, item.variantId, item.quantity + 1)
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-lg font-bold">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <aside className="h-fit rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
          <h2 className="mb-4 text-lg font-bold">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className="font-medium text-zinc-900">
                {formatPrice(subtotal())}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Shipping</span>
              <span className="font-medium text-zinc-900">
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-3 text-base">
              <span className="font-bold">Total</span>
              <span className="font-black text-brand">
                {formatPrice(subtotal() + shipping)}
              </span>
            </div>
          </div>
          <Link href="/checkout" className="mt-6 block">
            <Button className="w-full" size="lg">
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </aside>
      </div>
    </div>
  );
}
