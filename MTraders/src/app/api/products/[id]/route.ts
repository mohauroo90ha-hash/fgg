import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { saveUploadedImage } from "@/lib/upload";
import { slugify, parseJSON } from "@/lib/helpers";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const form = await req.formData();
    const name = String(form.get("name") || "").trim() || product.name;
    const slug = String(form.get("slug") || "").trim() || slugify(name);
    const brand = String(form.get("brand") || "").trim() || null;
    const description = String(form.get("description") || "").trim() || null;
    const basePrice = parseFloat(String(form.get("basePrice")));
    const categoryId = String(form.get("categoryId") || product.categoryId);
    const status = String(form.get("status") || "ACTIVE");
    const featured = String(form.get("featured")) === "true";

    const finalPrice = isNaN(basePrice) || basePrice < 0 ? product.basePrice : basePrice;

    const slugConflict = await prisma.product.findUnique({ where: { slug } });
    if (slugConflict && slugConflict.id !== id) {
      return NextResponse.json(
        { error: "A product with this slug already exists." },
        { status: 409 }
      );
    }

    const variants = parseJSON<any[]>(String(form.get("variants") || "[]"), []);

    const keptImages = parseJSON<string[]>(
      String(form.get("keptImages") || "[]"),
      []
    );
    const files = form
      .getAll("images")
      .filter((f): f is File => typeof f === "object" && f !== null && "size" in f && f.size > 0);

    const uploaded: string[] = [];
    for (const file of files) {
      try {
        uploaded.push(await saveUploadedImage(file));
      } catch (e) {
        console.error("Upload error:", e);
      }
    }
    const images = [...keptImages, ...uploaded].slice(0, 4);

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name,
          slug,
          brand,
          description,
          basePrice: finalPrice,
          categoryId,
          status,
          featured,
          images: JSON.stringify(images),
        },
      });

      await tx.variant.deleteMany({ where: { productId: id } });

      if (variants.length > 0) {
        await tx.variant.createMany({
          data: variants.map((v) => ({
            productId: id,
            sku: v.sku || null,
            price: parseFloat(v.price) || finalPrice,
            stock: parseInt(v.stock, 10) || 0,
            attributes: JSON.stringify(v.attributes || {}),
          })),
        });
      }
    });

    const updated = await prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Update product error:", e);
    return NextResponse.json(
      { error: "Failed to update product." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Delete product error:", e);
    return NextResponse.json(
      { error: "Failed to delete product." },
      { status: 500 }
    );
  }
}
