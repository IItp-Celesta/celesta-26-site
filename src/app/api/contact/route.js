import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin"; // Using your existing admin config

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, email, message } = data;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    // Save to a new Firestore collection named 'contact_messages'
    await adminFirestore.collection("contact_messages").add({
      name,
      email,
      message,
      status: "unread", // Helpful for you to track which messages you've read
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: "Message saved successfully!" }, { status: 201 });
  } catch (error) {
    console.error("Error saving contact message:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}