"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FaCalculator, FaCoins, FaInfoCircle, FaCalendarAlt, FaUser,
  FaWhatsapp, FaArrowRight, FaUndo, FaCar, FaShieldAlt
} from "react-icons/fa";

export default function LoanCalculatorPage() {
  const router = useRouter();

  // Client Details Form (Optional for transfer)
  const [clientName, setClientName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  
  // Financing variables
  const [carValue, setCarValue] = useState("35000000");
  const [downPaymentPercent, setDownPaymentPercent] = useState(20); // 10 or 20

  const financingDetails = useMemo(() => {
    const value = parseFloat(carValue) || 0;
    const downPayment = value * (downPaymentPercent / 100);
    const loanPrincipal = value - downPayment;
    const totalInterest = loanPrincipal * 0.15 * 5; // flat 15% interest for 5 years
    const totalCredit = loanPrincipal + totalInterest;
    
    // Fixed daily costs
    const insuranceDaily = 1300000 / 365;
    const ruraDaily = (30000 * 4) / 365; // 30,000 every 3 months = 120,000 / 365
    const rraDaily = (22500 * 4) / 365; // 22,500 every 3 months = 90,000 / 365
    const roadLevyDaily = 50000 / 365;
    const totalFixedDaily = insuranceDaily + ruraDaily + rraDaily + roadLevyDaily; // 4273.97

    const dailyLoanRepayment = totalCredit / 1825;
    const dailyPayment = dailyLoanRepayment + totalFixedDaily;

    return {
      downPayment: Math.round(downPayment),
      loanPrincipal: Math.round(loanPrincipal),
      totalInterest: Math.round(totalInterest),
      totalCredit: Math.round(totalCredit),
      insuranceDaily: Math.round(insuranceDaily),
      ruraDaily: Math.round(ruraDaily),
      rraDaily: Math.round(rraDaily),
      roadLevyDaily: Math.round(roadLevyDaily),
      totalFixedDaily: Math.round(totalFixedDaily),
      dailyLoanRepayment: Math.round(dailyLoanRepayment),
      dailyPayment: Math.round(dailyPayment)
    };
  }, [carValue, downPaymentPercent]);

  const handleReset = () => {
    setClientName("");
    setWhatsappNumber("");
    setCarValue("35000000");
    setDownPaymentPercent(20);
  };

  const handleApplyToRoster = () => {
    // Redirect to client-credit with query params
    const params = new URLSearchParams({
      mode: "create-loan",
      carValue: carValue,
      downPayment: downPaymentPercent.toString(),
    });
    router.push(`/staff/client-credit?${params.toString()}`);
  };

  return (
    <div className="space-y-6 pb-12 px-8 pt-8">
      {/* Title Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase flex items-center gap-3">
          <FaCalculator className="text-orange-500" /> Loan Repayment Calculator
        </h1>
        <p className="text-xs text-slate-500 font-medium tracking-wide mt-0.5">
          Evaluate vehicle financing scenarios, flat interest rates, and regulatory operational expenses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side - Configuration Inputs */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <FaCar className="text-slate-500" /> Financing Setup
            </h3>
          </div>

          {/* Car Value */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Vehicle Value (RWF)</label>
            <div className="relative">
              <input
                type="number"
                className="input-shadcn pl-3 text-sm font-bold"
                value={carValue}
                onChange={(e) => setCarValue(e.target.value)}
              />
            </div>
          </div>

          {/* Down Payment Options */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Down Payment</label>
            <div className="flex gap-3">
              {[10, 20].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDownPaymentPercent(pct)}
                  className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider border transition-all ${
                    downPaymentPercent === pct
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {pct}% Down
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 font-medium leading-relaxed">
              Down payment covers the upfront acquisition. Remaining balance is financed through the bank loan.
            </p>
          </div>

          {/* Locked Parameters Info */}
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg text-[10px] text-slate-500 space-y-2">
            <div className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <FaInfoCircle className="text-blue-500" /> Fixed Loan Terms:
            </div>
            <div className="grid grid-cols-2 gap-2 font-medium">
              <div>• Interest Rate: <span className="font-bold text-slate-800">15% Flat Annual</span></div>
              <div>• Duration: <span className="font-bold text-slate-800">5 Years (1,825 Days)</span></div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex gap-3">
            <button
              onClick={handleReset}
              className="btn-shadcn-secondary flex items-center justify-center gap-2 text-xs flex-1"
            >
              <FaUndo className="text-[10px]" /> Reset fields
            </button>
            <button
              onClick={handleApplyToRoster}
              className="btn-shadcn-primary flex items-center justify-center gap-2 text-xs flex-[2] active:scale-95"
            >
              Apply to Roster <FaArrowRight className="text-[10px]" />
            </button>
          </div>
        </div>

        {/* Right Side - Live Calculation Breakdown */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="bg-slate-900 text-slate-100 p-5 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block leading-none">Expected Daily Collection</span>
              <span className="text-2xl font-black tracking-tight block mt-2.5 text-orange-400">{financingDetails.dailyPayment.toLocaleString()} RWF</span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 text-right">
              <div className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">Total Outstanding</div>
              <div className="text-xs font-black text-white mt-0.5">{financingDetails.totalCredit.toLocaleString()} RWF</div>
            </div>
          </div>

          {/* Breakdown Content */}
          <div className="p-5 space-y-5">
            {/* Stage 1: Initial Acquisition */}
            <div>
              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-2 border-b border-slate-100 pb-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[8px] font-bold">1</span> Initial Car Purchase Breakdown
              </h4>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Car Value</div>
                  <div className="font-extrabold text-slate-800 mt-1">{(parseFloat(carValue) || 0).toLocaleString()} RWF</div>
                </div>
                <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Advance ({downPaymentPercent}%)</div>
                  <div className="font-extrabold text-emerald-600 mt-1">{financingDetails.downPayment.toLocaleString()} RWF</div>
                </div>
                <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Financed Principal</div>
                  <div className="font-extrabold text-slate-800 mt-1">{financingDetails.loanPrincipal.toLocaleString()} RWF</div>
                </div>
              </div>
            </div>

            {/* Stage 2: Financing Breakdown */}
            <div>
              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-2 border-b border-slate-100 pb-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[8px] font-bold">2</span> Bank Loan & Flat Interest
              </h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Flat Interest (15%/yr for 5 yrs)</div>
                  <div className="font-extrabold text-red-500 mt-1">{financingDetails.totalInterest.toLocaleString()} RWF</div>
                </div>
                <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Daily Repayment (1,825 days)</div>
                  <div className="font-extrabold text-slate-800 mt-1">{financingDetails.dailyLoanRepayment.toLocaleString()} RWF / day</div>
                </div>
              </div>
            </div>

            {/* Stage 3: Operational Costs */}
            <div>
              <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-2 border-b border-slate-100 pb-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[8px] font-bold">3</span> Fixed Regulatory & Operational Costs
              </h4>
              
              <div className="border border-slate-100 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left divide-y divide-slate-100">
                  <thead className="bg-slate-50 font-bold text-[9px] text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-1.5">Expense Item</th>
                      <th className="px-3 py-1.5">Periodical Amount</th>
                      <th className="px-3 py-1.5 text-right">Daily Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                    <tr>
                      <td className="px-3 py-2">Insurance</td>
                      <td className="px-3 py-2">1,300,000 RWF / Year</td>
                      <td className="px-3 py-2 text-right">{financingDetails.insuranceDaily.toLocaleString()} RWF</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">RURA Authorization Fee</td>
                      <td className="px-3 py-2">30,000 RWF / 3 Months</td>
                      <td className="px-3 py-2 text-right">{financingDetails.ruraDaily.toLocaleString()} RWF</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">RRA Income Tax Contribution</td>
                      <td className="px-3 py-2">22,500 RWF / 3 Months</td>
                      <td className="px-3 py-2 text-right">{financingDetails.rraDaily.toLocaleString()} RWF</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">National Road Levy</td>
                      <td className="px-3 py-2">50,000 RWF / Year</td>
                      <td className="px-3 py-2 text-right">{financingDetails.roadLevyDaily.toLocaleString()} RWF</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td className="px-3 py-2" colSpan={2}>Total Daily Fixed Expenses</td>
                      <td className="px-3 py-2 text-right text-emerald-600">{financingDetails.totalFixedDaily.toLocaleString()} RWF / day</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stage 4: Summary Alert */}
            <div className="bg-orange-50 border border-orange-100/80 p-3.5 rounded-lg text-[10px] text-orange-800 leading-relaxed font-medium flex gap-2.5 items-start">
              <FaInfoCircle className="text-orange-500 text-sm shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Scenario Formula Summary:</span> Total Daily Collection is compiled by adding the daily loan amortization rate (Principal {financingDetails.loanPrincipal.toLocaleString()} RWF + 5-Yr Interest {financingDetails.totalInterest.toLocaleString()} RWF = {financingDetails.totalCredit.toLocaleString()} RWF over 1,825 days) to the fixed operational expenses (equivalent to {financingDetails.totalFixedDaily.toLocaleString()} RWF/day).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
