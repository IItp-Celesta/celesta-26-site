import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

// ─── CSV Helpers ────────────────────────────────────────────────────────────

const csvEscape = (value) => {
  if (value === null || value === undefined) return '""';
  return `"${String(value)
    .replace(/\r?\n|\r/g, " ")
    .replace(/"/g, '""')}"`;
};

/** Force Excel to treat value as text (no auto-formatting phone/aadhaar as numbers) */
const csvText = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return `="${String(value)}"`;
};

const makeCsvRow = (values) => values.map(csvEscape).join(",");

const toIST = (value) => {
  if (!value) return "";
  // Handle Firestore Timestamp objects (has toDate or _seconds)
  let date;
  if (value.toDate) date = value.toDate();
  else if (value._seconds) date = new Date(value._seconds * 1000);
  else date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
};

const parseDate = (value) => {
  if (!value) return 0;
  if (value.toDate) return value.toDate().getTime();
  if (value._seconds) return value._seconds * 1000;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

const csvResponse = (csvRows, exportType) =>
  new NextResponse(csvRows.join("\r\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="celesta_${exportType}_data_${new Date().toISOString().split("T")[0]}.csv"`,
      "Cache-Control": "no-store",
    },
  });

const emptyResponse = (exportType) =>
  new NextResponse("", {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="celesta_${exportType}_data_${new Date().toISOString().split("T")[0]}.csv"`,
      "Cache-Control": "no-store",
    },
  });

// ─── Firestore batch reader ─────────────────────────────────────────────────

const readCollection = async (name) => {
  const snap = await adminFirestore.collection(name).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ─── FEST_PASS helpers ──────────────────────────────────────────────────────

const PASS_DAYS = { FEST_PASS: 0, FEST_PASS2: 2, FEST_PASS3: 3 };
const MULTI_DAY_PASSES = ["FEST_PASS2", "FEST_PASS3"];

/** Extract the pass product name from an invoice's cart items */
const getPassName = (cart) => {
  if (!Array.isArray(cart)) return null;
  for (const item of cart) {
    const name = (item.name || "").toUpperCase().replace(/\s+/g, "_");
    if (name in PASS_DAYS) return name;
    // Also check by regex for passes like "Fest Pass 2"
    if (/FEST.?PASS.?3/i.test(item.name || "")) return "FEST_PASS3";
    if (/FEST.?PASS.?2/i.test(item.name || "")) return "FEST_PASS2";
    if (/FEST.?PASS/i.test(item.name || "")) return "FEST_PASS";
  }
  return null;
};

const getComboPassName = (item) => {
  if (!item) return null;
  const name = (item.name || "").toUpperCase().replace(/\s+/g, "_");
  if (name in PASS_DAYS) return name;
  if (/FEST.?PASS.?3/i.test(item.name || "")) return "FEST_PASS3";
  if (/FEST.?PASS.?2/i.test(item.name || "")) return "FEST_PASS2";
  if (/FEST.?PASS/i.test(item.name || "")) return "FEST_PASS";
  return null;
};

const isAccommodationRequired = (row) =>
  row.requireAccommodation === true ||
  String(row.requireAccommodation || "").toLowerCase() === "yes";

// ─── Export: accom ──────────────────────────────────────────────────────────

async function exportAccom() {
  // Read all 4 sources in parallel
  const [workshopRegs, accomRequests, invoices, comboOrders] = await Promise.all([
    readCollection("workshop_registrations"),
    readCollection("accommodation_requests"),
    readCollection("invoices"),
    readCollection("combo_orders"),
  ]);

  const rows = [];

  // 1. Workshops with requireAccommodation
  for (const reg of workshopRegs) {
    if (!isAccommodationRequired(reg)) continue;
    rows.push({
      time: parseDate(reg.registrationTime),
      timeStr: toIST(reg.registrationTime),
      status: "Workshop Reg",
      name: reg.name || "",
      gender: reg.gender || "",
      phone: reg.phone || "",
      days: "",
      price: Number(reg.accommodationFee) || 0,
      aadhaar: reg.aadhaarUrl || "",
      payment: reg.accommodationScreenshotUrl || reg.screenshotUrl || "",
      source: `Workshop / ${reg.workshop || "N/A"}`,
    });
  }

  // 2. Direct accommodation bookings — one row per booked member
  for (const req of accomRequests) {
    const members = Array.isArray(req.bookedMembers) ? req.bookedMembers : [];
    const numDays = req.totalDays || (Array.isArray(req.selectedDates) ? req.selectedDates.length : 0);
    const perMemberPrice = members.length > 0 ? Math.round((req.totalAmount || 0) / members.length) : (req.totalAmount || 0);

    for (const m of members) {
      rows.push({
        time: parseDate(req.submittedAt),
        timeStr: toIST(req.submittedAt),
        status: req.status || "PENDING_VERIFICATION",
        name: m.name || "",
        gender: m.gender || "",
        phone: m.phone || "",
        days: numDays,
        price: perMemberPrice,
        aadhaar: m.aadhaarUrl || "",
        payment: req.screenshotId || "",
        source: "Direct Booking",
      });
    }
  }

  // 3. Gateway multi-day passes (invoices with FEST_PASS2 or FEST_PASS3, status PAID)
  for (const inv of invoices) {
    if (inv.status !== "PAID") continue;
    const passName = getPassName(inv.cart);
    if (!passName || !MULTI_DAY_PASSES.includes(passName)) continue;
    const days = PASS_DAYS[passName];
    const payload = inv.payload || {};
    // Try to get aadhaar from cart pass item's teamDetails
    let aadhaar = payload.aadhaar || "";
    const passItem = (inv.cart || []).find((i) => /FEST.?PASS/i.test(i.name || ""));
    if (!aadhaar && passItem?.teamDetails?.members?.[0]?.aadhaar) {
      aadhaar = passItem.teamDetails.members[0].aadhaar;
    }

    rows.push({
      time: parseDate(inv.createdAt),
      timeStr: toIST(inv.createdAt),
      status: inv.status,
      name: payload.name || "",
      gender: payload.gender || "",
      phone: payload.phone || "",
      days,
      price: inv.total || 0,
      aadhaar,
      payment: "Gateway Payment",
      source: `Pass / ${passName}`,
    });
  }

  // 4. QR combo multi-day passes
  for (const order of comboOrders) {
    const passName = getComboPassName(order.item);
    if (!passName || !MULTI_DAY_PASSES.includes(passName)) continue;
    const days = PASS_DAYS[passName];
    const attendee = order.attendee || {};

    rows.push({
      time: parseDate(order.submittedAt),
      timeStr: toIST(order.submittedAt),
      status: order.status || "PENDING_VERIFICATION",
      name: attendee.name || "",
      gender: attendee.gender || "",
      phone: attendee.phone || "",
      days,
      price: order.totalAmount || 0,
      aadhaar: attendee.idDocumentUrl || "",
      payment: order.screenshotUrl || "",
      source: `QR Pass / ${passName}`,
    });
  }

  // Sort by time
  rows.sort((a, b) => a.time - b.time);

  const csvRows = [];
  csvRows.push(
    makeCsvRow([
      "Status", "Time (IST)", "Name", "Gender", "Phone",
      "No. of Days", "Price Paid", "Aadhaar Screenshot",
      "Payment Proof Screenshot", "Source",
    ]),
  );

  for (const r of rows) {
    csvRows.push(
      makeCsvRow([
        r.status, r.timeStr, r.name, r.gender, csvText(r.phone),
        r.days, r.price, r.aadhaar, r.payment, r.source,
      ]),
    );
  }

  return csvRows;
}

// ─── Export: pronite ────────────────────────────────────────────────────────

async function exportPronite() {
  const [invoices, comboOrders] = await Promise.all([
    readCollection("invoices"),
    readCollection("combo_orders"),
  ]);

  const rows = [];

  // 1. Gateway purchases — invoices with any FEST_PASS variant, status PAID
  for (const inv of invoices) {
    if (inv.status !== "PAID") continue;
    const passName = getPassName(inv.cart);
    if (!passName) continue;

    const payload = inv.payload || {};
    let aadhaar = payload.aadhaar || "";
    const passItem = (inv.cart || []).find((i) => /FEST.?PASS/i.test(i.name || ""));
    if (!aadhaar && passItem?.teamDetails?.members?.[0]?.aadhaar) {
      aadhaar = passItem.teamDetails.members[0].aadhaar;
    }

    rows.push({
      time: parseDate(inv.createdAt),
      timeStr: toIST(inv.createdAt),
      status: inv.status,
      name: payload.name || "",
      email: payload.email || "",
      gender: payload.gender || "",
      phone: payload.phone || "",
      college: payload.college || "",
      pass: passName,
      price: inv.total || 0,
      coupon: inv.couponCode || "None",
      paymentMethod: "Gateway",
      payment: "Gateway Payment",
      aadhaar,
    });
  }

  // 2. QR combo purchases — all pass-type combo orders
  for (const order of comboOrders) {
    const passName = getComboPassName(order.item);
    if (!passName) continue;
    const attendee = order.attendee || {};

    rows.push({
      time: parseDate(order.submittedAt),
      timeStr: toIST(order.submittedAt),
      status: order.status || "PENDING_VERIFICATION",
      name: attendee.name || "",
      email: attendee.email || "",
      gender: attendee.gender || "",
      phone: attendee.phone || "",
      college: attendee.college || "",
      pass: passName,
      price: order.totalAmount || 0,
      coupon: order.couponCode || "None",
      paymentMethod: "Done via QR",
      payment: order.screenshotUrl || "",
      aadhaar: attendee.idDocumentUrl || "",
    });
  }

  rows.sort((a, b) => a.time - b.time);

  const csvRows = [];
  csvRows.push(
    makeCsvRow([
      "Status", "Time (IST)", "Name", "Email", "Gender", "Phone",
      "College", "Pass", "Price Paid", "Coupon", "Payment Method",
      "Payment Proof Screenshot", "Aadhaar Screenshot",
    ]),
  );

  for (const r of rows) {
    csvRows.push(
      makeCsvRow([
        r.status, r.timeStr, r.name, r.email, r.gender, csvText(r.phone),
        r.college, r.pass, r.price, r.coupon, r.paymentMethod,
        r.payment, r.aadhaar,
      ]),
    );
  }

  return csvRows;
}

// ─── Export: events ─────────────────────────────────────────────────────────

async function exportEvents() {
  const [eventRegs, invoices] = await Promise.all([
    readCollection("event_registrations"),
    readCollection("invoices"),
  ]);

  // Build invoiceId → total lookup
  const invoiceTotals = {};
  for (const inv of invoices) {
    if (inv.status === "PAID") {
      // An invoice can have multiple event items; map each eventId to its cost
      if (Array.isArray(inv.cart)) {
        for (const item of inv.cart) {
          if (item.type === "event" || String(item.id || "").startsWith("EVENT_")) {
            // Store cost per invoiceId (best effort — one invoice may have multiple events)
            invoiceTotals[inv.id] = invoiceTotals[inv.id] || {};
            invoiceTotals[inv.id][item.id] = Number(item.cost) || 0;
          }
        }
      }
    }
  }

  // Find the max team size across all registrations
  let maxMembers = 1;
  for (const reg of eventRegs) {
    const members = Array.isArray(reg.members) ? reg.members : [];
    if (members.length > maxMembers) maxMembers = members.length;
  }

  // Sort by paidAt
  eventRegs.sort((a, b) => parseDate(a.paidAt) - parseDate(b.paidAt));

  // Build header
  const headerBase = [
    "Time (IST)", "Event", "Team Name", "College",
    "Total Members", "Price Paid",
  ];
  // Leader columns
  const memberHeaders = ["Leader Name", "Leader Email", "Leader Phone", "Leader Gender", "Leader Aadhaar"];
  // Additional member columns
  for (let i = 2; i <= maxMembers; i++) {
    memberHeaders.push(`Member ${i} Name`, `Member ${i} Email`, `Member ${i} Phone`, `Member ${i} Gender`, `Member ${i} Aadhaar`);
  }

  const csvRows = [];
  csvRows.push(makeCsvRow([...headerBase, ...memberHeaders]));

  for (const reg of eventRegs) {
    const members = Array.isArray(reg.members) ? reg.members : [];

    // Look up price from invoice
    let pricePaid = "";
    if (reg.invoiceId && invoiceTotals[reg.invoiceId]) {
      const eventCosts = invoiceTotals[reg.invoiceId];
      pricePaid = eventCosts[reg.eventId] ?? Object.values(eventCosts)[0] ?? "";
    }

    const baseRow = [
      toIST(reg.paidAt),
      reg.eventName || "",
      reg.teamName || "",
      reg.college || "",
      members.length,
      pricePaid,
    ];

    // Flatten members horizontally
    const memberCols = [];
    for (let i = 0; i < maxMembers; i++) {
      const m = members[i] || {};
      memberCols.push(m.name || "", m.email || "", csvText(m.phone || ""), m.gender || "", m.aadhaar || "");
    }

    csvRows.push(makeCsvRow([...baseRow, ...memberCols]));
  }

  return csvRows;
}

// ─── Export: reg (workshops) ────────────────────────────────────────────────

async function exportReg() {
  const snapshot = await adminFirestore.collection("workshop_registrations").get();
  if (snapshot.empty) return [];

  const data = [];
  snapshot.forEach((doc) => {
    const row = { id: doc.id, ...doc.data() };

    const isLegacy = row.workshopFee === undefined;
    if (isLegacy) {
      row.workshopScreenshotUrl = row.screenshotUrl || "";
      row.workshopFee = "";
      row.workshopTxnId = "";
      row.upiId = row.upiId || "";
    } else {
      const parsedFee = Number(row.workshopFee);
      row.workshopFee = Number.isNaN(parsedFee) ? row.workshopFee : parsedFee || 0;
    }

    data.push(row);
  });

  data.sort((a, b) => parseDate(a.registrationTime) - parseDate(b.registrationTime));

  const csvRows = [];
  csvRows.push(
    makeCsvRow([
      "ID", "Time", "Name", "Gender", "Email", "Phone",
      "College", "Track", "Is IITP", "Roll Number",
      "Reg Fee Paid", "Sender UPI ID", "Reg Txn ID",
      "Payment Proof Screenshot",
    ]),
  );

  for (const row of data) {
    csvRows.push(
      makeCsvRow([
        row.id,
        row.registrationTime || "",
        row.name || "",
        row.gender || "",
        row.email || "",
        csvText(row.phone),
        row.college || "",
        row.workshop || "",
        row.isIITP ? "Yes" : "No",
        csvText(row.rollNumber),
        row.workshopFee,
        csvText(row.upiId),
        csvText(row.workshopTxnId),
        row.workshopScreenshotUrl || "",
      ]),
    );
  }

  return csvRows;
}

// ─── Main handler ───────────────────────────────────────────────────────────

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const exportType = searchParams.get("type") || "reg";

    const allowedTypes = ["accom", "pronite", "events", "reg"];
    if (!allowedTypes.includes(exportType)) {
      return NextResponse.json(
        { error: `Invalid export type. Use one of: ${allowedTypes.join(", ")}` },
        { status: 400 },
      );
    }

    let csvRows;
    switch (exportType) {
      case "accom":
        csvRows = await exportAccom();
        break;
      case "pronite":
        csvRows = await exportPronite();
        break;
      case "events":
        csvRows = await exportEvents();
        break;
      case "reg":
        csvRows = await exportReg();
        break;
    }

    if (!csvRows || csvRows.length === 0) return emptyResponse(exportType);
    return csvResponse(csvRows, exportType);
  } catch (error) {
    console.error("CSV export failed:", error);
    return NextResponse.json(
      {
        error: "Failed to export data",
        message: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 },
    );
  }
}
