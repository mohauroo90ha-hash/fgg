"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { formatPrice } from "@/lib/helpers";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

interface OrderRow {
  id: string;
  customerName: string;
  email: string;
  phone: string | null;
  address: string;
  city: string;
  country: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
    attributes: Record<string, string>;
  }>;
}

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const changeStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {orders.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 py-20 text-center">
          <p className="font-semibold text-zinc-700">No orders yet</p>
          <p className="mt-1 text-sm text-zinc-500">
            Orders placed in the store will appear here.
          </p>
        </div>
      )}

      {orders.map((order) => (
        <div key={order.id} className="rounded-xl border border-zinc-200 bg-white shadow-sm">
          <button
            onClick={() => setOpenId(openId === order.id ? null : order.id)}
            className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
          >
            <div className="flex items-center gap-4">
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-zinc-400 transition-transform",
                  openId === order.id && "rotate-180"
                )}
              />
              <div>
                <p className="font-bold">#{order.id.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-zinc-400">
                  {new Date(order.createdAt).toLocaleString()} · {order.items.reduce((s, i) => s + i.quantity, 0)} items
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold">{formatPrice(order.total)}</span>
              <StatusBadge status={order.status} />
            </div>
          </button>

          {openId === order.id && (
            <div className="border-t border-zinc-100 px-5 py-4">
              <div className="mb-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Customer
                  </p>
                  <p className="mt-1 font-medium">{order.customerName}</p>
                  <p className="text-zinc-500">{order.email}</p>
                  {order.phone && <p className="text-zinc-500">{order.phone}</p>}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Shipping address
                  </p>
                  <p className="mt-1 font-medium">{order.address}</p>
                  <p className="text-zinc-500">
                    {order.city}, {order.country}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Order status
                  </p>
                  <select
                    value={order.status}
                    onChange={(e) => changeStatus(order.id, e.target.value)}
                    disabled={updating === order.id}
                    className="mt-1 h-9 rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium focus:border-accent focus:outline-none disabled:opacity-50"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 px-4 py-2.5 text-sm"
                  >
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      {Object.keys(item.attributes).length > 0 && (
                        <p className="text-xs text-zinc-400">
                          {Object.entries(item.attributes)
                            .map(([, v]) => v)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-zinc-500">
                      × {item.quantity} —{" "}
                      <span className="font-semibold text-zinc-800">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
