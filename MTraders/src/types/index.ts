export type Role = "USER" | "ADMIN";

export interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: Role;
  image?: string | null;
}

export interface Attribute {
  id: string;
  categoryId: string;
  name: string;
  values: string[];
}

export interface CategoryWithMeta {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  productCount: number;
  attributes: Attribute[];
}

export interface HeroSlideMeta {
  id: string;
  tag: string;
  title: string;
  subtitle: string | null;
  cta: string | null;
  href: string | null;
  image: string | null;
  gradient: string | null;
  text: "dark" | "light";
  active: boolean;
  sortOrder: number;
}

export interface VariantWithMeta {
  id: string;
  sku: string | null;
  price: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface ProductWithMeta {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  description: string | null;
  basePrice: number;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  images: string[];
  status: string;
  featured: boolean;
  createdAt: string;
  variants: VariantWithMeta[];
}

export interface CartLine {
  productId: string;
  productSlug: string;
  variantId?: string;
  productName: string;
  brand?: string;
  price: number;
  image?: string;
  attributes: Record<string, string>;
  quantity: number;
  stock: number;
}
