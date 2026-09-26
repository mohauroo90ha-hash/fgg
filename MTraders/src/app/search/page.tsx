import Link from "next/link";
import { ChevronRight, SearchX } from "lucide-react";
import { searchProducts } from "@/lib/data";
import { ProductGrid } from "@/components/product/ProductGrid";

export const metadata = {
  title: "Search — MTraders",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchProducts(query) : [];

  return (
    <div className="container-x py-8">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-zinc-500">
        <Link href="/" className="hover:text-brand">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-800">Search</span>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {query ? (
          <>
            Results for{" "}
            <span className="text-accent-dark">"{query}"</span>
          </>
        ) : (
          "Search"
        )}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        {query ? `${results.length} result${results.length === 1 ? "" : "s"} found` : "Type a keyword in the search bar to find products."}
      </p>

      <div className="mt-8">
        {query && results.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 py-20 text-center">
            <SearchX className="mx-auto h-10 w-10 text-zinc-300" />
            <p className="mt-3 font-semibold text-zinc-700">
              No products match your search
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm font-semibold text-accent-dark hover:underline"
            >
              Browse all products
            </Link>
          </div>
        ) : (
          <ProductGrid products={results} cols="sm:grid-cols-2 lg:grid-cols-4" />
        )}
      </div>
    </div>
  );
}
