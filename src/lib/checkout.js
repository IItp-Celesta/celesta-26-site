import axios from "axios";
import toast from "react-hot-toast";

export async function checkout(cart, authUser, payload) {
  if (!authUser) {
    toast.error("Please log in before checkout.");
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
      throw new Error(orderResponse.data?.message || "Unable to create order.");
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

    throw new Error(paymentResponse.data?.error || "Unable to initiate payment.");
  } catch (error) {
    console.error("Checkout failed:", error);
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Checkout failed. Please try again.";
    toast.error(message);
    return null;
  }
}
