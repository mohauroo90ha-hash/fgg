import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { getAllHeroSlides } from "@/lib/data";
import { saveUploadedImage } from "@/lib/upload";

export async function GET() {
  try {
    const slides = await getAllHeroSlides();
    return NextResponse.json(slides);
  } catch (e) {
    console.error("Get hero slides error:", e);
    return NextResponse.json({ error: "Failed to load hero slides." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const form = await req.formData();
    const tag = String(form.get("tag") || "").trim();
    const title = String(form.get("title") || "").trim();
    const subtitle = String(form.get("subtitle") || "").trim() || null;
    const cta = String(form.get("cta") || "").trim() || null;
    const href = String(form.get("href") || "").trim() || null;
    const gradient = String(form.get("gradient") || "").trim() || null;
    const text = String(form.get("text") || "dark") === "light" ? "light" : "dark";
    const active = String(form.get("active")) !== "false";
    const sortOrder = parseInt(String(form.get("sortOrder") || "0"), 10) || 0;

    if (!tag || !title) {
      return NextResponse.json(
        { error: "Tag and title are required." },
        { status: 400 }
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

    const count = await prisma.heroSlide.count();
    const slide = await prisma.heroSlide.create({
      data: {
        tag,
        title,
        subtitle,
        cta,
        href,
        image,
        gradient,
        text,
        active,
        sortOrder: sortOrder || count,
      },
    });

    return NextResponse.json(slide, { status: 201 });
  } catch (e) {
    console.error("Create hero slide error:", e);
    return NextResponse.json(
      { error: "Failed to create hero slide." },
      { status: 500 }
    );
  }
}