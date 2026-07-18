"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import RegistrationForm from "../../components/workshop/RegistrationForm";
import FeeCalculator from "../../components/workshop/FeeCalculator";
import PaymentSimulator from "../../components/workshop/PaymentSimulator";
import Confirmation from "../../components/workshop/Confirmation";

import { registrationSchema } from "../../lib/schemas";

export default function WorkshopRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationId, setRegistrationId] = useState("");
  const [submittedData, setSubmittedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
    defaultValues: { requireAccommodation: "no", isIITP: "no" },
  });

  const formValues = watch();
  const isIITPStudent = formValues.isIITP === "yes";
  const accommodationFee =
    !isIITPStudent && formValues.requireAccommodation === "yes" ? 199 : 0;
  const finalAmount = accommodationFee;

  const feeSummary = {
    accommodationFee,
    finalAmount,
  };

  const onSubmit = async (data) => {
    setSubmittedData(data);

    if (finalAmount > 0) {
      setCurrentStep(2);
    } else {
      setLoading(true);
      try {
        const payload = { ...data, finalAmount: 0 };
        const response = await fetch("/api/register-workshop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.success) {
          setRegistrationId(result.registrationId);
          setCurrentStep(3); // Go directly to confirmation
        } else {
          alert(result.message || "Registration failed.");
        }
      } catch (error) {
        console.error("Submission Error:", error);
        alert("A server error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePaymentSuccess = (generatedId) => {
    setRegistrationId(generatedId);
    setCurrentStep(3);
  };

  return (
    // Outer Wrapper: Takes up full height, handles spacing from the global navbar
    <div
      style={{
        backgroundImage: "url('/images/auth-backdrop.png')",
        minHeight: "100vh",
        padding: "100px 1rem 4rem 1rem",
        fontFamily: "system-ui, sans-serif",
        color: "#f8fafc",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Premium Glassmorphism Container */}
      <div
        style={{
          maxWidth: "850px",
          margin: "0 auto",
          background: "rgba(15, 23, 42, 0.7)", // Dark transparent slate
          backdropFilter: "blur(12px)", // Frosted glass effect
          border: "1px solid rgba(14, 165, 233, 0.25)", // Subtle cyan border
          borderRadius: "24px",
          padding: "3rem",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(14, 165, 233, 0.08)",
          position: "relative",
          overflow: "hidden", 
        }}
      >
        {/* Loading Overlay */}
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "1.2rem",
              color: "#38bdf8",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            Saving Registration...
          </div>
        )}

        <header style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1
            style={{
              fontSize: "2.8rem",
              fontWeight: "900",
              textTransform: "uppercase",
              letterSpacing: "1px",
              margin: "0 0 10px 0",
              // Cyan to Blue text gradient
              background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 2px 10px rgba(0, 242, 254, 0.2))",
            }}
          >
            Workshop Registration
          </h1>
          <p
            style={{
              color: "#94a3b8",
              margin: 0,
              fontSize: "1.15rem",
              letterSpacing: "0.5px",
            }}
          >
            Celesta 2026 Tech Workshop Series
          </p>
        </header>

        <main style={{ animation: "fadeIn 0.5s ease-out" }}>
          {currentStep === 1 && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2.5rem",
              }}
            >
              <RegistrationForm
                register={register}
                errors={errors}
                watch={watch}
              />
              <FeeCalculator formValues={formValues} feeSummary={feeSummary} />

              <button
                type="submit"
                disabled={!isValid || loading}
                style={{
                  width: "100%",
                  padding: "1.25rem",
                  fontSize: "1.15rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: isValid && !loading ? "pointer" : "not-allowed",
                  transition: "all 0.3s ease",
                  // Glow and gradient for valid state, muted slate for invalid state
                  background: isValid
                    ? "linear-gradient(135deg, #0ea5e9, #2563eb)"
                    : "#1e293b",
                  color: isValid ? "#ffffff" : "#64748b",
                  boxShadow: isValid
                    ? "0 10px 25px -5px rgba(14, 165, 233, 0.4)"
                    : "inset 0 2px 4px rgba(0,0,0,0.2)",
                  transform: isValid && !loading ? "translateY(-2px)" : "none",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {isValid
                  ? finalAmount > 0
                    ? `Proceed to Pay ₹${finalAmount}`
                    : "Submit Registration"
                  : "Please Fill All Required Fields"}
              </button>
            </form>
          )}

          {currentStep === 2 && (
            <PaymentSimulator
              finalAmount={finalAmount}
              onPaymentSuccess={handlePaymentSuccess}
              formData={submittedData}
              feeSummary={feeSummary}
            />
          )}

          {currentStep === 3 && (
            <Confirmation
              registrationId={registrationId}
              formData={submittedData}
              feeSummary={feeSummary}
            />
          )}
        </main>
      </div>

      {/* Inline Keyframes for smooth fade-in */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
