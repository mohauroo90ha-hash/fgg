"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/helpers";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { Badge } from "@/components/ui/Badge";
import type { ProductWithMeta } from "@/types";

export function ProductCard({ product }: { product: ProductWithMeta }) {
  const addItem = useCart((s) => s.addItem);
  const openCart = useUI((s) => s.openCart);
  const firstImage = product.images[0];
  const hasStock = product.variants.some((v) => v.stock > 0);
  const minPrice = Math.min(
    product.basePrice,
    ...product.variants.map((v) => v.price)
  );

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.variants.find((v) => v.stock > 0);
    if (!variant) return;
    addItem({
      productId: product.id,
      productSlug: product.slug,
      variantId: variant.id,
      productName: product.name,
      brand: product.brand ?? undefined,
      price: variant.price,
      image: firstImage,
      attributes: variant.attributes,
      stock: variant.stock,
    });
    openCart();
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-xl"
    >
      <Link href={`/product/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-square overflow-hidden">
          <PlaceholderImage
            src={firstImage}
            alt={product.name}
            label={product.name.charAt(0)}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
          {product.featured && (
            <Badge className="absolute left-3 top-3 bg-accent text-brand shadow-sm">
              Featured
            </Badge>
          )}
          {!hasStock && (
            <Badge className="absolute right-3 top-3 bg-zinc-800/80 text-white">
              Sold out
            </Badge>
          )}
          <div className="absolute inset-x-3 bottom-3 translate-y-14 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={quickAdd}
              disabled={!hasStock}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-brand/95 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1 p-4">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            {product.brand}
          </span>
          <h3 className="line-clamp-2 font-semibold leading-snug text-zinc-900">
            {product.name}
          </h3>
          <span className="mt-auto pt-1 text-sm font-bold text-accent-dark">
            {formatPrice(minPrice)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
