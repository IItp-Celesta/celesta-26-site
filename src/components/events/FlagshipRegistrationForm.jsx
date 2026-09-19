"use client";
import React, { useState, useEffect } from "react";

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

  const totalAmount = numMembersInt * (eventFee || 0);

  useEffect(() => {
    setExpandedMember((current) =>
      current !== null && current > numMembersInt - 1
        ? numMembersInt - 1
        : current,
    );
  }, [numMembersInt]);

  const getInputClass = (hasError) =>
    `w-full p-[0.7rem] rounded-lg bg-slate-900/60 border text-slate-50 outline-none text-[0.9rem] transition-colors ${
      hasError ? "border-red-500" : "border-slate-700 focus:border-sky-500"
    }`;

  const getMemberError = (index, field) => {
    return errors?.members?.[index]?.[field];
  };

  return (
    <div className="border border-sky-500/20 p-8 rounded-2xl bg-slate-800/40 flex flex-col gap-10">
      <div>
        <h2 className="mt-0 mb-6 text-[1.3rem] font-bold text-slate-50 border-b border-slate-700 pb-3">
          1. Team Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 font-semibold text-[0.9rem] text-slate-300">
              Team Name *
            </label>
            <input
              type="text"
              {...register("teamName", { required: "Team Name is required" })}
              placeholder="Enter Team Name"
              className={getInputClass(errors.teamName)}
            />
            {errors.teamName && (
              <span className="text-red-400 text-[0.85rem] mt-1 block">
                {errors.teamName.message}
              </span>
            )}
          </div>

          <div>
            <label className="block mb-2 font-semibold text-[0.9rem] text-slate-300">
              College *
            </label>
            <input
              type="text"
              {...register("college", { required: "College is required" })}
              placeholder="Enter College Name"
              className={getInputClass(errors.college)}
            />
            {errors.college && (
              <span className="text-red-400 text-[0.85rem] mt-1 block">
                {errors.college.message}
              </span>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 font-semibold text-[0.9rem] text-slate-300">
              Number of Team Members *
            </label>
            <select
              {...register("numMembers", { required: true })}
              className={`${getInputClass(
                errors.numMembers,
              )} max-w-[300px] h-[44px] !bg-slate-900 cursor-pointer`}
            >
              {Array.from(
                { length: maxTeamSize - minTeamSize + 1 },
                (_, i) => minTeamSize + i,
              ).map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "Member" : "Members"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* MEMBER INFO SECTION */}
      <div>
        <h2 className="mt-0 mb-6 text-[1.3rem] font-bold text-slate-50 border-b border-slate-700 pb-3">
          2. Member Details
        </h2>

        <div className="flex flex-col gap-4">
          {Array.from({ length: numMembersInt }).map((_, index) => {
            const isExpanded = expandedMember === index;
            const hasError = !!errors?.members?.[index];

            return (
              <div
                key={index}
                className={`bg-slate-900/40 rounded-xl border flex flex-col overflow-hidden ${
                  hasError && !isExpanded
                    ? "border-red-500"
                    : "border-slate-700"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedMember(isExpanded ? null : index)}
                  className={`w-full p-6 text-left border-none cursor-pointer flex justify-between items-center ${
                    isExpanded
                      ? "bg-sky-500/10 border-b border-slate-700/50"
                      : "bg-transparent"
                  }`}
                >
                  <h3
                    className={`m-0 text-[1.1rem] font-semibold ${
                      isExpanded ? "text-sky-400" : "text-slate-200"
                    }`}
                  >
                    Member {index + 1} {index === 0 ? "(Team Leader)" : ""}
                  </h3>
                  <div className="flex items-center gap-3">
                    {hasError && !isExpanded && (
                      <span className="text-red-400 text-[0.85rem] font-semibold">
                        Incomplete
                      </span>
                    )}
                    <span
                      className={`font-bold ${
                        isExpanded ? "text-sky-400" : "text-slate-400"
                      }`}
                    >
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 bg-transparent">
                    <div>
                      <label className="block mb-2 font-semibold text-[0.85rem] text-slate-300">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        {...register(`members.${index}.name`, {
                          required: "Name is required",
                        })}
                        placeholder="Full Name"
                        className={getInputClass(getMemberError(index, "name"))}
                      />
                      {getMemberError(index, "name") && (
                        <span className="text-red-400 text-[0.8rem] mt-1 block">
                          {getMemberError(index, "name").message}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold text-[0.85rem] text-slate-300">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        {...register(`members.${index}.email`, {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "invalid email address",
                          },
                        })}
                        placeholder="Email Address"
                        className={getInputClass(
                          getMemberError(index, "email"),
                        )}
                      />
                      {getMemberError(index, "email") && (
                        <span className="text-red-400 text-[0.8rem] mt-1 block">
                          {getMemberError(index, "email").message}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold text-[0.85rem] text-slate-300">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        {...register(`members.${index}.phone`, {
                          required: "Phone is required",
                        })}
                        placeholder="Mobile Number"
                        className={getInputClass(
                          getMemberError(index, "phone"),
                        )}
                      />
                      {getMemberError(index, "phone") && (
                        <span className="text-red-400 text-[0.8rem] mt-1 block">
                          {getMemberError(index, "phone").message}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold text-[0.85rem] text-slate-300">
                        Gender *
                      </label>
                      <select
                        {...register(`members.${index}.gender`, {
                          required: "Gender is required",
                        })}
                        className={`${getInputClass(
                          getMemberError(index, "gender"),
                        )} h-11 bg-slate-900! cursor-pointer`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {getMemberError(index, "gender") && (
                        <span className="text-red-400 text-[0.8rem] mt-1 block">
                          {getMemberError(index, "gender").message}
                        </span>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2 font-semibold text-[0.85rem] text-slate-300">
                        Aadhaar / College ID Upload (PNG / JPEG / JPG) *
                      </label>
                      <div
                        className={`p-2 border border-dashed rounded-lg ${
                          getMemberError(index, "aadhaar")
                            ? "border-red-500"
                            : "border-sky-500/30"
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          {...register(`members.${index}.aadhaar`, {
                            required: "ID is required",
                          })}
                          className="w-full text-sm text-slate-400 
                            file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                            file:text-[0.85rem] file:font-bold file:bg-slate-800 file:text-slate-300
                            hover:file:bg-slate-700 file:cursor-pointer cursor-pointer"
                        />
                      </div>
                      {getMemberError(index, "aadhaar") && (
                        <span className="text-red-400 text-[0.8rem] mt-1 block">
                          {getMemberError(index, "aadhaar").message}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ADD TO CART SUMMARY */}
      <div className="border border-sky-500/20 p-6 rounded-2xl bg-slate-900/80 flex flex-col gap-4">
        <h3 className="m-0 text-[1.2rem] font-bold text-slate-50">
          3. Checkout Summary
        </h3>

        <div className="flex justify-between items-center text-slate-300 pb-4">
          <span>
            {/* STRIPPED FALLBACK HERE AS WELL */}
            Registration Fee (₹{eventFee} × {numMembersInt})
          </span>
          <span className="text-2xl font-extrabold text-sky-400">
            ₹{totalAmount}
          </span>
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className={`mt-2 p-4 rounded-lg font-bold text-[1.1rem] transition-colors border-none ${
            isUploading
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "cursor-pointer text-black bg-sky-400 hover:bg-sky-300"
          }`}
        >
          {isUploading
            ? "Uploading Documents..."
            : `Add to Cart (₹${totalAmount})`}
        </button>
      </div>
    </div>
  );
}
