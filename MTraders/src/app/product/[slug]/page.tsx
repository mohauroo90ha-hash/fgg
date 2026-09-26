import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { formatPrice } from "@/lib/helpers";
import { AddToCartSection } from "@/components/product/AddToCartSection";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { ProductGallery } from "@/components/product/ProductGallery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `${product.name} — MTraders` : "Product",
    description: product?.description || undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <div className="container-x py-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500">
        <Link href="/" className="hover:text-brand">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/category/${product.category.slug}`}
          className="hover:text-brand"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-zinc-800">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col gap-6">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-accent-dark">
              {product.brand}
            </span>
            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              {product.category.name} ·{" "}
              {product.variants.length}{" "}
              {product.variants.length === 1 ? "option" : "options"}
            </p>
          </div>

          <AddToCartSection product={product} />

          {product.description && (
            <div className="border-t border-zinc-200 pt-6">
              <h2 className="mb-2 text-lg font-semibold">Description</h2>
              <p className="leading-relaxed text-zinc-600">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <ProductCarousel
            title="You May Also Like"
            products={related}
          />
        </div>
      )}
    </div>
  );
}
