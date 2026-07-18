import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";

export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.name || !data.email) {
      return NextResponse.json(
        { success: false, message: "Missing data." },
        { status: 400 },
      );
    }

    const amountPaid = Number(data.amountPaid) || Number(data.finalAmount) || 0;
    let viewUrl = "NOT_REQUIRED";

    if (amountPaid > 0) {
      if (!data.screenshot) {
        return NextResponse.json(
          { success: false, message: "Missing screenshot." },
          { status: 400 },
        );
      }

      const cleanBase64 = data.screenshot.split(",")[1];
      const mimeType = data.screenshot.split(";")[0].split(":")[1];

      const driveRes = await fetch(
        "https://script.google.com/macros/s/AKfycbyFXQuobqvP1R-8d_w-1dEYo9QIvqEk7cYfxTT2LWxyuyIAxpvdp19El7hz-kDrluE/exec",
        {
          method: "POST",
          body: JSON.stringify({
            filename: `receipt_${data.name}.png`,
            mimeType: mimeType,
            base64: cleanBase64,
          }),
        },
      );

      const driveData = await driveRes.json();

      if (!driveData.success) {
        throw new Error("Google Drive Upload Failed");
      }
      
      const fileIdMatch = driveData.url.match(/[-\w]{25,}/);
      viewUrl = fileIdMatch
        ? `https://drive.google.com/file/d/${fileIdMatch[0]}/view`
        : driveData.url; // Fallback if parsing fails
    }

    const rawDate = data.registrationTime
      ? new Date(data.registrationTime)
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

    const registrationId = `WS2026-${Math.floor(
      10000 + Math.random() * 90000,
    )}`;

    await adminFirestore
      .collection("workshop_registrations")
      .doc(registrationId)
      .set({
        registrationId: registrationId,
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        college: data.college || "",
        cityState: data.cityState || "",
        rollNumber: data.rollNumber || "",
        workshop: data.workshop || "",
        isIITP: data.isIITP === "yes",
        requireAccommodation: data.requireAccommodation === "yes",
        amountPaid: amountPaid,
        upiId: data.upiId || "",
        screenshotUrl: viewUrl,
        registrationTime: cleanTime,
      });

    return NextResponse.json({ success: true, registrationId });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error while saving." },
      { status: 500 },
    );
  }
}
