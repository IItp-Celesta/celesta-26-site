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
  const phoneValue = watch("phone");
  const couponField = register("couponCode");

  const isEmailValid = emailValue && !errors.email;
  const isPhoneValid = phoneValue && !errors.phone;

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

  return (
   <div className="w-full flex flex-col gap-6 p-6 md:p-8 rounded-2xl  backdrop-blur-md border border-white/20 shadow-2xl">
      <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider border-b border-white/20 pb-3 state-wide">
        1. Personal &amp; Academic Details
      </h2>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FULL NAME */}
          <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
            <label className="text-white">Full Name *</label>
            <input
              type="text"
              {...register("name")}
              placeholder="Your Name"
              className={getInputClass(errors.name)}
            />
            {errors.name && (
              <span className="text-red-400 text-sm">
                {errors.name.message}
              </span>
            )}
          </div>

          {/* GENDER */}
          <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
            <label className="text-white">Gender *</label>
            <select
              {...register("gender")}
              className={getSelectClass(errors.gender)}
            >
              <option value="" className="bg-neutral-900 text-white">
                Select Gender
              </option>
              <option value="Male" className="bg-neutral-900 text-white">
                Male
              </option>
              <option value="Female" className="bg-neutral-900 text-white">
                Female
              </option>
              <option value="Other" className="bg-neutral-900 text-white">
                Other
              </option>
            </select>
            {errors.gender && (
              <span className="text-red-400 text-sm">
                {errors.gender.message}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* EMAIL */}
          <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
            <label className="text-white flex items-center gap-2 flex-wrap">
              <span>Email Address *</span>
              {isEmailValid ? (
                <span className="text-teal-400 text-base">✓</span>
              ) : (
                errors.email && (
                  <span className="text-red-400 text-xs">
                    ({errors.email.message})
                  </span>
                )
              )}
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="xyz@iitp.ac.in"
              className={getInputClass(errors.email)}
            />
          </div>

          {/* MOBILE NUMBER */}
          <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
            <label className="text-white flex items-center gap-2 flex-wrap">
              <span>Mobile Number *</span>
              {isPhoneValid ? (
                <span className="text-teal-400 text-base">✓</span>
              ) : (
                errors.phone && (
                  <span className="text-red-400 text-xs">
                    ({errors.phone.message})
                  </span>
                )
              )}
            </label>
            <input
              type="text"
              {...register("phone")}
              placeholder="9876543210"
              className={getInputClass(errors.phone)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* COLLEGE */}
          <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
            <label className="text-white">College / School *</label>
            <input
              type="text"
              {...register("college")}
              placeholder="IIT Patna"
              className={getInputClass(errors.college)}
            />
            {errors.college && (
              <span className="text-red-400 text-sm">
                {errors.college.message}
              </span>
            )}
          </div>

          {/* CITY / STATE */}
          <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
            <label className="text-white">City / State *</label>
            <input
              type="text"
              {...register("cityState")}
              placeholder="Patna, Bihar"
              className={getInputClass(errors.cityState)}
            />
            {errors.cityState && (
              <span className="text-red-400 text-sm">
                {errors.cityState.message}
              </span>
            )}
          </div>
        </div>

        {/* WORKSHOP TRACK */}
        <div className="flex flex-col gap-2 text-[16px] md:text-[18px] w-full">
          <label className="text-white">Workshop Applying For *</label>
          <select
            {...register("workshop")}
            className={getSelectClass(errors.workshop)}
          >
            <option value="" className="bg-neutral-900 text-white">
              Choose Technology Track
            </option>
            <option
              value="Artificial Intelligence"
              className="bg-neutral-900 text-white"
            >
              Artificial Intelligence
            </option>
            <option
              value="Ethical Hacking"
              className="bg-neutral-900 text-white"
            >
              Ethical Hacking
            </option>
            <option
              value="Drone Technology"
              className="bg-neutral-900 text-white"
            >
              Robotics
            </option>
          </select>
          {errors.workshop && (
            <span className="text-red-400 text-sm">
              {errors.workshop.message}
            </span>
          )}
        </div>

        {/* IITP STATUS */}
        <div className="p-4 md:p-5 rounded-xl bg-white/[0.05] border border-white/20 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2">
              <label className="text-[16px] md:text-[18px] font-semibold text-white">
                Are you an IIT Patna Student? *
              </label>

              <button
                type="button"
                onClick={() => setShowPrograms(!showPrograms)}
                className={`p-1 rounded-full transition-colors ${
                  showPrograms
                    ? "text-teal-400"
                    : "text-white/60 hover:text-white"
                }`}
                aria-label="Toggle eligible programs info"
              >
                <svg
                  width="20"
                  height="20"
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

            {showPrograms && (
              <div className="mt-2 inline-block text-xs md:text-sm text-teal-200 bg-teal-600/20 px-3 py-1.5 rounded-lg border-l-4 border-teal-400">
                Only for offline degree students
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="cursor-pointer flex items-center gap-2 text-white/90 text-base md:text-lg">
              <input
                type="radio"
                value="yes"
                {...register("isIITP")}
                className="accent-teal-500 w-4 h-4"
              />
              Yes, I am
            </label>
            <label className="cursor-pointer flex items-center gap-2 text-white/90 text-base md:text-lg">
              <input
                type="radio"
                value="no"
                {...register("isIITP")}
                className="accent-teal-500 w-4 h-4"
              />
              No, another college
            </label>
          </div>

          {isIITP === "yes" && (
            <div className="flex flex-col gap-2 text-[16px] md:text-[18px] pt-2">
              <label className="text-teal-400 text-base md:text-lg font-medium">
                Roll Number *
              </label>
              <input
                type="text"
                maxLength={8}
                placeholder="e.g. 2501ES09"
                {...register("rollNumber", {
                  setValueAs: (value) => value.toUpperCase(),
                })}
                className={getInputClass(errors.rollNumber)}
              />
              {errors.rollNumber && (
                <span className="text-red-400 text-sm">
                  {errors.rollNumber.message}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ACCOMMODATION */}
        <div className="flex flex-col gap-3">
          <label className="text-[16px] md:text-[18px] font-semibold text-white">
            Accommodation
          </label>

          {isIITP === "no" ? (
            <div className="flex flex-col gap-4">
              <span className="text-sm md:text-base text-white/70">
                Do you require accommodation on campus? (+₹249/day)
              </span>
              <div className="flex gap-8">
                <label className="cursor-pointer text-white/90 flex items-center gap-2 text-base md:text-lg">
                  <input
                    type="radio"
                    value="yes"
                    {...register("requireAccommodation")}
                    className="accent-teal-500 w-4 h-4"
                  />
                  Yes
                </label>

                <label className="cursor-pointer text-white/90 flex items-center gap-2 text-base md:text-lg">
                  <input
                    type="radio"
                    value="no"
                    {...register("requireAccommodation")}
                    className="accent-teal-500 w-4 h-4"
                  />
                  No
                </label>
              </div>

              {watch("requireAccommodation") === "yes" && (
                <div className="flex flex-col gap-3 mt-2">
                  <label className="text-base md:text-lg font-medium text-teal-400">
                    Number of Accommodation Days
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="cursor-pointer p-3.5 border-2 border-white/30 hover:border-teal-600 rounded-lg flex items-center gap-3 text-white bg-white/[0.03] transition-colors">
                      <input
                        type="radio"
                        value="1"
                        {...register("accommodationDays")}
                        className="accent-teal-500 w-4 h-4"
                      />
                      <span>
                        <strong className="text-white block">1 Day</strong>
                        <small className="text-white/60">₹249</small>
                      </span>
                    </label>

                    <label className="cursor-pointer p-3.5 border-2 border-white/30 hover:border-teal-600 rounded-lg flex items-center gap-3 text-white bg-white/[0.03] transition-colors">
                      <input
                        type="radio"
                        value="2"
                        {...register("accommodationDays")}
                        className="accent-teal-500 w-4 h-4"
                      />
                      <span>
                        <strong className="text-white block">2 Days</strong>
                        <small className="text-white/60">₹498</small>
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-teal-600/20 border border-teal-500/40 text-teal-300 text-sm md:text-base font-medium">
              Not Required
            </div>
          )}
        </div>

        {/* COUPON CODE */}
        {isIITP === "no" && (
          <div className="flex flex-col gap-2 text-[16px] md:text-[18px]">
            <label className="text-white">Coupon Code</label>

            <div className="flex gap-3">
              <input
                type="text"
                {...couponField}
                placeholder="Enter code"
                onChange={(e) => {
                  couponField.onChange(e);
                  setCouponStatus(null);
                }}
                className={getInputClass(false)}
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
                className="px-6 py-2 border-2 border-teal-600 rounded-lg text-white text-base font-semibold hover:bg-teal-600/20 transition-colors cursor-pointer shrink-0"
              >
                Apply
              </button>
            </div>

            {couponStatus && (
              <div
                className={`text-sm mt-1 ${
                  couponStatus.valid ? "text-teal-400" : "text-red-400"
                }`}
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
