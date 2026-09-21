"use client";

import React, { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useCart } from "@/context/CartContext";
import { useInvoices } from "@/hooks/useInvoices";

export default function AccommodationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false); // NEW
  const [txnId, setTxnId] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { cart } = useCart();
  const { invoices } = useInvoices();
  const [uniqueMembers, setUniqueMembers] = useState([]);
  const [memberDays, setMemberDays] = useState({});

  useEffect(() => {
    if (isOpen) {
      const membersMap = new Map();

      const extractMembers = (items) => {
        if (!Array.isArray(items)) return;
        items.forEach((item) => {
          if (item.type === "event" || String(item.id).startsWith("EVENT_")) {
            item.teamDetails?.members?.forEach((member) => {
              const key = member.email || member.phone;
              if (key && !membersMap.has(key)) {
                membersMap.set(key, {
                  id: key,
                  name: member.name || "",
                  email: member.email || "",
                  phone: member.phone || "",
                  gender: member.gender || "",
                  aadhar :member.aadhaar || "",
                });
              }
            });
          }
        });
      };

      extractMembers(cart);

      invoices.forEach((inv) => extractMembers(inv.cart || inv.cartItems));

      const membersList = Array.from(membersMap.values());

      setUniqueMembers(membersList);

      const initialDays = {};
      membersList.forEach((m) => {
        initialDays[m.id] = 0;
      });

      setMemberDays(initialDays);

      setIsConfirmed(false);
      setTxnId("");
      setFile(null);
    }
  }, [isOpen, cart, invoices]);

  const MAX_DAYS = 3;

  const handleDayChange = (id, delta) => {
    setMemberDays((prev) => {
      const current = prev[id] || 0;
      const newDays = Math.min(MAX_DAYS, Math.max(0, current + delta));

      return {
        ...prev,
        [id]: newDays,
      };
    });
  };

  const totalDays = Object.values(memberDays).reduce((a, b) => a + b, 0);

  const totalAmount = totalDays * 279;

  const handleConfirm = () => {
    if (totalDays === 0) {
      toast.error("Please assign at least 1 day to a team member.");
      return;
    }

    setIsConfirmed(true);
  };

  const handleUploadAndSubmit = async (e) => {
    e.preventDefault();

    if (totalAmount === 0) {
      toast.error("Please assign at least 1 day to a team member.");
      return;
    }

    if (!txnId || !file) {
      toast.error("Please provide both Transaction ID and Screenshot");
      return;
    }

    setIsSubmitting(true);

    const toastId = toast.loading("Booking Accommodation...");

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be logged in");
      }

      const bookedMembers = uniqueMembers
        .filter((m) => memberDays[m.id] > 0)
        .map((m) => ({
          name: m.name,
          email: m.email,
          phone: m.phone,
          gender: m.gender,
          aadhar: m.aadhar,
          days: memberDays[m.id],
        }));

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });

      const formData = new FormData();
      formData.append("file", compressedFile);

      const token = await currentUser.getIdToken();
      const uploadRes = await fetch("/api/upload-id", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const uploadedData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error("Failed to upload screenshot");
      }

      await addDoc(collection(db, "accommodation_requests"), {
        uid: currentUser.uid,
        email: currentUser.email,
        txnId,
        screenshotId: uploadedData.secure_url,
        status: "PENDING_VERIFICATION",
        totalAmount,
        totalDays,
        bookedMembers,
        submittedAt: serverTimestamp(),
      });

      toast.success("Accommodation booked successfully!", {
        id: toastId,
      });

      setIsOpen(false);
      setIsConfirmed(false);
    } catch (error) {
      console.error(error);

      toast.error(error.message || "Something went wrong", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Accommodation Banner */}
      <div className="border border-white/15 bg-white/5 rounded-xl p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold text-white">
            Hostel Accommodation
          </h3>

          <p className="text-sm text-white/60 mt-1">
            For accommodation on campus, book seperately for
            <span className="font-semibold text-sky-400"> ₹279/day/member</span>
            .
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="bg-sky-500 hover:bg-sky-400 text-black font-semibold py-2.5 px-5 rounded-lg transition-colors whitespace-nowrap"
        >
          Book Accommodation
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-slate-900 border border-white/15 rounded-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={() => {
                setIsOpen(false);
                setIsConfirmed(false);
              }}
              className="absolute top-4 right-4 text-white/50 hover:text-white text-lg"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold text-white mb-1">
              Hostel Accommodation
            </h2>

            <p className="text-sm text-white/50 mb-4">
              Select how many days each team member is staying.
            </p>

            {/* Member List */}
            {uniqueMembers.length === 0 ? (
              <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10 mb-6">
                <p className="text-sm text-white/60">
                  No registered members found.
                </p>

                <p className="text-xs text-white/40 mt-1">
                  Please add an event to your cart first.
                </p>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2 mb-5 bg-black/20 p-3 rounded-lg border border-white/10">
                {uniqueMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/5"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">
                        {m.name}
                      </span>

                      <span className="text-[10px] text-white/40">{m.id}</span>
                    </div>

                    <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1 border border-white/10">
                      <button
                        type="button"
                        onClick={() => handleDayChange(m.id, -1)}
                        disabled={memberDays[m.id] <= 0}
                        className={`w-6 h-6 flex items-center justify-center rounded text-white transition-colors ${
                          memberDays[m.id] <= 0
                            ? "bg-white/5 text-white/20 cursor-not-allowed"
                            : "bg-white/10 hover:bg-red-500/50"
                        }`}
                      >
                        -
                      </button>

                      <span className="text-sm font-mono w-4 text-center text-sky-300 font-bold">
                        {memberDays[m.id]}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDayChange(m.id, 1)}
                        disabled={memberDays[m.id] >= MAX_DAYS}
                        className={`w-6 h-6 flex items-center justify-center rounded text-white transition-colors ${
                          memberDays[m.id] >= MAX_DAYS
                            ? "bg-white/5 text-white/20 cursor-not-allowed"
                            : "bg-white/10 hover:bg-sky-500/50"
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isConfirmed && uniqueMembers.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-white/60">Total Days</span>

                  <span className="font-semibold text-white">{totalDays}</span>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-white/60">Amount</span>

                  <span className="text-lg font-bold text-sky-400">
                    ₹{totalAmount}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={totalDays === 0}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    totalDays === 0
                      ? "bg-white/10 text-white/30 cursor-not-allowed"
                      : "bg-sky-500 text-black hover:bg-sky-400"
                  }`}
                >
                  Confirm & Pay
                </button>
              </div>
            )}

            {isConfirmed && totalAmount > 0 && (
              <div className="animate-[fadeIn_0.3s_ease-out]">
                {/* Summary */}
                <div className="flex justify-between items-center bg-sky-500/10 border border-sky-500/30 p-3 rounded-lg mb-5">
                  <span className="text-sm text-sky-200">
                    Total Payable ({totalDays} Days)
                  </span>

                  <span className="text-xl font-bold text-sky-400">
                    ₹{totalAmount}
                  </span>
                </div>

                {/* QR */}
                <div className="bg-white rounded-lg p-3 w-fit mx-auto mb-3">
                  <img
                    src="/payment/qr.jpeg"
                    alt="UPI payment QR code"
                    className="w-40 h-40 object-contain"
                  />
                </div>

                <p className="text-center text-sm text-white/60 mb-6">
                  Scan to pay{" "}
                  <span className="font-semibold text-sky-400">
                    ₹{totalAmount}
                  </span>
                </p>

                <form
                  onSubmit={handleUploadAndSubmit}
                  className="flex flex-col gap-4"
                >
                  {/* Transaction ID */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      UPI Transaction ID
                    </label>

                    <input
                      type="text"
                      required
                      value={txnId}
                      onChange={(e) => setTxnId(e.target.value)}
                      placeholder="Enter transaction ID"
                      className="w-full bg-white/5 border border-white/15 rounded-lg p-3 text-white placeholder:text-white/30 outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>

                  {/* Screenshot */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">
                      Payment Screenshot
                    </label>

                    <input
                      type="file"
                      required
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="w-full text-sm text-white/50 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-sky-500/10 file:text-sky-400 file:font-medium hover:file:bg-sky-500/20 cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 mt-2 rounded-lg font-semibold transition-colors ${
                      isSubmitting
                        ? "bg-white/10 text-white/30 cursor-not-allowed"
                        : "bg-sky-500 text-black hover:bg-sky-400"
                    }`}
                  >
                    {isSubmitting ? "Submitting..." : `Submit`}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
