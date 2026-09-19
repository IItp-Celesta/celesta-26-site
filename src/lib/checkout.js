import axios from "axios";

export async function checkout(cart, authUser, payload) {
  if (!authUser) {
    alert("Please log in before checkout.");
    return null;
  }

  try {
    const token = await authUser.getIdToken(true);

    const orderResponse = await axios.post(
      "/api/order",
      {
        cart,
        payload,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (orderResponse.status !== 201 || !orderResponse.data.success) {
      throw new Error("Unable to create order.");
    }

    const orderId = orderResponse.data.id;

    const paymentResponse = await axios.post(
      "/api/payment",
      {
        orderId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (paymentResponse.data?.token) {
      return paymentResponse.data;
    }

    throw new Error("Unable to initiate payment.");
  } catch (error) {
    console.error("Checkout failed:", error);
    alert("Checkout failed. Please try again.");
    return null;
  }
}
