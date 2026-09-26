"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/helpers";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    address: "",
    city: "",
    country: "",
    phone: "",
  });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | {
    id: string;
    total: number;
  }>(null);

  const shipping = subtotal() >= 99 || items.length === 0 ? 0 : 9.99;
  const total = subtotal() + shipping;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.customerName || !form.email || !form.address || !form.city || !form.country) {
      setError("Please fill in all required fields.");
      return;
    }

    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");

      setDone({ id: data.id, total: data.total });
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  if (done) {
    return (
      <div className="container-x flex flex-col items-center justify-center py-24 text-center">
        <CheckCircle2 className="h-16 w-16 text-emerald-500" />
        <h1 className="mt-4 text-2xl font-bold">Order confirmed!</h1>
        <p className="mt-2 max-w-md text-zinc-500">
          Thank you for shopping with MTraders. Your order{" "}
          <span className="font-semibold text-zinc-900">#{done.id.slice(-8).toUpperCase()}</span>{" "}
          has been placed for <span className="font-semibold">{formatPrice(done.total)}</span>.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={() => router.push("/")}>
            Continue shopping
          </Button>
          <Link href="/category/shoes">
            <Button>Shop more</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link href="/" className="mt-4 inline-block text-sm font-semibold text-accent-dark hover:underline">
          Go back to shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <h1 className="mb-6 text-3xl font-black tracking-tight">Checkout</h1>

      <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Lock className="h-4 w-4" /> Shipping Details
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="customerName">Full name *</Label>
              <Input id="customerName" value={form.customerName} onChange={set("customerName")} placeholder="John Doe" />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea id="address" value={form.address} onChange={set("address")} placeholder="Street, building, apartment" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input id="city" value={form.city} onChange={set("city")} placeholder="City" />
            </div>
            <div>
              <Label htmlFor="country">Country *</Label>
              <Input id="country" value={form.country} onChange={set("country")} placeholder="Country" />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={set("phone")} placeholder="+1 555 000 0000" />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}
        </div>

        <aside className="h-fit rounded-xl border border-zinc-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
          <h2 className="mb-4 text-lg font-bold">Order Summary</h2>
          <div className="mb-4 max-h-60 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex justify-between gap-2 text-sm">
                <span className="line-clamp-1 text-zinc-600">
                  {item.productName} × {item.quantity}
                </span>
                <span className="font-medium">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-zinc-200 pt-3 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal())}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-base">
              <span className="font-bold">Total</span>
              <span className="font-black text-brand">{formatPrice(total)}</span>
            </div>
          </div>
          <Button className="mt-6 w-full" size="lg" type="submit" loading={placing}>
            {placing ? "Placing order..." : "Place order"}
          </Button>
          <p className="mt-3 text-center text-xs text-zinc-400">
            Demo checkout — no real payment is processed.
          </p>
        </aside>
      </form>
    </div>
  );
}
