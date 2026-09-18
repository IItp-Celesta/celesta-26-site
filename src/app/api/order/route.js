import { NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebaseAdmin";
import { orderRequestSchema } from "@/lib/schemas";
import { Timestamp } from "firebase-admin/firestore";
import { calculateCartTotal } from "@/lib/pricing_algo";
import eventsData from "@/app/events/events.json"; 

const EVENT_FEES = new Map(
  eventsData.events.map((e) => [
    e.name.toLowerCase().replace(/\s+/g, "-"),
    Number(e.fee),
  ]),
);

function resolveTrustedItemCost(item) {
  if (item.type === "event" || String(item.id).startsWith("EVENT_")) {
    const parts = String(item.id).split("_");
    const slug = parts.slice(1, -1).join("_");
    const fee = EVENT_FEES.get(slug);

    if (typeof fee !== "number") {
      throw new Error(`Unknown or unpriced event in cart: ${item.id}`);
    }

    const numMembers = parseInt(
      item.teamDetails?.numMembers ?? item.teamDetails?.members?.length ?? 1,
      10,
    );

    return { ...item, cost: fee * numMembers };
  }

  const { cost, ...rest } = item;
  return rest;
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let uid, verifiedEmail;
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      uid = decodedToken.uid;
      verifiedEmail = decodedToken.email;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = orderRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { cart, payload } = parsed.data;
    const trustedEmail = verifiedEmail || payload.email;

    let trustedCart;
    try {
      trustedCart = cart.map(resolveTrustedItemCost);
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    const trustedTotal = calculateCartTotal(trustedCart);

    const docRef = await adminFirestore.collection("invoices").add({
      cart: trustedCart,
      payload,
      email: trustedEmail,
      total: trustedTotal,
      status: "PENDING",
      createdAt: Timestamp.now(),
      uid,
    });

    return NextResponse.json(
      { success: true, id: docRef.id, total: trustedTotal },
      { status: 201 },
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
