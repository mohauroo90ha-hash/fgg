import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { saveUploadedImage } from "@/lib/upload";
import { slugify, parseJSON } from "@/lib/helpers";

function serializeAdminProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    description: p.description,
    basePrice: p.basePrice,
    categoryId: p.categoryId,
    category: { id: p.category.id, name: p.category.name, slug: p.category.slug },
    images: parseJSON<string[]>(p.images, []),
    status: p.status,
    featured: p.featured,
    createdAt: p.createdAt.toISOString(),
    variants: p.variants.map((v: any) => ({
      id: v.id,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      attributes: parseJSON<Record<string, string>>(v.attributes, {}),
    })),
  };
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true, variants: true },
    });
    return NextResponse.json(products.map(serializeAdminProduct));
  } catch (e) {
    console.error("Get products error:", e);
    return NextResponse.json({ error: "Failed to load products." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const form = await req.formData();
    const name = String(form.get("name") || "").trim();
    const slug = String(form.get("slug") || "").trim() || slugify(name);
    const brand = String(form.get("brand") || "").trim() || null;
    const description = String(form.get("description") || "").trim() || null;
    const basePrice = parseFloat(String(form.get("basePrice")));
    const categoryId = String(form.get("categoryId") || "");
    const status = String(form.get("status") || "ACTIVE");
    const featured = String(form.get("featured")) === "true";

    if (!name || !categoryId || isNaN(basePrice) || basePrice < 0) {
      return NextResponse.json(
        { error: "Name, category and a valid price are required." },
        { status: 400 }
      );
    }

    const slugExists = await prisma.product.findUnique({ where: { slug } });
    if (slugExists) {
      return NextResponse.json(
        { error: "A product with this slug already exists." },
        { status: 409 }
      );
    }

    const variants = parseJSON<any[]>(String(form.get("variants") || "[]"), []);
    if (variants.length === 0) {
      return NextResponse.json(
        { error: "Add at least one variant with a price and stock." },
        { status: 400 }
      );
    }

    const files = form
      .getAll("images")
      .filter((f): f is File => typeof f === "object" && f !== null && "size" in f && f.size > 0);

    const uploaded: string[] = [];
    for (const file of files.slice(0, 4)) {
      try {
        uploaded.push(await saveUploadedImage(file));
      } catch (e) {
        console.error("Upload error:", e);
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        brand,
        description,
        basePrice,
        categoryId,
        status,
        featured,
        images: JSON.stringify(uploaded),
        variants: {
          create: variants.map((v) => ({
            sku: v.sku || null,
            price: parseFloat(v.price) || basePrice,
            stock: parseInt(v.stock, 10) || 0,
            attributes: JSON.stringify(v.attributes || {}),
          })),
        },
      },
      include: { category: true, variants: true },
    });

    return NextResponse.json(serializeAdminProduct(product), { status: 201 });
  } catch (e) {
    console.error("Create product error:", e);
    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 }
    );
  }
}
