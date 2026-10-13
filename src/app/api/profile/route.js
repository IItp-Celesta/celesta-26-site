import { NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(request) {
    try {
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const token = authHeader.split(" ")[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        const uid = decodedToken.uid;

        const userDocRef = adminFirestore.collection("users").doc(uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            return NextResponse.json(
                { success: false, message: "User does not exist" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                user: userDoc.data(),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET user error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
