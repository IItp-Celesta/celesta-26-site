import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";

export async function POST(request) {
  try {
    const { code } = await request.json();
    const cleanCode = String(code || "")
      .trim()
      .toUpperCase();

    if (!cleanCode) {
      return NextResponse.json(
        { valid: false, message: "Please enter a coupon code" },
        { status: 400 },
      );
    }

    const couponSnap = await adminFirestore
      .collection("coupons")
      .doc(cleanCode)
      .get();

    if (!couponSnap.exists) {
      return NextResponse.json({
        valid: false,
        message: "Invalid coupon code",
      });
    }

    const coupon = couponSnap.data();

    if (coupon.isActive === false) {
      return NextResponse.json({
        valid: false,
        message: "This coupon is no longer active",
      });
    }

    if (coupon.expiresAt) {
      const expiryTime = new Date(coupon.expiresAt).getTime();
      if (!Number.isNaN(expiryTime) && Date.now() > expiryTime) {
        return NextResponse.json({
          valid: false,
          message: "This coupon has expired",
        });
      }
    }

    // Extract the percentage instead of the flat discount
    const discountPercentage = Number(coupon.discountPercentage);

    if (
      !Number.isFinite(discountPercentage) ||
      discountPercentage <= 0 ||
      discountPercentage > 100
    ) {
      return NextResponse.json({
        valid: false,
        message: "Invalid coupon configuration",
      });
    }

    return NextResponse.json({
      valid: true,
      discountPercentage,
    });
  } catch (error) {
    console.error("Coupon Validation Error:", error);
    return NextResponse.json(
      { valid: false, message: "Server error" },
      { status: 500 },
    );
  }
}
