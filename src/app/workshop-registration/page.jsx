"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

import RegistrationForm from "../../components/workshop/RegistrationForm";
import FeeCalculator from "../../components/workshop/FeeCalculator";
import PaymentSimulator from "../../components/workshop/PaymentSimulator";
import Confirmation from "../../components/workshop/Confirmation";

import { registrationSchema } from "../../lib/schemas";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthUserContext";
import styles from "../register/Register.module.css";

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
      <div
        className={`p-4 md:p-10 bg-muted ${styles.background} text-white min-h-svh flex items-center justify-center`}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`px-4 pt-28 pb-16 md:px-10 md:pt-32 md:pb-20 bg-muted ${styles.background} text-white min-h-svh flex flex-col items-center justify-start overflow-x-hidden`}
    >
      <motion.div
        initial={{ opacity: 0, x: -140 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl mb-8 text-center md:text-left"
      >
        <h1 className="font-bold text-3xl sm:text-4xl md:text-6xl text-grad race py-2 uppercase tracking-wide">
          Workshop Registration
        </h1>
        <p className="text-white/70 text-sm sm:text-base md:text-lg px-2 tracking-wide mt-1">
          Celesta 2026 Tech Workshop (31st Oct &amp; 1st Nov)
        </p>
      </motion.div>

      <motion.main
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl mb-12 flex flex-col gap-8"
      >
        {currentStep === 1 && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-8 w-full"
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
              className={`mx-auto ${styles.btn} ${
                !isValid ? "opacity-50 cursor-not-allowed" : ""
              } text-center`}
            >
              {isValid ? "Proceed to Verification" : "Fill Required Fields"}
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
      </motion.main>
    </div>
  );
}