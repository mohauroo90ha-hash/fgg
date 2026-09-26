"use client";

import { useMemo, useState } from "react";
import { ShoppingBag, Check, RotateCcw, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/helpers";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import type { ProductWithMeta } from "@/types";

export function AddToCartSection({ product }: { product: ProductWithMeta }) {
  const addItem = useCart((s) => s.addItem);
  const openCart = useUI((s) => s.openCart);
  const [added, setAdded] = useState(false);

  const attrOptions = useMemo(() => {
    const names = Array.from(
      new Set(product.variants.flatMap((v) => Object.keys(v.attributes)))
    );
    return names.map((name) => ({
      name,
      values: Array.from(
        new Set(
          product.variants
            .map((v) => v.attributes[name])
            .filter((v): v is string => Boolean(v))
        )
      ),
    }));
  }, [product.variants]);

  const [selection, setSelection] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const opt of attrOptions) init[opt.name] = opt.values[0] ?? "";
    return init;
  });

  const selectedVariant = useMemo(() => {
    return product.variants.find((v) =>
      attrOptions.every(
        (opt) => v.attributes[opt.name] === selection[opt.name]
      )
    );
  }, [product.variants, attrOptions, selection]);

  const price = selectedVariant?.price ?? product.basePrice;
  const inStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const stock = selectedVariant?.stock ?? 0;

  const handleAdd = () => {
    if (!selectedVariant) return;
    addItem({
      productId: product.id,
      productSlug: product.slug,
      variantId: selectedVariant.id,
      productName: product.name,
      brand: product.brand ?? undefined,
      price: selectedVariant.price,
      image: product.images[0],
      attributes: selectedVariant.attributes,
      stock: selectedVariant.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    openCart();
  };

  return (
    <div className="space-y-6">
      {attrOptions.length > 0 && (
        <div className="space-y-4">
          {attrOptions.map((opt) => (
            <div key={opt.name}>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                {opt.name}:{" "}
                <span className="text-accent-dark">{selection[opt.name]}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {opt.values.map((val) => (
                  <button
                    key={val}
                    onClick={() =>
                      setSelection((s) => ({ ...s, [opt.name]: val }))
                    }
                    className={
                      selection[opt.name] === val
                        ? "rounded-md border-2 border-brand bg-brand px-4 py-2 text-sm font-semibold text-white"
                        : "rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-brand hover:text-brand"
                    }
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black text-brand">
          {formatPrice(price)}
        </span>
        {product.variants.length > 1 && (
          <span className="text-sm text-zinc-400">price per variant</span>
        )}
      </div>

      {selectedVariant && (
        <p
          className={`text-sm font-medium ${
            inStock ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {inStock ? `${stock} in stock` : "Out of stock"}
        </p>
      )}

      <Button
        size="lg"
        className="w-full sm:w-auto sm:min-w-56"
        disabled={!inStock}
        loading={added}
        onClick={handleAdd}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" /> Added to cart
          </>
        ) : (
          <>
            <ShoppingBag className="h-5 w-5" /> Add to cart
          </>
        )}
      </Button>

      <div className="space-y-2 rounded-lg bg-cream p-4 text-sm text-zinc-600">
        <div className="flex items-center gap-3">
          <RotateCcw className="h-4 w-4 text-accent-dark" />
          30-day easy returns
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-accent-dark" />
          Secure checkout & buyer protection
        </div>
      </div>
    </div>
  );
}
