import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { adminFirestore } from "@/lib/firebaseAdmin";


export async function POST(req) {
  try {
    const { email } = await req.json();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = Date.now() + 5 * 60 * 1000;
    await adminFirestore.collection("otps").doc(email).set({
      otp,
      expiresAt,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Celesta – IIT Patna" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your One-Time Password (OTP) for Registration",
      html: `
    <div style="font-family: Arial, Helvetica, sans-serif; background-color:#f9fafb; padding:24px;">
      <div style="max-width:520px; margin:auto; background:#ffffff; padding:28px; border-radius:8px; border:1px solid #e5e7eb;">
        
        <h2 style="color:#4f46e5; margin-bottom:16px;">Celesta – IIT Patna</h2>

        <p style="font-size:15px; color:#111827;">Dear User,</p>

        <p style="font-size:15px; color:#111827;">
          Thank you for registering with <strong>Celesta</strong>.
          Please use the following One-Time Password (OTP) to complete your registration:
        </p>

        
        <div style="
          font-size:32px;
          font-weight:700;
          letter-spacing:6px;
          text-align:center;
          margin:24px 0;
          color:#111827;
        ">
          ${otp}
        </div>

        <p style="font-size:14px; color:#374151;">
          This OTP is valid for <strong>5 minutes</strong>.
          For security reasons, please do not share this code with anyone.
        </p>

        <p style="font-size:14px; color:#374151;">
          If you did not initiate this request, you can safely ignore this email.
        </p>

        <hr style="margin:24px 0; border:none; border-top:1px solid #e5e7eb;" />

        <p style="font-size:13px; color:#6b7280;">
          Best regards,<br />
          <strong>Team Celesta</strong><br />
          IIT Patna
        </p>

      </div>
    </div>
  `,
    });

    return NextResponse.json({ success: true, message: "OTP sent securely" });
  } catch (error) {
    console.error("Error in send-otp route:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process OTP request" },
      { status: 500 },
    );
  }
}
