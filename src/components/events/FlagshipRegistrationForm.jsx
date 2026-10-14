"use client";
import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import styles from "@/app/register/Register.module.css";

export default function FlagshipRegistrationForm({
  register,
  errors,
  watch,
  eventFee,
  isUploading,
  minTeamSize = 1,
  maxTeamSize = 5,
}) {
  const [expandedMember, setExpandedMember] = useState(0);

  const numMembers = watch("numMembers", String(minTeamSize));
  const numMembersInt = parseInt(numMembers || String(minTeamSize), 10);

  const numBots = watch("numBots", "1");
  const numBotsInt = parseInt(numBots || "1", 10);

  const totalAmount = (eventFee || 0) * numBotsInt;

  useEffect(() => {
    setExpandedMember((current) =>
      current !== null && current > numMembersInt - 1
        ? numMembersInt - 1
        : current,
    );
  }, [numMembersInt]);

  const getInputClass = (hasError) =>
    `p-2.5 border-2 rounded-lg text-white bg-transparent w-full focus:outline-none focus:ring-0 transition-colors placeholder:text-white/40 ${
      hasError
        ? "border-red-500 focus:border-red-500"
        : "border-white/80 focus:border-teal-600"
    }`;

  const getSelectClass = (hasError) =>
    `p-2.5 border-2 rounded-lg text-white bg-transparent w-full focus:outline-none focus:ring-0 cursor-pointer transition-colors ${
      hasError
        ? "border-red-500 focus:border-red-500"
        : "border-white/80 focus:border-teal-600"
    }`;

  const getMemberError = (index, field) => {
    return errors?.members?.[index]?.[field];
  };

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8">
      {/* ─── SECTION 1 & 2: MAIN GLASSMORPHIC CARD ──────────────────────────── */}
      <div className="w-full flex flex-col gap-6 p-6 md:p-8 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl">
        {/* TEAM INFORMATION HEADER */}
        <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider border-b border-white/20 pb-3 state-wide m-0">
          1. Team Information
        </h2>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team Name */}
            <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
              <label className="text-white">Team Name *</label>
              <input
                type="text"
                {...register("teamName", { required: "Team Name is required" })}
                placeholder="Enter Team Name"
                className={getInputClass(errors.teamName)}
              />
              {errors.teamName && (
                <span className="text-red-400 text-sm">
                  {errors.teamName.message}
                </span>
              )}
            </div>

            {/* College */}
            <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
              <label className="text-white">College *</label>
              <input
                type="text"
                {...register("college", { required: "College is required" })}
                placeholder="IIT Patna"
                className={getInputClass(errors.college)}
              />
              {errors.college && (
                <span className="text-red-400 text-sm">
                  {errors.college.message}
                </span>
              )}
            </div>

            {/* Num Members */}
            <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
              <label className="text-white">Number of Team Members *</label>
              <select
                {...register("numMembers", { required: true })}
                className={getSelectClass(errors.numMembers)}
              >
                {Array.from(
                  { length: maxTeamSize - minTeamSize + 1 },
                  (_, i) => minTeamSize + i,
                ).map((num) => (
                  <option
                    key={num}
                    value={num}
                    className="bg-neutral-900 text-white"
                  >
                    {num} {num === 1 ? "Member" : "Members"}
                  </option>
                ))}
              </select>
            </div>

            {/* Num Bots */}
            <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
              <label className="text-white">
                Number of Bots (If applicable)
              </label>
              <select
                {...register("numBots")}
                className={getSelectClass(errors.numBots)}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option
                    key={num}
                    value={num}
                    className="bg-neutral-900 text-white"
                  >
                    {num} {num === 1 ? "Bot" : "Bots"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* MEMBER DETAILS HEADER */}
        <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider border-b border-white/20 pb-3 state-wide m-0 mt-4">
          2. Member Details
        </h2>

        {/* ACCORDION PANELS */}
        <div className="flex flex-col gap-4">
          {Array.from({ length: numMembersInt }).map((_, index) => {
            const isExpanded = expandedMember === index;
            const hasError = !!errors?.members?.[index];

            return (
              <div
                key={index}
                className={`rounded-xl border flex flex-col overflow-hidden bg-white/[0.05] transition-colors ${
                  hasError && !isExpanded ? "border-red-500" : "border-white/20"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedMember(isExpanded ? null : index)}
                  className={`w-full p-4 md:p-5 text-left border-none cursor-pointer flex justify-between items-center transition-colors ${
                    isExpanded
                      ? "bg-teal-600/20 border-b border-white/20"
                      : "bg-transparent hover:bg-white/[0.02]"
                  }`}
                >
                  <h3
                    className={`m-0 text-[16px] md:text-[18px] font-semibold ${
                      isExpanded ? "text-teal-400" : "text-white/90"
                    }`}
                  >
                    Member {index + 1} {index === 0 ? "(Team Leader)" : ""}
                  </h3>
                  <div className="flex items-center gap-3">
                    {hasError && !isExpanded && (
                      <span className="text-red-400 text-sm font-semibold">
                        Incomplete
                      </span>
                    )}
                    <span
                      className={`font-bold ${
                        isExpanded ? "text-teal-400" : "text-white/60"
                      }`}
                    >
                      {isExpanded ? "▼" : "▶"}
                    </span>
                  </div>
                </button>

                <div
                  className={`p-4 md:p-5 grid-cols-1 md:grid-cols-2 gap-6 bg-transparent ${
                    isExpanded ? "grid" : "hidden"
                  }`}
                >
                  {/* Name */}
                  <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
                    <label className="text-white">Full Name *</label>
                    <input
                      type="text"
                      {...register(`members.${index}.name`, {
                        required: "Name is required",
                      })}
                      placeholder="Your Name"
                      className={getInputClass(getMemberError(index, "name"))}
                    />
                    {getMemberError(index, "name") && (
                      <span className="text-red-400 text-sm">
                        {getMemberError(index, "name").message}
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
                    <label className="text-white">Email Address *</label>
                    <input
                      type="email"
                      {...register(`members.${index}.email`, {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      placeholder="xyz@college.ac.in"
                      className={getInputClass(getMemberError(index, "email"))}
                    />
                    {getMemberError(index, "email") && (
                      <span className="text-red-400 text-sm">
                        {getMemberError(index, "email").message}
                      </span>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
                    <label className="text-white">Mobile Number *</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      {...register(`members.${index}.phone`, {
                        required: "Phone is required",
                      })}
                      placeholder="9876543210"
                      className={getInputClass(getMemberError(index, "phone"))}
                    />
                    {getMemberError(index, "phone") && (
                      <span className="text-red-400 text-sm">
                        {getMemberError(index, "phone").message}
                      </span>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
                    <label className="text-white">Gender *</label>
                    <select
                      {...register(`members.${index}.gender`, {
                        required: "Gender is required",
                      })}
                      className={getSelectClass(
                        getMemberError(index, "gender"),
                      )}
                    >
                      <option value="" className="bg-neutral-900 text-white">
                        Select Gender
                      </option>
                      <option
                        value="Male"
                        className="bg-neutral-900 text-white"
                      >
                        Male
                      </option>
                      <option
                        value="Female"
                        className="bg-neutral-900 text-white"
                      >
                        Female
                      </option>
                      <option
                        value="Other"
                        className="bg-neutral-900 text-white"
                      >
                        Other
                      </option>
                    </select>
                    {getMemberError(index, "gender") && (
                      <span className="text-red-400 text-sm">
                        {getMemberError(index, "gender").message}
                      </span>
                    )}
                  </div>

                  {/* Aadhaar File Upload */}
                  <div className="md:col-span-2 flex flex-col gap-2 text-[16px] md:text-[18px] w-full mt-2">
                    <label className="text-white">
                      Aadhaar (PNG / JPEG / JPG) *
                    </label>
                    <label
                      className={`border-2 border-dashed rounded-xl p-4 md:p-6 text-center transition-all flex flex-col items-center gap-2 bg-white/[0.02] cursor-pointer ${
                        getMemberError(index, "aadhaar")
                          ? "border-red-500 hover:bg-red-500/10"
                          : "border-white/40 hover:border-teal-500 hover:bg-teal-600/10"
                      }`}
                    >
                      <span className="text-[14px] md:text-[16px] text-white/90 font-medium mb-1">
                        Click to Upload Image
                      </span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        {...register(`members.${index}.aadhaar`, {
                          required: "ID is required",
                        })}
                        className="block w-full max-w-xs text-[14px] text-white/70 mx-auto
                          file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0
                          file:text-[14px] file:font-semibold file:bg-teal-600/20 file:text-teal-400
                          hover:file:bg-teal-600/30 file:cursor-pointer cursor-pointer transition-colors"
                      />
                    </label>
                    {getMemberError(index, "aadhaar") && (
                      <span className="text-red-400 text-sm mt-1">
                        {getMemberError(index, "aadhaar").message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── SECTION 3: CHECKOUT SUMMARY ────────────────────────── */}
      <div className="border border-teal-500/30 p-6 md:p-8 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col gap-6">
        <h3 className="m-0 text-lg md:text-xl font-bold text-white uppercase tracking-wider border-b border-white/20 pb-3 state-wide">
          3. Checkout Summary
        </h3>

        <div className="flex flex-col gap-4 text-[16px] md:text-[18px]">
          <div className="flex justify-between text-white/80 items-center">
            <span>Registration Fee</span>
            <span className="font-bold text-white text-lg md:text-xl">
              ₹ {totalAmount}
            </span>
          </div>
        </div>

        <hr className="border-t border-dashed border-white/20 m-0" />

        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-bold text-white uppercase tracking-wide state-wide">
              Final Total
            </span>
          </div>
          <span className="text-2xl md:text-3xl font-black text-[#92EBFF] drop-shadow-[0_0_12px_rgba(146,235,255,0.4)]">
            ₹ {totalAmount}
          </span>
        </div>

        <div className="flex justify-center mt-2">
          <button
            type="submit"
            disabled={isUploading}
            className={`${styles.btn} flex items-center justify-center gap-3 text-[16px] md:text-[18px] w-full md:w-auto px-10 ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isUploading ? (
              "Uploading Documents..."
            ) : (
              <>
                Add to Cart (₹{totalAmount})
                <ArrowRight size={22} className="inline ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
