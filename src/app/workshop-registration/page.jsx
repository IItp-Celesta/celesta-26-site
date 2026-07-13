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

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
    defaultValues: { requireAccommodation: "no" },
  });

  const formValues = watch();

  const BASE_FEE = 1200;
  const isIITPStudent = formValues.isIITP === "yes";
  const discount = isIITPStudent ? 700 : 0;
  const accommodationFee =
    !isIITPStudent && formValues.requireAccommodation === "yes" ? 500 : 0;
  const subtotal = BASE_FEE - discount + accommodationFee;
  const gst = Math.round(subtotal * 0.18);
  const finalAmount = subtotal + gst;

  const feeSummary = {
    baseFee: BASE_FEE,
    discount,
    accommodationFee,
    gst,
    finalAmount,
  };

  const onSubmit = (data) => {
    setSubmittedData(data);
    setCurrentStep(2);
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
        }}
      >
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
                disabled={!isValid}
                style={{
                  width: "100%",
                  padding: "1.25rem",
                  fontSize: "1.15rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: isValid ? "pointer" : "not-allowed",
                  transition: "all 0.3s ease",
                  // Glow and gradient for valid state, muted slate for invalid state
                  background: isValid
                    ? "linear-gradient(135deg, #0ea5e9, #2563eb)"
                    : "#1e293b",
                  color: isValid ? "#ffffff" : "#64748b",
                  boxShadow: isValid
                    ? "0 10px 25px -5px rgba(14, 165, 233, 0.4)"
                    : "inset 0 2px 4px rgba(0,0,0,0.2)",
                  transform: isValid ? "translateY(-2px)" : "none",
                }}
              >
                {isValid
                  ? `Pay ₹${finalAmount} & Complete Registration`
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
