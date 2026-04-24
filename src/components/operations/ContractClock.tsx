"use client";

import React from "react";
import { motion } from "framer-motion";

interface ClockProps {
  contractId: string;
  startDate: Date | string | null;
  dailyRate: number;
  totalPaid: number;
  totalPrice: number;
  termMonths: number;
  maturityDate: Date | string | null;
  status: string;
}

export const ContractClock = ({ startDate, dailyRate, totalPaid, totalPrice, termMonths, maturityDate, status }: ClockProps) => {
  if (status === "PENDING" || status === "READY_FOR_RELEASE") {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
        <h3 className="font-bold text-gray-700 mb-2">Contract Not Started</h3>
        <p className="text-sm text-gray-500 mb-4">The vehicle has not been released yet.</p>
        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold">
          Status: {status.replace("_", " ")}
        </div>
      </div>
    );
  }

  const now = new Date();
  const start = startDate ? new Date(startDate) : now;
  const maturity = maturityDate ? new Date(maturityDate) : now;
  
  // Calculate days elapsed (The "Clock")
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const daysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const expectedPayment = daysElapsed * dailyRate;
  const isInArrears = totalPaid < expectedPayment;
  const moneyPaidPercent = Math.min((totalPaid / totalPrice) * 100, 100);
  
  // Calculate Time Elapsed %
  const totalDays = termMonths * 30; // Approximation
  const timeElapsedPercent = Math.min((daysElapsed / totalDays) * 100, 100);

  // Check if expired
  const isExpiredUnpaid = status !== "COMPLETED" && now > maturity;

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-gray-700">Payment Clock</h3>
          <p className="text-xs text-gray-500 mt-1">Tracks time elapsed vs payments made</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${
          status === "COMPLETED" ? "bg-green-100 text-green-700 border-green-200" :
          isExpiredUnpaid ? "bg-red-100 text-red-700 border-red-200" :
          isInArrears ? "bg-orange-100 text-orange-700 border-orange-200" : 
          "bg-blue-100 text-blue-700 border-blue-200"
        }`}>
          {status === "COMPLETED" ? "✅ COMPLETED" :
           isExpiredUnpaid ? "🚨 EXPIRED (RECOVERY)" :
           isInArrears ? "⚠️ ARREARS" : 
           "✅ ON TRACK"}
        </span>
      </div>

      <div className="space-y-6">
        {/* Time Progress */}
        <div>
          <div className="flex justify-between text-xs mb-2 font-semibold text-gray-600">
            <span>Time Elapsed (Maturity Date)</span>
            <span>{Math.round(timeElapsedPercent)}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${timeElapsedPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-blue-500 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)]" 
            />
          </div>
        </div>

        {/* Payment Progress */}
        <div>
          <div className="flex justify-between text-xs mb-2 font-semibold text-gray-600">
            <span>Payment Progress (Total Paid)</span>
            <span className={moneyPaidPercent < timeElapsedPercent && status !== "COMPLETED" ? "text-orange-600" : "text-green-600"}>
              {Math.round(moneyPaidPercent)}%
            </span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${moneyPaidPercent}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className={`h-full shadow-[inset_0_-2px_4px_rgba(0,0,0,0.1)] ${moneyPaidPercent < timeElapsedPercent && status !== "COMPLETED" ? 'bg-orange-500' : 'bg-green-500'}`} 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Days Active</p>
          <p className="text-xl font-black text-gray-800">{daysElapsed} <span className="text-sm font-semibold text-gray-500">Days</span></p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Remaining Balance</p>
          <p className="text-xl font-black text-gray-800">{(totalPrice - totalPaid).toLocaleString()} <span className="text-sm font-semibold text-gray-500">RWF</span></p>
        </div>
      </div>
    </div>
  );
};
