import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { saveUploadedImage } from "@/lib/upload";

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
    const form = await req.formData();
    const name = String(form.get("name") || "").trim();
    const slug = String(form.get("slug") || "").trim();
    const description = String(form.get("description") || "").trim();
    const attributes = JSON.parse(String(form.get("attributes") || "[]"));

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    if (slug) {
      const conflict = await prisma.category.findUnique({ where: { slug } });
      if (conflict && conflict.id !== id) {
        return NextResponse.json(
          { error: "A category with this slug already exists." },
          { status: 409 }
        );
      }
    }

    const imageFile = form.get("image");
    const removeImage = String(form.get("removeImage")) === "true";
    let image = category.image;
    if (imageFile instanceof File && imageFile.size > 0) {
      try {
        image = await saveUploadedImage(imageFile);
      } catch (e) {
        console.error("Upload error:", e);
      }
    } else if (removeImage) {
      image = null;
    }

    await prisma.$transaction(async (tx) => {
      await tx.category.update({
        where: { id },
        data: {
          name: name || category.name,
          slug: slug || category.slug,
          description: description !== "" ? description : category.description,
          image,
        },
      });

      if (form.has("attributes")) {
        await tx.attribute.deleteMany({ where: { categoryId: id } });
        await tx.attribute.createMany({
          data: attributes
            .filter((a: any) => a.name?.trim())
            .map((a: any) => ({
              categoryId: id,
              name: a.name.trim(),
              values: JSON.stringify(a.values ?? []),
            })),
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Update category error:", e);
    return NextResponse.json(
      { error: "Failed to update category." },
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
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Delete category error:", e);
    return NextResponse.json(
      { error: "Failed to delete category." },
      { status: 500 }
    );
  }
}
