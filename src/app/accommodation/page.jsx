"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthUserContext";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

const PRICE_PER_DAY = 249;
const MAX_FILE_SIZE_MB = 5;
const AVAILABLE_DATES = ["30th Oct", "31st Oct", "1st Nov"];

const compressImageFast = (file, maxWidth = 1600) => {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return reject(new Error(`File ${file.name} exceeds the 5MB limit.`));
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      const ratio = Math.min(maxWidth / img.width, 1);

      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Unable to process image."));

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Unable to compress image."));
          resolve(new File([blob], `${file.name.replace(/\.[^/.]+$/, "")}.jpg`, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.75
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`File ${file.name} is corrupted or unreadable.`));
    };
  });
};

export default function AccommodationPage() {
  const { authUser, loading } = useAuth();
  const router = useRouter();

  const [txnId, setTxnId] = useState("");
  const [paymentFile, setPaymentFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedDates, setSelectedDates] = useState(AVAILABLE_DATES);
  const [numMembers, setNumMembers] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState(0);

  const [members, setMembers] = useState([
    { name: "", email: "", phone: "", gender: "", aadhaarNo: "", aadhaarFile: null },
  ]);

  const totalAmount = numMembers * selectedDates.length * PRICE_PER_DAY;

  useEffect(() => {
    if (!loading && !authUser) {
      toast.error("Please log in to book accommodation");
      router.push("/login");
    }
  }, [authUser, loading, router]);

  const handleNumMembersChange = (increment) => {
    setNumMembers((prev) => {
      const next = Math.max(1, Math.min(10, prev + increment));

      if (activeAccordion >= next) setActiveAccordion(Math.max(0, next - 1));

      setMembers((prevMembers) => {
        if (prevMembers.length < next) {
          return [
            ...prevMembers,
            ...Array.from({ length: next - prevMembers.length }, () => ({
              name: "", email: "", phone: "", gender: "", aadhaarNo: "", aadhaarFile: null,
            })),
          ];
        }
        return prevMembers.slice(0, next);
      });
      return next;
    });
  };

  const handleMemberChange = (index, field, value) => {
    setMembers((prev) =>
      prev.map((member, i) => (i === index ? { ...member, [field]: value } : member))
    );
  };

  const toggleDate = (date) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date].sort()
    );
  };

  const handleFileSelect = (e, callback) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast.error(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
        e.target.value = "";
        callback(null);
      } else {
        callback(file);
      }
    } else {
      callback(null);
    }
  };

  const handleUploadAndSubmit = async (e) => {
    e.preventDefault();

    if (selectedDates.length < 2) return toast.error("Please select at least TWO dates.");
    if (!txnId.trim()) return toast.error("Please enter a valid Transaction ID.");
    if (!paymentFile) return toast.error("Please provide Payment Screenshot.");

    const normalizedMembers = members.map((member) => ({
      ...member,
      name: member.name.trim(),
      email: member.email.trim().toLowerCase(),
      phone: member.phone.trim(),
      aadhaarNo: member.aadhaarNo.trim(),
    }));

    for (let i = 0; i < normalizedMembers.length; i++) {
      const m = normalizedMembers[i];
      if (!m.name || !m.email || !m.phone || !m.gender || !m.aadhaarNo || !m.aadhaarFile) {
        setActiveAccordion(i);
        return toast.error(`Please fill all fields and upload ID for Person ${i + 1}`);
      }
      if (!/^\d{10}$/.test(m.phone)) {
        setActiveAccordion(i);
        return toast.error(`Please enter a valid 10-digit phone number for Person ${i + 1}`);
      }
      if (!/^\d{12}$/.test(m.aadhaarNo)) {
        setActiveAccordion(i);
        return toast.error(`Please enter a valid 12-digit Aadhaar number for Person ${i + 1}`);
      }
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Processing...");

    try {
      const token = await authUser.getIdToken();

      const uploadFile = async (file) => {
        let processedFile = file;
        if (file.size > 500 * 1024) {
          processedFile = await compressImageFast(file);
        }

        const formData = new FormData();
        formData.append("file", processedFile);

        const res = await fetch("/api/upload-id", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data?.secure_url) throw new Error(data?.error || "Upload failed");
        return data.secure_url;
      };

      const finalMembers = [];

      for (let i = 0; i < normalizedMembers.length; i++) {
        toast.loading(`Processing for ${i + 1}/${normalizedMembers.length}...`, { id: toastId });
        const url = await uploadFile(normalizedMembers[i].aadhaarFile);

        finalMembers.push({
          name: normalizedMembers[i].name,
          email: normalizedMembers[i].email,
          phone: normalizedMembers[i].phone,
          gender: normalizedMembers[i].gender,
          aadhaarNo: normalizedMembers[i].aadhaarNo,
          aadhaarUrl: url,
        });
      }

      toast.loading("Uploading Payment Receipt...", { id: toastId });
      const paymentUrl = await uploadFile(paymentFile);

      toast.loading("Finalizing...", { id: toastId });
      const bookingResponse = await fetch("/api/accommodation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          txnId: txnId.trim(),
          selectedDates,
          bookedMembers: finalMembers,
          screenshotId: paymentUrl,
        }),
      });

      if (!bookingResponse.ok) {
        const bookingData = await bookingResponse.json();
        throw new Error(bookingData?.error || "Failed to create accommodation booking.");
      }

      toast.success("Accommodation booked successfully!", { id: toastId });
      router.push("/profile");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          <p className="text-md text-slate-300">Loading Page...</p>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[url('/images/auth-backdrop.png')] bg-cover bg-fixed bg-center flex justify-center p-4 pt-28 pb-12 text-white">
      <div className="bg-slate-900/95 border border-slate-800 rounded-lg w-full max-w-3xl p-6 md:p-8 h-fit">

        <div className="mb-8 border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider">Accommodation Booking</h1>
          <h3 className="text-md text-slate-300 ">For participants registered in flagship events</h3>
          <p className="text-slate-400 text-sm mt-1">Rs. {PRICE_PER_DAY} per person/day (Min 2 Days)</p>
        </div>

        <form onSubmit={handleUploadAndSubmit} className="flex flex-col gap-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Number of People */}
            <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
              <label className="block text-sm font-semibold mb-3">Number of People</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => handleNumMembersChange(-1)} disabled={numMembers <= 1 || isSubmitting} className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50">-</button>
                <span className="w-8 text-center font-bold text-lg">{numMembers}</span>
                <button type="button" onClick={() => handleNumMembersChange(1)} disabled={numMembers >= 10 || isSubmitting} className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50">+</button>
              </div>
            </div>

            {/* Select Dates */}
            <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
              <label className="block text-sm font-semibold mb-3">Select Dates (Min 2 consecutive days)</label>
              <div className="flex gap-2">
                {AVAILABLE_DATES.map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => toggleDate(date)}
                    disabled={isSubmitting}
                    className={`flex-1 py-2 rounded text-xs font-bold border disabled:opacity-50 ${selectedDates.includes(date)
                        ? "bg-sky-600 border-sky-500 text-white"
                        : "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                      }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="flex flex-col gap-3">
            {members.map((member, idx) => {
              const isActive = activeAccordion === idx;
              const isFilled = member.name && member.aadhaarNo && member.aadhaarFile;

              return (
                <div key={idx} className="bg-slate-800/50 rounded border border-slate-700 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setActiveAccordion(isActive ? -1 : idx)}
                    className="w-full p-4 flex justify-between items-center bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-xs font-bold text-slate-300 border border-slate-700">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-sm text-slate-200">
                        Person Details {member.name && <span className="font-normal text-slate-400">- {member.name}</span>}
                      </span>
                    </div>
                    {isFilled && !isActive ? (
                      <CheckCircle2 size={18} className="text-green-500" />
                    ) : isActive ? (
                      <ChevronUp size={18} className="text-slate-400" />
                    ) : (
                      <ChevronDown size={18} className="text-slate-400" />
                    )}
                  </button>

                  {isActive && (
                    <div className="p-4 border-t border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
                        <input type="text" required disabled={isSubmitting} value={member.name} onChange={(e) => handleMemberChange(idx, "name", e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm outline-none focus:border-sky-500 disabled:opacity-50" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Email *</label>
                        <input type="email" required disabled={isSubmitting} value={member.email} onChange={(e) => handleMemberChange(idx, "email", e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm outline-none focus:border-sky-500 disabled:opacity-50" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Phone Number *</label>
                        <input type="tel" required maxLength={10} disabled={isSubmitting} value={member.phone} onChange={(e) => handleMemberChange(idx, "phone", e.target.value.replace(/\D/g, ''))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm outline-none focus:border-sky-500 disabled:opacity-50" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Gender *</label>
                        <select required disabled={isSubmitting} value={member.gender} onChange={(e) => handleMemberChange(idx, "gender", e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm outline-none focus:border-sky-500 disabled:opacity-50">
                          <option value="" disabled>Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">ID Number *</label>
                        <input type="text" required maxLength={12} disabled={isSubmitting} value={member.aadhaarNo} onChange={(e) => handleMemberChange(idx, "aadhaarNo", e.target.value.replace(/\D/g, ''))} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm outline-none focus:border-sky-500 disabled:opacity-50" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">ID Document (JPG/PNG, Max 5MB) *</label>
                        <input type="file" required disabled={isSubmitting} accept="image/png, image/jpeg, image/jpg" onChange={(e) => handleFileSelect(e, (file) => handleMemberChange(idx, "aadhaarFile", file))} className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-700 file:text-white cursor-pointer disabled:opacity-50" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Payment Section */}
          <div className="mt-4 pt-6 border-t border-slate-800">
            <div className="flex justify-between items-center bg-slate-800 p-4 rounded mb-6 border border-slate-700">
              <span className="text-sm font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-sky-400">Rs. {totalAmount}</span>
            </div>

            <div className="w-48 h-48 mx-auto bg-white p-2 rounded mb-6">
              <img src="/payment/qr2.jpeg" alt="UPI QR Code" className="w-full h-full object-contain" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs text-slate-400 mb-1">UPI Transaction ID / UTR *</label>
                <input type="text" required disabled={isSubmitting} value={txnId} onChange={(e) => setTxnId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm outline-none focus:border-sky-500 disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Payment Screenshot (Max 5MB) *</label>
                <input type="file" required disabled={isSubmitting} accept="image/png, image/jpeg, image/jpg" onChange={(e) => handleFileSelect(e, setPaymentFile)} className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-700 file:text-white cursor-pointer disabled:opacity-50" />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded font-bold uppercase tracking-wide bg-sky-600 hover:bg-sky-500 text-white disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed">
              {isSubmitting ? "Processing..." : "Submit Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
