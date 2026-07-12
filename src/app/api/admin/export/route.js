import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get("collection") || "workshop_registrations";

    const snapshot = await adminFirestore.collection(collectionName).get();
    
    if (snapshot.empty) {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }

    const data = [];
    const headerSet = new Set(); // Use a Set to collect ALL possible columns

    // 1. Process documents and format Timestamps
    snapshot.forEach((doc) => {
      const rawData = doc.data();
      const processedRow = { id: doc.id };
      headerSet.add("id"); // Ensure 'id' is always the first column

      for (const [key, value] of Object.entries(rawData)) {
        headerSet.add(key); // Add every key we find to our columns list

        // Check if the value is a Firebase Timestamp (it will have a .toDate() function)
        if (value && typeof value.toDate === 'function') {
          // Convert Firebase Timestamp to a readable local date/time string
          processedRow[key] = value.toDate().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        } else {
          processedRow[key] = value;
        }
      }
      data.push(processedRow);
    });

    // Convert Set to Array for our CSV headers
    const headers = Array.from(headerSet);
    const csvRows = [];
    
    // Add the header row
    csvRows.push(headers.join(","));

    // 2. Map the data to the correct columns
    for (const row of data) {
      const values = headers.map(header => {
        // If a user is missing a specific field (like dob), leave it blank
        const val = row[header] !== undefined && row[header] !== null ? row[header] : "";
        
        // Escape standard text for Excel compatibility
        const escaped = String(val).replace(/"/g, '""'); 
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\n");

    return new NextResponse(csvString, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${collectionName}_export.csv"`,
      },
    });

  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}