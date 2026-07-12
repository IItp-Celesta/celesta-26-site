export default function Confirmation({
  registrationId,
  formData,
  feeSummary,
}) {
  return (
    <div
      style={{
        animation: "popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        border: "1px solid #14532d",
        padding: "2.5rem 2rem",
        borderRadius: "16px",
        backgroundColor: "#0f172a",
        textAlign: "center",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "60px",
          height: "60px",
          backgroundColor: "#14532d",
          borderRadius: "50%",
          color: "#4ade80",
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "1rem",
          border: "1px solid #22c55e",
        }}
      >
        ✓
      </div>

      <h2
        style={{
          color: "#4ade80",
          fontSize: "1.75rem",
          fontWeight: "800",
          margin: "0 0 0.5rem 0",
        }}
      >
        Registration Successful!
      </h2>

      <p
        style={{
          color: "#cbd5e1",
          fontSize: "1rem",
          margin: "0 0 2rem 0",
        }}
      >
        A confirmation receipt has been emailed to{" "}
        <strong
          style={{
            color: "#ffffff",
            textDecoration: "underline",
          }}
        >
          {formData.email}
        </strong>
        .
      </p>

      <div
        style={{
          maxWidth: "450px",
          margin: "0 auto",
          padding: "1.5rem",
          borderRadius: "12px",
          backgroundColor: "#1e293b",
          border: "1px solid #334155",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          textAlign: "left",
        }}
      >
        <h4
          style={{
            margin: "0 0 1rem 0",
            color: "#f8fafc",
            borderBottom: "1px solid #334155",
            paddingBottom: "0.5rem",
            fontSize: "1rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Official Pass Summary
        </h4>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            fontSize: "0.95rem",
          }}
        >
          <div>
            <span style={{ color: "#94a3b8" }}>Registration ID:</span>{" "}
            <strong
              style={{
                fontFamily: "monospace",
                fontSize: "1.1rem",
                color: "#60a5fa",
              }}
            >
              {registrationId}
            </strong>
          </div>

          <div>
            <span style={{ color: "#94a3b8" }}>Workshop Track:</span>{" "}
            <strong style={{ color: "#f8fafc" }}>
              {formData.workshop}
            </strong>
          </div>

          <div>
            <span style={{ color: "#94a3b8" }}>Attendee:</span>{" "}
            <span
              style={{
                color: "#e2e8f0",
                fontWeight: "500",
              }}
            >
              {formData.fullName}
            </span>
          </div>

          {formData.isIITP === "yes" && (
            <div>
              <span style={{ color: "#94a3b8" }}>IITP Roll No:</span>{" "}
              <span
                style={{
                  fontFamily: "monospace",
                  color: "#e2e8f0",
                }}
              >
                {formData.rollNumber}
              </span>
            </div>
          )}

          <div>
            <span style={{ color: "#94a3b8" }}>Housing Allocation:</span>{" "}
            <span
              style={{
                color: "#e2e8f0",
                fontWeight: "500",
              }}
            >
              {formData.requireAccommodation === "yes"
                ? "Campus Hostel Booked"
                : "Not Requested"}
            </span>
          </div>

          <hr
            style={{
              border: "none",
              borderTop: "1px dashed #475569",
              margin: "0.5rem 0",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "700",
              fontSize: "1.05rem",
            }}
          >
            <span style={{ color: "#f8fafc" }}>Amount Processed:</span>
            <span style={{ color: "#4ade80" }}>
              ₹{feeSummary.finalAmount}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: "2rem",
          background: "transparent",
          border: "1px solid #334155",
          color: "#4ade80",
          padding: "0.75rem 1.5rem",
          borderRadius: "8px",
          fontWeight: "600",
          cursor: "pointer",
          fontSize: "0.95rem",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = "#1e293b";
          e.target.style.borderColor = "#4ade80";
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = "transparent";
          e.target.style.borderColor = "#334155";
        }}
      >
        Register another attendee
      </button>
    </div>
  );
}