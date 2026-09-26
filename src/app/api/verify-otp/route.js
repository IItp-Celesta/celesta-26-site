import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: "Missing credentials" }, { status: 400 });
    }

    const otpDocRef = adminFirestore.collection("otps").doc(email);
    const otpDoc = await otpDocRef.get();

    if (!otpDoc.exists) {
      return NextResponse.json({ success: false, message: "No OTP requested or OTP has expired" }, { status: 400 });
    }

    const data = otpDoc.data();

    if (Date.now() > data.expiresAt) {
      await otpDocRef.delete(); 
      return NextResponse.json({ success: false, message: "OTP has expired" }, { status: 400 });
    }

    if (data.otp !== otp) {
      return NextResponse.json({ success: false, message: "Invalid OTP" }, { status: 400 });
    }

    await otpDocRef.delete();

    return NextResponse.json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}