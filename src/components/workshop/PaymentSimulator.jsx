"use client";

import { useState } from "react";
import "./PaymentSimulator.css";

export default function PaymentSimulator({ finalAmount, onPaymentSuccess }) {
    const [upiId, setUpiId] = useState("");
    const [screenshot, setScreenshot] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({
        upi: "",
        screenshot: "",
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        // Validation: File type
        if (file.type !== "image/png" && file.type !== "image/jpeg" && file.type !== "image/jpg") {
            setErrors((prev) => ({
                ...prev,
                screenshot: "Only JPG and PNG images are allowed.",
            }));
            return;
        }

        // Validation: Max file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({
                ...prev,
                screenshot: "Maximum file size is 5 MB.",
            }));
            return;
        }

        setErrors({ upi: "", screenshot: "" });

        setScreenshot(file);
        setPreview(URL.createObjectURL(file));
    };

    const validate = () => {
        let valid = true;
        const newErrors = { upi: "", screenshot: "" };

        if (!upiId.trim()) {
            newErrors.upi = "Please enter your UPI ID.";
            valid = false;
        }

        if (!screenshot) {
            newErrors.screenshot = "Please upload payment screenshot.";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = () => {
        if (!validate()) return; // Stops submission if validation fails

        setLoading(true);

        setTimeout(() => {
            const registrationId = "WS2026-" + Math.floor(10000 + Math.random() * 90000);
            onPaymentSuccess(registrationId);
        }, 2500);
    };

    return (
        <div className="payment-page">
            <h1 className="payment-title">Complete Your Registration</h1>

            <div className="payment-layout">
                {/* LEFT */}
                <div className="qr-card">
                    <h2>Scan & Pay</h2>
                    {/* Note: Ensure qr.png is in your /public folder! */}
                    <img src="/qr.png" alt="QR Code" className="qr-image" />
                    <p className="scan-text">Scan using any UPI App</p>
                    <div className="upi-display">
                        <span>UPI ID</span>
                        <strong>celesta@oksbi</strong>
                        <small>✔ Verified Merchant</small>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="details-card">
                    <h2>Payment Details</h2>
                    <div className="summary-box">
                        <div>
                            <h4>Workshop Registration</h4>
                            <p>Registration Fee</p>
                        </div>
                        <strong>₹{finalAmount}</strong>
                    </div>

                    <div className="form-group">
                        <label>Your UPI ID</label>
                        <input
                            type="text"
                            placeholder="example@oksbi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                        />
                        {errors.upi && <p className="error">{errors.upi}</p>}
                    </div>

                    <div className="form-group">
                        <label>Upload Payment Screenshot</label>
                        <label className="upload-box">
                            <div className="upload-icon">{screenshot ? "✅" : "📤"}</div>
                            <div className="upload-title">{screenshot ? screenshot.name : "Click to Upload"}</div>
                            <div className="upload-subtitle">
                                {screenshot ? "Screenshot uploaded successfully" : "JPG / PNG (Max 5 MB)"}
                            </div>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={handleFileChange}
                                hidden
                            />
                        </label>
                        {errors.screenshot && <p className="error">{errors.screenshot}</p>}
                    </div>

                    {preview && (
                        <div className="preview-section">
                            <h4>Uploaded Screenshot</h4>
                            <img src={preview} alt="Preview" className="preview-image" />
                        </div>
                    )}

                    <button className="submit-btn" disabled={loading} onClick={handleSubmit}>
                        {loading ? (
                            <>
                                <span className="loader"></span>
                                Verifying Payment...
                            </>
                        ) : (
                            "Complete Registration"
                        )}
                    </button>

                    <p className="payment-note">
                        🔒 Your payment will be verified securely by the Celesta Team.
                    </p>
                </div>
            </div>
        </div>
    );
}