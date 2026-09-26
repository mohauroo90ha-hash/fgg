import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCategoriesWithCount } from "@/lib/data";
import { parseJSON } from "@/lib/helpers";
import { ProductForm } from "@/components/admin/ProductForm";
import { MobileAdminNav } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Edit Product — MTraders Admin",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true },
    }),
    getCategoriesWithCount(),
  ]);

  if (!product) notFound();

  const serialized = {
    ...product,
    createdAt: product.createdAt.toISOString(),
    images: parseJSON<string[]>(product.images, []),
    variants: product.variants.map((v) => ({
      ...v,
      attributes: parseJSON<Record<string, string>>(v.attributes, {}),
    })),
  };

  return (
    <div>
      <MobileAdminNav />
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-zinc-500">
        <Link href="/admin/products" className="hover:text-brand">
          Products
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-zinc-800">{product.name}</span>
      </nav>
      <h1 className="mb-6 text-2xl font-black tracking-tight sm:text-3xl">
        Edit Product
      </h1>
      <ProductForm categories={categories} initial={serialized} />
    </div>
  );
}
