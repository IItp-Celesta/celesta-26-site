"use client";

import { useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";

// Added default empty objects {} to formData and feeSummary to prevent crashes if data takes a second to load
export default function PaymentSimulator({
  finalAmount,
  onPaymentSuccess,
  formData = {},
  feeSummary = {},
}) {
  const [upiId, setUpiId] = useState("");
  const [screenshotBase64, setScreenshotBase64] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ upi: "", screenshot: "" });

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        screenshot: "Only images are allowed.",
      }));
      return;
    }

    setErrors({ upi: "", screenshot: "" });

    const options = {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const base64String = await fileToBase64(compressedFile);
      setScreenshotBase64(base64String);
      setPreview(base64String);
    } catch (error) {
      console.error("Error compressing image:", error);
      setErrors((prev) => ({
        ...prev,
        screenshot: "Error processing image. Try again.",
      }));
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors = { upi: "", screenshot: "" };

    if (!upiId.trim()) {
      newErrors.upi = "Please enter your UPI ID.";
      valid = false;
    }
    if (!screenshotBase64) {
      newErrors.screenshot = "Please upload payment screenshot.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const payload = {
        id: crypto.randomUUID(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        cityState: formData.cityState,     
        rollNumber: formData.rollNumber,   
        isIITP: formData.isIITP,
        workshop: formData.workshop,
        requireAccommodation: formData.requireAccommodation,
        amountPaid: feeSummary?.finalAmount || finalAmount,
        upiId: upiId,
        screenshot: screenshotBase64,
        registrationTime: new Date().toISOString(),
      };

      const response = await fetch("/api/register-workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        onPaymentSuccess(result.registrationId || payload.id);
      } else {
        alert(result.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment Submission Error:", error);
      alert("A server error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-widest mb-2">
          Manual Verification
        </h2>
        <p className="text-gray-400 text-sm">
          Please complete your payment to secure your spot.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* LEFT: QR Code Card */}
        <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col items-center justify-center text-center shadow-xl">
          <h3 className="text-lg font-semibold mb-6 text-white uppercase tracking-wider">
            Scan & Pay
          </h3>

          <div className="bg-white p-3 rounded-2xl shadow-[0_0_20px_rgba(14,165,233,0.3)] mb-6 transition-transform hover:scale-105 duration-300 flex items-center justify-center overflow-hidden">
            <Image
              src="/payment/qr.jpeg"
              alt="QR Code"
              width={240}
              height={240}
              className="rounded-xl object-cover"
            />
          </div>

          <p className="text-gray-400 mb-4 text-sm font-medium">
            Scan using any UPI App
          </p>

          <div className="bg-black/40 rounded-xl p-4 w-full border border-white/5">
            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">
              Official UPI ID
            </span>
            <strong className="text-lg font-mono text-cyan-400 tracking-wider block">
              celesta@oksbi
            </strong>
            <small className="text-xs text-emerald-400 mt-2 flex items-center justify-center gap-1 font-medium">
              <span>✔</span> Verified Merchant
            </small>
          </div>
        </div>

        {/* RIGHT: Payment Details Form */}
        <div className="flex-[1.5] bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col gap-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-3 uppercase tracking-wider">
            Payment Details
          </h3>

          <div className="flex justify-between items-center bg-cyan-900/20 p-4 rounded-xl border border-cyan-500/30 shadow-inner">
            <div>
              <h4 className="font-semibold text-white">
                Workshop Registration
              </h4>
              <p className="text-sm text-cyan-200/70">Total Payable Amount</p>
            </div>
            <strong className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
              ₹{finalAmount}
            </strong>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300 font-medium">
              Your UPI ID (used for payment)
            </label>
            <input
              type="text"
              placeholder="e.g., yourname@oksbi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className={`w-full bg-black/40 border ${
                errors.upi
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-white/10 focus:border-cyan-400"
              } rounded-xl p-3.5 text-white placeholder-gray-600 outline-none transition-all`}
            />
            {errors.upi && (
              <p className="text-red-400 text-xs mt-1">{errors.upi}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-300 font-medium">
              Upload Payment Screenshot
            </label>
            <label
              className={`border-2 border-dashed ${
                errors.screenshot
                  ? "border-red-500/50"
                  : "border-white/20 hover:border-cyan-400 hover:bg-cyan-900/10"
              } rounded-xl p-6 text-center cursor-pointer transition-all group flex flex-col items-center justify-center gap-3`}
            >
              <div className="text-3xl group-hover:-translate-y-1 transition-transform duration-300">
                {screenshotBase64 ? "✅" : "📤"}
              </div>
              <div className="font-medium text-gray-200">
                {screenshotBase64
                  ? "Screenshot Attached"
                  : "Click to browse or drag & drop"}
              </div>
              <div className="text-xs text-gray-500">
                {screenshotBase64
                  ? "Image compressed & ready"
                  : "JPG or PNG formats only"}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                hidden
              />
            </label>
            {errors.screenshot && (
              <p className="text-red-400 text-xs mt-1">{errors.screenshot}</p>
            )}
          </div>

          {preview && (
            <div className="bg-black/30 p-3 rounded-xl border border-white/5 animate-in fade-in">
              <h4 className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                Preview
              </h4>
              <img
                src={preview}
                alt="Screenshot Preview"
                className="w-full max-h-40 object-contain rounded-lg"
              />
            </div>
          )}

          <button
            disabled={loading}
            onClick={handleSubmit}
            className={`mt-2 w-full py-4 rounded-xl font-bold uppercase tracking-widest text-white transition-all duration-300 flex items-center justify-center gap-3 ${
              loading
                ? "bg-gray-800 border border-white/10 cursor-not-allowed text-gray-400"
                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-[0_10px_25px_-5px_rgba(14,165,233,0.4)] hover:-translate-y-1"
            }`}
          >
            {loading ? "Processing..." : "Submit For Verification"}
          </button>
        </div>
      </div>
    </div>
  );
}
