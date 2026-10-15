"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthUserContext";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import styles from "@/app/register/Register.module.css";

const PRICE_PER_DAY = 249;
const MAX_FILE_SIZE_MB = 5;
const AVAILABLE_DATES = ["30th Oct", "31st Oct", "1st Nov"];

const compressImageFast = (file, maxWidth = 1600) => {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return reject(new Error(`File ${file.name} exceeds the ${MAX_FILE_SIZE_MB}MB limit.`));
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

  const [selectedDates, setSelectedDates] = useState([]);
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

  const inputClass = "p-2.5 border-2 border-white/80 rounded-lg text-white bg-transparent w-full focus:outline-none focus:ring-0 focus:border-teal-600 placeholder:text-white/40 transition-colors disabled:opacity-50";

  if (loading || !authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className={`px-4 pt-28 pb-16 md:px-10 md:pt-32 md:pb-20 bg-muted ${styles.background} text-white min-h-svh flex flex-col items-center justify-start overflow-x-hidden`}>
      <motion.div
        initial={{ opacity: 0, x: -140 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl mb-8 text-center md:text-left overflow-hidden"
      >
        <h1 className="font-bold text-2xl min-[400px]:text-3xl sm:text-4xl md:text-5xl text-grad race py-2 uppercase tracking-wide break-words">
          Accommodation Booking
        </h1>
        <p className="text-white/70 text-sm sm:text-base md:text-lg px-2 tracking-wide mt-1">
          For participants registered in flagship events (₹{PRICE_PER_DAY} / day)
        </p>
      </motion.div>

      <motion.main
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl mb-12 flex flex-col gap-8"
      >
        <form onSubmit={handleUploadAndSubmit} className="flex flex-col gap-6 md:gap-8 w-full">
          
          {/* ─── SECTION 1: BOOKING DETAILS ──────────────────────────── */}
          <div className="w-full flex flex-col gap-6 p-6 md:p-8 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl">
            <h2 className="m-0 text-lg md:text-xl font-bold text-white uppercase tracking-wider border-b border-white/20 pb-3 state-wide">
              1. Booking Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
                <label className="text-white">Number of People *</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleNumMembersChange(-1)}
                    disabled={numMembers <= 1 || isSubmitting}
                    className="w-11 h-11 flex items-center justify-center bg-white/[0.05] border-2 border-white/40 hover:bg-teal-600/20 hover:border-teal-500 rounded-lg text-xl font-bold disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-xl">{numMembers}</span>
                  <button
                    type="button"
                    onClick={() => handleNumMembersChange(1)}
                    disabled={numMembers >= 10 || isSubmitting}
                    className="w-11 h-11 flex items-center justify-center bg-white/[0.05] border-2 border-white/40 hover:bg-teal-600/20 hover:border-teal-500 rounded-lg text-xl font-bold disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
                <label className="text-white">Select Dates (Min 2 Days) *</label>
                <div className="flex flex-wrap gap-3">
                  {AVAILABLE_DATES.map((date) => {
                    const isSelected = selectedDates.includes(date);
                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => toggleDate(date)}
                        disabled={isSubmitting}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] md:text-[16px] font-bold border-2 transition-all duration-300 disabled:opacity-50 cursor-pointer ${
                          isSelected
                            ? "bg-teal-500 border-teal-500 text-black shadow-[0_0_15px_rgba(20,184,166,0.4)]"
                            : "bg-white/[0.02] border-white/40 text-white/70 hover:border-teal-500 hover:text-white hover:bg-teal-600/10"
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={18} className="text-black" />}
                        {date}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ─── SECTION 2: MEMBER DETAILS ──────────────────────────── */}
          <div className="w-full flex flex-col gap-6 p-6 md:p-8 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl">
            <h2 className="m-0 text-lg md:text-xl font-bold text-white uppercase tracking-wider border-b border-white/20 pb-3 state-wide">
              2. Member Details
            </h2>

            <div className="flex flex-col gap-4">
              {members.map((member, idx) => {
                const isActive = activeAccordion === idx;
                const isFilled = member.name && member.aadhaarNo && member.aadhaarFile;

                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/20 flex flex-col overflow-hidden bg-white/[0.05] transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveAccordion(isActive ? -1 : idx)}
                      className={`w-full p-4 md:p-5 text-left border-none cursor-pointer flex justify-between items-center transition-colors ${
                        isActive
                          ? "bg-teal-600/20 border-b border-white/20"
                          : "bg-transparent hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-600/20 text-[14px] font-bold text-teal-400 border border-teal-500/50">
                          {idx + 1}
                        </span>
                        <h3 className={`m-0 text-[16px] md:text-[18px] font-semibold ${isActive ? "text-teal-400" : "text-white/90"}`}>
                          Member Details {member.name && <span className="font-normal text-white/50">- {member.name}</span>}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {isFilled && !isActive ? (
                          <CheckCircle2 size={20} className="text-teal-400" />
                        ) : isActive ? (
                          <ChevronUp size={20} className="text-teal-400" />
                        ) : (
                          <ChevronDown size={20} className="text-white/60" />
                        )}
                      </div>
                    </button>

                    <div className={`p-4 md:p-5 grid-cols-1 md:grid-cols-2 gap-6 bg-transparent ${isActive ? "grid" : "hidden"}`}>
                      <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
                        <label className="text-white">Full Name *</label>
                        <input type="text" required disabled={isSubmitting} value={member.name} onChange={(e) => handleMemberChange(idx, "name", e.target.value)} placeholder="Full Name" className={inputClass} />
                      </div>

                      <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
                        <label className="text-white">Email Address *</label>
                        <input type="email" required disabled={isSubmitting} value={member.email} onChange={(e) => handleMemberChange(idx, "email", e.target.value)} placeholder="xyz@college.ac.in" className={inputClass} />
                      </div>

                      <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
                        <label className="text-white">Phone Number *</label>
                        <input type="tel" required maxLength={10} disabled={isSubmitting} value={member.phone} onChange={(e) => handleMemberChange(idx, "phone", e.target.value.replace(/\D/g, ''))} placeholder="9876543210" className={inputClass} />
                      </div>

                      <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
                        <label className="text-white">Gender *</label>
                        <select required disabled={isSubmitting} value={member.gender} onChange={(e) => handleMemberChange(idx, "gender", e.target.value)} className={`${inputClass} cursor-pointer`}>
                          <option value="" disabled className="bg-neutral-900 text-white">Select Gender</option>
                          <option value="Male" className="bg-neutral-900 text-white">Male</option>
                          <option value="Female" className="bg-neutral-900 text-white">Female</option>
                          <option value="Other" className="bg-neutral-900 text-white">Other</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
                        <label className="text-white">Aadhaar Number *</label>
                        <input type="text" required maxLength={12} disabled={isSubmitting} value={member.aadhaarNo} onChange={(e) => handleMemberChange(idx, "aadhaarNo", e.target.value.replace(/\D/g, ''))} placeholder="12-Digit Aadhaar" className={inputClass} />
                      </div>

                      <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
                        <label className="text-white">Aadhaar Document *</label>
                        <label className="border-2 border-dashed border-white/40 hover:border-teal-500 hover:bg-teal-600/10 rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col justify-center items-center h-full bg-white/[0.02]">
                           <input type="file" required disabled={isSubmitting} accept="image/png, image/jpeg, image/jpg" onChange={(e) => handleFileSelect(e, (file) => handleMemberChange(idx, "aadhaarFile", file))} className="block w-full max-w-[200px] text-[12px] text-white/70 mx-auto
                            file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0
                            file:text-[12px] file:font-semibold file:bg-teal-600/20 file:text-teal-400
                            hover:file:bg-teal-600/30 file:cursor-pointer cursor-pointer transition-colors" />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── SECTION 3: CHECKOUT SUMMARY ──────────────────────────── */}
          <div className="border border-teal-500/30 p-6 md:p-8 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col gap-6">
            <h3 className="m-0 text-lg md:text-xl font-bold text-white uppercase tracking-wider border-b border-white/20 pb-3 state-wide">
              3. Payment & Summary
            </h3>

            <div className="flex flex-col md:flex-row gap-8">
              {/* QR Code Side */}
              <div className="flex-1 flex flex-col items-center justify-center text-center md:border-r border-white/20 md:pr-8">
                <h3 className="text-[16px] md:text-[18px] font-bold mb-4 text-white uppercase tracking-wider state-wide">
                  Scan to Pay
                </h3>
                <div className="bg-white p-3 rounded-2xl shadow-[0_0_20px_rgba(146,235,255,0.25)] mb-4 inline-block">
                  <img src="/payment/qr2.jpeg" alt="UPI QR Code" className="w-[180px] h-[180px] object-cover rounded-xl" />
                </div>
              </div>

              <div className="flex-[1.2] flex flex-col justify-center gap-6">
                <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
                  <label className="text-white">Transaction ID / UTR *</label>
                  <input type="text" required disabled={isSubmitting} value={txnId} onChange={(e) => setTxnId(e.target.value)} placeholder="Enter Transaction ID" className={inputClass} />
                </div>

                <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
                  <label className="text-white">Payment Screenshot *</label>
                  <label className="border-2 border-dashed border-white/40 hover:border-teal-500 hover:bg-teal-600/10 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center gap-2 bg-white/[0.02]">
                    <span className="text-[14px] md:text-[16px] text-white/90 font-medium mb-1">
                      Click to Upload Receipt
                    </span>
                    <input type="file" required disabled={isSubmitting} accept="image/png, image/jpeg, image/jpg" onChange={(e) => handleFileSelect(e, setPaymentFile)} className="block w-full max-w-xs text-[14px] text-white/70 mx-auto
                      file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                      file:text-[14px] file:font-semibold file:bg-teal-600/20 file:text-teal-400
                      hover:file:bg-teal-600/30 file:cursor-pointer cursor-pointer transition-colors" />
                  </label>
                </div>
              </div>
            </div>

            <hr className="border-t border-dashed border-white/20 m-0 my-2" />

            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-lg md:text-xl font-bold text-white uppercase tracking-wide state-wide">
                  Final Total
                </span>
                <span className="text-[14px] md:text-[16px] text-white/60">
                  (₹{PRICE_PER_DAY} × {numMembers} person × {selectedDates.length} days)
                </span>
              </div>
              <span className="text-2xl md:text-3xl font-black text-[#92EBFF] drop-shadow-[0_0_12px_rgba(146,235,255,0.4)]">
                ₹ {totalAmount}
              </span>
            </div>

            <div className="flex justify-center mt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${styles.btn} flex items-center justify-center gap-3 text-[16px] md:text-[18px] w-full md:w-auto px-10 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  "Processing Booking..."
                ) : (
                  <>
                    Confirm Booking (₹{totalAmount})
                    <ArrowRight size={22} className="inline ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </motion.main>
    </div>
  );
}