// Product IDs
const TSHIRT_IDS = ['CMT41CTMe4Nyi7DrfgrU', 'qfM24G7TwM9qEZlUtw15', 'SfdcOSw17L9poOBSbTsu'];
const HOODIE_ID = 'Bu8pvVHc87wB5L1EWfK9';
const PRONITE_PRICE = 11;
export function countUniquePronitePasses(cart) {
  if (!cart || cart.length === 0) return 0;

  const membersMap = new Map();
  cart.forEach((item) => {
    if (item.type === "event" || String(item.id).startsWith("EVENT_")) {
      item.teamDetails?.members?.forEach((member) => {
        const key = member.email || member.phone;
        if (key) membersMap.set(key, true);
      });
    }
  });
  return membersMap.size;
}

export function calculateCartTotal(cart) {
    if (!cart || cart.length === 0) return 0;

    let tShirtCount = 0;
    let hoodieCount = 0;
    let otherTotal = 0;

    cart.forEach(item => {
        if (item.type === "event" || String(item.id).startsWith("EVENT_")) {
            otherTotal += item.cost;
        }
        else if (TSHIRT_IDS.includes(item.id)) {
            tShirtCount += item.quantity;
        } else if (item.id === HOODIE_ID) {
            hoodieCount += item.quantity;
        }
        else {
            otherTotal += (item.cost || 0) * item.quantity;
        }
    });

    let total = otherTotal;


    total += countUniquePronitePasses(cart) * PRONITE_PRICE;

    // Combo (Hoodie + T-shirt = 999)
    const combos = Math.min(tShirtCount, hoodieCount);
    total += combos * 999;

    tShirtCount -= combos;
    hoodieCount -= combos;

    // T-Shirts
    const tShirtTriplets = Math.floor(tShirtCount / 3);
    total += tShirtTriplets * 999;
    const remainingTShirts = tShirtCount % 3;
    if (remainingTShirts === 2) total += 698;
    if (remainingTShirts === 1) total += 349;

    // Hoodies
    const hoodieTriplets = Math.floor(hoodieCount / 3);
    total += hoodieTriplets * 2149;
    const remainingHoodies = hoodieCount % 3;
    if (remainingHoodies === 2) total += 1459;
    if (remainingHoodies === 1) total += 749;

    return total;
}