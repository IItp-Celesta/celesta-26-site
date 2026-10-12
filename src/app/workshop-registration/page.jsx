"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import RegistrationForm from "../../components/workshop/RegistrationForm";
import FeeCalculator from "../../components/workshop/FeeCalculator";
import PaymentSimulator from "../../components/workshop/PaymentSimulator";
import Confirmation from "../../components/workshop/Confirmation";

import { registrationSchema } from "../../lib/schemas";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthUserContext";

export default function WorkshopRegistrationPage() {
  const { authUser, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !authUser) {
      router.replace("/login?redirect=/workshop-registration");
    }
  }, [loading, authUser, router]);
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationId, setRegistrationId] = useState("");
  const [submittedData, setSubmittedData] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState({
    code: null,
    price: null,
  });

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
    defaultValues: {
      requireAccommodation: "no",
      isIITP: "no",
      accommodationDays: "2",
    },
  });

  const formValues = watch();
  const isIITPStudent = formValues.isIITP === "yes";
  const couponCode = formValues.couponCode?.trim().toUpperCase();

  const handleVerifyCoupon = async () => {
    if (!couponCode) {
      setAppliedCoupon({ code: null, price: null });
      return { valid: false, message: "Please enter a coupon code." };
    }

    try {
      const baseAmount = isIITPStudent ? 599 : 1199;
      const res = await fetch("/api/combo/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, amount: baseAmount }),
      });
      const data = await res.json();

      if (data.valid) {
        setAppliedCoupon({
          code: couponCode,
          price: data.couponPrice,
        });
        return {
          valid: true,
          message: `Coupon applied! Workshop fee reduced to ₹${data.couponPrice}.`,
        };
      }

      setAppliedCoupon({ code: null, price: null });
      return { valid: false, message: data.message || "Invalid coupon code." };
    } catch (error) {
      setAppliedCoupon({ code: null, price: null });
      return {
        valid: false,
        message: "Unable to verify coupon. Please try again.",
      };
    }
  };

  let workshopFee = isIITPStudent ? 599 : 1199;
  if (
    !isIITPStudent &&
    appliedCoupon.price &&
    appliedCoupon.code === couponCode
  ) {
    workshopFee = appliedCoupon.price;
  }

  const accommodationDays =
    formValues.requireAccommodation === "yes"
      ? Number(formValues.accommodationDays || 2)
      : 0;

  const accommodationFee = !isIITPStudent ? accommodationDays * 249 : 0;
  const finalAmount = accommodationFee;

  const totalAmount = workshopFee + accommodationFee;

  const feeSummary = {
    workshopFee,
    accommodationFee,
    finalAmount,
    totalAmount,
  };

  const onSubmit = async (data) => {
    setSubmittedData(data);
    setCurrentStep(2);
  };

  const handlePaymentSuccess = (generatedId) => {
    setRegistrationId(generatedId);
    setCurrentStep(3);
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div
      className="page-wrapper"
      style={{ backgroundImage: "url('/images/backdrop.png')" }}
    >
      <div className="glass-container">
        <header style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 className="page-title">Workshop Registration</h1>
          <p
            style={{
              color: "#94a3b8",
              margin: 0,
              fontSize: "1.15rem",
              letterSpacing: "0.5px",
            }}
          >
            Celesta 2026 Tech Workshop (31st Oct & 1st Nov)
          </p>
        </header>

        <main style={{ animation: "fadeIn 0.5s ease-out" }}>
          {/*
        <div style={{ padding: "2rem", backgroundColor: "[#0e121f]", borderRadius: "12px", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
            <h2 style={{ color: "#ef4444", fontSize: "2rem", fontWeight: "800", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "1px" }}>
              Registrations Closed
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "1.1rem", lineHeight: "1.6" }}>
              Thank you for the overwhelming response! The registrations for the Celesta 2026 Tech Workshop are now officially closed. 
            </p>
          </div>
          */}

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
                onVerifyCoupon={handleVerifyCoupon}
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
                  ? "Proceed to Verification"
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
              onBack={() => setCurrentStep(1)}
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-wrapper {
          min-height: 100vh;
          padding: 100px 1rem 4rem 1rem;
          font-family: system-ui, sans-serif;
          color: #f8fafc;
          position: relative;
          z-index: 1;
          background-size: cover;
          background-position: center;
        }
        .glass-container {
          max-width: 850px;
          margin: 0 auto;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(14, 165, 233, 0.25);
          border-radius: 24px;
          padding: 3rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(14, 165, 233, 0.08);
          position: relative;
          overflow: hidden;
        }
        .page-title {
          font-size: 2.8rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0 0 10px 0;
          background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 2px 10px rgba(0, 242, 254, 0.2));
        }

        /* Mobile specific overrides */
        @media (max-width: 640px) {
          .page-wrapper {
            padding: 80px 0 0 0;
          }
          .glass-container {
            padding: 2rem 1.25rem;
            border-radius: 24px 24px 0 0;
            border-left: none;
            border-right: none;
            border-bottom: none;
          }
          .page-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
