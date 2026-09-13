import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";
import { v2 as cloudinary } from "cloudinary";

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
        folder: "flagship_aadhaar_cards",
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
    const formData = await request.formData();
    const eventId = formData.get("eventId") || "unknown";
    const teamName = formData.get("teamName") || "";
    const college = formData.get("college") || "";
    const numMembers = parseInt(formData.get("numMembers") || "1", 10);

    const members = [];

    // Parse member details and upload Aadhaar files
    for (let i = 0; i < numMembers; i++) {
      const name = formData.get(`members[${i}][name]`) || "";
      const email = formData.get(`members[${i}][email]`) || "";
      const phone = formData.get(`members[${i}][phone]`) || "";
      const gender = formData.get(`members[${i}][gender]`) || "";
      const memberCollege = formData.get(`members[${i}][college]`) || "";
      const aadhaarFile = formData.get(`members[${i}][aadhaar]`);

      let aadhaarUrl = "NOT_PROVIDED";
      
      // Upload Aadhaar file if present
      if (aadhaarFile && typeof aadhaarFile !== "string" && aadhaarFile.size > 0) {
        try {
           aadhaarUrl = await uploadToCloudinary(
            aadhaarFile,
            `aadhaar_${eventId}_${teamName.replace(/\s+/g, "_")}_mem${i}_${Date.now()}`
          );
        } catch (uploadErr) {
           console.error("Cloudinary upload failed for member", i, uploadErr);
           aadhaarUrl = "UPLOAD_FAILED";
        }
      }

      members.push({
        name,
        email,
        phone,
        gender,
        college: memberCollege,
        aadhaarUrl,
      });
    }

    const rawDate = new Date();
    const cleanTime = rawDate.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const registrationId = `FS2026-${eventId.substring(0, 3).toUpperCase()}-${Math.floor(
      10000 + Math.random() * 90000,
    )}`;

    // Save to Firestore
    await adminFirestore
      .collection("flagship_registrations")
      .doc(registrationId)
      .set({
        registrationId,
        eventId,
        teamName,
        college,
        numMembers,
        members,
        registrationTime: cleanTime,
        status: "registered"
      });

    return NextResponse.json({ success: true, registrationId });
  } catch (error) {
    console.error("Flagship Registration Save Error:", error);
    return NextResponse.json(
      { success: false, message: `Server error: ${error.message}` },
      { status: 500 },
    );
  }
}
