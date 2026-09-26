import { prisma } from "@/lib/prisma";
import { parseJSON } from "@/lib/helpers";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { MobileAdminNav } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Orders — MTraders Admin",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 200,
  });

  const serialized = orders.map((o) => ({
    id: o.id,
    customerName: o.customerName,
    email: o.email,
    phone: o.phone,
    address: o.address,
    city: o.city,
    country: o.country,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      quantity: i.quantity,
      price: i.price,
      attributes: parseJSON<Record<string, string>>(i.attributes, {}),
    })),
  }));

  return (
    <div>
      <MobileAdminNav />
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {orders.length} orders · click an order to see details & update status.
        </p>
      </div>
      <OrdersTable orders={serialized} />
    </div>
  );
}
