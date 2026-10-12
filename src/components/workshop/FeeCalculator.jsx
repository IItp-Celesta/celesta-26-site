"use client";

export default function FeeCalculator({ formValues, feeSummary }) {
  const { workshopFee, accommodationFee, totalAmount } = feeSummary;
  const isIITP = formValues.isIITP === "yes";
  const userType = isIITP ? "IIT Patna Student" : "External Participant";

  return (
    <div className="border border-sky-500/20 p-7 rounded-2xl bg-slate-900/50 shadow-lg flex flex-col gap-6">
      <h3 className="m-0 text-xl font-bold text-slate-50 uppercase tracking-wide">
        2. Fee Breakdown
      </h3>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between text-slate-300 items-center">
          <div className="flex flex-col">
            <span>Registration Fee ({userType})</span>
          </div>
          <div className="flex items-center gap-2">
            {!isIITP && (
              <span className="line-through text-slate-500 text-sm">₹1399</span>
            )}
            {isIITP && (
              <span className="line-through text-slate-500 text-sm">₹799</span>
            )}
            <span className="font-bold text-slate-50 text-lg">
              ₹ {workshopFee}
            </span>
          </div>
        </div>

        {accommodationFee > 0 && (
          <div className="flex justify-between text-slate-300">
            <span>Accommodation Fee ({formValues.accommodationDays} Days)</span>
            <span className="font-bold text-slate-50">
              + ₹ {accommodationFee}
            </span>
          </div>
        )}
      </div>

      <hr className="border-t-2 border-dashed border-slate-700 m-0" />

      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-xl font-extrabold text-slate-50">
            Final Total
          </span>
          <span className="text-xs text-slate-400">
            (Split payments on next step)
          </span>
        </div>
        <span className="text-2xl font-black text-sky-500 drop-shadow-[0_0_15px_rgba(14,165,233,0.4)]">
          ₹ {totalAmount}
        </span>
      </div>
    </div>
  );
}