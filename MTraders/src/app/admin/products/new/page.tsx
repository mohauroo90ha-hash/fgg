import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCategoriesWithCount } from "@/lib/data";
import { ProductForm } from "@/components/admin/ProductForm";
import { MobileAdminNav } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Add Product — MTraders Admin",
};

export default async function NewProductPage() {
  const categories = await getCategoriesWithCount();

  return (
    <div>
      <MobileAdminNav />
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-zinc-500">
        <Link href="/admin/products" className="hover:text-brand">
          Products
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-zinc-800">New product</span>
      </nav>
      <h1 className="mb-6 text-2xl font-black tracking-tight sm:text-3xl">
        Add Product
      </h1>
      <ProductForm categories={categories} />
    </div>
  );
}
