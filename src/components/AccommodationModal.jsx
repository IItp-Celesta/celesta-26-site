"use client";

import React, { useState, useEffect, useMemo } from "react";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthUserContext";
import { isEventItem } from "@/lib/pricing_algo";

const PRICE_PER_DAY = 299;

export default function AccommodationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [txnId, setTxnId] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { cart } = useCart();
  const { authUser } = useAuth();
  const [selectedDays, setSelectedDays] = useState(1);
  const [selectedMemberIds, setSelectedMemberIds] = useState(new Set());

  const uniqueMembers = useMemo(() => {
    const membersMap = new Map();

    cart.forEach((item) => {
      if (!isEventItem(item)) return;
      item.teamDetails?.members?.forEach((member) => {
        const email = member.email ? member.email.toLowerCase().trim() : "";
        const phone = member.phone ? member.phone.trim() : "";
        const key = email || phone;
        if (!key) return;

        membersMap.set(key, {
          id: key,
          name: member.name || "",
          email,
          phone,
          gender: member.gender || "",
          aadhaar: member.aadhaar || "",
        });
      });
    });

    return Array.from(membersMap.values());
  }, [cart]);

  useEffect(() => {
    setSelectedMemberIds(new Set(uniqueMembers.map((m) => m.id)));
  }, [uniqueMembers]);

  const toggleMember = (id) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalMembers = selectedMemberIds.size;
  const totalDaysAcrossAll = totalMembers * selectedDays;
  const totalAmount = totalDaysAcrossAll * PRICE_PER_DAY;

  const handleUploadAndSubmit = async (e) => {
    e.preventDefault();
    if (!txnId || !file) {
      toast.error("Please provide both Transaction ID and Screenshot");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Booking Accommodation...");

    try {
      if (!authUser) throw new Error("You must be logged in");

      const bookedMembers = uniqueMembers
        .filter((m) => selectedMemberIds.has(m.id))
        .map((m) => ({
          name: m.name,
          email: m.email,
          phone: m.phone,
          gender: m.gender,
          aadhaar: m.aadhaar,
          days: selectedDays,
        }));

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });

      const formData = new FormData();
      formData.append("file", compressedFile);

      const token = await authUser.getIdToken();
      const uploadRes = await fetch("/api/upload-id", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const uploadedData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error("Failed to upload screenshot");

      await addDoc(collection(db, "accommodation_requests"), {
        uid: authUser.uid,
        email: authUser.email,
        txnId,
        screenshotId: uploadedData.secure_url,
        status: "PENDING_VERIFICATION",
        totalAmount,
        totalDays: totalDaysAcrossAll,
        bookedMembers,
        submittedAt: serverTimestamp(),
      });

      toast.success("Accommodation booked successfully!", { id: toastId });
      setIsOpen(false);
      setTxnId("");
      setFile(null);
      setSelectedMemberIds(new Set());
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (uniqueMembers.length === 0) return null;

  return (
    <>
      <div className="border border-white/15 bg-white/5 rounded-xl p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="text-center md:text-left w-full md:w-auto">
          <h3 className="text-lg font-semibold text-white">
            Hostel Accommodation (Food not included)
          </h3>
          <p className="text-sm text-white/60 mt-1 mb-3">
            ₹{PRICE_PER_DAY}/day per person. Select who needs accommodation:
          </p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {uniqueMembers.map((m) => {
              const isSelected = selectedMemberIds.has(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMember(m.id)}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-sky-500/20 border-sky-500/50 text-sky-300"
                      : "bg-black/40 border-white/10 text-white/40 hover:bg-white/10"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-sm border flex items-center justify-center ${isSelected ? "border-sky-400 bg-sky-500" : "border-white/30"}`}
                  >
                    {isSelected && (
                      <span className="text-black text-[8px] font-bold">✓</span>
                    )}
                  </div>
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 md:mt-0">
          <div className="flex items-center bg-black/40 rounded-lg p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setSelectedDays(Math.max(1, selectedDays - 1))}
              disabled={selectedDays <= 1 || totalMembers === 0}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                selectedDays <= 1 || totalMembers === 0
                  ? "text-white/20 cursor-not-allowed"
                  : "text-white hover:bg-white/10"
              }`}
            >
              -
            </button>
            <span className="w-16 text-center font-bold text-sky-400 text-sm">
              {selectedDays} Day{selectedDays > 1 ? "s" : ""}
            </span>
            <button
              type="button"
              onClick={() => setSelectedDays(Math.min(3, selectedDays + 1))}
              disabled={selectedDays >= 3 || totalMembers === 0}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                selectedDays >= 3 || totalMembers === 0
                  ? "text-white/20 cursor-not-allowed"
                  : "text-white hover:bg-white/10"
              }`}
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            disabled={totalMembers === 0}
            className={`font-semibold py-2.5 px-6 rounded-lg transition-colors whitespace-nowrap shadow-lg min-w-[140px] ${
              totalMembers === 0
                ? "bg-white/5 text-white/40 cursor-not-allowed border border-white/10"
                : "bg-sky-500 hover:bg-sky-400 text-black shadow-sky-500/20"
            }`}
          >
            {totalMembers === 0 ? "Select Members" : `Book (₹${totalAmount})`}
          </button>
        </div>
      </div>

      {isOpen && totalMembers > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-slate-900 border border-white/15 rounded-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white text-lg"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold text-white mb-6">
              Complete Payment
            </h2>

            <div className="animate-[fadeIn_0.3s_ease-out]">
              <div className="flex justify-between items-center bg-sky-500/10 border border-sky-500/30 p-4 rounded-xl mb-6">
                <div className="flex flex-col">
                  <span className="text-xs text-sky-200 uppercase tracking-wider font-semibold">
                    Total Payable
                  </span>
                  <span className="text-[10px] text-sky-200/60 mt-0.5">
                    {selectedDays} Day{selectedDays > 1 ? "s" : ""} for{" "}
                    {totalMembers} Person{totalMembers > 1 ? "s" : ""}
                  </span>
                </div>
                <span className="text-2xl font-black text-sky-400">
                  ₹{totalAmount}
                </span>
              </div>

              <div className="bg-white rounded-xl p-3 w-fit mx-auto mb-3 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
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
                className="flex flex-col gap-5"
              >
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    UPI Transaction ID
                  </label>
                  <input
                    type="text"
                    required
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                    placeholder="Enter 12-digit UTR number"
                    className="w-full bg-black/40 border border-white/15 rounded-lg p-3 text-white placeholder:text-white/30 outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Payment Screenshot
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-white/50 file:mr-3 file:py-2.5 file:px-3 file:rounded-md file:border-0 file:bg-sky-500/10 file:text-sky-400 file:font-bold hover:file:bg-sky-500/20 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 mt-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isSubmitting ? "bg-white/10 text-white/30 cursor-not-allowed" : "bg-sky-500 text-black hover:bg-sky-400 shadow-lg shadow-sky-500/20"}`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                      Submitting...
                    </>
                  ) : (
                    "Submit Receipt"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
