"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Adjust these import paths depending on where you put your components!
// If you put them in src/components/workshop/, these paths are correct:
import RegistrationForm from '../../components/workshop/RegistrationForm';
import FeeCalculator from '../../components/workshop/FeeCalculator';
import PaymentSimulator from '../../components/workshop/PaymentSimulator';
import Confirmation from '../../components/workshop/Confirmation';

// Assuming you put your Zod schema inside the existing lib/schemas.js
import { registrationSchema } from '../../lib/schemas'; 

export default function WorkshopRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1); // 1: Form, 2: Gateway, 3: Receipt
  const [registrationId, setRegistrationId] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  // Initialize React Hook Form with Zod Phase 3 validation
  const { register, watch, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      requireAccommodation: 'no'
    }
  });

  // Watch entire form state for the Fee Calculator
  const formValues = watch(); 

  // PHASE 2: Live Fee Calculator (Pure Derived State)
  const BASE_FEE = 1500; // Looking at their screenshot, it looks like base fee is 1500 now!
  const isIITPStudent = formValues.isIITP === 'yes';
  
  const discount = isIITPStudent ? 400 : 0; 
  const accommodationFee = (!isIITPStudent && formValues.requireAccommodation === 'yes') ? 500 : 0;
  const subtotal = BASE_FEE - discount + accommodationFee;
  const gst = Math.round(subtotal * 0.18);
  const finalAmount = subtotal + gst;

  const feeSummary = { baseFee: BASE_FEE, discount, accommodationFee, gst, finalAmount };

  // Triggered only if all Zod validations pass
  const onSubmit = (data) => {
    setSubmittedData(data); // Save finalized valid data
    setCurrentStep(2);      // Move to Payment Simulator
  };

  const handlePaymentSuccess = (generatedId) => {
    setRegistrationId(generatedId);
    setCurrentStep(3);
  };

  return (
    <div style={{ maxWidth: '750px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif', color: '#1e293b' }}>
      <header style={{ textAlign: 'center', marginBottom: '2.5rem', paddingTop: '80px' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0ea5e9', marginBottom: '0.5rem' }}>Workshop Registration</h1>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem' }}>Celesta 2026 Tech Workshop Series</p>
      </header>

      <main>
        {currentStep === 1 && (
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <RegistrationForm register={register} errors={errors} watch={watch} />
            
            <FeeCalculator formValues={formValues} feeSummary={feeSummary} />

            <button
              type="submit"
              disabled={!isValid}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                backgroundColor: isValid ? '#0ea5e9' : '#334155',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: isValid ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s ease',
                boxShadow: isValid ? '0 4px 6px -1px rgba(14, 165, 233, 0.2)' : 'none'
              }}
            >
              {isValid ? `Pay ₹${finalAmount} & Complete Registration` : 'Please Fill All Required Fields'}
            </button>
          </form>
        )}

        {currentStep === 2 && (
          <PaymentSimulator finalAmount={finalAmount} onPaymentSuccess={handlePaymentSuccess} />
        )}

        {currentStep === 3 && (
          <Confirmation registrationId={registrationId} formData={submittedData} feeSummary={feeSummary} />
        )}
      </main>
    </div>
  );
}