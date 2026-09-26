import { ProductCard } from "./ProductCard";
import type { ProductWithMeta } from "@/types";

export function ProductGrid({
  products,
  cols = "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
}: {
  products: ProductWithMeta[];
  cols?: string;
}) {
  return (
    <div className={`grid grid-cols-1 gap-5 ${cols}`}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
