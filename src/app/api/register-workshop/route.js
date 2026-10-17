import { NextResponse } from "next/server";
import { adminFirestore, adminAuth } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    let uid;
    try {
      const token = authHeader.split(" ")[1];
      const decodedToken = await adminAuth.verifyIdToken(token);
      uid = decodedToken.uid;
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const name = body.name || "";
    const email = body.email || "";
    const isExternal = body.isIITP === "no" || body.isIITP === false;
    const requireAccommodation =
      body.requireAccommodation === "yes" || body.requireAccommodation === true;
    const accommodationDays = Number(body.accommodationDays || 0);
    const couponCode = (body.couponCode || "").trim().toUpperCase();

    let expectedWorkshopFee = isExternal ? 1199 : 599;

    if (isExternal && couponCode) {
      const couponSnap = await adminFirestore
        .collection("coupons")
        .doc(couponCode)
        .get();
      if (couponSnap.exists && couponSnap.data().isActive !== false) {
        const prices = couponSnap.data().prices || {};
        const couponPrice = Number(prices[String(expectedWorkshopFee)]);
        if (Number.isFinite(couponPrice)) {
          expectedWorkshopFee = couponPrice;
        }
      }
    }

    const expectedAccommodationFee =
      requireAccommodation && isExternal ? accommodationDays * 249 : 0;
    const expectedTotalAmount = expectedWorkshopFee + expectedAccommodationFee;

    const workshopScreenshotUrl = body.workshopScreenshotUrl || "Missing";
    const accommodationScreenshotUrl = requireAccommodation
      ? body.accommodationScreenshotUrl || "Missing"
      : "NOT_REQUIRED";
    const aadhaarUrl = isExternal
      ? body.aadhaarScreenshotUrl || "Missing"
      : "NOT_REQUIRED";

    const rawDate = body.registrationTime
      ? new Date(body.registrationTime)
      : new Date();
    const cleanTime = rawDate.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const registrationId = `WS2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const docRef = adminFirestore.collection("workshop_registrations").doc();

    await docRef.set({
        uid,
        registrationId,
        name,
        gender: body.gender || "",
        email,
        phone: body.phone || "",
        college: body.college || "",
        cityState: body.cityState || "",
        rollNumber: body.rollNumber || "",
        workshop: body.workshop || "",
        isIITP: !isExternal,
        requireAccommodation,
        accommodationDays,
        workshopFee: expectedWorkshopFee,
        accommodationFee: expectedAccommodationFee,
        amountPaid: expectedTotalAmount,
        couponCode,
        upiId: body.upiId || "",
        workshopTxnId: body.workshopTxnId || "",
        accomTxnId: body.accomTxnId || "",
        workshopScreenshotUrl,
        accommodationScreenshotUrl,
        aadhaarUrl,
        registrationTime: cleanTime,
        submittedAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({ success: true, registrationId });
  } catch (error) {
    console.error("Registration Save Error:", error);
    return NextResponse.json(
      { success: false, message: `Server error: ${error.message}` },
      { status: 500 },
    );
  }
}
