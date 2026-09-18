import { decrypt, generateSignature } from "@/lib/nttpay";
import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    let encData = "";

    try {
      const formData = await req.formData();
      encData = formData.get("encData");
    } catch (e) {
      // fallback
    }

    if (!encData) {
      try {
        const json = await req.json();
        encData = json.encData;
      } catch (e) {}
    }

    if (!encData) {
      return NextResponse.json({ error: "No encData found" }, { status: 400 });
    }

    const decrypted_data = decrypt(encData);

    let jsonData = JSON.parse(decrypted_data);
    let resArray = Object.keys(jsonData).map((key) => jsonData[key]);

    const statusCode = resArray[0]["responseDetails"]["statusCode"];
    const orderId = resArray[0]["extras"]["udf1"];
    const receivedSignature = resArray[0]?.payDetails?.signature;
    if (receivedSignature) {
      const expectedSignature = generateSignature(resArray);
      if (expectedSignature !== receivedSignature) {
        console.error("Payment webhook signature mismatch for order:", orderId);
        return NextResponse.json(
          { error: "Signature verification failed" },
          { status: 400 },
        );
      }
    } else {
      console.warn(
        "Payment webhook: no signature field found to verify for order:",
        orderId,
        "— proceeding WITHOUT signature verification. Confirm Atom's field name.",
      );
    }

    if (statusCode == "OTS0000") {
      console.log("Transaction successful for Order:", orderId);

      if (orderId) {
        const db = adminFirestore;
        const invoiceRef = db.collection("invoices").doc(orderId);
        const invoiceSnap = await invoiceRef.get();

        if (invoiceSnap.exists) {
          const invoiceData = invoiceSnap.data();
          const uid = invoiceData.uid;

          const paidAmount = parseFloat(resArray[0]?.payDetails?.totalAmount);
          const expectedAmount = invoiceData.total;

          if (invoiceData.status === "PAID") {
            console.log(
              "Order already marked PAID, ignoring duplicate webhook:",
              orderId,
            );
            return NextResponse.redirect(
              new URL("/success?status=success", req.url),
            );
          }

          if (
            typeof expectedAmount !== "number" ||
            Number.isNaN(paidAmount) ||
            Math.abs(paidAmount - expectedAmount) > 0.01
          ) {
            console.error(
              `Amount mismatch for order ${orderId}: paid ${paidAmount}, expected ${expectedAmount}. Flagging for review, NOT granting access.`,
            );
            await invoiceRef.update({
              status: "AMOUNT_MISMATCH",
              paymentDetails: resArray[0],
            });

            return NextResponse.redirect(
              new URL("/store?status=error", req.url),
            );
          }

          // 1. Update Invoice Status
          await invoiceRef.update({
            status: "PAID",
            paymentDetails: resArray[0],
          });

          let boughtPronite = false;
          const confirmedFileIds = [];

          if (invoiceData.cart && Array.isArray(invoiceData.cart)) {
            for (const item of invoiceData.cart) {
              if (
                item.type === "event" ||
                (item.id && String(item.id).startsWith("EVENT_"))
              ) {
                if (item.teamDetails) {
                  if (
                    item.teamDetails.members &&
                    Array.isArray(item.teamDetails.members)
                  ) {
                    item.teamDetails.members.forEach((member) => {
                      if (member.aadhaar) {
                        confirmedFileIds.push(member.aadhaar);
                      }
                    });
                  }

                  await db.collection("event_registrations").add({
                    eventId: item.id,
                    eventName:
                      item.teamDetails.eventName ||
                      item.name ||
                      "Unknown Event",
                    teamName: item.teamDetails.teamName || "Unknown Team",
                    college: item.teamDetails.college || "",
                    members: item.teamDetails.members || [],
                    paidAt: FieldValue.serverTimestamp(),
                    userId: uid,
                    invoiceId: orderId,
                  });
                }
              }

              if (
                item.id === "PRONITE" ||
                item.type === "event" ||
                String(item.id).startsWith("EVENT_")
              ) {
                boughtPronite = true;
              }
            }
          }

          if (confirmedFileIds.length > 0) {
            try {
              await cloudinary.uploader.replace_tag(
                "paid_confirmed",
                confirmedFileIds,
              );
              console.log(
                `Successfully secured ${confirmedFileIds.length} ID documents.`,
              );
            } catch (cloudinaryError) {
              console.error(
                "Failed to tag confirmed documents in Cloudinary:",
                cloudinaryError,
              );
            }
          }

          if (uid) {
            const userUpdates = { qrEnabled: true };
            if (boughtPronite) {
              userUpdates.hasPronitePass = true;
            }
            await db.collection("users").doc(uid).update(userUpdates);
            console.log(`Access granted to user ${uid}`);
          }
        } else {
          console.error("Webhook received for unknown orderId:", orderId);
        }
      }

      return NextResponse.redirect(new URL("/success?status=success", req.url));
    } else {
      console.log("Transaction failed:", statusCode);
      if (orderId) {
        await adminFirestore.collection("invoices").doc(orderId).update({
          status: "FAILED",
        });
      }
      return NextResponse.redirect(new URL("/store?status=failed", req.url));
    }
  } catch (error) {
    console.error("Error in payment response:", error);
    return NextResponse.redirect(new URL("/store?status=error", req.url));
  }
}
