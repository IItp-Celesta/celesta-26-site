import crypto from "crypto";
import { NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebaseAdmin";

const QR_SECRET = process.env.QR_SECRET_KEY;

export async function GET(req) {
  return NextResponse.json(
    { error: "QR generation is temporarily disabled" },
    { status: 503 },
  );
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    const uid = decoded.uid;

    const userDoc = await adminFirestore
      .collection("users")
      .doc(uid)
      .get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userDoc.data();

    const payload = {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      celestaId: user.celestaId,
    };

    const signature = crypto
      .createHmac("sha256", QR_SECRET)
      .update(JSON.stringify(payload))
      .digest("hex");

    return NextResponse.json({
      payload,
      sig: signature,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
