"use client";

export default function Confirmation({ registrationId, formData, feeSummary }) {
  return (
    <div className="p-6 md:p-10 rounded-2xl backdrop-blur-md border border-teal-500/35 shadow-2xl text-center text-white flex flex-col items-center gap-6">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600/20 rounded-full text-teal-400 text-3xl font-bold border-2 border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
        ✓
      </div>

      <h2 className="text-grad race text-2xl md:text-4xl font-bold uppercase tracking-wider m-0">
        Registration Successful!
      </h2>

      <div className="w-full max-w-md mx-auto p-6 rounded-xl bg-black/40 border border-white/20 shadow-2xl text-left flex flex-col gap-4">
        <h4 className="m-0 text-white border-b border-white/20 pb-3 text-lg md:text-xl uppercase tracking-wider state-wide">
          Official Pass Summary
        </h4>

        <div className="flex flex-col gap-3 text-[16px] md:text-[18px]">
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <span className="text-white/60">Registration ID:</span>
            <strong className="font-mono text-[16px] md:text-[18px] text-[#92EBFF]">
              {registrationId}
            </strong>
          </div>

          <div className="flex justify-between items-center gap-2 flex-wrap">
            <span className="text-white/60">Workshop Track:</span>
            <strong className="text-white">{formData.workshop}</strong>
          </div>

          <div className="flex justify-between items-center gap-2 flex-wrap">
            <span className="text-white/60">Attendee:</span>
            <span className="text-white font-medium">{formData.name}</span>
          </div>

          {formData.isIITP === "yes" && (
            <div className="flex justify-between items-center gap-2 flex-wrap">
              <span className="text-white/60">IITP Roll No:</span>
              <span className="font-mono text-white">
                {formData.rollNumber}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center gap-2 flex-wrap">
            <span className="text-white/60">Housing Allocation:</span>
            <span className="text-white font-medium">
              {formData.requireAccommodation === "yes"
                ? "Campus Hostel Booked"
                : "Not Requested"}
            </span>
          </div>

          <hr className="border-t border-dashed border-white/20 my-2" />

          <div className="flex justify-between items-center font-bold text-lg md:text-xl">
            <span className="text-white">Amount Processed:</span>
            <span className="text-teal-400">₹{feeSummary.totalAmount}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 px-6 py-2.5 border-2 border-teal-600 rounded-lg text-white hover:bg-teal-600/20 text-[16px] md:text-[18px] font-semibold transition-colors cursor-pointer"
      >
        Register another attendee
      </button>
    </div>
  );
}