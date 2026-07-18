"use client";

export default function RegistrationForm({ register, errors, watch }) {
  const isIITP = watch("isIITP");
  const emailValue = watch("email");
  const phoneValue = watch("phone"); // Updated to match backend

  const isEmailValid = emailValue && !errors.email;
  const isPhoneValid = phoneValue && !errors.phone;

  // Reusable input style for dark mode
  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "0.7rem",
    border: `1px solid ${hasError ? "#ef4444" : "#334155"}`,
    borderRadius: "8px",
    boxSizing: "border-box",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    color: "#f8fafc",
    outline: "none",
    transition: "border-color 0.2s",
  });

  return (
    <div
      style={{
        border: "1px solid rgba(14, 165, 233, 0.2)",
        padding: "2rem",
        borderRadius: "16px",
        backgroundColor: "rgba(30, 41, 59, 0.4)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "1.5rem",
          fontSize: "1.3rem",
          fontWeight: "700",
          color: "#f8fafc",
          borderBottom: "1px solid #334155",
          paddingBottom: "0.75rem",
        }}
      >
        1. Personal & Academic Details
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* FULL NAME */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "600",
              fontSize: "0.9rem",
              color: "#cbd5e1",
            }}
          >
            Full Name *
          </label>
          <input
            type="text"
            {...register("name")} // Updated to match backend
            placeholder="Name"
            style={inputStyle(errors.name)}
          />
          {errors.name && (
            <span
              style={{
                color: "#f87171",
                fontSize: "0.85rem",
                marginTop: "4px",
                display: "block",
              }}
            >
              {errors.name.message}
            </span>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.25rem",
          }}
        >
          {/* EMAIL */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                fontSize: "0.9rem",
                color: "#cbd5e1",
              }}
            >
              Email Address *{" "}
              {isEmailValid ? (
                <span style={{ color: "#4ade80" }}>✓</span>
              ) : (
                errors.email && (
                  <span style={{ color: "#f87171", fontSize: "0.8rem" }}>
                    ({errors.email.message})
                  </span>
                )
              )}
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="xyz@iitp.ac.in"
              style={inputStyle(errors.email)}
            />
          </div>

          {/* MOBILE NUMBER */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                fontSize: "0.9rem",
                color: "#cbd5e1",
              }}
            >
              Mobile Number *{" "}
              {isPhoneValid ? (
                <span style={{ color: "#4ade80" }}>✓</span>
              ) : (
                errors.phone && (
                  <span style={{ color: "#f87171", fontSize: "0.8rem" }}>
                    ({errors.phone.message})
                  </span>
                )
              )}
            </label>
            <input
              type="text"
              {...register("phone")} // Updated to match backend
              placeholder="9876543210"
              style={inputStyle(errors.phone)}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.25rem",
          }}
        >
          {/* COLLEGE */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                fontSize: "0.9rem",
                color: "#cbd5e1",
              }}
            >
              Institute / College *
            </label>
            <input
              type="text"
              {...register("college")}
              placeholder="IIT Patna"
              style={inputStyle(errors.college)}
            />
          </div>

          {/* CITY / STATE */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
                fontSize: "0.9rem",
                color: "#cbd5e1",
              }}
            >
              City / State *
            </label>
            <input
              type="text"
              {...register("cityState")}
              placeholder="Patna, Bihar"
              style={inputStyle(errors.cityState)}
            />
          </div>
        </div>

        {/* WORKSHOP TRACK */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "600",
              fontSize: "0.9rem",
              color: "#cbd5e1",
            }}
          >
            Workshop Applying For *
          </label>
          <select
            {...register("workshop")}
            style={{ ...inputStyle(errors.workshop), appearance: "auto" }}
          >
            <option value="" style={{ color: "#000" }}>
              -- Choose a Technology track --
            </option>
            <option value="Artificial Intelligence" style={{ color: "#000" }}>
              Artificial Intelligence
            </option>
            <option value="Ethical Hacking" style={{ color: "#000" }}>
              Ethical Hacking
            </option>
            <option value="Drone Technology" style={{ color: "#000" }}>
              Drone Technology
            </option>
            <option value="Full Stack Development" style={{ color: "#000" }}>
              Full Stack Development
            </option>
            <option value="Arduino Course" style={{ color: "#000" }}>
              Arduino Course
            </option>
            <option value="Autonomous Robotics" style={{ color: "#000" }}>
              Autonomous Robotics
            </option>
            <option value="Generative AI" style={{ color: "#000" }}>
              Generative AI
            </option>
            <option value="Internet of Things" style={{ color: "#000" }}>
              Internet of Things
            </option>
          </select>
        </div>

        {/* IITP STATUS */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            padding: "1.25rem",
            borderRadius: "10px",
            border: "1px solid #334155",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "0.75rem",
              fontWeight: "700",
              fontSize: "0.95rem",
              color: "#e2e8f0",
            }}
          >
            Are you an IIT Patna Student? *
          </label>
          <div
            style={{
              display: "flex",
              gap: "2rem",
              marginBottom: isIITP === "yes" ? "1rem" : "0",
            }}
          >
            <label
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#cbd5e1",
              }}
            >
              <input type="radio" value="yes" {...register("isIITP")} /> Yes, I
              am
            </label>
            <label
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#cbd5e1",
              }}
            >
              <input type="radio" value="no" {...register("isIITP")} /> No,
              another college
            </label>
          </div>

          {isIITP === "yes" && (
            <div
              style={{ marginTop: "0.5rem", animation: "fadeIn 0.3s ease-out" }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "0.4rem",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                  color: "#38bdf8",
                }}
              >
                Roll Number *
              </label>
              <input
                type="text"
                maxLength={8}
                placeholder="e.g. 2501ES09"
                {...register("rollNumber", {
                  setValueAs: (value) => value.toUpperCase(),
                })}
                style={{
                  ...inputStyle(errors.rollNumber),
                  borderColor: errors.rollNumber ? "#ef4444" : "#0ea5e9",
                }}
              />

              {errors.rollNumber && (
                <span
                  style={{
                    color: "#f87171",
                    fontSize: "0.85rem",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  {errors.rollNumber.message}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ACCOMMODATION */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "700",
              fontSize: "0.95rem",
              color: "#e2e8f0",
            }}
          >
            Accommodation
          </label>
          {isIITP === "no" ? (
            <div
              style={{ padding: "0.5rem 0", animation: "fadeIn 0.3s ease-out" }}
            >
              <span
                style={{
                  display: "block",
                  marginBottom: "0.75rem",
                  fontSize: "0.9rem",
                  color: "#94a3b8",
                }}
              >
                Do you require accommodation on campus? (+₹199)
              </span>
              <div style={{ display: "flex", gap: "2rem" }}>
                <label
                  style={{
                    cursor: "pointer",
                    color: "#cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <input
                    type="radio"
                    value="yes"
                    {...register("requireAccommodation")}
                  />{" "}
                  Yes
                </label>
                <label
                  style={{
                    cursor: "pointer",
                    color: "#cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <input
                    type="radio"
                    value="no"
                    {...register("requireAccommodation")}
                  />{" "}
                  No
                </label>
              </div>
            </div>
          ) : isIITP === "yes" ? (
            <div
              style={{
                padding: "0.75rem",
                backgroundColor: "rgba(14, 165, 233, 0.1)",
                border: "1px solid rgba(14, 165, 233, 0.2)",
                borderRadius: "8px",
                color: "#38bdf8",
                fontSize: "0.9rem",
                fontWeight: "500",
                animation: "fadeIn 0.3s ease-out",
              }}
            >
              Not Required
            </div>
          ) : (
            <span
              style={{
                fontSize: "0.9rem",
                color: "#64748b",
                fontStyle: "italic",
              }}
            >
              Please specify IIT Patna status to check housing configurations.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
