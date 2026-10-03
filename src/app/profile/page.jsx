"use client";

import { useAuth } from "@/context/AuthUserContext";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { useInvoices } from "@/hooks/useInvoices";
import { useComboOrders } from "@/hooks/useComboOrders";
import { CheckCircle2, Clock } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";
import { countUniquePronitePasses } from "@/lib/pricing_algo";
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

export default function Profile() {
  const router = useRouter();
  const { authUser, userData, loading, signOutUser } = useAuth();
  const qrRef = useRef(null);
  const [qrValue, setQrValue] = useState("");

  const { invoices } = useInvoices();
  const { comboOrders, loading: combosLoading } = useComboOrders();

  useEffect(() => {
    if (!loading && !authUser) {
      toast.error("Please login first to view your profile!");
      router.replace("/login?redirect=/profile");
    }
  }, [authUser, loading, router]);

  useEffect(() => {
    async function fetchQR() {
      if (authUser && userData?.qrEnabled) {
        try {
          const token = await authUser.getIdToken();
          const qrRes = await axios.get("/api/qr/generate", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setQrValue(JSON.stringify(qrRes.data));
        } catch (qrErr) {
          console.error("Error fetching QR:", qrErr);
        }
      }
    }
    fetchQR();
  }, [authUser, userData]);

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
    a.download = `${userData.celestaId}_QR.png`;
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
        text: `Entry QR for ${userData.displayName}`,
      });
    } else {
      downloadQR();
    }
  };

  if (loading || !authUser || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading Profile...
      </div>
    );
  }

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
            <Info icon={<User />} label="Name" value={userData.displayName} />
            <Info icon={<Mail />} label="Email" value={userData.email} />
            <Info icon={<Calendar />} label="DOB" value={userData.dob} />
            <Info
              icon={<CreditCard />}
              label="Celesta ID"
              value={userData.celestaId}
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
                userData.qrEnabled ? "bg-white" : "bg-white/80"
              } transition-all duration-300 `}
            >
              {userData.qrEnabled ? (
                qrValue ? (
                  <QRCodeSVG value={qrValue} size={260} />
                ) : (
                  <div className="w-[260px] h-[260px] flex items-center justify-center text-gray-400">
                    Loading QR...
                  </div>
                )
              ) : (
                <>
                  <Image
                    src="/images/dummyqr.png"
                    alt="QR Locked"
                    width={260}
                    height={260}
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

            {userData.qrEnabled ? (
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

        <div className="flex flex-col items-center justify-center w-full mt-8 border-t border-white/10 pt-4">
          {invoices.length === 0 && comboOrders.length === 0 ? (
            <CardFooter className="justify-center text-sm text-white/50 py-10 w-full">
              No Paid Invoices
            </CardFooter>
          ) : (
            <div className="w-full max-w-3xl mx-auto p-6 rounded-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Your Tickets & Invoices
                </h2>
              </div>

              {!combosLoading && comboOrders.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-8">
                  <div className="bg-black/30 p-3 px-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white text-sm">
                        Your passes
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    {comboOrders.map((order) => {
                      const isVerified = order.status === "VERIFIED";

                      return (
                        <div
                          key={order.id}
                          className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                        >
                          <div>
                            <h4 className="font-semibold text-white">
                              {order.item?.name || "Combo Pass"}
                            </h4>
                            <div className="text-sm text-neutral-400 mt-1 space-y-0.5">
                              <p>
                                UTR:{" "}
                                <span className="text-white/70">
                                  {order.txnId}
                                </span>
                              </p>
                              <p>
                                Name:{" "}
                                <span className="text-white/70">
                                  {order.attendee.name}
                                </span>
                              </p>
                              {order.couponCode && (
                                <p>
                                  Coupon:{" "}
                                  <span className="text-white/70">
                                    {order.couponCode}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 md:gap-1">
                            <span className="text-lg font-semibold text-white">
                              ₹{order.totalAmount}
                            </span>

                            {isVerified ? (
                              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                                <CheckCircle2 size={14} /> Approved
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
                                <Clock size={14} /> Order submitted (Application
                                in review)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {invoices.length > 0 && (
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
                                ₹{invoicePronitePasses * 399}{" "}
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
              )}
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
