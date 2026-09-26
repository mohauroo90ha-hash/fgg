import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Shoes",
    slug: "shoes",
    description: "Sneakers, boots, formal and casual footwear.",
    attributes: [
      { name: "Size", values: ["39", "40", "41", "42", "43", "44", "45"] },
      { name: "Color", values: ["Black", "White", "Red", "Navy", "Tan"] },
    ],
  },
  {
    name: "Watches",
    slug: "watches",
    description: "Luxury, sport and everyday timepieces.",
    attributes: [
      { name: "Strap Material", values: ["Leather", "Steel", "Rubber", "Nylon"] },
      { name: "Movement", values: ["Quartz", "Automatic", "Solar"] },
      { name: "Dial Color", values: ["Black", "Silver", "Blue", "Gold"] },
    ],
  },
  {
    name: "Perfumes",
    slug: "perfumes",
    description: "Signature scents for every personality.",
    attributes: [
      { name: "Volume", values: ["30ml", "50ml", "100ml"] },
      { name: "Concentration", values: ["Eau de Toilette", "Eau de Parfum"] },
      { name: "Scent Family", values: ["Woody", "Floral", "Fresh", "Oriental"] },
    ],
  },
  {
    name: "Bags",
    slug: "bags",
    description: "Backpacks, totes, handbags and travel bags.",
    attributes: [
      { name: "Size", values: ["Small", "Medium", "Large"] },
      { name: "Color", values: ["Black", "Brown", "Beige", "Olive"] },
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Belts, sunglasses, wallets and more.",
    attributes: [
      { name: "Color", values: ["Black", "Brown", "Silver", "Gold"] },
      { name: "Material", values: ["Leather", "Metal", "Plastic", "Fabric"] },
    ],
  },
];

const productSeeds: Array<{
  categorySlug: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  variants: Array<{ price?: number; stock: number; attrs: Record<string, string> }>;
  featured?: boolean;
}> = [
  {
    categorySlug: "shoes",
    name: "Air Runner Pro",
    brand: "Stride",
    description: "Lightweight running sneaker with breathable mesh upper and cushioned sole.",
    price: 129.99,
    featured: true,
    variants: [
      { stock: 12, attrs: { Size: "41", Color: "Black" } },
      { stock: 8, attrs: { Size: "42", Color: "Black" } },
      { stock: 5, attrs: { Size: "43", Color: "White" } },
    ],
  },
  {
    categorySlug: "shoes",
    name: "Urban Boot Classic",
    brand: "Northsole",
    description: "Durable ankle-high boot with premium leather finish and rugged grip.",
    price: 189.99,
    featured: true,
    variants: [
      { stock: 6, attrs: { Size: "42", Color: "Tan" } },
      { stock: 4, attrs: { Size: "43", Color: "Tan" } },
      { stock: 3, attrs: { Size: "41", Color: "Navy" } },
    ],
  },
  {
    categorySlug: "shoes",
    name: "Suede Court Sneaker",
    brand: "Stride",
    description: "Classic court-style sneaker in soft suede with a clean white sole.",
    price: 99.99,
    variants: [
      { stock: 10, attrs: { Size: "40", Color: "White" } },
      { stock: 7, attrs: { Size: "41", Color: "Red" } },
    ],
  },
  {
    categorySlug: "watches",
    name: "Heritage Automatic",
    brand: "Tyme",
    description: "Self-winding automatic watch with sapphire crystal and steel bracelet.",
    price: 349.99,
    featured: true,
    variants: [
      { stock: 4, attrs: { Strap: "Steel", Movement: "Automatic", Dial: "Silver" } },
      { stock: 3, attrs: { Strap: "Leather", Movement: "Automatic", Dial: "Black" } },
    ],
  },
  {
    categorySlug: "watches",
    name: "Sport Dive 200",
    brand: "Tyme",
    description: "Water resistant sport watch built for adventure and everyday wear.",
    price: 199.99,
    variants: [
      { stock: 9, attrs: { Strap: "Rubber", Movement: "Quartz", Dial: "Blue" } },
    ],
  },
  {
    categorySlug: "watches",
    name: "Minimal Slim Quartz",
    brand: "Nova",
    description: "Slim, understated quartz watch with minimalist dial.",
    price: 89.99,
    variants: [
      { stock: 15, attrs: { Strap: "Nylon", Movement: "Quartz", Dial: "Black" } },
      { stock: 11, attrs: { Strap: "Leather", Movement: "Quartz", Dial: "Gold" } },
    ],
  },
  {
    categorySlug: "perfumes",
    name: "Midnight Oud",
    brand: "Aroma",
    description: "A bold oriental fragrance with oud, amber and warm spices.",
    price: 119.99,
    featured: true,
    variants: [
      { price: 119.99, stock: 10, attrs: { Volume: "100ml", Concentration: "Eau de Parfum", Family: "Oriental" } },
      { price: 79.99, stock: 12, attrs: { Volume: "50ml", Concentration: "Eau de Parfum", Family: "Oriental" } },
    ],
  },
  {
    categorySlug: "perfumes",
    name: "Fresh Citrus Eau",
    brand: "Aroma",
    description: "Bright, clean citrus scent perfect for everyday freshness.",
    price: 59.99,
    variants: [
      { stock: 14, attrs: { Volume: "50ml", Concentration: "Eau de Toilette", Family: "Fresh" } },
    ],
  },
  {
    categorySlug: "perfumes",
    name: "Velvet Rose",
    brand: "Belle",
    description: "Romantic floral bouquet with rose, jasmine and soft musk.",
    price: 99.99,
    variants: [
      { stock: 8, attrs: { Volume: "100ml", Concentration: "Eau de Parfum", Family: "Floral" } },
    ],
  },
  {
    categorySlug: "bags",
    name: "Weekender Tote",
    brand: "Carry",
    description: "Spacious canvas tote with leather straps for travel and work.",
    price: 79.99,
    featured: true,
    variants: [
      { stock: 10, attrs: { Size: "Large", Color: "Beige" } },
      { stock: 6, attrs: { Size: "Medium", Color: "Brown" } },
    ],
  },
  {
    categorySlug: "bags",
    name: "Urban Backpack",
    brand: "Carry",
    description: "Sleek everyday backpack with padded laptop sleeve.",
    price: 69.99,
    variants: [
      { stock: 13, attrs: { Size: "Medium", Color: "Black" } },
      { stock: 5, attrs: { Size: "Large", Color: "Olive" } },
    ],
  },
  {
    categorySlug: "accessories",
    name: "Premium Leather Belt",
    brand: "Northsole",
    description: "Full-grain leather belt with polished metal buckle.",
    price: 39.99,
    variants: [
      { stock: 20, attrs: { Color: "Black", Material: "Leather" } },
      { stock: 15, attrs: { Color: "Brown", Material: "Leather" } },
    ],
  },
  {
    categorySlug: "accessories",
    name: "Aviator Sunglasses",
    brand: "Eclips",
    description: "Classic aviator sunglasses with UV400 lenses.",
    price: 49.99,
    variants: [
      { stock: 18, attrs: { Color: "Gold", Material: "Metal" } },
    ],
  },
];

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Seeding MTraders database...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@mtraders.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "MTraders Admin",
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      },
    });
    categoryMap[cat.slug] = created.id;

    for (const attr of cat.attributes) {
      const existing = await prisma.attribute.findFirst({
        where: { categoryId: created.id, name: attr.name },
      });
      if (!existing) {
        await prisma.attribute.create({
          data: { categoryId: created.id, name: attr.name, values: JSON.stringify(attr.values) },
        });
      }
    }
  }

  for (const p of productSeeds) {
    const categoryId = categoryMap[p.categorySlug];
    if (!categoryId) continue;

    const slug = slugify(p.name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) continue;

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug,
        brand: p.brand,
        description: p.description,
        basePrice: p.price,
        categoryId,
        images: "[]",
        status: "ACTIVE",
        featured: p.featured ?? false,
      },
    });

    for (const v of p.variants) {
      await prisma.variant.create({
        data: {
          productId: product.id,
          sku: `${slug.toUpperCase().replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          price: v.price ?? p.price,
          stock: v.stock,
          attributes: JSON.stringify(v.attrs),
        },
      });
    }
  }

  const heroSlides = [
    {
      tag: "New Season",
      title: "Step Into the New Drop",
      subtitle: "Fresh sneakers and boots for every walk of life.",
      cta: "Shop Shoes",
      href: "/category/shoes",
      gradient: "linear-gradient(120deg,#f5e6d3 0%,#e8c9a0 100%)",
      text: "dark",
      active: true,
      sortOrder: 0,
    },
  ];

  const existingHeroSlides = await prisma.heroSlide.count();
  if (existingHeroSlides === 0) {
    for (const s of heroSlides) {
      await prisma.heroSlide.create({ data: s });
    }
    console.log(`Seeded ${heroSlides.length} hero slide(s).`);
  } else {
    console.log(`Skipping hero slides: ${existingHeroSlides} already exist.`);
  }

  const count = await prisma.product.count();
  const catCount = await prisma.category.count();
  console.log(`Done. ${catCount} categories, ${count} products seeded.`);
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
