"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthUserContext";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";
import { isPassItem } from "@/lib/pricing_algo";

export default function CheckoutModal({ isOpen, onClose, onSubmit, cart = [] }) {
  const { authUser } = useAuth(); // Needed strictly for the secure upload token

  const hasPass = cart.some(isPassItem);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setEmail("");
      setCollege("");
      setGender("");
      setPhone("");
      setAadhaarFile(null);
    }
  }, [isOpen]);

  const handleFileUpload = async (file) => {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    });

    const formData = new FormData();
    formData.append("file", compressedFile);

    const token = await authUser.getIdToken();
    const res = await fetch("/api/upload-id", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload document");
    const data = await res.json();
    return data.secure_url;
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
      };

      if (onSubmit) {
        onSubmit(payload, finalCart);
      }

      toast.success("Ready for checkout!", { id: toastId });
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again.", { id: toastId });
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
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Email *</label>
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
                <label className="block text-xs font-medium text-white/60 mb-1">Phone Number *</label>
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
                <label className="block text-xs font-medium text-white/60 mb-1">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="text-white w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-md focus:outline-none focus:border-sky-500 text-sm"
                  required
                >
                  <option value="" disabled>Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-medium text-white/60 mb-1">College Name</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="text-white w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-md focus:outline-none focus:border-sky-500 text-sm"
                placeholder="Your Institute (Optional)"
              />
            </div>
            
            <div className="pt-2">
              <label className="block text-xs font-medium text-white/60 mb-1">Government ID (JPG/PNG) *</label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={(e) => setAadhaarFile(e.target.files[0])}
                className="w-full text-xs text-white/50 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-sky-500/10 file:text-sky-400 file:font-medium hover:file:bg-sky-500/20 cursor-pointer"
                required
              />
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