import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { parseJSON } from "@/lib/helpers";

export async function POST(req: Request) {
  try {
    const { customerName, email, address, city, country, phone, items } =
      await req.json();

    if (!customerName || !email || !address || !city || !country) {
      return NextResponse.json(
        { error: "Please fill in all required shipping fields." },
        { status: 400 }
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }

    let itemsTotal = 0;
    const orderItems: {
      productId: string;
      variantId?: string;
      productName: string;
      attributes: string;
      price: number;
      quantity: number;
    }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });
      if (!product) {
        return NextResponse.json(
          { error: "A product in your cart is no longer available." },
          { status: 400 }
        );
      }

      let price = product.basePrice;
      let variantId: string | undefined;
      let attrs: Record<string, string> = {};

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          return NextResponse.json(
            { error: "A selected option is no longer available." },
            { status: 400 }
          );
        }
        if (variant.stock < item.quantity) {
          return NextResponse.json(
            { error: `Not enough stock for ${product.name}.` },
            { status: 400 }
          );
        }
        price = variant.price;
        variantId = variant.id;
        attrs = parseJSON<Record<string, string>>(variant.attributes, {});
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      itemsTotal += price * qty;

      orderItems.push({
        productId: product.id,
        variantId,
        productName: product.name,
        attributes: JSON.stringify(attrs),
        price,
        quantity: qty,
      });

      if (variantId) {
        await prisma.variant.update({
          where: { id: variantId },
          data: { stock: { decrement: qty } },
        });
      }
    }

    const shipping = itemsTotal >= 99 ? 0 : 9.99;

    const session = await getServerSession(authOptions);

    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id || null,
        customerName,
        email,
        address,
        city,
        country,
        phone,
        status: "PAID",
        itemsTotal,
        shipping,
        total: itemsTotal + shipping,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    console.error("Create order error:", e);
    return NextResponse.json(
      { error: "Failed to place your order." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 200,
    });

    return NextResponse.json(
      orders.map((o) => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((i) => ({
          ...i,
          attributes: parseJSON<Record<string, string>>(i.attributes, {}),
        })),
      }))
    );
  } catch (e) {
    console.error("Get orders error:", e);
    return NextResponse.json({ error: "Failed to load orders." }, { status: 500 });
  }
}
