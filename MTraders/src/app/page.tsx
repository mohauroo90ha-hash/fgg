import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Reveal } from "@/components/Reveal";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import {
  getCategoriesWithCount,
  getFeaturedProducts,
  getHeroSlides,
  getLatestProducts,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, latest, heroSlides] = await Promise.all([
    getCategoriesWithCount(),
    getFeaturedProducts(),
    getLatestProducts(12),
    getHeroSlides(),
  ]);

  return (
    <div>
      <HeroSlider slides={heroSlides} />

      <section className="container-x py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Shop by Category
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Explore our curated collections
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 0.06}>
              <Link
                href={`/category/${cat.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-xl"
              >
                <div className="placeholder-gradient flex aspect-[4/3] items-center justify-center">
                  <PlaceholderImage
                    src={cat.image}
                    alt={cat.name}
                    label={cat.name.charAt(0)}
                    className="aspect-[4/3] w-full"
                  />
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-semibold">{cat.name}</h3>
                    <p className="text-xs text-zinc-500">
                      {cat.productCount} products
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400 transition-all group-hover:translate-x-1 group-hover:text-accent-dark" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <ProductCarousel
          title="Featured Picks"
          subtitle="Hand-picked products our customers love"
          products={featured}
        />
      )}

      <section className="container-x py-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            All Products
          </h2>
        </div>
        <ProductGrid products={latest.slice(0, 8)} />
      </section>
    </div>
  );
}
