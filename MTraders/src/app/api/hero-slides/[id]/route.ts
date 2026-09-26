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
    const slide = await prisma.heroSlide.findUnique({ where: { id } });
    if (!slide) {
      return NextResponse.json({ error: "Hero slide not found." }, { status: 404 });
    }

    const form = await req.formData();
    const tag = String(form.get("tag") || "").trim();
    const title = String(form.get("title") || "").trim();
    const subtitle = String(form.get("subtitle") || "").trim();
    const cta = String(form.get("cta") || "").trim();
    const href = String(form.get("href") || "").trim();
    const gradient = String(form.get("gradient") || "").trim();
    const text = String(form.get("text") || "dark") === "light" ? "light" : "dark";
    const active = String(form.get("active")) !== "false";
    const sortOrder = parseInt(String(form.get("sortOrder") || "0"), 10) || 0;

    const imageFile = form.get("image");
    const removeImage = String(form.get("removeImage")) === "true";
    let image = slide.image;
    if (imageFile instanceof File && imageFile.size > 0) {
      try {
        image = await saveUploadedImage(imageFile);
      } catch (e) {
        console.error("Upload error:", e);
      }
    } else if (removeImage) {
      image = null;
    }

    await prisma.heroSlide.update({
      where: { id },
      data: {
        tag: tag || slide.tag,
        title: title || slide.title,
        subtitle: subtitle !== "" ? subtitle : slide.subtitle,
        cta: cta !== "" ? cta : slide.cta,
        href: href !== "" ? href : slide.href,
        gradient: gradient !== "" ? gradient : slide.gradient,
        image,
        text,
        active,
        sortOrder,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Update hero slide error:", e);
    return NextResponse.json(
      { error: "Failed to update hero slide." },
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
    const slide = await prisma.heroSlide.findUnique({ where: { id } });
    if (!slide) {
      return NextResponse.json({ error: "Hero slide not found." }, { status: 404 });
    }

    await prisma.heroSlide.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Delete hero slide error:", e);
    return NextResponse.json(
      { error: "Failed to delete hero slide." },
      { status: 500 }
    );
  }
}