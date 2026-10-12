"use client";
import { useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { CheckCircle2, Upload, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthUserContext";

export default function PaymentSimulator({ onPaymentSuccess, formData = {}, feeSummary = {}, onBack }) {
  const { authUser } = useAuth()
  const isExternal = formData.isIITP === "no";
  const requireAccommodation = formData.requireAccommodation === "yes";
  const showAccomPayment = requireAccommodation && feeSummary.accommodationFee > 0;
  
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
      setErrors((prev) => ({ ...prev, [type]: "Error processing image. Try again." }));
    }
  };

  const handleNext = () => {
    setErrors({});
    
    // Validate Step 1: Registration
    if (step === 1) {
      let valid = true;
      const newErrors = {};
      if (!upiId.trim()) { newErrors.upi = "Required"; valid = false; }
      if (!regTxnId.trim()) { newErrors.regTxn = "Required"; valid = false; }
      if (!regFile) { newErrors.regFile = "Required"; valid = false; }
      
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
      if (!accomTxnId.trim()) { newErrors.accomTxn = "Required"; valid = false; }
      if (!accomFile) { newErrors.accomFile = "Required"; valid = false; }
      
      if (!valid) {
        setErrors(newErrors);
        return;
      }

      if (isExternal) setStep(3);
      else handleSubmit();
    }
    // Validate Step 3: Aadhaar
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
        if (value !== undefined && value !== null) submitData.append(key, value);
      });

      if (formData.couponCode) {
      submitData.append("couponCode", formData.couponCode);}
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

  return (
    <div className="w-full max-w-xl md:max-w-4xl mx-auto flex flex-col gap-6 md:gap-8 animate-in fade-in duration-500">
      
      {/* Header & Back Button */}
      <div className="flex justify-between items-center w-full px-2">
        <button onClick={handlePrevious} disabled={loading} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium text-sm disabled:opacity-50 transition-colors">
          <ArrowLeft size={18} /> {step === 1 ? "Edit Details" : "Back"}
        </button>
        <div className="text-xs font-mono text-gray-400 uppercase tracking-widest bg-black/40 px-4 py-1.5 rounded-full border border-white/5">
          {step === 1 && "1. Registration"}
          {step === 2 && "2. Accommodation"}
          {step === 3 && "3. Identity Verification"}
        </div>
      </div>

      {/* Grand Total Reminder (Always Visible) */}
      <div className="bg-cyan-900/20 border border-cyan-500/20 rounded-2xl p-5 md:p-6 text-center shadow-lg flex justify-between items-center">
        <div className="text-left">
          <h2 className="text-gray-400 text-xs md:text-sm font-medium uppercase tracking-widest mb-1">Grand Total Due</h2>
          <p className="text-[10px] md:text-xs text-cyan-500/80">Multiple scans required</p>
        </div>
        <div className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]">
          ₹ {feeSummary.totalAmount}
        </div>
      </div>

      {/* --- STEP 1: REGISTRATION --- */}
      {step === 1 && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10 flex flex-col md:flex-row gap-8 shadow-xl animate-in slide-in-from-right-4 duration-300">
          
          <div className="flex-1 flex flex-col items-center justify-center text-center md:border-r border-b md:border-b-0 border-white/10 pb-6 md:pb-0 md:pr-8">
            <h3 className="text-lg font-semibold mb-2 text-white uppercase tracking-wider">Registration Payment</h3>
            <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-6">₹ {feeSummary.workshopFee}</div>
            <div className="bg-white p-3 rounded-2xl shadow-[0_0_20px_rgba(14,165,233,0.2)] mb-4 inline-block">
              <Image src="/payment/qr1.png" alt="Registration QR" width={220} height={220} className="rounded-xl object-cover" />
            </div>
          </div>

          <div className="flex-[1.2] flex flex-col justify-center gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-300 font-medium">Your UPI ID *</label>
                <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="username@bank" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500 transition-colors" />
                {errors.upi && <p className="text-red-400 text-xs">{errors.upi}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-300 font-medium">Txn ID / UTR *</label>
                <input type="text" value={regTxnId} onChange={(e) => setRegTxnId(e.target.value)} placeholder="" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500 transition-colors" />
                {errors.regTxn && <p className="text-red-400 text-xs">{errors.regTxn}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm text-gray-300 font-medium">Payment Screenshot *</label>
              <label className="border-2 border-dashed border-white/20 hover:border-cyan-400 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center gap-2 bg-black/20">
                {regFile ? <CheckCircle2 size={28} className="text-green-400" /> : <Upload size={28} className="text-cyan-400" />}
                <span className="text-sm text-gray-300">{regFile ? "Screenshot Attached" : "Upload Receipt"}</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "reg")} hidden />
              </label>
              {errors.regFile && <p className="text-red-400 text-xs">{errors.regFile}</p>}
              {previews.reg && <img src={previews.reg} alt="Preview" className="h-24 mt-2 rounded-lg object-contain border border-white/10 self-start" />}
            </div>
          </div>
        </div>
      )}

      {/* --- STEP 2: ACCOMMODATION --- */}
      {step === 2 && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10 flex flex-col md:flex-row gap-8 shadow-xl animate-in slide-in-from-right-4 duration-300">
          
          <div className="flex-1 flex flex-col items-center justify-center text-center md:border-r border-b md:border-b-0 border-white/10 pb-6 md:pb-0 md:pr-8">
            <h3 className="text-lg font-semibold mb-2 text-white uppercase tracking-wider">Accommodation Payment</h3>
            <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-6">₹ {feeSummary.accommodationFee}</div>
            <div className="bg-white p-3 rounded-2xl shadow-[0_0_20px_rgba(251,191,36,0.2)] mb-4 inline-block">
              <Image src="/payment/qr2.jpeg" alt="Accommodation QR" width={220} height={220} className="rounded-xl object-cover" />
            </div>
            <p className="text-xs text-amber-400/80 uppercase tracking-widest font-mono">Separate Scan Required</p>
          </div>

          <div className="flex-[1.2] flex flex-col justify-center gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-300 font-medium">Transaction ID / UTR *</label>
              <input type="text" value={accomTxnId} onChange={(e) => setAccomTxnId(e.target.value)} placeholder="" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-amber-500 transition-colors" />
              {errors.accomTxn && <p className="text-red-400 text-xs">{errors.accomTxn}</p>}
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm text-gray-300 font-medium">Payment Screenshot *</label>
              <label className="border-2 border-dashed border-white/20 hover:border-amber-400 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center gap-2 bg-black/20">
                {accomFile ? <CheckCircle2 size={28} className="text-green-400" /> : <Upload size={28} className="text-amber-400" />}
                <span className="text-sm text-gray-300">{accomFile ? "Screenshot Attached" : "Upload Receipt"}</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "accom")} hidden />
              </label>
              {errors.accomFile && <p className="text-red-400 text-xs">{errors.accomFile}</p>}
              {previews.accom && <img src={previews.accom} alt="Preview" className="h-24 mt-2 rounded-lg object-contain border border-white/10 self-start" />}
            </div>
          </div>
        </div>
      )}

      {/* --- STEP 3: AADHAAR --- */}
      {step === 3 && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-white/10 shadow-xl animate-in slide-in-from-right-4 duration-300">
          <div className="text-center mb-8">
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-white uppercase tracking-wider">Identity Verification</h3>
            <p className="text-sm text-gray-400">Required for non-IITP participants.</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <label className="text-sm text-gray-300 font-medium mb-3 block text-center">Upload Aadhaar Card Screenshot/Photo *</label>
            <label className="border-2 border-dashed border-white/20 hover:border-pink-400 rounded-xl p-10 md:p-14 text-center cursor-pointer transition-all flex flex-col items-center gap-4 bg-black/20">
              {aadhaarFile ? <CheckCircle2 size={48} className="text-green-400" /> : <Upload size={48} className="text-pink-400" />}
              <span className="font-medium text-gray-300 md:text-lg">{aadhaarFile ? "Aadhaar Attached" : "Tap to Upload Image"}</span>
              <p className="text-xs text-gray-500">Max size 400KB. JPG/PNG only.</p>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "aadhaar")} hidden />
            </label>
            {errors.aadhaar && <p className="text-red-400 text-xs mt-3 text-center">{errors.aadhaar}</p>}
            {previews.aadhaar && <img src={previews.aadhaar} alt="Preview" className="h-32 md:h-48 mx-auto mt-6 rounded-lg object-contain border border-white/10 shadow-lg" />}
          </div>
       </div>
    )}

      <div className="flex justify-center mt-2">
        <button
          disabled={loading}
          onClick={handleNext}
          className={`w-full md:w-96 py-4 rounded-xl font-bold uppercase tracking-widest text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-xl
            ${loading ? "bg-gray-800 border border-white/10 cursor-not-allowed text-gray-500" 
            : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:-translate-y-1 hover:shadow-cyan-500/30 border border-cyan-400/30"}`}
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              {((step === 1 && !showAccomPayment && !isExternal) || 
                (step === 2 && !isExternal) || 
                 step === 3) ? "Submit Registration" : "Next Step"}
              {step !== 3 && (showAccomPayment || isExternal) && <ArrowRight size={18} />}
            </>
          )}
        </button>
      </div>
    </div>
  );
}