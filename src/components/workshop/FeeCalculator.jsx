"use client";

export default function FeeCalculator({ formValues, feeSummary }) {
  const { workshopFee, accommodationFee, totalAmount } = feeSummary;
  const isIITP = formValues.isIITP === "yes";
  const userType = isIITP ? "IIT Patna Student" : "External Participant";

  return (
   <div className="border border-teal-500/30 p-6 md:p-8 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col gap-6">
      <h3 className="m-0 text-xl md:text-2xl font-bold text-white uppercase tracking-wider border-b border-white/20 pb-3 state-wide">
        2. Fee Breakdown
      </h3>

      <div className="flex flex-col gap-4 text-base md:text-lg">
        <div className="flex justify-between text-white/80 items-center">
          <div className="flex flex-col">
            <span>Registration Fee ({userType})</span>
          </div>
          <div className="flex items-center gap-3">
            {!isIITP && (
              <span className="line-through text-white/40 text-sm">₹1399</span>
            )}
            {isIITP && (
              <span className="line-through text-white/40 text-sm">₹799</span>
            )}
            <span className="font-bold text-white text-lg md:text-xl">
              ₹ {workshopFee}
            </span>
          </div>
        </div>

        {accommodationFee > 0 && (
          <div className="flex justify-between text-white/80 items-center">
            <span>
              Accommodation Fee ({formValues.accommodationDays} Days)
            </span>
            <span className="font-bold text-white text-lg md:text-xl">
              + ₹ {accommodationFee}
            </span>
          </div>
        )}
      </div>

      <hr className="border-t border-dashed border-white/20 m-0" />

      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-xl font-bold text-white uppercase tracking-wide state-wide">
            Final Total
          </span>
          <span className="text-xs text-white/60">
            (Split payments on next step)
          </span>
        </div>
        <span className="text-2xl md:text-3xl font-black text-[#92EBFF] drop-shadow-[0_0_12px_rgba(146,235,255,0.4)]">
          ₹ {totalAmount}
        </span>
      </div>
    </div>
  );
}