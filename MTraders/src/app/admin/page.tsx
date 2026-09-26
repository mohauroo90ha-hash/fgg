import Link from "next/link";
import { Package, Tags, ShoppingBag, DollarSign, AlertTriangle, Plus, ArrowUpRight } from "lucide-react";
import { getAdminStats, getLatestProducts } from "@/lib/data";
import { formatPrice } from "@/lib/helpers";
import { MobileAdminNav } from "@/components/admin/AdminSidebar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export const metadata = {
  title: "Dashboard — MTraders Admin",
};

export default async function AdminDashboard() {
  const [stats, latest] = await Promise.all([
    getAdminStats(),
    getLatestProducts(6),
  ]);

  const statCards = [
    { label: "Products", value: stats.productCount, icon: Package, color: "bg-blue-100 text-blue-600" },
    { label: "Categories", value: stats.categoryCount, icon: Tags, color: "bg-purple-100 text-purple-600" },
    { label: "Orders", value: stats.orderCount, icon: ShoppingBag, color: "bg-amber-100 text-amber-600" },
    { label: "Revenue", value: formatPrice(stats.revenue), icon: DollarSign, color: "bg-emerald-100 text-emerald-600" },
  ];

  return (
    <div>
      <MobileAdminNav />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Overview of your MTraders store.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
        >
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardBody className="flex items-center gap-4">
              <span className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm text-zinc-500">{card.label}</p>
                <p className="text-xl font-black">{card.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {stats.lowStock > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            <span className="font-bold">{stats.lowStock}</span>{" "}
            {stats.lowStock === 1 ? "variant is" : "variants are"} running low on
            stock (≤ 5 units).
          </p>
        </div>
      )}

      <Card className="mt-6">
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-bold">Latest Products</h2>
          <Link
            href="/admin/products"
            className="flex items-center gap-1 text-sm font-semibold text-accent-dark hover:underline"
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-400">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {latest.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/products/${p.id}/edit`} className="font-medium hover:text-accent-dark">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-zinc-500">{p.category.name}</td>
                  <td className="px-5 py-3 font-medium">{formatPrice(p.basePrice)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
