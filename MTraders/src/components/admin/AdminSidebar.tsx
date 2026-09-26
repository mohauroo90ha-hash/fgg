"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Plus,
  ArrowLeft,
  Image,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/hero-slides", label: "Hero Slides", icon: Image },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <div className="sticky top-28 space-y-1">
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}

        <div className="border-t border-zinc-200 pt-3">
          <Link
            href="/admin/products/new"
            className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-accent-dark"
          >
            <Plus className="h-4 w-4" /> Add product
          </Link>
          <Link
            href="/"
            className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100"
          >
            <ArrowLeft className="h-4 w-4" /> Back to store
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function MobileAdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="sticky top-16 z-40 -mx-4 mb-5 flex items-center gap-2 border-b border-zinc-200 bg-zinc-50/95 px-4 py-2.5 backdrop-blur md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 transition-colors hover:text-brand"
          aria-label="Open admin menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <p className="text-sm font-semibold text-zinc-600">Admin menu</p>
        <Link
          href="/admin/products/new"
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-black"
        >
          <Plus className="h-3.5 w-3.5" /> Add product
        </Link>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/40"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 flex h-full w-72 max-w-[85vw] flex-col bg-white p-4 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2 font-black text-brand">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-sm text-brand">
                    MT
                  </span>
                  MTraders Admin
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-100"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {links.map((link) => {
                  const active = link.exact
                    ? pathname === link.href
                    : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-brand text-white"
                          : "text-zinc-600 hover:bg-zinc-100"
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-zinc-200 pt-3">
                <Link
                  href="/admin/products/new"
                  className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-accent-dark"
                >
                  <Plus className="h-4 w-4" /> Add product
                </Link>
                <Link
                  href="/"
                  className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-100"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to store
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
