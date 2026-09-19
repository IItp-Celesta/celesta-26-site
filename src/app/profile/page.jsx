"use client";

import { useAuth } from "@/context/AuthUserContext";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useInvoices } from "@/hooks/useInvoices";
import React from "react";
import toast from "react-hot-toast";
import {
  calculateCartTotal,
  countUniquePronitePasses,
} from "@/lib/pricing_algo";
import {
  User,
  Mail,
  Calendar,
  CreditCard,
  Download,
  Share2,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/ProfileCard";
import { Button } from "@/components/ui/button";
import styles from "./Profile.module.css";
import { useCart } from "@/context/CartContext";
import { checkout } from "@/lib/checkout";
import { ModalForm } from "./checkout_modal.js";
import AccommodationModal from "@/components/AccommodationModal"; // Fixed import

export default function Profile() {
  const router = useRouter();
  const { authUser, loading, signOutUser } = useAuth();
  const qrRef = useRef(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    dob: "",
    celestaId: "",
    qrEnabled: false,
  });
  const [qrValue, setQrValue] = useState("");

  const { cart, removeFromCart, emptyCart, addToCart } = useCart();

  const uniquePronitePasses = countUniquePronitePasses(cart);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = calculateCartTotal(cart);
  const { invoices } = useInvoices();
  const hasEventInCart = cart.some(
    (item) =>
      item.type === "event" ||
      (item.id && String(item.id).startsWith("EVENT_")),
  );

  const initiateCheckout = async (payload) => {
    if (typeof window !== "undefined" && !window.AtomPaynetz) {
      alert(
        "Payment gateway is initializing. Please try again in a few seconds.",
      );
      return;
    }

    const custEmail = authUser?.email;
    const custMobile = payload?.phone;

    if (!custEmail || !custMobile) {
      toast.error(
        "We need a valid email and phone number before you can pay. Please fill them in and try again.",
      );
      return;
    }

    setIsCheckoutLoading(true);

    try {
      const data = await checkout(cart, authUser, payload);
      if (data && data.token) {
        const options = {
          atomTokenId: data.token,
          merchId: data.merchId,
          custEmail,
          custMobile,
          returnUrl: `${window.location.origin}/api/payment/response`,
        };

        if (window.AtomPaynetz) {
          new window.AtomPaynetz(
            options,
            process.env.NEXT_PUBLIC_ATOM_ENV === "prod" ? "prod" : "uat",
          );
        } else {
          console.error("AtomPaynetz object not found");
          alert("Payment gateway error. Please refresh.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating checkout");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      if (!authUser) return;
      const token = await authUser.getIdToken(true);
      const res = await axios.get("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setProfile({
          name: res.data.user.displayName,
          email: res.data.user.email,
          dob: res.data.user.dob,
          celestaId: res.data.user.celestaId,
          qrEnabled: res.data.user?.qrEnabled,
        });
      }
    }
    fetchProfile();
  }, [authUser]);

  useEffect(() => {
    if (!authUser || !profile.qrEnabled) return;
    async function fetchQR() {
      try {
        const token = await authUser.getIdToken(true);
        const res = await axios.get("/api/qr/generate", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQrValue(JSON.stringify(res.data));
      } catch (err) {
        console.error("QR fetch error:", err);
      }
    }
    fetchQR();
  }, [authUser, profile.qrEnabled]);

  /* ───────── QR TO IMAGE ───────── */
  const qrToBlob = async () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return null;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    canvas.width = 400;
    canvas.height = 400;
    return new Promise((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 400, 400);
        canvas.toBlob(resolve);
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    });
  };

  const downloadQR = async () => {
    const blob = await qrToBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.celestaId}_QR.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareQR = async () => {
    const blob = await qrToBlob();
    if (!blob) return;
    const file = new File([blob], "celesta-qr.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Celesta Entry QR",
        text: `Entry QR for ${profile.name}`,
      });
    } else {
      downloadQR();
    }
  };

  const startCheckout = () => {
    if (hasEventInCart) {
      const eventItem = cart.find(
        (item) => item.type === "event" || String(item.id).startsWith("EVENT_"),
      );
      const leader = eventItem?.teamDetails?.members?.[0];
      initiateCheckout({
        college: eventItem?.teamDetails?.college || "",
        phone: leader?.phone || "",
        email: authUser?.email || leader?.email || "",
      });
      return;
    }
    setCheckoutModalOpen(true);
  };

  return (
    <div className={styles.background}>
      <Card
        className="
          w-full max-w-5xl
          bg-white/10 backdrop-blur-2xl
          border border-white/20
          text-white
          overflow-hidden
        "
      >
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-xl font-semibold tracking-wide">
            Profile
          </CardTitle>
          <CardDescription className="text-white/60 text-sm">
            Celesta 2026 · IIT Patna
            <button
              onClick={() => {
                signOutUser();
                router.replace("/");
              }}
              className="mx-4 px-2 py-1 text-neutral-500 text-xs bg-neutral-900 uppercase tracking-wide rounded"
            >
              Log Out
            </button>
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-6">
          <div className="space-y-4">
            <Info icon={<User />} label="Name" value={profile.name} />
            <Info icon={<Mail />} label="Email" value={profile.email} />
            <Info icon={<Calendar />} label="DOB" value={profile.dob} />
            <Info
              icon={<CreditCard />}
              label="Celesta ID"
              value={profile.celestaId}
              highlight
            />
          </div>

          <div className="flex flex-col items-center justify-center">
            <p className="text-sm text-white/70 mb-4 tracking-wide">
              ENTRY QR PASS
            </p>

            <div
              ref={qrRef}
              className={`relative p-6 rounded-3xl ${
                profile.qrEnabled ? "bg-white" : "bg-white/80"
              } transition-all duration-300 `}
            >
              {profile.qrEnabled ? (
                qrValue ? (
                  <QRCodeSVG value={qrValue} size={260} />
                ) : (
                  <div className="w-[260px] h-[260px] flex items-center justify-center text-gray-400">
                    Loading QR...
                  </div>
                )
              ) : (
                <>
                  <img
                    src="/images/dummyqr.png"
                    alt="QR Locked"
                    className="w-[260px] h-[260px] object-cover rounded-xl blur-sm opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/60 px-4 py-2 rounded-lg text-center">
                      <p className="text-xs text-white font-medium">
                        Register in any event
                      </p>
                      <p className="text-[11px] text-white/70">to unlock QR</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {profile.qrEnabled ? (
              <div className="flex gap-3 mt-6">
                <Button
                  size="sm"
                  variant="outline text-black"
                  onClick={downloadQR}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline text-black"
                  onClick={shareQR}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-xs text-white/50 text-center max-w-[220px]">
                QR unlocks after registering for at least one event
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="justify-center text-xs text-white/50 pb-8">
          Scan QR at Celesta entry gates
        </CardFooter>

        <div className="flex flex-col items-center justify-center w-full">
          {cart.length === 0 ? (
            <CardFooter className="justify-center text-sm text-white/50 py-10">
              Your Cart is empty
            </CardFooter>
          ) : (
            <div className="w-full max-w-3xl mx-auto p-6 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Shopping Cart</h2>
                <div className="text-lg font-semibold text-neutral-300">
                  {totalItems} items • ₹{totalPrice}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {uniquePronitePasses > 0 && (
                  <div className="flex items-center justify-between p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg ">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-bold text-purple-400">
                          Pronite Passes
                        </h3>
                        <p className="text-[11px] text-purple-300/70 mt-1 max-w-[200px] leading-tight">
                          Auto-applied for all participants
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-white text-lg">
                          ₹{uniquePronitePasses * 11}
                        </span>
                        <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-1 rounded mt-1 border border-purple-500/30">
                          {uniquePronitePasses} pass
                          {uniquePronitePasses > 1 ? "es" : ""} added
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="">
                        <h3 className="font-semibold text-white">
                          {item.name}
                        </h3>
                        <p className="text-sm text-neutral-400">
                          ₹{item.cost || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-semibold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-between pt-4 border-t border-neutral-700 gap-4">
                <Script
                  src={`https://${
                    process.env.NEXT_PUBLIC_ATOM_ENV === "prod"
                      ? "psa"
                      : "pgtest"
                  }.atomtech.in/staticdata/ots/js/atomcheckout.js?v=${Date.now()}`}
                  strategy="lazyOnload"
                  onLoad={() => {
                    console.log("AtomPaynetz script loaded successfully");
                  }}
                />
                <div className="px-4 md:px-12 w-full mx-auto">
                  <AccommodationModal />
                </div>
                <button
                  onClick={emptyCart}
                  className="px-6 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 transition"
                >
                  Empty Cart
                </button>

                <button
                  type="button"
                  onClick={startCheckout}
                  disabled={isCheckoutLoading}
                  className={`px-8 py-3 text-white font-semibold rounded-md transition flex-grow md:flex-grow-0 ${
                    isCheckoutLoading
                      ? "bg-green-600/50 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isCheckoutLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Checkout (₹${totalPrice})`
                  )}
                </button>

                <ModalForm
                  isOpen={checkoutModalOpen}
                  onClose={() => setCheckoutModalOpen(false)}
                  onSubmit={(payload) => initiateCheckout(payload)}
                />
              </div>
            </div>
          )}

          {invoices.length === 0 ? (
            <CardFooter className="justify-center text-sm text-white/50 py-10 border-t border-white/10 w-full mt-8">
              No Paid Invoices
            </CardFooter>
          ) : (
            <div className="w-full max-w-3xl mx-auto p-6 rounded-xl border-t border-white/10 mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Your Tickets & Invoices
                </h2>
              </div>

              <div className="space-y-4 mb-8 flex flex-col">
                {invoices.map((invoice) => {
                  const invoicePronitePasses = countUniquePronitePasses(
                    invoice.cart,
                  );

                  return (
                    <div
                      key={invoice.id}
                      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-4"
                    >
                      <div className="bg-black/30 p-2 px-4 flex justify-between items-center text-xs text-white/50 border-b border-white/10">
                        <span>Order #{invoice.id.substring(0, 8)}</span>
                        <span className="font-bold text-green-400">
                          Total Paid: ₹{invoice.total}
                        </span>
                      </div>

                      {invoicePronitePasses > 0 && (
                        <div className="flex items-center justify-between p-3 bg-purple-900/10 border-b border-white/5">
                          <div className="px-1">
                            <h3 className="font-semibold text-purple-400 text-sm">
                              Pronite Passes
                            </h3>
                          </div>
                          <div className="text-right px-2">
                            <span className="text-sm font-semibold text-white">
                              x{invoicePronitePasses}
                            </span>
                            <p className="text-[11px] font-bold text-green-400 mt-0.5">
                              ₹{invoicePronitePasses * 11}{" "}
                              <span className="text-white/40 font-normal tracking-wide">
                                (Included)
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                      {invoice.cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 border-b border-white/5 last:border-0"
                        >
                          <div className="flex items-center space-x-4 px-2">
                            <div className="">
                              <h3 className="font-semibold text-white">
                                {item.name}
                              </h3>
                              <p className="text-sm text-neutral-400">
                                Event Fee: ₹{item.cost || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 px-2">
                            <span className="text-lg font-semibold text-white">
                              x{item.quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function Info({ icon, label, value, highlight }) {
  return (
    <div
      className="
        flex gap-4 p-4 rounded-xl
        bg-white/10 border border-white/10
        backdrop-blur-md
      "
    >
      <div
        className={`p-2 rounded-lg ${
          highlight
            ? "bg-indigo-500/20 text-indigo-300"
            : "bg-white/20 text-white/70"
        }`}
      >
        {icon}
      </div>
      <div className="overflow-hidden">
        <p className="text-xs uppercase tracking-wider text-white/60">
          {label}
        </p>
        <p className="text-sm font-medium break-all">{value}</p>
      </div>
    </div>
  );
}
