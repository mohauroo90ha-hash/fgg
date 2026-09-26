import { prisma } from "./prisma";
import { parseJSON } from "./helpers";
import type {
  Attribute,
  CategoryWithMeta,
  HeroSlideMeta,
  ProductWithMeta,
  VariantWithMeta,
} from "@/types";

function serializeProduct(p: any): ProductWithMeta {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    description: p.description,
    basePrice: p.basePrice,
    categoryId: p.categoryId,
    category: {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug,
    },
    images: parseJSON<string[]>(p.images, []),
    status: p.status,
    featured: p.featured,
    createdAt: p.createdAt.toISOString(),
    variants: p.variants.map(
      (v: any): VariantWithMeta => ({
        id: v.id,
        sku: v.sku,
        price: v.price,
        stock: v.stock,
        attributes: parseJSON<Record<string, string>>(v.attributes, {}),
      })
    ),
  };
}

function serializeCategory(c: any, productCount: number): CategoryWithMeta {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    parentId: c.parentId,
    productCount,
    attributes: c.attributes.map(
      (a: any): Attribute => ({
        id: a.id,
        categoryId: a.categoryId,
        name: a.name,
        values: parseJSON<string[]>(a.values, []),
      })
    ),
  };
}

export async function getCategoriesWithCount(): Promise<CategoryWithMeta[]> {
  const cats = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: { attributes: true, _count: { select: { products: true } } },
  });
  return cats.map((c) => serializeCategory(c, c._count.products));
}

export async function getFeaturedProducts(): Promise<ProductWithMeta[]> {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", featured: true },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { category: true, variants: true },
  });
  return products.map(serializeProduct);
}

export async function getLatestProducts(take = 12): Promise<ProductWithMeta[]> {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take,
    include: { category: true, variants: true },
  });
  return products.map(serializeProduct);
}

export async function getProductBySlug(slug: string) {
  const p = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, variants: true },
  });
  return p ? serializeProduct(p) : null;
}

export async function getCategoryBySlug(slug: string) {
  const cat = await prisma.category.findUnique({
    where: { slug },
    include: {
      attributes: true,
      products: { include: { category: true, variants: true } },
    },
  });
  if (!cat) return null;
  return {
    category: serializeCategory(cat, cat.products.length),
    products: cat.products
      .filter((p) => p.status === "ACTIVE")
      .map(serializeProduct),
  };
}

export async function getRelatedProducts(
  product: ProductWithMeta,
  take = 8
): Promise<ProductWithMeta[]> {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take,
    include: { category: true, variants: true },
  });
  return products.map(serializeProduct);
}

export async function searchProducts(query: string): Promise<ProductWithMeta[]> {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { name: { contains: query } },
        { brand: { contains: query } },
        { description: { contains: query } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: { category: true, variants: true },
  });
  return products.map(serializeProduct);
}

export async function getHeroSlides(): Promise<HeroSlideMeta[]> {
  const slides = await prisma.heroSlide.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return slides.map((s) => ({
    id: s.id,
    tag: s.tag,
    title: s.title,
    subtitle: s.subtitle,
    cta: s.cta,
    href: s.href,
    image: s.image,
    gradient: s.gradient,
    text: (s.text === "light" ? "light" : "dark") as "dark" | "light",
    active: s.active,
    sortOrder: s.sortOrder,
  }));
}

export async function getAllHeroSlides(): Promise<HeroSlideMeta[]> {
  const slides = await prisma.heroSlide.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return slides.map((s) => ({
    id: s.id,
    tag: s.tag,
    title: s.title,
    subtitle: s.subtitle,
    cta: s.cta,
    href: s.href,
    image: s.image,
    gradient: s.gradient,
    text: (s.text === "light" ? "light" : "dark") as "dark" | "light",
    active: s.active,
    sortOrder: s.sortOrder,
  }));
}

export async function getAdminStats() {
  const [productCount, categoryCount, orderCount, revenue, lowStock] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.variant.count({ where: { stock: { lte: 5 } } }),
    ]);
  return {
    productCount,
    categoryCount,
    orderCount,
    revenue: revenue._sum.total ?? 0,
    lowStock,
  };
}
