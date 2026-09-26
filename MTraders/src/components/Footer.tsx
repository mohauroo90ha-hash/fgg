import Link from "next/link";

const shopLinks = ["shoes", "watches", "perfumes", "bags", "accessories"];

export function Footer() {
  return (
    <footer className="mt-16 bg-brand text-zinc-300">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent font-black text-brand">
              MT
            </span>
            <span className="text-xl font-black tracking-tight text-white">
              MTraders
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            Premium fashion for every style — shoes, watches, perfumes, bags and
            accessories.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
            Shop
          </h3>
          <ul className="space-y-2 text-sm">
            {shopLinks.map((s) => (
              <li key={s}>
                <Link
                  href={`/category/${s}`}
                  className="capitalize text-zinc-400 transition-colors hover:text-accent"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
            Account
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/cart" className="text-zinc-400 transition-colors hover:text-accent">
                Cart
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-zinc-400 transition-colors hover:text-accent">
                Sign in
              </Link>
            </li>
            <li>
              <Link href="/register" className="text-zinc-400 transition-colors hover:text-accent">
                Create account
              </Link>
            </li>
            <li>
              <Link href="/admin" className="text-zinc-400 transition-colors hover:text-accent">
                Admin panel
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
            Contact
          </h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>hello@mtraders.com</li>
            <li>Mon–Sat, 9:00–18:00</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} MTraders. All rights reserved.
      </div>
    </footer>
  );
}
