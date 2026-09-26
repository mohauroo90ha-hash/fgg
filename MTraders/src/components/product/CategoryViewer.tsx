"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { cn } from "@/lib/utils";
import type { Attribute, ProductWithMeta } from "@/types";

type SortKey = "newest" | "price-asc" | "price-desc" | "name";

export function CategoryViewer({
  products,
  attributes,
}: {
  products: ProductWithMeta[];
  attributes: Attribute[];
}) {
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [sort, setSort] = useState<SortKey>("newest");

  const toggle = (attrName: string, value: string) => {
    setSelected((prev) => {
      const next = new Set(prev[attrName] ?? []);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...prev, [attrName]: next };
    });
  };

  const activeCount = Object.values(selected).reduce(
    (sum, s) => sum + s.size,
    0
  );

  const filtered = useMemo(() => {
    const activeAttrs = Object.entries(selected).filter(([, v]) => v.size > 0);

    let result = products.filter((p) => {
      if (activeAttrs.length === 0) return true;
      return p.variants.some((v) =>
        activeAttrs.every(([name, values]) => values.has(v.attributes[name]))
      );
    });

    switch (sort) {
      case "price-asc":
        result = [...result].sort(
          (a, b) =>
            Math.min(a.basePrice, ...a.variants.map((v) => v.price)) -
            Math.min(b.basePrice, ...b.variants.map((v) => v.price))
        );
        break;
      case "price-desc":
        result = [...result].sort(
          (a, b) =>
            Math.min(b.basePrice, ...b.variants.map((v) => v.price)) -
            Math.min(a.basePrice, ...a.variants.map((v) => v.price))
        );
        break;
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result = [...result].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return result;
  }, [products, selected, sort]);

  const clearAll = () => setSelected({});

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </h2>
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" /> Clear ({activeCount})
            </button>
          )}
        </div>

        {attributes.length === 0 && (
          <p className="text-sm text-zinc-500">No filters for this category.</p>
        )}

        {attributes.map((attr) => (
          <div key={attr.id} className="border-t border-zinc-200 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-zinc-800">
              {attr.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {attr.values.map((value) => {
                const isOn = selected[attr.name]?.has(value);
                return (
                  <button
                    key={value}
                    onClick={() => toggle(attr.name, value)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      isOn
                        ? "border-brand bg-brand text-white"
                        : "border-zinc-300 bg-white text-zinc-600 hover:border-brand hover:text-brand"
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </aside>

      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-500">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-700 focus:border-accent focus:outline-none"
          >
            <option value="newest">Sort: Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </div>

        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-dashed border-zinc-300 py-20 text-center"
            >
              <p className="font-semibold text-zinc-700">No products found</p>
              <p className="mt-1 text-sm text-zinc-500">
                Try adjusting or clearing your filters.
              </p>
              <button
                onClick={clearAll}
                className="mt-4 text-sm font-semibold text-accent-dark hover:underline"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ProductGrid products={filtered} cols="sm:grid-cols-2 xl:grid-cols-3" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
