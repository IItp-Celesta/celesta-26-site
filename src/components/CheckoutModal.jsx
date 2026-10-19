"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthUserContext";
import { uploadImage } from "@/lib/uploadImage";
import toast from "react-hot-toast";
import { isPassItem } from "@/lib/pricing_algo";

export default function CheckoutModal({
  isOpen,
  onClose,
  onSubmit,
  cart = [],
  totalPrice = 0,
}) {
  const { authUser } = useAuth(); // Needed strictly for the secure upload token

  const hasPass = cart.some(isPassItem);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponPrice, setCouponPrice] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const payable = couponPrice !== null ? couponPrice : totalPrice;

  useEffect(() => {
    if (isOpen) {
      setName("");
      setEmail("");
      setCollege("");
      setGender("");
      setPhone("");
      setAadhaarFile(null);
      setCouponCode("");
      setCouponPrice(null);
      setIsUploading(false);
    }
  }, [isOpen]);

  const handleFileUpload = async (file) => {
    return uploadImage(file, authUser);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Please enter a coupon code.");
    setIsApplyingCoupon(true);
    try {
      const res = await fetch("/api/combo/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), amount: totalPrice }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponPrice(null);
        return toast.error(data.message || "Invalid coupon code.");
      }
      setCouponPrice(data.couponPrice);
      toast.success(`Coupon applied! New price: ₹${data.couponPrice}`);
    } catch {
      setCouponPrice(null);
      toast.error("Failed to validate coupon.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!aadhaarFile || !gender || !name || !email) {
      toast.error("Please fill all required fields and attach your ID.");
      return;
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (aadhaarFile && !allowedTypes.includes(aadhaarFile.type)) {
      toast.error("Only PNG, JPG, or JPEG images are allowed.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Processing...");

    try {
      const aadhaarUrl = await handleFileUpload(aadhaarFile);

      const finalCart = cart.map((item) => {
        if (isPassItem(item)) {
          return {
            ...item,
            type: "pass",
            quantity: 1,
            teamDetails: {
              teamName: name,
              college: college || "Not Provided",
              numMembers: 1,
              members: [
                {
                  name,
                  email,
                  phone,
                  gender,
                  aadhaar: aadhaarUrl,
                },
              ],
            },
          };
        }
        return item;
      });

      const payload = {
        name,
        email,
        gender,
        college: college || "Not Provided",
        phone,
        aadhaar: aadhaarUrl,
        ...(couponPrice !== null && {
          couponCode: couponCode.trim().toUpperCase(),
        }),
      };

      if (onSubmit) {
        onSubmit(payload, finalCart);
      }

      toast.success("Ready for checkout!", { id: toastId });
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed. Please try again.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0 bg-slate-900 z-10">
          <div>
            <h2 className="text-xl font-bold text-white">
              {hasPass ? "Attendee Details" : "Buyer Details"}
            </h2>
            <p className="text-xs text-sky-400 mt-1">
              {hasPass
                ? "Please provide details for the ticket holder."
                : "Please provide your details to complete the order."}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="text-white/50 hover:text-white text-2xl font-bold transition-colors disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-white w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-md focus:outline-none focus:border-sky-500 transition-colors text-sm"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">
                  Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="text-white w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-md focus:outline-none focus:border-sky-500 text-sm"
                  required
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

            <div className="pt-2">
              <label className="block text-xs font-medium text-white/60 mb-1">
                College Name *
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="text-white w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-md focus:outline-none focus:border-sky-500 text-sm"
                placeholder="Your Institute"
                required
              />
            </div>

            <div className="pt-2">
              <label className="block text-xs font-medium text-white/60 mb-1">
                Aadhaar (JPG/PNG) *
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={(e) => setAadhaarFile(e.target.files[0])}
                className="w-full text-xs text-white/50 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-sky-500/10 file:text-sky-400 file:font-medium hover:file:bg-sky-500/20 cursor-pointer"
                required
              />
            </div>
            <div className="pt-2">
              <label className="block text-xs font-medium text-white/60 mb-1">
                Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponPrice(null);
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
              <div className="flex justify-between items-center mt-3 text-sm">
                <span className="text-white/60">Total Payable</span>
                <span>
                  {couponPrice !== null && (
                    <span className="line-through text-white/40 mr-2">
                      ₹{totalPrice}
                    </span>
                  )}
                  <span className="font-bold text-sky-400">₹{payable}</span>
                </span>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-white/10 bg-slate-900 shrink-0 flex justify-end gap-3 z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-5 py-2.5 text-sm font-medium text-white/70 bg-white/5 rounded-lg hover:bg-white/10 focus:outline-none transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="checkout-form"
            disabled={isUploading}
            className="px-5 py-2.5 text-sm font-bold text-black bg-sky-500 rounded-lg hover:bg-sky-400 focus:outline-none transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-sky-500/20"
          >
            {isUploading ? (
              <>
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                Processing...
              </>
            ) : (
              "Confirm & Proceed"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
