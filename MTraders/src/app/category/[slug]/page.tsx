import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getCategoryBySlug } from "@/lib/data";
import { CategoryViewer } from "@/components/product/CategoryViewer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCategoryBySlug(slug);
  return {
    title: data ? `${data.category.name} — MTraders` : "Category",
    description: data?.category.description || undefined,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCategoryBySlug(slug);
  if (!data) notFound();

  const { category, products } = data;

  return (
    <div className="container-x py-8">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-zinc-500">
        <Link href="/" className="hover:text-brand">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-800">{category.name}</span>
      </nav>

      <header className="mb-8">
        <div className="relative -mx-4 flex min-h-44 items-center overflow-hidden rounded-2xl px-6 sm:-mx-6 sm:min-h-56 sm:px-10 lg:-mx-8">
          {category.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={category.image}
              alt={category.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="placeholder-gradient absolute inset-0" />
          )}
          <div className="absolute inset-0 bg-brand/60" />
          <div className="relative">
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </header>

      <CategoryViewer products={products} attributes={category.attributes} />
    </div>
  );
}
