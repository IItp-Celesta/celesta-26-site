import { NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (authError) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const body = await req.json();
    const { txnId, selectedDates, bookedMembers, screenshotId } = body;

    const safeTxnId = txnId ? String(txnId).trim() : "";
    if (safeTxnId === "") {
      return NextResponse.json({ error: "Invalid or missing Transaction ID." }, { status: 400 });
    }

    if (!Array.isArray(selectedDates) || selectedDates.length < 2) {
      return NextResponse.json({ error: "You must select at least two dates." }, { status: 400 });
    }

    if (!Array.isArray(bookedMembers) || bookedMembers.length < 1 || bookedMembers.length > 10) {
      return NextResponse.json({ error: "Invalid number of members (1-10 allowed)." }, { status: 400 });
    }

    if (!screenshotId || typeof screenshotId !== 'string') {
       return NextResponse.json({ error: "Payment screenshot URL is missing." }, { status: 400 });
    }

    const validatedMembers = bookedMembers.map((m) => ({
      name: String(m.name || "").trim(),
      email: String(m.email || "").trim().toLowerCase(),
      phone: String(m.phone || "").trim(),
      gender: String(m.gender || "").trim(),
      aadhaarNo: String(m.aadhaarNo || "").trim(),
      aadhaarUrl: String(m.aadhaarUrl || "").trim(),
    }));

    const PRICE_PER_DAY = 249;
    const numMembers = validatedMembers.length;
    const totalDays = selectedDates.length;
    const calculatedTotalAmount = numMembers * totalDays * PRICE_PER_DAY;

    const accommodationRef = adminFirestore.collection("accommodation_requests");

    const newDoc = {
      uid,
      email,
      txnId: safeTxnId,
      screenshotId,
      status: "PENDING_VERIFICATION",
      totalAmount: calculatedTotalAmount,
      selectedDates,
      totalDays,
      numMembers,
      bookedMembers: validatedMembers,
      submittedAt: new Date(), 
    };

    await accommodationRef.add(newDoc);

    return NextResponse.json({
      success: true,
      message: "Accommodation booked successfully",
    });

  } catch (error) {
    console.error("Accommodation booking failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error during booking" },
      { status: 500 }
    );
  }
}