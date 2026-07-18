"use client";

export default function FeeCalculator({ formValues, feeSummary }) {
  const { accommodationFee, finalAmount } = feeSummary;

  const isIITP = formValues.isIITP === "yes";
  const workshopFee = isIITP ? 590 : 1416;
  const userType = isIITP ? "IIT Patna Student" : "External Participant";

  const paymentLink = isIITP
    ? "https://imjo.in/dJDqw7"
    : "https://imjo.in/rJFAbz";

  return (
    <div
      style={{
        border: "1px solid rgba(14, 165, 233, 0.2)",
        padding: "1.75rem",
        borderRadius: "16px",
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: 0,
          fontSize: "1.2rem",
          fontWeight: "700",
          color: "#f8fafc",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        2. Billing & Payment Portals
      </h3>

      <div
        style={{
          backgroundColor: "rgba(8, 145, 178, 0.15)",
          border: "1px solid rgba(14, 165, 233, 0.3)",
          padding: "1.25rem",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h4
              style={{
                margin: 0,
                color: "#f8fafc",
                fontSize: "1.1rem",
                fontWeight: "600",
              }}
            >
              Workshop Track Fee
            </h4>
            <p
              style={{
                margin: 0,
                color: "rgba(165, 243, 252, 0.7)",
                fontSize: "0.85rem",
              }}
            >
              Mandatory base fee ({userType})
            </p>
          </div>
          <span
            style={{ fontSize: "1.25rem", fontWeight: "700", color: "#22d3ee" }}
          >
            ₹{workshopFee}
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "0.8rem",
            color: "#94a3b8",
            lineHeight: "1.4",
          }}
        >
          * This fee must be paid on the official external portal. Please click
          the link below to pay, then return here to submit your registration.
        </p>

        <a
          href={paymentLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: "0.5rem",
            display: "block",
            textAlign: "center",
            backgroundColor: "rgba(8, 145, 178, 0.2)",
            color: "#22d3ee",
            border: "1px solid rgba(14, 165, 233, 0.5)",
            padding: "0.75rem",
            borderRadius: "8px",
            fontSize: "0.85rem",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "1px",
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) =>
            (e.target.style.backgroundColor = "rgba(8, 145, 178, 0.3)")
          }
          onMouseOut={(e) =>
            (e.target.style.backgroundColor = "rgba(8, 145, 178, 0.2)")
          }
        >
          Pay ₹{workshopFee} on Portal ➔
        </a>
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid #334155",
          margin: 0,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "#cbd5e1",
          fontSize: "1rem",
        }}
      >
        <span>Campus Accommodation Fee (Local Payment)</span>
        <span style={{ fontWeight: "600", color: "#f8fafc" }}>
          {accommodationFee > 0 ? `+₹${accommodationFee}` : "₹0"}
        </span>
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "2px dashed #475569",
          margin: 0,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc" }}
          >
            Amount Due Now
          </span>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            (Accommodation Only)
          </span>
        </div>
        <span
          style={{
            fontSize: "1.5rem",
            fontWeight: "900",
            color: finalAmount > 0 ? "#0ea5e9" : "#4ade80",
            textShadow:
              finalAmount > 0 ? "0 0 15px rgba(14, 165, 233, 0.4)" : "none",
          }}
        >
          ₹{finalAmount}
        </span>
      </div>
    </div>
  );
}
