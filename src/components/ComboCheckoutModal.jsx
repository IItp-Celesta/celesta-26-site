"use client";

import React, { useState } from "react";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthUserContext";

export default function ComboCheckoutModal({
  isOpen,
  onClose,
  cartItem,
  onSuccess,
}) {
  const { authUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [college, setCollege] = useState("");
  const [txnId, setTxnId] = useState("");
  const [file, setFile] = useState(null);
  const [idFile, setIdFile] = useState(null);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !cartItem) return null;

  const baseAmount = Number(cartItem.cost) || 0;
  const totalAmount = Math.max(0, baseAmount - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }

    setIsApplyingCoupon(true);

    try {
      const res = await fetch("/api/combo/validate-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setDiscount(0);
        toast.error(data.message || "Invalid coupon code.");
        return;
      }

      const percentage = Number(data.discountPercentage) || 0;
      const calculatedDiscount = Math.round((baseAmount * percentage) / 100);

      setDiscount(calculatedDiscount);
      toast.success(
        `Coupon applied! ${percentage}% off (₹${calculatedDiscount} saved).`,
      );
    } catch (error) {
      console.error(error);
      setDiscount(0);
      toast.error("Failed to validate coupon.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!txnId || !file || !name || !email || !phone || !gender || !idFile) {
      toast.error(
        "Please fill all required fields, upload your ID and payment screenshot.",
      );
      return;
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Submitting...");

    try {
      if (!authUser) {
        throw new Error("You must be logged in");
      }

      const token = await authUser.getIdToken();

      const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload-id", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to upload file");
        }

        return data.secure_url;
      };

      const [compressedFile, compressedIdFile] = await Promise.all([
        imageCompression(file, {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        }),
        imageCompression(idFile, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        }),
      ]);

      const [screenshotUrl, idDocumentUrl] = await Promise.all([
        uploadFile(compressedFile),
        uploadFile(compressedIdFile),
      ]);

      await addDoc(collection(db, "combo_orders"), {
        uid: authUser.uid,
        email: authUser.email,
        item: cartItem,
        attendee: {
          name,
          email,
          phone,
          gender,
          college: college || "Not Provided",
          idDocumentUrl,
        },
        txnId,
        screenshotUrl,
        couponCode: discount > 0 ? couponCode.trim().toUpperCase() : null,
        totalAmount,
        status: "PENDING_VERIFICATION",
        submittedAt: serverTimestamp(),
      });

      toast.success("Order submitted successfully!", {
        id: toastId,
      });

      setIsSubmitting(false);
      onClose();
      if (onSuccess) {
        onSuccess(cartItem.id);
      }
    } catch (error) {
      console.error(error);

      toast.error(error.message || "Something went wrong", { id: toastId });

      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-slate-900 border border-white/15 rounded-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-white/50 hover:text-white text-lg"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-white mb-2">{cartItem.name}</h2>
        <p className="text-xs text-sky-400 mb-6">
          Direct QR Payment & Verification
        </p>

        <div className="mb-6">
          <label className="block text-xs font-medium text-white/60 mb-1">
            Coupon Code
          </label>
          <p>For Discounts, Contact at +91 95885 36927</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setDiscount(0);
              }}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 bg-slate-800 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-sky-500"
            />

            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={isApplyingCoupon || !couponCode.trim()}
              className="px-4 py-2 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-md text-sm font-semibold hover:bg-sky-500/30 disabled:opacity-50"
            >
              {isApplyingCoupon ? "..." : "Apply"}
            </button>
          </div>
        </div>

        {/* Amount */}
        <div className="flex justify-between items-center bg-sky-500/10 border border-sky-500/30 p-4 rounded-xl mb-6">
          <span className="text-xs text-sky-200 uppercase tracking-wider font-semibold">
            Total Payable
          </span>
          <div className="text-right">
            {discount > 0 && (
              <span className="block text-sm text-white/40 line-through">
                ₹{baseAmount}
              </span>
            )}

            <span className="text-2xl font-black text-sky-400">
              ₹{totalAmount}
            </span>
          </div>
        </div>

        {/* QR */}
        <div className="bg-white rounded-xl p-3 w-fit mx-auto mb-3 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          <img
            src="/payment/qr.jpeg"
            alt="UPI QR Code"
            className="w-40 h-40 object-contain"
          />
        </div>

        <p className="text-center text-sm text-white/60 mb-6">
          Scan to pay{" "}
          <span className="font-semibold text-sky-400">₹{totalAmount}</span> via
          UPI
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">
                Gender *
              </label>
              <select
                required
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-sky-500"
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">
              College Name *
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="College Name"
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">
              Aadhaar (JPG/PNG/JPEG ) *
            </label>

            <input
              type="file"
              required
              accept="image/png, image/jpeg, image/jpg"
              onChange={(e) => setIdFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-white/50 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-sky-500/10 file:text-sky-400 file:font-medium hover:file:bg-sky-500/20 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">
              Transaction ID / UTR *
            </label>
            <input
              type="text"
              required
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              placeholder="Enter Transaction ID / UTR number"
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1">
              Payment Screenshot *
            </label>
            <input
              type="file"
              required
              accept="image/png, image/jpeg, image/jpg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-white/50 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-sky-500/10 file:text-sky-400 file:font-medium hover:file:bg-sky-500/20 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 mt-4 rounded-xl font-bold text-black bg-sky-500 hover:bg-sky-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              `Submit QR Payment — ₹${totalAmount}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
