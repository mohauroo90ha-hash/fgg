import { getAllHeroSlides } from "@/lib/data";
import { HeroSlideManager } from "@/components/admin/HeroSlideManager";
import { MobileAdminNav } from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Hero Slides — MTraders Admin",
};

export default async function AdminHeroSlidesPage() {
  const slides = await getAllHeroSlides();

  return (
    <div>
      <MobileAdminNav />
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          Hero Slides
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage the banners shown on the storefront homepage.
        </p>
      </div>
      <HeroSlideManager slides={slides} />
    </div>
  );
}