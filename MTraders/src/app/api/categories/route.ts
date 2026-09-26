import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { getCategoriesWithCount } from "@/lib/data";
import { saveUploadedImage } from "@/lib/upload";

export async function GET() {
  try {
    const categories = await getCategoriesWithCount();
    return NextResponse.json(categories);
  } catch (e) {
    console.error("Get categories error:", e);
    return NextResponse.json({ error: "Failed to load categories." }, { status: 500 });
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
    const slug = String(form.get("slug") || "").trim();
    const description = String(form.get("description") || "").trim() || null;
    const attributes = JSON.parse(String(form.get("attributes") || "[]"));

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required." },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A category with this slug already exists." },
        { status: 409 }
      );
    }

    const imageFile = form.get("image");
    let image: string | null = null;
    if (imageFile instanceof File && imageFile.size > 0) {
      try {
        image = await saveUploadedImage(imageFile);
      } catch (e) {
        console.error("Upload error:", e);
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        attributes: {
          create: (attributes ?? []).map(
            (a: { name: string; values: string[] }) => ({
              name: a.name,
              values: JSON.stringify(a.values),
            })
          ),
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (e) {
    console.error("Create category error:", e);
    return NextResponse.json(
      { error: "Failed to create category." },
      { status: 500 }
    );
  }
}
