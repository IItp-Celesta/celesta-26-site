const TSHIRT_IDS = [
  "CMT41CTMe4Nyi7DrfgrU",
  "qfM24G7TwM9qEZlUtw15",
  "SfdcOSw17L9poOBSbTsu",
];
const HOODIE_ID = "Bu8pvVHc87wB5L1EWfK9";

export const PRONITE_PRICE = 899;
export const PRONITE_DISCOUNTED_PRICE = 399;

export const isEventItem = (item) =>
  item?.type === "event" || String(item?.id ?? "").startsWith("EVENT_");

export const isPassItem = (item) =>
  !!item &&
  !isEventItem(item) &&
  (item.type === "pass" ||
    item.type === "combo_pass" ||
    /\b(ticket|pass)(es|s)?\b/i.test(item.name ?? ""));

const keysOf = (m) =>
  [m?.email?.toLowerCase().trim(), m?.phone?.trim()].filter(Boolean);

const eventMembers = (items) =>
  (items || [])
    .filter(isEventItem)
    .flatMap((item) => item.teamDetails?.members ?? []);

export function getAddedPronitePassMembers(cart, pastInvoices = []) {
  const owned = new Set(
    (pastInvoices || [])
      .flatMap((inv) => eventMembers(inv.cart || inv.cartItems))
      .flatMap(keysOf),
  );

  const added = [];
  eventMembers(cart).forEach((member) => {
    const keys = keysOf(member);
    if (keys.length === 0 || keys.some((k) => owned.has(k))) return;
    keys.forEach((k) => owned.add(k));
    added.push(member);
  });
  return added;
}

export const countUniquePronitePasses = (cart, pastInvoices = []) =>
  getAddedPronitePassMembers(cart, pastInvoices).length;

export function calculateCartTotal(cart, pastInvoices = []) {
  if (!cart?.length) return 0;

  let tShirts = 0;
  let hoodies = 0;
  let total = 0;

  cart.forEach((item) => {
    const cost = Number(item.cost) || 0;
    const qty = Number(item.quantity) || 1;

    if (item.id === HOODIE_ID) hoodies += qty;
    else if (TSHIRT_IDS.includes(item.id)) tShirts += qty;
    else total += cost * qty; // events, passes, other merch
  });

  total +=
    countUniquePronitePasses(cart, pastInvoices) * PRONITE_DISCOUNTED_PRICE;

  const combos = Math.min(tShirts, hoodies);
  total += combos * 999;
  tShirts -= combos;
  hoodies -= combos;

  total += Math.floor(tShirts / 3) * 999 + [0, 349, 698][tShirts % 3];
  total += Math.floor(hoodies / 3) * 2149 + [0, 749, 1459][hoodies % 3];

  return total;
}
