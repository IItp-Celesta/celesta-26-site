import { NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(request) {
  try {
    const { name, email, dob } = await request.json();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token)
    const uid = decodedToken.uid;
    // const displayName = decodedToken.displayName || name || "User";
    const db = adminFirestore;
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    //generation of celesta id
    const celestaId = `CEL26-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrEnabled = false;


    if (!userDoc.exists) {
      await adminAuth.updateUser(uid, { emailVerified: true });
      await userDocRef.set({
        role: 'user',
        displayName: name,
        dob: dob,
        email: decodedToken.email,
        celestaId,
        qrEnabled: qrEnabled,
        createdAt: Timestamp.now(),
        uid: uid,
      });
    } else {
      return NextResponse.json({ success: false, message: 'UID already exists' });
    }


    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

