import { adminAuth, adminFirestore } from "@/lib/firebaseAdmin";
import { orderRequestSchema } from "@/lib/schemas";
import {
  calculateCartTotal,
  isEventItem,
  isPassItem,
} from "@/lib/pricing_algo";
import eventsData from "@/app/events/events.json";

const json = (body, status) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const feeBySlug = Object.fromEntries(
  eventsData.events.map((e) => [
    e.name.toLowerCase().replace(/\s+/g, "-"),
    e.fee,
  ]),
);

async function applyCoupon(rawCode, baseAmount) {
  const code = String(rawCode || "")
    .trim()
    .toUpperCase();
  if (!code) return { valid: false, message: "Please enter a coupon code" };

  const snap = await adminFirestore.collection("coupons").doc(code).get();
  if (!snap.exists) return { valid: false, message: "Invalid coupon code" };

  const coupon = snap.data();

  if (coupon.isActive === false) {
    return { valid: false, message: "This coupon is no longer active" };
  }

  if (coupon.expiresAt) {
    const expiry = new Date(coupon.expiresAt).getTime();
    if (!Number.isNaN(expiry) && Date.now() > expiry) {
      return { valid: false, message: "This coupon has expired" };
    }
  }

  const couponPrice = Number((coupon.prices || {})[String(baseAmount)]);
  if (!Number.isFinite(couponPrice)) {
    return {
      valid: false,
      message: "This coupon is not applicable to this cart",
    };
  }
  if (couponPrice < 0 || couponPrice > baseAmount) {
    return { valid: false, message: "Invalid coupon configuration" };
  }

  return { valid: true, code, couponPrice };
}

async function priceCart(cart) {
  return Promise.all(
    cart.map(async (item) => {
      if (isEventItem(item)) {
        const slug = /^EVENT_(.+)_\d+$/.exec(item.id)?.[1];
        const fee = feeBySlug[slug];
        if (fee === undefined) throw new Error("Unknown event");
        const numBots = parseInt(item.teamDetails?.numBots || 1, 10);
        const finalEventCost = fee * numBots;
        return { ...item, cost: finalEventCost, quantity: 1 };
      }
      const snap = await adminFirestore
        .collection("products")
        .doc(item.id)
        .get();
      if (!snap.exists) throw new Error("Unknown product");
      const p = snap.data();
      return { ...item, name: p.name, cost: p.cost };
    }),
  );
}

export async function POST(req) {
  try {
    const header = req.headers.get("authorization");
    if (!header?.startsWith("Bearer ")) {
      return json({ success: false, message: "Unauthorized" }, 401);
    }
    let uid;
    try {
      uid = (await adminAuth.verifyIdToken(header.split("Bearer ")[1])).uid;
    } catch {
      return json({ success: false, message: "Unauthorized" }, 401);
    }

    const parsed = orderRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ success: false, message: "Invalid payload format." }, 400);
    }

    let cart;
    try {
      cart = await priceCart(parsed.data.cart);
    } catch {
      return json({ success: false, message: "Invalid cart item." }, 400);
    }

    const pastSnap = await adminFirestore
      .collection("invoices")
      .where("uid", "==", uid)
      .where("status", "==", "PAID")
      .get();
    const pastInvoices = pastSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (cart.some(isPassItem)) {
      const alreadyOwns = pastInvoices.some((inv) =>
        (inv.cart || []).some(isPassItem),
      );
      if (alreadyOwns) {
        return json(
          { success: false, message: "You already have a pass." },
          403,
        );
      }
    }

    const baseTotal = calculateCartTotal(cart, pastInvoices);

    let total = baseTotal;
    let appliedCoupon = null;

    if (parsed.data.payload.couponCode) {
      const result = await applyCoupon(
        parsed.data.payload.couponCode,
        baseTotal,
      );
      if (!result.valid) {
        return json({ success: false, message: result.message }, 400);
      }
      total = result.couponPrice;
      appliedCoupon = result.code;
    }

    if (total <= 0) {
      return json({ success: false, message: "Nothing to charge." }, 400);
    }

    const ref = adminFirestore.collection("invoices").doc();
    await ref.set({
      uid,
      cart,
      payload: parsed.data.payload,
      total,
      originalTotal: baseTotal,
      couponCode: appliedCoupon,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    });

    return json({ success: true, id: ref.id, total }, 201);
  } catch (err) {
    console.error("Order API Error:", err);
    return json({ success: false, message: "Internal Server Error" }, 500);
  }
}
