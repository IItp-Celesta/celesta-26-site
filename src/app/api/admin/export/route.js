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

/** Parse Firestore Timestamps, ISO strings, numbers, or DD/MM/YYYY strings into epoch ms */
const parseDate = (value) => {
  if (!value) return 0;
  if (typeof value.toDate === "function") return value.toDate().getTime();
  if (typeof value._seconds === "number") return value._seconds * 1000;
  if (typeof value.seconds === "number") return value.seconds * 1000;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const str = String(value).trim();
  const direct = new Date(str).getTime();
  if (Number.isFinite(direct)) return direct;

  // Handle en-IN formatted strings like "19/10/2026, 11:39:00 pm"
  const match = str.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?)?$/i,
  );
  if (match) {
    const [, d, m, y, hh = "0", mm = "0", ss = "0", meridian] = match;
    let hour = Number(hh);
    if (meridian) {
      const isPM = meridian.toLowerCase() === "pm";
      if (isPM && hour < 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
    }
    const parsed = new Date(
      Number(y),
      Number(m) - 1,
      Number(d),
      hour,
      Number(mm),
      Number(ss),
    ).getTime();
    if (Number.isFinite(parsed)) return parsed;
  }

  return 0;
};

const toIST = (value) => {
  if (!value) return "";
  let date;
  if (typeof value.toDate === "function") date = value.toDate();
  else if (typeof value._seconds === "number") date = new Date(value._seconds * 1000);
  else if (typeof value.seconds === "number") date = new Date(value.seconds * 1000);
  else {
    const ms = parseDate(value);
    date = ms ? new Date(ms) : new Date(value);
  }
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
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

// ─── FEST_PASS & Status Helpers ─────────────────────────────────────────────

const PASS_DAYS = { FEST_PASS: 0, FEST_PASS2: 2, FEST_PASS3: 3 };
const MULTI_DAY_PASSES = ["FEST_PASS2", "FEST_PASS3"];

const isPaidStatus = (status) => {
  const s = String(status || "").toUpperCase().trim();
  return s === "PAID" || s === "SUCCESS" || s === "VERIFIED" || s === "COMPLETED";
};

/**
 * Detect pass type ("FEST_PASS" | "FEST_PASS2" | "FEST_PASS3" | null) from a cart or order item.
 * Checks item.id first (since Firestore `products` doc IDs are FEST_PASS, FEST_PASS2, FEST_PASS3),
 * then item.name, then item.type + cost fallback (899 / 1749 / 1999).
 */
const detectPassFromItem = (item) => {
  if (!item || typeof item !== "object") return null;

  const rawId = String(item.id || item.productId || item.passId || "").trim();
  const normId = rawId.toUpperCase().replace(/[\s\-]+/g, "_");
  const rawName = String(item.name || item.prodName || item.title || "").trim();
  const normName = rawName.toUpperCase().replace(/[\s\-]+/g, "_");
  const rawType = String(item.type || "").trim().toLowerCase();
  const cost = Number(item.cost ?? item.price ?? item.prodAmount ?? 0);

  // 1. Direct key match on ID or Name
  if (normId in PASS_DAYS) return normId;
  if (normName in PASS_DAYS) return normName;

  // 2. Regex match on ID (most reliable)
  if (/FEST.?PASS.?3/i.test(rawId) || /PASS.?3\b/i.test(rawId)) return "FEST_PASS3";
  if (/FEST.?PASS.?2/i.test(rawId) || /PASS.?2\b/i.test(rawId)) return "FEST_PASS2";
  if (/FEST.?PASS/i.test(rawId)) return "FEST_PASS";

  // 3. Regex match on Name
  if (
    /FEST.?PASS.?3/i.test(rawName) ||
    /(?:PRONITE|PASS|COMBO).*3\s*DAY/i.test(rawName) ||
    /3\s*DAY.*(?:PRONITE|PASS|ACCOM)/i.test(rawName) ||
    /PASS\s*3\b/i.test(rawName)
  ) {
    return "FEST_PASS3";
  }
  if (
    /FEST.?PASS.?2/i.test(rawName) ||
    /(?:PRONITE|PASS|COMBO).*2\s*DAY/i.test(rawName) ||
    /2\s*DAY.*(?:PRONITE|PASS|ACCOM)/i.test(rawName) ||
    /PASS\s*2\b/i.test(rawName)
  ) {
    return "FEST_PASS2";
  }
  if (/FEST.?PASS/i.test(rawName)) {
    return "FEST_PASS";
  }

  // 4. Fallback if item.type is "pass" or name mentions "Pronite"
  const isPassLike =
    rawType === "pass" ||
    rawType === "pronite" ||
    rawType === "combo" ||
    /PRONITE/i.test(rawName);

  if (isPassLike) {
    if (cost >= 1900) return "FEST_PASS3"; // Base price 1999
    if (cost >= 1500) return "FEST_PASS2"; // Base price 1749
    return "FEST_PASS"; // Base price 899
  }

  return null;
};

/** Find the pass name and matching cart item from an invoice/order cart */
const findPassInInvoice = (inv) => {
  const cart = Array.isArray(inv?.cart) ? inv.cart : [];
  let fallback = null;

  for (const item of cart) {
    const passName = detectPassFromItem(item);
    if (passName) {
      if (MULTI_DAY_PASSES.includes(passName)) {
        return { passName, passItem: item };
      }
      if (!fallback) fallback = { passName, passItem: item };
    }
  }

  if (fallback) return fallback;

  // Fallback to paymentDetails.prodDetails if cart was empty
  const prodDetails = inv?.paymentDetails?.prodDetails;
  if (Array.isArray(prodDetails)) {
    for (const prod of prodDetails) {
      const passName = detectPassFromItem(prod);
      if (passName) return { passName, passItem: prod };
    }
  }

  return { passName: null, passItem: null };
};

/** Extract pass name from a combo_orders document */
const getComboPassName = (order) => {
  if (!order) return null;
  if (order.item) {
    const fromItem = detectPassFromItem(order.item);
    if (fromItem) return fromItem;
  }
  if (Array.isArray(order.items || order.cart)) {
    const { passName } = findPassInInvoice({ cart: order.items || order.cart });
    if (passName) return passName;
  }
  return detectPassFromItem(order);
};

/** Build lookup maps for users and orders by doc.id and doc.uid */
const buildLookupMaps = (users = [], orders = []) => {
  const usersByUid = {};
  for (const u of users) {
    if (u.id) usersByUid[u.id] = u;
    if (u.uid) usersByUid[u.uid] = u;
  }

  const ordersByKey = {};
  for (const o of orders) {
    if (o.id) ordersByKey[o.id] = o;
    if (o.uid && !ordersByKey[o.uid]) ordersByKey[o.uid] = o;
  }

  return { usersByUid, ordersByKey };
};

/**
 * Extract attendee details for an invoice/order, handling:
 * - `payload.aadhar` (single 'a' in `invoices`) and `payload.aadhaar` (in `orders`)
 * - `passItem.teamDetails.members[0]`
 * - `paymentDetails.custDetails` (`custEmail`, `custMobile`)
 * - Fallback to `orders` and `users` via `uid`
 */
const extractInvoiceAttendee = (inv, passItem, usersByUid = {}, ordersByKey = {}) => {
  const payload = inv?.payload || {};
  const member0 = passItem?.teamDetails?.members?.[0] || {};
  const custDetails = inv?.paymentDetails?.custDetails || {};
  const userDoc = (inv?.uid && usersByUid[inv.uid]) || {};
  const orderDoc =
    (inv?.id && ordersByKey[inv.id]) ||
    (inv?.uid && ordersByKey[inv.uid]) ||
    {};
  const orderPayload = orderDoc.payload || {};
  const orderMember0 = orderDoc.cart?.[0]?.teamDetails?.members?.[0] || {};

  const name =
    payload.name ||
    member0.name ||
    inv?.name ||
    orderPayload.name ||
    orderMember0.name ||
    userDoc.name ||
    userDoc.displayName ||
    userDoc.fullName ||
    "";

  const email =
    payload.email ||
    member0.email ||
    inv?.email ||
    custDetails.custEmail ||
    orderPayload.email ||
    orderMember0.email ||
    userDoc.email ||
    "";

  const gender =
    payload.gender ||
    member0.gender ||
    inv?.gender ||
    orderPayload.gender ||
    orderMember0.gender ||
    userDoc.gender ||
    "";

  const phone =
    payload.phone ||
    member0.phone ||
    inv?.phone ||
    custDetails.custMobile ||
    orderPayload.phone ||
    orderMember0.phone ||
    userDoc.phone ||
    userDoc.phoneNumber ||
    "";

  const college =
    payload.college ||
    passItem?.teamDetails?.college ||
    inv?.college ||
    orderPayload.college ||
    orderDoc.cart?.[0]?.teamDetails?.college ||
    userDoc.college ||
    "";

  const aadhaar =
    payload.aadhaar ||
    payload.aadhar ||
    payload.aadhaarUrl ||
    payload.aadharUrl ||
    payload.idDocumentUrl ||
    payload.collegeId ||
    member0.aadhaar ||
    member0.aadhar ||
    member0.aadhaarUrl ||
    orderPayload.aadhaar ||
    orderPayload.aadhar ||
    orderMember0.aadhaar ||
    userDoc.aadhaar ||
    userDoc.aadhar ||
    userDoc.aadhaarUrl ||
    "";

  return { name, email, gender, phone, college, aadhaar };
};

/** Combine paid records from `invoices` and any paid records in `orders` not already in `invoices` */
const getUnifiedPaidGatewayRecords = (invoices = [], orders = []) => {
  const seenIds = new Set();
  const records = [];

  for (const inv of invoices) {
    seenIds.add(inv.id);
    if (isPaidStatus(inv.status)) {
      records.push(inv);
    }
  }

  for (const ord of orders) {
    if (seenIds.has(ord.id)) continue;
    if (isPaidStatus(ord.status)) {
      records.push(ord);
    }
  }

  return records;
};

const isAccommodationRequired = (row) => {
  if (row.requireAccommodation === true) return true;
  const val = String(row.requireAccommodation || "").toLowerCase().trim();
  if (val === "yes" || val === "true" || val === "1") return true;
  if (Number(row.accommodationFee) > 0) return true;
  if (row.accommodationScreenshotUrl || row.accomTxnId) return true;
  return false;
};

// ─── 1. Export: accom (Hostel Sheet) ────────────────────────────────────────

async function exportAccom() {
  const [workshopRegs, accomRequests, invoices, comboOrders, orders, users] =
    await Promise.all([
      readCollection("workshop_registrations"),
      readCollection("accommodation_requests"),
      readCollection("invoices"),
      readCollection("combo_orders"),
      readCollection("orders"),
      readCollection("users"),
    ]);

  const { usersByUid, ordersByKey } = buildLookupMaps(users, orders);
  const paidGatewayRecords = getUnifiedPaidGatewayRecords(invoices, orders);

  const rows = [];

  // 1. Workshops with requireAccommodation
  for (const reg of workshopRegs) {
    if (!isAccommodationRequired(reg)) continue;
    const rawTime = reg.submittedAt || reg.registrationTime;
    rows.push({
      time: parseDate(rawTime),
      timeStr: toIST(reg.submittedAt) || reg.registrationTime || "",
      status: reg.status || "Workshop Reg",
      name: reg.name || "",
      gender: reg.gender || "",
      phone: reg.phone || "",
      days: reg.accommodationDays ?? "",
      price: Number(reg.accommodationFee) || 0,
      aadhaar: reg.aadhaarUrl || reg.aadhaar || reg.aadhar || "",
      payment: reg.accommodationScreenshotUrl || reg.screenshotUrl || "",
      source: `Workshop / ${reg.workshop || "N/A"}`,
    });
  }

  // 2. Direct accommodation bookings — one row per booked member
  for (const req of accomRequests) {
    const members = Array.isArray(req.bookedMembers)
      ? req.bookedMembers
      : Array.isArray(req.members)
        ? req.members
        : [];
    const numDays =
      req.totalDays ??
      (Array.isArray(req.selectedDates) ? req.selectedDates.length : "");
    const totalAmount = Number(req.totalAmount) || 0;
    const rawTime = req.submittedAt || req.createdAt;
    const time = parseDate(rawTime);
    const timeStr = toIST(rawTime);

    if (members.length > 0) {
      const perMemberPrice = Math.round(totalAmount / members.length);
      for (const m of members) {
        rows.push({
          time,
          timeStr,
          status: req.status || "PENDING_VERIFICATION",
          name: m.name || "",
          gender: m.gender || "",
          phone: m.phone || "",
          days: numDays,
          price: perMemberPrice,
          aadhaar: m.aadhaarUrl || m.aadhaar || m.aadhar || m.aadhaarNo || "",
          payment: req.screenshotUrl || req.screenshotId || "",
          source: "Direct Booking",
        });
      }
    } else {
      // Fallback if bookedMembers array is missing on a doc
      const userDoc = (req.uid && usersByUid[req.uid]) || {};
      rows.push({
        time,
        timeStr,
        status: req.status || "PENDING_VERIFICATION",
        name: req.name || userDoc.name || "",
        gender: req.gender || userDoc.gender || "",
        phone: req.phone || userDoc.phone || "",
        days: numDays,
        price: totalAmount,
        aadhaar: req.aadhaarUrl || req.aadhaar || req.aadhar || req.aadhaarNo || "",
        payment: req.screenshotUrl || req.screenshotId || "",
        source: "Direct Booking",
      });
    }
  }

  // 3. Gateway multi-day passes (FEST_PASS2 or FEST_PASS3 with status PAID)
  for (const inv of paidGatewayRecords) {
    const { passName, passItem } = findPassInInvoice(inv);
    if (!passName || !MULTI_DAY_PASSES.includes(passName)) continue;

    const days = PASS_DAYS[passName];
    const attendee = extractInvoiceAttendee(inv, passItem, usersByUid, ordersByKey);
    const price =
      inv.total ??
      passItem?.cost ??
      inv.paymentDetails?.payDetails?.amount ??
      0;

    rows.push({
      time: parseDate(inv.createdAt || inv.submittedAt),
      timeStr: toIST(inv.createdAt || inv.submittedAt),
      status: inv.status || "PAID",
      name: attendee.name,
      gender: attendee.gender,
      phone: attendee.phone,
      days,
      price,
      aadhaar: attendee.aadhaar,
      payment: "Gateway Payment",
      source: `Pass / ${passName}`,
    });
  }

  // 4. QR combo multi-day passes (FEST_PASS2 or FEST_PASS3)
  for (const order of comboOrders) {
    const passName = getComboPassName(order);
    if (!passName || !MULTI_DAY_PASSES.includes(passName)) continue;

    const days = PASS_DAYS[passName];
    const attendee = order.attendee || {};
    const userDoc = (order.uid && usersByUid[order.uid]) || {};

    rows.push({
      time: parseDate(order.submittedAt || order.createdAt),
      timeStr: toIST(order.submittedAt || order.createdAt),
      status: order.status || "PENDING_VERIFICATION",
      name: attendee.name || order.name || userDoc.name || "",
      gender: attendee.gender || order.gender || userDoc.gender || "",
      phone: attendee.phone || order.phone || userDoc.phone || "",
      days,
      price: order.totalAmount ?? order.originalAmount ?? order.item?.cost ?? 0,
      aadhaar:
        attendee.idDocumentUrl ||
        attendee.aadhaarUrl ||
        attendee.aadhaar ||
        attendee.aadhar ||
        order.idDocumentUrl ||
        "",
      payment: order.screenshotUrl || order.screenshotId || "",
      source: `QR Pass / ${passName}`,
    });
  }

  // Sort chronologically
  rows.sort((a, b) => a.time - b.time);

  const csvRows = [];
  csvRows.push(
    makeCsvRow([
      "Status",
      "Time (IST)",
      "Name",
      "Gender",
      "Phone",
      "No. of Days",
      "Price Paid",
      "Aadhaar Screenshot",
      "Payment Proof Screenshot",
      "Source",
    ]),
  );

  for (const r of rows) {
    csvRows.push(
      makeCsvRow([
        r.status,
        r.timeStr,
        r.name,
        r.gender,
        csvText(r.phone),
        r.days,
        r.price,
        r.aadhaar,
        r.payment,
        r.source,
      ]),
    );
  }

  return csvRows;
}

// ─── 2. Export: pronite (Pronite Pass Sheet) ────────────────────────────────

async function exportPronite() {
  const [invoices, comboOrders, orders, users] = await Promise.all([
    readCollection("invoices"),
    readCollection("combo_orders"),
    readCollection("orders"),
    readCollection("users"),
  ]);

  const { usersByUid, ordersByKey } = buildLookupMaps(users, orders);
  const paidGatewayRecords = getUnifiedPaidGatewayRecords(invoices, orders);

  const rows = [];

  // 1. Gateway purchases — invoices/orders with any FEST_PASS variant, status PAID
  for (const inv of paidGatewayRecords) {
    const { passName, passItem } = findPassInInvoice(inv);
    if (!passName) continue;

    const attendee = extractInvoiceAttendee(inv, passItem, usersByUid, ordersByKey);
    const price =
      inv.total ??
      passItem?.cost ??
      inv.paymentDetails?.payDetails?.amount ??
      0;
    const coupon =
      inv.couponCode ||
      inv.coupon ||
      inv.payload?.couponCode ||
      inv.payload?.coupon ||
      "None";

    rows.push({
      time: parseDate(inv.createdAt || inv.submittedAt),
      timeStr: toIST(inv.createdAt || inv.submittedAt),
      status: inv.status || "PAID",
      name: attendee.name,
      email: attendee.email,
      gender: attendee.gender,
      phone: attendee.phone,
      college: attendee.college,
      pass: passName,
      price,
      coupon,
      paymentMethod: "Gateway",
      payment: "Gateway Payment",
      aadhaar: attendee.aadhaar,
    });
  }

  // 2. QR combo purchases — all pass-type combo orders
  for (const order of comboOrders) {
    const passName = getComboPassName(order);
    if (!passName) continue;

    const attendee = order.attendee || {};
    const userDoc = (order.uid && usersByUid[order.uid]) || {};

    rows.push({
      time: parseDate(order.submittedAt || order.createdAt),
      timeStr: toIST(order.submittedAt || order.createdAt),
      status: order.status || "PENDING_VERIFICATION",
      name: attendee.name || order.name || userDoc.name || "",
      email: attendee.email || order.email || userDoc.email || "",
      gender: attendee.gender || order.gender || userDoc.gender || "",
      phone: attendee.phone || order.phone || userDoc.phone || "",
      college: attendee.college || order.college || userDoc.college || "",
      pass: passName,
      price: order.totalAmount ?? order.originalAmount ?? order.item?.cost ?? 0,
      coupon: order.couponCode || "None",
      paymentMethod: "Done via QR",
      payment: order.screenshotUrl || order.screenshotId || "",
      aadhaar:
        attendee.idDocumentUrl ||
        attendee.aadhaarUrl ||
        attendee.aadhaar ||
        attendee.aadhar ||
        order.idDocumentUrl ||
        "",
    });
  }

  rows.sort((a, b) => a.time - b.time);

  const csvRows = [];
  csvRows.push(
    makeCsvRow([
      "Status",
      "Time (IST)",
      "Name",
      "Email",
      "Gender",
      "Phone",
      "College",
      "Pass",
      "Price Paid",
      "Coupon",
      "Payment Method",
      "Payment Proof Screenshot",
      "Aadhaar Screenshot",
    ]),
  );

  for (const r of rows) {
    csvRows.push(
      makeCsvRow([
        r.status,
        r.timeStr,
        r.name,
        r.email,
        r.gender,
        csvText(r.phone),
        r.college,
        r.pass,
        r.price,
        r.coupon,
        r.paymentMethod,
        r.payment,
        r.aadhaar,
      ]),
    );
  }

  return csvRows;
}

// ─── 3. Export: events (Event Sheet) ────────────────────────────────────────

async function exportEvents() {
  const [eventRegs, invoices] = await Promise.all([
    readCollection("event_registrations"),
    readCollection("invoices"),
  ]);

  // Build invoiceId → { byId, byName, total } lookup (works even when cart item has no `type` field)
  const invoiceLookup = {};
  for (const inv of invoices) {
    const byId = {};
    const byName = {};
    if (Array.isArray(inv.cart)) {
      for (const item of inv.cart) {
        const cost = Number(item.cost ?? item.price ?? 0);
        if (item.id) byId[item.id] = cost;
        if (item.name) byName[item.name] = cost;
      }
    }
    invoiceLookup[inv.id] = {
      byId,
      byName,
      total: Number(inv.total ?? inv.paymentDetails?.payDetails?.amount ?? 0),
    };
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
    "Time (IST)",
    "Event",
    "Team Name",
    "College",
    "Total Members",
    "Price Paid",
  ];
  const memberHeaders = [
    "Leader Name",
    "Leader Email",
    "Leader Phone",
    "Leader Gender",
    "Leader Aadhaar",
  ];
  for (let i = 2; i <= maxMembers; i++) {
    memberHeaders.push(
      `Member ${i} Name`,
      `Member ${i} Email`,
      `Member ${i} Phone`,
      `Member ${i} Gender`,
      `Member ${i} Aadhaar`,
    );
  }

  const csvRows = [];
  csvRows.push(makeCsvRow([...headerBase, ...memberHeaders]));

  for (const reg of eventRegs) {
    const members = Array.isArray(reg.members) ? reg.members : [];

    // Look up price from invoice by eventId, eventName, or invoice total
    let pricePaid = reg.amountPaid ?? reg.price ?? "";
    if (reg.invoiceId && invoiceLookup[reg.invoiceId]) {
      const invInfo = invoiceLookup[reg.invoiceId];
      pricePaid =
        invInfo.byId[reg.eventId] ??
        invInfo.byName[reg.eventName] ??
        invInfo.total ??
        pricePaid;
    }

    const baseRow = [
      toIST(reg.paidAt),
      reg.eventName || "",
      reg.teamName || "",
      reg.college || "",
      members.length,
      pricePaid,
    ];

    // Flatten members horizontally (1 row per team)
    const memberCols = [];
    for (let i = 0; i < maxMembers; i++) {
      const m = members[i] || {};
      memberCols.push(
        m.name || "",
        m.email || "",
        csvText(m.phone || ""),
        m.gender || "",
        m.aadhaar || m.aadhar || m.aadhaarUrl || "",
      );
    }

    csvRows.push(makeCsvRow([...baseRow, ...memberCols]));
  }

  return csvRows;
}

// ─── 4. Export: reg (Workshop Sheet) ────────────────────────────────────────

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

  data.sort(
    (a, b) =>
      parseDate(a.submittedAt || a.registrationTime) -
      parseDate(b.submittedAt || b.registrationTime),
  );

  const csvRows = [];
  csvRows.push(
    makeCsvRow([
      "ID",
      "Time",
      "Name",
      "Gender",
      "Email",
      "Phone",
      "College",
      "Track",
      "Is IITP",
      "Roll Number",
      "Reg Fee Paid",
      "Sender UPI ID",
      "Reg Txn ID",
      "Payment Proof Screenshot",
      "Aadhaar URL",
      "Accommodation Screenshot URL",
    ]),
  );

  for (const row of data) {
    csvRows.push(
      makeCsvRow([
        row.registrationId || row.id,
        row.registrationTime || toIST(row.submittedAt) || "",
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
        row.workshopScreenshotUrl || row.screenshotUrl || "",
        row.aadhaarUrl || "",
        row.accommodationScreenshotUrl || "",
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