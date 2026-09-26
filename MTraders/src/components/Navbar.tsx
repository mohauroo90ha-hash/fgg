"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  ShoppingBag,
  Search,
  User,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Plus,
} from "lucide-react";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";
import type { CategoryWithMeta } from "@/types";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryWithMeta[]>([]);
  const [query, setQuery] = useState("");
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const count = useCart((s) => s.count());
  const openCart = useUI((s) => s.openCart);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCatsOpen(false);
    setUserOpen(false);
  }, [pathname]);

  const isAdmin = session?.user?.role === "ADMIN";

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-brand/95 shadow-lg backdrop-blur" : "bg-brand"
      )}
    >
      <div className="container-x flex h-16 items-center gap-3 lg:h-20">
        <button
          className="text-white lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent font-black text-brand">
            MT
          </span>
          <span className="text-xl font-black tracking-tight text-white">
            MTraders
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            Home
          </Link>
          <div
            className="relative"
            onMouseEnter={() => setCatsOpen(true)}
            onMouseLeave={() => setCatsOpen(false)}
          >
            <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white">
              Shop <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {catsOpen && (
              <div className="absolute left-0 top-full w-56 rounded-lg border border-zinc-200 bg-white p-2 shadow-xl">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/category/${c.slug}`}
                    className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-accent/10 hover:text-brand"
                  >
                    <span className="flex items-center gap-2.5">
                      {c.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.image}
                          alt=""
                          className="h-7 w-7 rounded object-cover"
                        />
                      )}
                      {c.name}
                    </span>
                    <span className="text-xs text-zinc-400">{c.productCount}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="ml-auto hidden max-w-xs flex-1 md:block">
          <form onSubmit={submitSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="h-10 w-full rounded-md border border-white/15 bg-white/10 pl-9 pr-3 text-sm text-white placeholder:text-zinc-400 focus:border-accent focus:outline-none"
            />
          </form>
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          {status === "loading" ? null : session?.user ? (
            <div className="relative">
              <button
                onClick={() => setUserOpen((v) => !v)}
                className="flex h-10 items-center gap-2 rounded-md px-2 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm font-bold text-brand">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </span>
                <span className="hidden max-w-[90px] truncate text-sm font-medium lg:block">
                  {session.user.name}
                </span>
              </button>
              {userOpen && (
                <div className="absolute right-0 top-full w-56 rounded-lg border border-zinc-200 bg-white p-2 shadow-xl">
                  <div className="border-b border-zinc-100 px-3 py-2 text-sm text-zinc-500">
                    {session.user.email}
                  </div>
                  {isAdmin && (
                    <>
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                      >
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                      <Link
                        href="/admin/products/new"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                      >
                        <Plus className="h-4 w-4" /> Add product
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:block">Sign in</span>
            </Link>
          )}

          <button
            onClick={openCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-md text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-brand">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-brand lg:hidden">
          <div className="container-x py-3">
            <form onSubmit={submitSearch} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="h-10 w-full rounded-md border border-white/15 bg-white/10 pl-9 pr-3 text-sm text-white placeholder:text-zinc-400 focus:border-accent focus:outline-none"
              />
            </form>
            <Link
              href="/"
              className="block rounded-md px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
            >
              Home
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="block rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-white/10"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
