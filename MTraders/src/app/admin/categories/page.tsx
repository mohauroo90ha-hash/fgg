import { getCategoriesWithCount } from "@/lib/data";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { MobileAdminNav } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Categories — MTraders Admin",
};

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesWithCount();

  return (
    <div>
      <MobileAdminNav />
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Categories</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage categories and their custom attributes.
        </p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}
