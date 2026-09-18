import { NextResponse } from "next/server";
import { encrypt, decrypt } from "@/lib/nttpay";
import { adminAuth, adminFirestore } from "@/lib/firebaseAdmin";

const merchId = process.env.NEXT_PUBLIC_MERCHANT_ID;
const merchPass = process.env.MERCHANT_PASSWORD;
const prodId = process.env.PRODUCT_ID;
const Authurl = process.env.ATOM_AUTH_URL;

export async function POST(req) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    let uid;
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId } = body;
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const invoiceRef = adminFirestore.collection("invoices").doc(orderId);
    const invoiceSnap = await invoiceRef.get();

    if (!invoiceSnap.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const invoice = invoiceSnap.data();

    // Make sure the caller actually owns this invoice.
    if (invoice.uid !== uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (invoice.status !== "PENDING") {
      return NextResponse.json(
        { error: `Order is not payable (status: ${invoice.status})` },
        { status: 409 },
      );
    }

    const amount = invoice.total;
    const userEmailId = invoice.payload?.email || invoice.email;
    const userContactNo = invoice.payload?.phone;

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
    }
    if (!userEmailId || !userContactNo) {
      return NextResponse.json(
        { error: "Order is missing required contact details" },
        { status: 400 },
      );
    }

    const txnId = "TXN" + Date.now();
    const txnDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const jsondata = `{
      "payInstrument": {
        "headDetails": {
          "version": "OTSv1.1",
          "api": "AUTH",
          "platform": "FLASH"
        },
        "merchDetails": {
          "merchId": "${merchId}",
          "userId": "",
          "password": "${merchPass}",
          "merchTxnId": "${txnId}",
          "merchTxnDate": "${txnDate}"
        },
        "payDetails": {
          "amount": "${amount.toFixed(2)}",
          "product": "${prodId}",
          "custAccNo": "213232323",
          "txnCurrency": "INR"
        },
        "custDetails": {
          "custEmail": "${userEmailId}",
          "custMobile": "${userContactNo}"
        },
        "extras": {
          "udf1": "${orderId}",
          "udf2": "udf2",
          "udf3": "udf3",
          "udf4": "udf4",
          "udf5": "udf5"
        }
      }
    }`;

    const encDataR = encrypt(jsondata);

    const formBody = new URLSearchParams({
      encData: encDataR,
      merchId: merchId,
    });

    const response = await fetch(Authurl, {
      method: "POST",
      headers: {
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    if (response.status !== 200) {
      const errorText = await response.text();
      console.error(`Gateway returned ${response.status}. Body: ${errorText}`);
      return NextResponse.json(
        { error: `Gateway Error ${response.status}: ${errorText.substring(0, 100)}...` },
        { status: 502 },
      );
    }

    const datas = await response.text();

    if (datas.includes("<html") || !datas.includes("&")) {
      console.error("Invalid response received from Payment Gateway.");
      return NextResponse.json(
        { error: "Invalid response from Payment Gateway. Service may be down or URL incorrect." },
        { status: 502 },
      );
    }

    const arr = datas.split("&");
    const arrTwo = arr[1].split("=");

    if (!arrTwo || arrTwo.length < 2) {
      throw new Error("Failed to parse encrypted data from response");
    }

    const decrypted_data = decrypt(arrTwo[1]);
    const jsonData = JSON.parse(decrypted_data);

    if (jsonData["responseDetails"]["txnStatusCode"] === "OTS0000") {
      return NextResponse.json({
        token: jsonData["atomTokenId"],
        txnId,
        merchId,
      });
    } else {
      console.log(
        "Transaction failed with status code:",
        jsonData["responseDetails"]["txnStatusCode"],
      );
      return NextResponse.json(
        { error: jsonData["responseDetails"]["txnStatusCode"] },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Error in payment route:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}