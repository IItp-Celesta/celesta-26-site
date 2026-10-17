import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { adminAuth } from "@/lib/firebaseAdmin";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let uid;
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      uid = decodedToken.uid;
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    let reqBody = {};
    try {
      reqBody = await req.json();
    } catch (_) {}

    const allowedFolders = ["celesta_secure_ids", "workshop_receipts"];
    const folder = allowedFolders.includes(reqBody?.folder) ? reqBody.folder : "celesta_secure_ids";

    const timestamp = Math.round(Date.now() / 1000);
    const transformation = "c_limit,w_1200,h_1200,q_auto";

    const paramsToSign = {
      folder,
      timestamp,
      transformation,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      success: true,
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
      transformation,
    });
  } catch (error) {
    console.error("Cloudinary sign failed:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
