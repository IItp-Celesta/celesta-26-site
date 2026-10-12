import { NextResponse } from "next/server";
import { adminFirestore, adminAuth } from "@/lib/firebaseAdmin";
import { v2 as cloudinary } from "cloudinary";
import { FieldValue } from "firebase-admin/firestore";

cloudinary.config({
  cloud_name:
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (file, publicId) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "workshop_receipts",
        public_id: publicId,
        type: "private",
        access_mode: "authenticated",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      },
    );
    uploadStream.end(buffer);
  });
};

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

    const formData = await request.formData();
    const name = formData.get("name") || "";
    const email = formData.get("email") || "";
    const isExternal = formData.get("isIITP") === "no";
    const requireAccommodation = formData.get("requireAccommodation") === "yes";
    const accommodationDays = Number(formData.get("accommodationDays") || "0");
    const couponCode = (formData.get("couponCode") || "").trim().toUpperCase();

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

    let workshopScreenshotUrl = "Missing";
    if (
      formData.get("workshopScreenshot") &&
      formData.get("workshopScreenshot") !== "null"
    ) {
      workshopScreenshotUrl = await uploadToCloudinary(
        formData.get("workshopScreenshot"),
        `reg_${name.replace(/\s+/g, "_")}_${Date.now()}`,
      );
    }

    let accommodationScreenshotUrl = "NOT_REQUIRED";
    if (
      requireAccommodation &&
      formData.get("accommodationScreenshot") &&
      formData.get("accommodationScreenshot") !== "null"
    ) {
      accommodationScreenshotUrl = await uploadToCloudinary(
        formData.get("accommodationScreenshot"),
        `accom_${name.replace(/\s+/g, "_")}_${Date.now()}`,
      );
    }

    let aadhaarUrl = "NOT_REQUIRED";
    if (
      isExternal &&
      formData.get("aadhaarScreenshot") &&
      formData.get("aadhaarScreenshot") !== "null"
    ) {
      try {
        aadhaarUrl = await uploadToCloudinary(
          formData.get("aadhaarScreenshot"),
          `aadhaar_${name.replace(/\s+/g, "_")}_${Date.now()}`,
        );
      } catch (err) {
        console.error("ID upload failed", err);
        aadhaarUrl = "UPLOAD_FAILED";
      }
    }

    const rawDate = formData.get("registrationTime")
      ? new Date(formData.get("registrationTime"))
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

    await adminFirestore
      .collection("workshop_registrations")
      .doc(registrationId)
      .set({
        uid,
        registrationId,
        name,
        gender: formData.get("gender") || "",
        email,
        phone: formData.get("phone") || "",
        college: formData.get("college") || "",
        cityState: formData.get("cityState") || "",
        rollNumber: formData.get("rollNumber") || "",
        workshop: formData.get("workshop") || "",
        isIITP: !isExternal,
        requireAccommodation,
        accommodationDays: formData.get("accommodationDays") || "0",
        workshopFee: expectedWorkshopFee,
        accommodationFee: expectedAccommodationFee,
        amountPaid: expectedTotalAmount,
        couponCode,
        upiId: formData.get("upiId") || "",
        workshopTxnId: formData.get("workshopTxnId") || "",
        accomTxnId: formData.get("accomTxnId") || "",
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
