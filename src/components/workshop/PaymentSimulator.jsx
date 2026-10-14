"use client";
import { useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { CheckCircle2, Upload, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthUserContext";
import styles from "../../app/register/Register.module.css";

export default function PaymentSimulator({
  onPaymentSuccess,
  formData = {},
  feeSummary = {},
  onBack,
}) {
  const { authUser } = useAuth();
  const isExternal = formData.isIITP === "no";
  const requireAccommodation = formData.requireAccommodation === "yes";
  const showAccomPayment =
    requireAccommodation && feeSummary.accommodationFee > 0;

  const [step, setStep] = useState(1);

  const [upiId, setUpiId] = useState("");
  const [regTxnId, setRegTxnId] = useState("");
  const [accomTxnId, setAccomTxnId] = useState("");

  const [regFile, setRegFile] = useState(null);
  const [accomFile, setAccomFile] = useState(null);
  const [aadhaarFile, setAadhaarFile] = useState(null);

  const [previews, setPreviews] = useState({ reg: "", accom: "", aadhaar: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleFileChange = async (e, type) => {
    let file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, [type]: "Only images are allowed." }));
      return;
    }
    setErrors((prev) => ({ ...prev, [type]: "" }));

    const options = {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      const objectUrl = URL.createObjectURL(compressedFile);

      if (type === "reg") {
        setRegFile(compressedFile);
        setPreviews((prev) => ({ ...prev, reg: objectUrl }));
      } else if (type === "accom") {
        setAccomFile(compressedFile);
        setPreviews((prev) => ({ ...prev, accom: objectUrl }));
      } else {
        setAadhaarFile(compressedFile);
        setPreviews((prev) => ({ ...prev, aadhaar: objectUrl }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [type]: "Error processing image. Try again.",
      }));
    }
  };

  const handleNext = () => {
    setErrors({});

    // Validate Step 1: Registration
    if (step === 1) {
      let valid = true;
      const newErrors = {};
      if (!upiId.trim()) {
        newErrors.upi = "Required";
        valid = false;
      }
      if (!regTxnId.trim()) {
        newErrors.regTxn = "Required";
        valid = false;
      }
      if (!regFile) {
        newErrors.regFile = "Required";
        valid = false;
      }

      if (!valid) {
        setErrors(newErrors);
        return;
      }

      if (showAccomPayment) setStep(2);
      else if (isExternal) setStep(3);
      else handleSubmit();
    }
    // Validate Step 2: Accommodation
    else if (step === 2) {
      let valid = true;
      const newErrors = {};
      if (!accomTxnId.trim()) {
        newErrors.accomTxn = "Required";
        valid = false;
      }
      if (!accomFile) {
        newErrors.accomFile = "Required";
        valid = false;
      }

      if (!valid) {
        setErrors(newErrors);
        return;
      }

      if (isExternal) setStep(3);
      else handleSubmit();
    }
    // Validate Step 3: Identity Verification
    else if (step === 3) {
      if (!aadhaarFile) {
        setErrors({ aadhaar: "Aadhaar is mandatory for externals." });
        return;
      }
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    setErrors({});
    if (step === 3) {
      if (showAccomPayment) setStep(2);
      else setStep(1);
    } else if (step === 2) {
      setStep(1);
    } else {
      onBack();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = await authUser.getIdToken();
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null)
          submitData.append(key, value);
      });

      if (formData.couponCode) {
        submitData.append("couponCode", formData.couponCode);
      }
      submitData.append("id", crypto.randomUUID());
      submitData.append("workshopFee", feeSummary.workshopFee);
      submitData.append("accommodationFee", feeSummary.accommodationFee);
      submitData.append("totalAmount", feeSummary.totalAmount);

      submitData.append("upiId", upiId);
      submitData.append("workshopTxnId", regTxnId);

      if (showAccomPayment) {
        submitData.append("accomTxnId", accomTxnId);
        if (accomFile) submitData.append("accommodationScreenshot", accomFile);
      }

      submitData.append("registrationTime", new Date().toISOString());

      if (regFile) submitData.append("workshopScreenshot", regFile);
      if (aadhaarFile) submitData.append("aadhaarScreenshot", aadhaarFile);

      const response = await fetch("/api/register-workshop", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });

      const result = await response.json();
      if (result.success) onPaymentSuccess(result.registrationId);
      else alert(result.message || "Registration failed.");
    } catch (error) {
      alert("A server error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "p-2.5 border-2 border-white/80 rounded-lg text-white bg-transparent w-full focus:outline-none focus:ring-0 focus:border-teal-600 placeholder:text-white/40 transition-colors";

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8">
      <div className="flex justify-between items-center w-full">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border-2 border-teal-600 rounded-lg text-white hover:bg-teal-600/20 font-medium text-[16px] md:text-[18px] disabled:opacity-50 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} /> {step === 1 ? "Edit Details" : "Back"}
        </button>
        <div className="text-sm md:text-base text-white/80 uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full border border-white/20 state-wide">
          {step === 1 && "1. Registration"}
          {step === 2 && "2. Accommodation"}
          {step === 3 && "3. Identity Verification"}
        </div>
      </div>

      {/* Grand Total Reminder*/}
      <div className="backdrop-blur-md border border-teal-500/30 shadow-2xl rounded-2xl p-5 md:p-6 flex justify-between items-center">
        <div className="text-left">
          <h2 className="text-white text-[16px] md:text-[18px] font-bold uppercase tracking-wider state-wide mb-1">
            Grand Total Due
          </h2>
          <p className="text-xs text-teal-300">Multiple scans required</p>
        </div>
        <div className="text-3xl md:text-4xl font-extrabold text-[#92EBFF] drop-shadow-[0_0_15px_rgba(146,235,255,0.3)]">
          ₹ {feeSummary.totalAmount}
        </div>
      </div>

      {/* --- STEP 1: REGISTRATION --- */}
      {step === 1 && (
        <div className="backdrop-blur-md rounded-2xl p-6 md:p-8 border border-teal-500/30 shadow-2xl flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex flex-col items-center justify-center text-center md:border-r border-b md:border-b-0 border-white/20 pb-6 md:pb-0 md:pr-8">
            <h3 className="text-lg md:text-xl font-bold mb-2 text-white uppercase tracking-wider state-wide">
              Registration Payment
            </h3>
            <div className="text-3xl md:text-4xl font-bold text-[#92EBFF] mb-6">
              ₹ {feeSummary.workshopFee}
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-[0_0_20px_rgba(146,235,255,0.25)] mb-2 inline-block">
              <Image
                src="/payment/qr1.png"
                alt="Registration QR"
                width={220}
                height={220}
                className="rounded-xl object-cover"
              />
            </div>
          </div>

          <div className="flex-[1.2] flex flex-col justify-center gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
                <label className="text-white">Your UPI ID *</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@bank"
                  className={inputClass}
                />
                {errors.upi && (
                  <p className="text-red-400 text-xs">{errors.upi}</p>
                )}
              </div>

              <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
                <label className="text-white">Txn ID / UTR *</label>
                <input
                  type="text"
                  value={regTxnId}
                  onChange={(e) => setRegTxnId(e.target.value)}
                  placeholder="Enter Transaction ID"
                  className={inputClass}
                />
                {errors.regTxn && (
                  <p className="text-red-400 text-xs">{errors.regTxn}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
              <label className="text-white">Payment Screenshot *</label>
              <label className="border-2 border-dashed border-white/40 hover:border-teal-500 hover:bg-teal-600/10 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center gap-2 bg-white/[0.02]">
                {regFile ? (
                  <CheckCircle2 size={28} className="text-teal-400" />
                ) : (
                  <Upload size={28} className="text-[#92EBFF]" />
                )}
                <span className="text-[16px] md:text-[18px] text-white/90">
                  {regFile ? "Screenshot Attached" : "Upload Receipt"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "reg")}
                  hidden
                />
              </label>
              {errors.regFile && (
                <p className="text-red-400 text-xs">{errors.regFile}</p>
              )}
              {previews.reg && (
                <img
                  src={previews.reg}
                  alt="Preview"
                  className="h-24 mt-2 rounded-lg object-contain border border-white/20 self-start"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- STEP 2: ACCOMMODATION --- */}
      {step === 2 && (
        <div className="backdrop-blur-md rounded-2xl p-6 md:p-8 border border-teal-500/30 shadow-2xl flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex flex-col items-center justify-center text-center md:border-r border-b md:border-b-0 border-white/20 pb-6 md:pb-0 md:pr-8">
            <h3 className="text-lg md:text-xl font-bold mb-2 text-white uppercase tracking-wider state-wide">
              Accommodation Payment
            </h3>
            <div className="text-3xl md:text-4xl font-bold text-[#E3F9B3] mb-6">
              ₹ {feeSummary.accommodationFee}
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-[0_0_20px_rgba(227,249,179,0.25)] mb-4 inline-block">
              <Image
                src="/payment/qr2.jpeg"
                alt="Accommodation QR"
                width={220}
                height={220}
                className="rounded-xl object-cover"
              />
            </div>
            <p className="text-xs text-[#E3F9B3] uppercase tracking-widest">
              Separate Scan Required
            </p>
          </div>

          <div className="flex-[1.2] flex flex-col justify-center gap-6">
            <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
              <label className="text-white">Transaction ID / UTR *</label>
              <input
                type="text"
                value={accomTxnId}
                onChange={(e) => setAccomTxnId(e.target.value)}
                placeholder="Enter Transaction ID"
                className={inputClass}
              />
              {errors.accomTxn && (
                <p className="text-red-400 text-xs">{errors.accomTxn}</p>
              )}
            </div>

            <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
              <label className="text-white">Payment Screenshot *</label>
              <label className="border-2 border-dashed border-white/40 hover:border-teal-500 hover:bg-teal-600/10 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center gap-2 bg-white/[0.02]">
                {accomFile ? (
                  <CheckCircle2 size={28} className="text-teal-400" />
                ) : (
                  <Upload size={28} className="text-[#E3F9B3]" />
                )}
                <span className="text-[16px] md:text-[18px] text-white/90">
                  {accomFile ? "Screenshot Attached" : "Upload Receipt"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "accom")}
                  hidden
                />
              </label>
              {errors.accomFile && (
                <p className="text-red-400 text-xs">{errors.accomFile}</p>
              )}
              {previews.accom && (
                <img
                  src={previews.accom}
                  alt="Preview"
                  className="h-24 mt-2 rounded-lg object-contain border border-white/20 self-start"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- STEP 3: IDENTITY VERIFICATION --- */}
      {step === 3 && (
        <div className="backdrop-blur-md rounded-2xl p-6 md:p-8 border border-teal-500/30 shadow-2xl">
          <div className="text-center mb-8">
            <h3 className="text-lg md:text-xl font-bold mb-2 text-white uppercase tracking-wider state-wide">
              Identity Verification
            </h3>
            <p className="text-[14px] md:text-[16px] text-white/70">
              Required for non-IITP participants.
            </p>
          </div>

          <div className="max-w-2xl mx-auto flex flex-col gap-3">
            <label className="text-[16px] md:text-[18px] text-white font-medium text-center">
              Upload Aadhaar Card Screenshot/Photo *
            </label>
            <label className="border-2 border-dashed border-white/40 hover:border-teal-500 hover:bg-teal-600/10 rounded-xl p-10 md:p-14 text-center cursor-pointer transition-all flex flex-col items-center gap-4 bg-white/[0.02]">
              {aadhaarFile ? (
                <CheckCircle2 size={48} className="text-teal-400" />
              ) : (
                <Upload size={48} className="text-[#FB7AC3]" />
              )}
              <span className="font-medium text-white text-[16px] md:text-[18px]">
                {aadhaarFile ? "Aadhaar Attached" : "Tap to Upload Image"}
              </span>
              <p className="text-xs text-white/50">
                Max size 400KB. JPG/PNG only.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "aadhaar")}
                hidden
              />
            </label>
            {errors.aadhaar && (
              <p className="text-red-400 text-xs mt-2 text-center">
                {errors.aadhaar}
              </p>
            )}
            {previews.aadhaar && (
              <img
                src={previews.aadhaar}
                alt="Preview"
                className="h-32 md:h-48 mx-auto mt-4 rounded-lg object-contain border border-white/20 shadow-lg"
              />
            )}
          </div>
        </div>
      )}

      <div className="flex justify-center mt-2">
        <button
          type="button"
          disabled={loading}
          onClick={handleNext}
          className={`${styles.btn} ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          } flex items-center justify-center gap-3 text-[16px] md:text-[18px]`}
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              {(step === 1 && !showAccomPayment && !isExternal) ||
              (step === 2 && !isExternal) ||
              step === 3
                ? "Submit Registration"
                : "Next Step"}
              {step !== 3 && (showAccomPayment || isExternal) && (
                <ArrowRight size={22} className="inline ml-2" />
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}