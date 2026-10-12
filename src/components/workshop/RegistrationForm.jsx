"use client";

import { useState } from "react";

export default function RegistrationForm({
  register,
  errors,
  watch,
  onVerifyCoupon,
}) {
  const [showPrograms, setShowPrograms] = useState(false);
  const [couponStatus, setCouponStatus] = useState(null);
  const isIITP = watch("isIITP");
  const emailValue = watch("email");
  const phoneValue = watch("phone"); // Updated to match backend
  const couponField = register("couponCode");

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

  const selectStyle = (hasError) => ({
    width: "100%",
    height: "44px",
    padding: "0 0.8rem",
    border: `1px solid ${hasError ? "#ef4444" : "#334155"}`,
    borderRadius: "7px",
    boxSizing: "border-box",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    fontSize: "0.9rem",
    outline: "none",
    cursor: "pointer",
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.25rem",
          }}
        >
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
              {...register("name")}
              placeholder="Your Name"
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

          {/* GENDER */}
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
              Gender *
            </label>
            <select {...register("gender")} style={selectStyle(errors.gender)}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
              <span
                style={{
                  color: "#f87171",
                  fontSize: "0.85rem",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                {errors.gender.message}
              </span>
            )}
          </div>
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
              College / School *
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
            style={selectStyle(errors.workshop)}
          >
            <option value="">Choose Technology Track</option>
            <option value="Artificial Intelligence">
              Artificial Intelligence
            </option>
            <option value="Ethical Hacking">Ethical Hacking</option>
            <option value="Drone Technology">Robotics</option>
          </select>
          {errors.workshop && (
            <span
              style={{
                color: "#f87171",
                fontSize: "0.85rem",
                marginTop: "4px",
                display: "block",
              }}
            >
              {errors.workshop.message}
            </span>
          )}
        </div>

        {/* IITP STATUS */}
        <div
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.4)",
            padding: "1.25rem",
            borderRadius: "10px",
            border: "1px solid #334155",
            display: "flex",
            flexDirection: "column",
            gap: "0.8rem",
          }}
        >
          <div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <label
                style={{
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  color: "#e2e8f0",
                }}
              >
                Are you an IIT Patna Student? *
              </label>

              {/* Clickable Info Icon */}
              <button
                type="button"
                onClick={() => setShowPrograms(!showPrograms)}
                style={{
                  background: "none",
                  border: "none",
                  color: showPrograms ? "#38bdf8" : "#94a3b8", // Changes color when active
                  cursor: "pointer",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  transition: "color 0.2s",
                }}
                aria-label="Toggle eligible programs info"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </button>
            </div>

            {/* Hidden Info Badge that appears on click */}
            {showPrograms && (
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#bae6fd",
                  backgroundColor: "rgba(14, 165, 233, 0.1)",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  borderLeft: "3px solid #0ea5e9",
                  marginTop: "0.8rem",
                  lineHeight: "1.4",
                  display: "inline-block",
                  animation: "fadeIn 0.2s ease-out",
                }}
              >
                Only for offline degree students
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.5rem",
              marginTop: "0.25rem",
              marginBottom: isIITP === "yes" ? "0.5rem" : "0",
            }}
          >
            <label
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#cbd5e1",
                fontSize: "0.9rem",
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
                fontSize: "0.9rem",
              }}
            >
              <input type="radio" value="no" {...register("isIITP")} /> No,
              another college
            </label>
          </div>

          {isIITP === "yes" && (
            <div
              style={{
                marginTop: "0.25rem",
                animation: "fadeIn 0.3s ease-out",
              }}
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
              style={{
                padding: "0.5rem 0",
                animation: "fadeIn 0.3s ease-out",
              }}
            >
              <span
                style={{
                  display: "block",
                  marginBottom: "0.75rem",
                  fontSize: "0.9rem",
                  color: "#94a3b8",
                }}
              >
                Do you require accommodation on campus? (+₹249/day)
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
                  />
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
                  />
                  No
                </label>
              </div>

              {watch("requireAccommodation") === "yes" && (
                <div style={{ marginTop: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.75rem",
                      fontWeight: "600",
                      fontSize: "0.85rem",
                      color: "#38bdf8",
                    }}
                  >
                    Number of Accommodation Days
                  </label>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.75rem",
                    }}
                  >
                    <label
                      style={{
                        cursor: "pointer",
                        padding: "0.8rem",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        color: "#cbd5e1",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <input
                        type="radio"
                        value="1"
                        {...register("accommodationDays")}
                      />

                      <span>
                        <strong style={{ color: "#f8fafc" }}>1 Day</strong>
                        <br />
                        <small style={{ color: "#64748b" }}>₹249</small>
                      </span>
                    </label>

                    <label
                      style={{
                        cursor: "pointer",
                        padding: "0.8rem",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        color: "#cbd5e1",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <input
                        type="radio"
                        value="2"
                        {...register("accommodationDays")}
                      />

                      <span>
                        <strong style={{ color: "#f8fafc" }}>2 Days</strong>
                        <br />
                        <small style={{ color: "#64748b" }}>₹498</small>
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          ) : (
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
          )}
        </div>
        {isIITP === "no" && (
          <div style={{ marginTop: "0.25rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.4rem",
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "#cbd5e1",
              }}
            >
              Coupon Code
            </label>

            <div style={{ display: "flex", gap: "0.4rem" }}>
              <input
                type="text"
                {...couponField}
                placeholder="Enter code"
                onChange={(e) => {
                  couponField.onChange(e);
                  setCouponStatus(null);
                }}
                style={{
                  ...inputStyle(false),
                  flex: 1,
                }}
              />

              <button
                type="button"
                onClick={async () => {
                  try {
                    const result = await onVerifyCoupon();

                    setCouponStatus({
                      valid: result?.valid === true,
                      message:
                        result?.message ||
                        (result?.valid ? "Applied" : "Invalid"),
                    });
                  } catch {
                    setCouponStatus({
                      valid: false,
                      message: "Invalid",
                    });
                  }
                }}
                style={{
                  padding: "0 0.9rem",
                  color: "#fff",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Apply
              </button>
            </div>

            {couponStatus && (
              <div
                style={{
                  marginTop: "0.3rem",
                  fontSize: "0.75rem",
                  color: couponStatus.valid ? "#4ade80" : "#f87171",
                }}
              >
                {couponStatus.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
