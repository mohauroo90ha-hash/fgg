import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseJSON, formatPrice } from "@/lib/helpers";
import { MobileAdminNav } from "@/components/admin/AdminSidebar";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardHeader } from "@/components/ui/Card";
import { PlaceholderImage } from "@/components/PlaceholderImage";

export const metadata = {
  title: "Products — MTraders Admin",
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, variants: true, _count: { select: { orderItems: true } } },
  });

  return (
    <div>
      <MobileAdminNav />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {products.length} products in your catalog.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
        >
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardHeader className="flex flex-col items-center gap-2 py-16 text-center">
            <Package className="h-10 w-10 text-zinc-300" />
            <p className="font-semibold text-zinc-700">No products yet</p>
            <p className="text-sm text-zinc-500">
              Add your first product to start selling.
            </p>
            <Link
              href="/admin/products/new"
              className="mt-2 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-brand"
            >
              <Plus className="h-4 w-4" /> Add product
            </Link>
          </CardHeader>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wider text-zinc-400">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const minPrice = Math.min(
                  p.basePrice,
                  ...p.variants.map((v) => v.price)
                );
                const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
                return (
                  <tr key={p.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60">
                    <td className="px-5 py-3">
                      <Link href={`/admin/products/${p.id}/edit`} className="flex items-center gap-3">
                        <PlaceholderImage
                          src={parseJSON<string[]>(p.images, [])[0]}
                          alt={p.name}
                          label={p.name.charAt(0)}
                          className="h-12 w-12 shrink-0 rounded-md"
                        />
                        <span className="font-medium hover:text-accent-dark">{p.name}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-zinc-500">{p.category.name}</td>
                    <td className="px-5 py-3 font-medium">{formatPrice(minPrice)}</td>
                    <td className="px-5 py-3">
                      <span className={totalStock <= 5 ? "font-semibold text-red-500" : "text-zinc-600"}>
                        {totalStock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-zinc-500">{p._count.orderItems}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-semibold text-zinc-600 transition-colors hover:border-brand hover:text-brand"
                        >
                          Edit
                        </Link>
                        <DeleteProductButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
