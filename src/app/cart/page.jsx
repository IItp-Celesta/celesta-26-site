"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import toast from "react-hot-toast";
import ComboCheckoutModal from "@/components/ComboCheckoutModal";
import { useAuth } from "@/context/AuthUserContext";
import { useCart } from "@/context/CartContext";
import { useInvoices } from "@/hooks/useInvoices";
import { checkout } from "@/lib/checkout";

import {
  calculateCartTotal,
  countUniquePronitePasses,
  getAddedPronitePassMembers,
  isEventItem,
  isPassItem,
  PRONITE_PRICE,
  PRONITE_DISCOUNTED_PRICE,
} from "@/lib/pricing_algo";

import CheckoutModal from "@/components/CheckoutModal";
import AccommodationModal from "@/components/AccommodationModal";

export default function CartPage() {
  const router = useRouter();
  const { authUser, userData, loading } = useAuth();

  const { invoices, loading: invoicesLoading } = useInvoices();
  const { cart, removeFromCart, emptyCart } = useCart();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const [comboModalOpen, setComboModalOpen] = useState(false);
  const [selectedComboItem, setSelectedComboItem] = useState(null);

  const uniquePronitePasses = countUniquePronitePasses(cart, invoices);
  const addedPassMembers = getAddedPronitePassMembers(cart, invoices);
  const totalPrice = calculateCartTotal(cart, invoices);

  const hasEventInCart = cart.some(isEventItem);
  const hasPassInCart = cart.some(isPassItem);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading...
      </div>
    );
  }

  if (!authUser) {
    router.replace("/login?redirect=/cart");

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Redirecting...
      </div>
    );
  }

  const handleCheckoutClick = () => {
    const comboItem = cart.find((item) => item.type === "combo_pass");

    if (comboItem) {
      setSelectedComboItem(comboItem);
      setComboModalOpen(true);
      return;
    }

    startCheckout();
  };

  const initiateCheckout = async (payload, finalCart = cart) => {
    if (typeof window !== "undefined" && !window.AtomPaynetz) {
      alert(
        "Payment gateway is initializing. Please try again in a few seconds.",
      );
      return;
    }

    const custEmail = authUser?.email;
    const custMobile = payload?.phone;

    if (!custEmail || !custMobile) {
      toast.error("We need a valid email and phone number before you can pay.");
      return;
    }

    setIsCheckoutLoading(true);

    try {
      const data = await checkout(finalCart, authUser, payload);

      if (data?.token) {
        const options = {
          atomTokenId: data.token,
          merchId: data.merchId,
          custEmail,
          custMobile,
          returnUrl: `${window.location.origin}/api/payment/response`,
        };

        new window.AtomPaynetz(
          options,
          process.env.NEXT_PUBLIC_ATOM_ENV === "prod" ? "prod" : "uat",
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Error initiating checkout");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const startCheckout = () => {
    if (totalPrice <= 0) {
      toast.error("Invalid cart total (₹0). Please check store pricing.");
      return;
    }

    if (hasEventInCart && !hasPassInCart) {
      const eventItem = cart.find(isEventItem);
      const leader = eventItem?.teamDetails?.members?.[0];

      initiateCheckout(
        {
          name:
            leader?.name ||
            userData?.name ||
            userData?.displayName ||
            "Participant",
          gender: leader?.gender || "Other",
          college: eventItem?.teamDetails?.college || "Not Provided",
          phone: leader?.phone || "",
          email: authUser?.email || leader?.email || "no-reply@celesta.org.in",
        },
        cart,
      );

      return;
    }

    setCheckoutModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pt-32">
      <Script
        src={`https://${
          process.env.NEXT_PUBLIC_ATOM_ENV === "prod" ? "psa" : "pgtest"
        }.atomtech.in/staticdata/ots/js/atomcheckout.js?v=20260326`}
        strategy="lazyOnload"
      />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-white/50 mt-1">
              Review your items before checkout
            </p>
          </div>
          <button
            onClick={() => router.push("/profile")}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
          >
            Back to Profile
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/50 mb-6">Your cart is empty</p>
            <button
              onClick={() => router.push("/events")}
              className="px-6 py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-500 transition-colors"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Your Items</h2>
              <div className="text-lg font-semibold text-neutral-300">
                Total: ₹{totalPrice}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {uniquePronitePasses > 0 && (
                <div className="flex flex-col p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-purple-400">
                        Pronite Passes
                      </h3>
                      <p className="text-xs text-purple-300/70 mt-1">
                        Auto-applied for new participants
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-white/40 line-through">
                        ₹{uniquePronitePasses * PRONITE_PRICE}
                      </span>
                      <div className="font-bold text-white text-lg">
                        ₹{uniquePronitePasses * PRONITE_DISCOUNTED_PRICE}
                      </div>
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-1 rounded">
                        {uniquePronitePasses} pass
                        {uniquePronitePasses > 1 ? "es" : ""} added
                      </span>
                    </div>
                  </div>

                  {addedPassMembers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-purple-500/20">
                      <p className="text-[10px] uppercase tracking-wider text-purple-300/60 mb-2">
                        Passes generated for:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {addedPassMembers.map((member, idx) => (
                          <div
                            key={idx}
                            className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 rounded-md text-xs font-medium text-purple-200"
                          >
                            {member.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {cart.map((item) => {
                const isEvent = isEventItem(item);
                const members = item.teamDetails?.members || [];

                return (
                  <div key={item.id} className="p-4 bg-neutral-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-neutral-400">
                          {isEvent
                            ? `Team Registration: ₹${item.cost}`
                            : `₹${item.cost || "N/A"}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="px-4 py-2 bg-red-600/20 text-red-400 text-sm font-semibold rounded-lg hover:bg-red-600 hover:text-white border border-red-500/30 hover:border-red-600 transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {isEvent && members.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <p className="text-xs uppercase tracking-wider text-white/40 mb-2">
                          Registered Members
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {members.map((member, index) => (
                            <div
                              key={`${member.email || member.phone || index}-${index}`}
                              className="px-3 py-1.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sm text-sky-300"
                            >
                              {member.name}
                              {index === 0 && (
                                <span className="ml-1.5 text-[10px] text-sky-400/60">
                                  (Leader)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-neutral-700 pt-6 space-y-4">
              {hasEventInCart && <AccommodationModal />}
              <div className="flex gap-4">
                <button
                  onClick={emptyCart}
                  className="px-6 py-3 bg-neutral-700 rounded-md hover:bg-neutral-600 transition-colors"
                >
                  Empty Cart
                </button>

                <button
                  onClick={handleCheckoutClick}
                  disabled={isCheckoutLoading || invoicesLoading}
                  className="flex-1 px-8 py-3 bg-green-600 rounded-md hover:bg-green-700 font-semibold transition-colors disabled:opacity-50"
                >
                  {isCheckoutLoading
                    ? "Processing..."
                    : `Checkout (₹${totalPrice})`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onSubmit={initiateCheckout}
        cart={cart}
      />

      <ComboCheckoutModal
        isOpen={comboModalOpen}
        onClose={() => setComboModalOpen(false)}
        cartItem={selectedComboItem}
        onSuccess={(itemId) => {
          removeFromCart(itemId);
        }}
      />
    </div>
  );
}
