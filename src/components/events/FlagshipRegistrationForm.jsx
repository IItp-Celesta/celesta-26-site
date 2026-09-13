"use client";

import React from "react";

export default function FlagshipRegistrationForm({
  register,
  errors,
  watch
}) {
  const numMembers = watch("numMembers", "1");

  // Reusable styles based on the workshop form
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

  const getMemberError = (index, field) => {
    return errors?.members?.[index]?.[field];
  };

  return (
    <div
      style={{
        border: "1px solid rgba(14, 165, 233, 0.2)",
        padding: "2rem",
        borderRadius: "16px",
        backgroundColor: "rgba(30, 41, 59, 0.4)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        gap: "2.5rem",
      }}
    >
      {/* TEAM INFO SECTION */}
      <div>
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
          1. Team Information
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem", color: "#cbd5e1" }}>
              Team Name *
            </label>
            <input
              type="text"
              {...register("teamName", { required: "Team Name is required" })}
              placeholder="Enter Team Name"
              style={inputStyle(errors.teamName)}
            />
            {errors.teamName && (
              <span style={{ color: "#f87171", fontSize: "0.85rem", marginTop: "4px", display: "block" }}>
                {errors.teamName.message}
              </span>
            )}
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem", color: "#cbd5e1" }}>
              Overall College *
            </label>
            <input
              type="text"
              {...register("college", { required: "College is required" })}
              placeholder="Enter College Name"
              style={inputStyle(errors.college)}
            />
            {errors.college && (
              <span style={{ color: "#f87171", fontSize: "0.85rem", marginTop: "4px", display: "block" }}>
                {errors.college.message}
              </span>
            )}
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.9rem", color: "#cbd5e1" }}>
              Number of Team Members *
            </label>
            <select
              {...register("numMembers", { required: true })}
              style={selectStyle(errors.numMembers)}
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* MEMBER INFO SECTION */}
      <div>
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
          2. Member Details
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {Array.from({ length: parseInt(numMembers || 1) }).map((_, index) => (
            <div 
              key={index} 
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.4)",
                padding: "1.5rem",
                borderRadius: "10px",
                border: "1px solid #334155",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#e2e8f0" }}>
                Member {index + 1} {index === 0 ? "(Team Leader)" : ""}
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.85rem", color: "#cbd5e1" }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    {...register(`members.${index}.name`, { required: "Name is required" })}
                    placeholder="Full Name"
                    style={inputStyle(getMemberError(index, "name"))}
                  />
                  {getMemberError(index, "name") && (
                    <span style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
                      {getMemberError(index, "name").message}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.85rem", color: "#cbd5e1" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    {...register(`members.${index}.email`, { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "invalid email address"
                      }
                    })}
                    placeholder="Email Address"
                    style={inputStyle(getMemberError(index, "email"))}
                  />
                  {getMemberError(index, "email") && (
                    <span style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
                      {getMemberError(index, "email").message}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.85rem", color: "#cbd5e1" }}>
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    {...register(`members.${index}.phone`, { required: "Phone is required" })}
                    placeholder="Mobile Number"
                    style={inputStyle(getMemberError(index, "phone"))}
                  />
                  {getMemberError(index, "phone") && (
                    <span style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
                      {getMemberError(index, "phone").message}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.85rem", color: "#cbd5e1" }}>
                    Gender *
                  </label>
                  <select
                    {...register(`members.${index}.gender`, { required: "Gender is required" })}
                    style={selectStyle(getMemberError(index, "gender"))}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {getMemberError(index, "gender") && (
                    <span style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
                      {getMemberError(index, "gender").message}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.85rem", color: "#cbd5e1" }}>
                    College *
                  </label>
                  <input
                    type="text"
                    {...register(`members.${index}.college`, { required: "College is required" })}
                    placeholder="College Name"
                    style={inputStyle(getMemberError(index, "college"))}
                  />
                  {getMemberError(index, "college") && (
                    <span style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
                      {getMemberError(index, "college").message}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", fontSize: "0.85rem", color: "#cbd5e1" }}>
                    Aadhaar Card Upload (PDF/Image) *
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    {...register(`members.${index}.aadhaar`, { required: "Aadhaar Card is required" })}
                    style={{
                      ...inputStyle(getMemberError(index, "aadhaar")),
                      padding: "0.5rem",
                      cursor: "pointer",
                      backgroundColor: "rgba(14, 165, 233, 0.1)",
                    }}
                  />
                  {getMemberError(index, "aadhaar") && (
                    <span style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "4px", display: "block" }}>
                      {getMemberError(index, "aadhaar").message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
