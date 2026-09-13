"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import FlagshipRegistrationForm from "../../../../components/events/FlagshipRegistrationForm";
import toast from "react-hot-toast";
import data from "../../events.json";

export default function FlagshipRegistrationPage({ params }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Try to find the event name based on the slug
  const eventId = params.eventId;
  const event = data.events.find(e => e.name.toLowerCase().replace(/\s+/g, '-') === eventId);
  const eventName = event ? event.name : "Flagship Event";

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      numMembers: "1"
    }
  });

  const onSubmit = async (formDataObj) => {
    try {
      setLoading(true);

      const submitData = new FormData();
      submitData.append("eventId", eventId);
      submitData.append("teamName", formDataObj.teamName);
      submitData.append("college", formDataObj.college);
      submitData.append("numMembers", formDataObj.numMembers);

      // Append members data
      if (formDataObj.members) {
        for (let i = 0; i < formDataObj.members.length; i++) {
          const member = formDataObj.members[i];
          submitData.append(`members[${i}][name]`, member.name);
          submitData.append(`members[${i}][email]`, member.email);
          submitData.append(`members[${i}][phone]`, member.phone);
          submitData.append(`members[${i}][gender]`, member.gender);
          submitData.append(`members[${i}][college]`, member.college);

          if (member.aadhaar && member.aadhaar[0]) {
            submitData.append(`members[${i}][aadhaar]`, member.aadhaar[0]);
          }
        }
      }

      const response = await fetch("/api/register-flagship", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`Successfully registered for ${eventName}!`);
        // Redirect back to events page after a short delay
        setTimeout(() => {
          router.push("/events");
        }, 1500);
      } else {
        toast.error(result.message || "Something went wrong during registration.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="page-wrapper"
      style={{ backgroundImage: "url('/images/auth-backdrop.png')" }}
    >
      <div className="glass-container">
        <header style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 className="page-title">{eventName} Registration</h1>
          <p
            style={{
              color: "#94a3b8",
              margin: 0,
              fontSize: "1.15rem",
              letterSpacing: "0.5px",
            }}
          >
            Celesta 2026 Flagship Events
          </p>
        </header>

        <main style={{ animation: "fadeIn 0.5s ease-out" }}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2.5rem",
            }}
          >
            <FlagshipRegistrationForm
              register={register}
              errors={errors}
              watch={watch}
            />

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
                cursor: (!isValid || loading) ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                background: (!isValid || loading)
                  ? "#1e293b"
                  : "linear-gradient(135deg, #0ea5e9, #2563eb)",
                color: (!isValid || loading) ? "#64748b" : "#ffffff",
                boxShadow: (!isValid || loading)
                  ? "inset 0 2px 4px rgba(0,0,0,0.2)"
                  : "0 10px 25px -5px rgba(14, 165, 233, 0.4)",
                transform: (!isValid || loading) ? "none" : "translateY(-2px)",
              }}
            >
              {loading
                ? "Submitting..."
                : isValid
                ? "Submit Registration"
                : "Please Fill All Required Fields"}
            </button>
          </form>
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
