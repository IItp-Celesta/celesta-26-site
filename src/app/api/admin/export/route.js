import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";

const ALLOWED_COLLECTIONS = ["workshop_registrations"];

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const secretKey = process.env.ADMIN_PASSWORD;

    if (!authHeader) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii",
    );
    const [username, password] = credentials.split(":");

    // Verify Password
    if (password !== secretKey) {
      return new NextResponse("Invalid Secret Key", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const collectionName =
      searchParams.get("collection") || "workshop_registrations";

    if (!ALLOWED_COLLECTIONS.includes(collectionName)) {
      return NextResponse.json(
        { error: "Invalid collection" },
        { status: 403 },
      );
    }

    const snapshot = await adminFirestore.collection(collectionName).get();

    if (snapshot.empty) {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }

    const data = [];
    const headerSet = new Set(["id"]); 

    snapshot.forEach((doc) => {
      const rawData = doc.data();
      const processedRow = { id: doc.id };

      for (const [key, value] of Object.entries(rawData)) {
        headerSet.add(key);
        if (value && typeof value.toDate === "function") {
          processedRow[key] = value
            .toDate()
            .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        } else if (typeof value === "object" && value !== null) {
          processedRow[key] = JSON.stringify(value);
        } else {
          processedRow[key] = value;
        }
      }
      data.push(processedRow);
    });

    const headers = Array.from(headerSet);
    const csvRows = [headers.join(",")];

    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header] ?? "";
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    }

    return new NextResponse(csvRows.join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${collectionName}_export.csv"`,
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 },
    );
  }
}
