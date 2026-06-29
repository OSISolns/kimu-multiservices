"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "../../UserContext";
import {
  FaMoneyBillWave, FaWhatsapp, FaCalendarAlt, FaPlus, FaEdit,
  FaTrash, FaSearch, FaExclamationTriangle, FaCheckCircle, FaUser,
  FaTimes, FaCoins, FaInfoCircle
} from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ClientCreditPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Form states
  const [form, setForm] = useState({
    clientName: "",
    whatsappNumber: "",
    totalCredit: "",
    paidAmount: "",
    dailyPayment: "",
    nextPaymentDate: new Date().toISOString().split("T")[0],
    notes: ""
  });

  const [paymentAmount, setPaymentAmount] = useState("");

  // Reminder feedback overlay state
  const [reminderResult, setReminderResult] = useState<any>(null);

  // Financing calculation states
  const [useFinancing, setUseFinancing] = useState(false);
  const [carValue, setCarValue] = useState("35000000");
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);

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

  useEffect(() => {
    if (useFinancing) {
      setForm(prev => ({
        ...prev,
        totalCredit: financingDetails.totalCredit.toString(),
        dailyPayment: financingDetails.dailyPayment.toString(),
        notes: prev.notes || `Vehicle Finance: ${parseFloat(carValue).toLocaleString()} RWF car value, ${downPaymentPercent}% down payment.`
      }));
    }
  }, [useFinancing, financingDetails, carValue, downPaymentPercent]);

  const fetchCredits = async () => {
    try {
      const res = await fetch("/api/client-credits", {
        headers: { "x-username": user?.username || "" }
      });
      if (res.ok) {
        const result = await res.json();
        setCredits(result.credits || []);
      }
    } catch (err) {
      console.error("Failed to fetch client credits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCredits();
    }
  }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const mode = searchParams.get("mode");
      if (mode === "create-loan") {
        const pCarValue = searchParams.get("carValue") || "35000000";
        const pDownPayment = searchParams.get("downPayment") || "20";
        
        setCarValue(pCarValue);
        setDownPaymentPercent(parseInt(pDownPayment));
        setUseFinancing(true);
        setIsAddModalOpen(true);
        
        // Clean up URL query params
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/client-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-username": user?.username || ""
        },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        await fetchCredits();
        setIsAddModalOpen(false);
        resetForm();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create client credit record");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving record");
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    try {
      const res = await fetch(`/api/client-credits/${selectedRecord.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-username": user?.username || ""
        },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        await fetchCredits();
        setIsEditModalOpen(false);
        setSelectedRecord(null);
        resetForm();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update record");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating record");
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !paymentAmount) return;
    try {
      const newPaidAmount = selectedRecord.paidAmount + parseFloat(paymentAmount);
      const res = await fetch(`/api/client-credits/${selectedRecord.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-username": user?.username || ""
        },
        body: JSON.stringify({
          paidAmount: newPaidAmount,
          nextPaymentDate: new Date(Date.now() + 86400000).toISOString().split("T")[0] // Advance next payment due date by 1 day
        })
      });

      if (res.ok) {
        await fetchCredits();
        setIsPaymentModalOpen(false);
        setSelectedRecord(null);
        setPaymentAmount("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to log payment");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClick = async (id: number) => {
    if (!confirm("Are you sure you want to delete this credit tracking record?")) return;
    try {
      const res = await fetch(`/api/client-credits/${id}`, {
        method: "DELETE",
        headers: { "x-username": user?.username || "" }
      });
      if (res.ok) {
        await fetchCredits();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReminder = async (record: any) => {
    try {
      const res = await fetch(`/api/client-credits/${record.id}/remind`, {
        method: "POST",
        headers: { "x-username": user?.username || "" }
      });
      if (res.ok) {
        const data = await res.json();
        setReminderResult(data);
        fetchCredits();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to trigger reminder");
      }
    } catch (err) {
      console.error(err);
      alert("Error triggering reminder");
    }
  };

  const resetForm = () => {
    setForm({
      clientName: "",
      whatsappNumber: "",
      totalCredit: "",
      paidAmount: "0",
      dailyPayment: "",
      nextPaymentDate: new Date().toISOString().split("T")[0],
      notes: ""
    });
    setUseFinancing(false);
    setCarValue("35000000");
    setDownPaymentPercent(20);
  };

  const openEditModal = (record: any) => {
    setSelectedRecord(record);
    setForm({
      clientName: record.clientName,
      whatsappNumber: record.whatsappNumber,
      totalCredit: record.totalCredit.toString(),
      paidAmount: record.paidAmount.toString(),
      dailyPayment: record.dailyPayment.toString(),
      nextPaymentDate: record.nextPaymentDate,
      notes: record.notes || ""
    });
    
    // Try to parse carValue and downPaymentPercent from notes if it exists
    if (record.notes && record.notes.includes("Vehicle Finance:")) {
      try {
        const carValueMatch = record.notes.match(/Vehicle Finance: ([\d,]+) RWF car value/);
        const downPaymentMatch = record.notes.match(/(\d+)% down payment/);
        if (carValueMatch) {
          setCarValue(carValueMatch[1].replace(/,/g, ""));
        }
        if (downPaymentMatch) {
          setDownPaymentPercent(parseInt(downPaymentMatch[1]));
        }
        setUseFinancing(true);
      } catch (err) {
        setUseFinancing(false);
      }
    } else {
      setUseFinancing(false);
    }
    
    setIsEditModalOpen(true);
  };

  const openPaymentModal = (record: any) => {
    setSelectedRecord(record);
    setPaymentAmount(record.dailyPayment.toString());
    setIsPaymentModalOpen(true);
  };

  // Status computation for display
  const normalizedCredits = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return credits.map(c => {
      let calcStatus = c.status;
      if (c.paidAmount >= c.totalCredit) {
        calcStatus = "paid";
      } else if (c.nextPaymentDate < today) {
        calcStatus = "overdue";
      } else {
        calcStatus = "active";
      }
      return { ...c, computedStatus: calcStatus };
    });
  }, [credits]);

  const filteredCredits = useMemo(() => {
    return normalizedCredits.filter(c => {
      const matchesSearch = c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.whatsappNumber.includes(searchTerm);
      const matchesStatus = statusFilter === "all" || c.computedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [normalizedCredits, searchTerm, statusFilter]);

  // Aggregate totals
  const stats = useMemo(() => {
    let totalOutstanding = 0;
    let expectedDaily = 0;
    let overdueCount = 0;
    let paidCount = 0;

    normalizedCredits.forEach(c => {
      if (c.computedStatus !== "paid") {
        totalOutstanding += (c.totalCredit - c.paidAmount);
        expectedDaily += c.dailyPayment;
        if (c.computedStatus === "overdue") {
          overdueCount++;
        }
      } else {
        paidCount++;
      }
    });

    return { totalOutstanding, expectedDaily, overdueCount, paidCount };
  }, [normalizedCredits]);

  if (loading) return <LoadingSpinner message="Loading client credit status..." size="lg" fullScreen />;

  return (
    <div className="space-y-6 pb-12 relative px-8 pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase flex items-center gap-3">
            <FaCoins className="text-orange-500" /> Client Credit Roster
          </h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide mt-0.5">Daily payment logs and automated WhatsApp reminder center</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="btn-shadcn-primary flex items-center gap-2 active:scale-95 text-[10px]"
        >
          <FaPlus /> Set Up Credit Account
        </button>
      </div>

      {/* KPI Stats Cards - Sleek Flat Border Design */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Total Outstanding Credit" value={`${stats.totalOutstanding.toLocaleString()} RWF`} icon={<FaMoneyBillWave />} color="orange" />
        <KpiCard title="Expected Daily Collection" value={`${stats.expectedDaily.toLocaleString()} RWF`} icon={<FaCoins />} color="emerald" />
        <KpiCard title="Overdue Accounts" value={stats.overdueCount} icon={<FaExclamationTriangle />} color="red" />
        <KpiCard title="Settled Accounts" value={stats.paidCount} icon={<FaCheckCircle />} color="green" />
      </div>

      {/* Filters and Search - Clean Border Styling */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Search client name or phone..."
            className="input-shadcn pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 w-full md:w-auto">
          {["all", "active", "overdue", "paid"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all duration-150 ${
                statusFilter === filter
                  ? "bg-slate-900 text-slate-50 shadow-sm"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Client List - Shadcn-UI Tables */}
      <div className="table-container-shadcn">
        <table className="table-shadcn">
          <thead className="table-header-shadcn">
            <tr>
              <th className="table-header-cell-shadcn">Client Details</th>
              <th className="table-header-cell-shadcn">Total Credit</th>
              <th className="table-header-cell-shadcn">Paid Amount</th>
              <th className="table-header-cell-shadcn">Daily Due</th>
              <th className="table-header-cell-shadcn">Next Payment Due</th>
              <th className="table-header-cell-shadcn">Status</th>
              <th className="table-header-cell-shadcn text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCredits.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-semibold text-xs">
                  No client credit records found matching current criteria.
                </td>
              </tr>
            ) : (
              filteredCredits.map((c) => {
                const outstanding = c.totalCredit - c.paidAmount;
                return (
                  <tr key={c.id} className="table-row-shadcn">
                    <td className="table-cell-shadcn whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                          <FaUser />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs uppercase">{c.clientName}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                            <FaWhatsapp className="text-green-500" /> {c.whatsappNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell-shadcn whitespace-nowrap">
                      <div className="font-bold text-slate-900">{c.totalCredit.toLocaleString()} RWF</div>
                      <div className="text-[10px] font-bold text-red-500 mt-0.5">{outstanding.toLocaleString()} RWF Left</div>
                    </td>
                    <td className="table-cell-shadcn whitespace-nowrap">
                      <div className="font-bold text-emerald-600">{c.paidAmount.toLocaleString()} RWF</div>
                      <div className="w-20 bg-slate-100 rounded-full h-1 mt-1 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1 rounded-full"
                          style={{ width: `${Math.min(100, (c.paidAmount / c.totalCredit) * 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="table-cell-shadcn whitespace-nowrap font-bold text-slate-700">
                      {c.dailyPayment.toLocaleString()} RWF
                    </td>
                    <td className="table-cell-shadcn whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <FaCalendarAlt className="text-slate-400" /> {c.nextPaymentDate}
                      </div>
                    </td>
                    <td className="table-cell-shadcn whitespace-nowrap">
                      <span className={`badge-shadcn ${
                        c.computedStatus === "paid" ? "badge-shadcn-success" :
                        c.computedStatus === "overdue" ? "badge-shadcn-destructive" : "badge-shadcn-warning"
                      }`}>
                        {c.computedStatus}
                      </span>
                    </td>
                    <td className="table-cell-shadcn whitespace-nowrap text-right space-x-1.5">
                      {c.computedStatus !== "paid" && (
                        <>
                          <button
                            onClick={() => openPaymentModal(c)}
                            className="btn-shadcn-outline !h-7 !px-2.5 !text-[10px] border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          >
                            Pay Due
                          </button>
                          <button
                            onClick={() => handleSendReminder(c)}
                            className="btn-shadcn-outline !h-7 !px-2.5 !text-[10px] border-green-200 text-green-600 hover:bg-green-50 inline-flex items-center gap-1"
                          >
                            <FaWhatsapp /> Remind
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openEditModal(c)}
                        className="btn-shadcn-secondary !w-7 !h-7 !p-0 inline-flex items-center justify-center text-slate-600"
                        title="Edit Record"
                      >
                        <FaEdit className="text-[10px]" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(c.id)}
                        className="btn-shadcn-secondary !w-7 !h-7 !p-0 inline-flex items-center justify-center text-red-500 hover:bg-red-50"
                        title="Delete Record"
                      >
                        <FaTrash className="text-[10px]" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* WHATSAPP REMINDER RESULT OVERLAY - Shadcn-UI Dialog */}
      {reminderResult && (
        <div className="modal-overlay-shadcn">
          <div className="modal-content-shadcn max-w-md">
            <button onClick={() => setReminderResult(null)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-lg transition-colors">
              <FaTimes />
            </button>
            <div className="modal-header-shadcn">
              <h3 className="modal-title-shadcn flex items-center gap-2">
                <FaWhatsapp className="text-green-500" /> WhatsApp Reminder Dispatched
              </h3>
              <p className="modal-description-shadcn">
                Status: <span className="font-bold text-green-600">{reminderResult.message}</span>
              </p>
            </div>
            
            <div className="space-y-4 mt-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] font-medium text-slate-600">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Recipient Name</div>
                <div className="font-black text-slate-900 uppercase">{reminderResult.recipient} ({reminderResult.number})</div>
              </div>
              <div className="bg-slate-950 text-green-400 font-mono p-4 rounded-lg text-[10px] whitespace-pre-wrap leading-relaxed shadow-inner max-h-48 overflow-y-auto">
                {reminderResult.messageText}
              </div>
            </div>
            
            <div className="modal-footer-shadcn">
              <button
                onClick={() => setReminderResult(null)}
                className="btn-shadcn-primary w-full sm:w-auto"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE RECORD MODAL - Shadcn-UI Dialog */}
      {isAddModalOpen && (
        <div className="modal-overlay-shadcn">
          <div className="modal-content-shadcn">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-lg transition-colors">
              <FaTimes />
            </button>
            <div className="modal-header-shadcn">
              <h2 className="modal-title-shadcn flex items-center gap-2">
                <FaCoins className="text-orange-500" /> Setup Client Credit
              </h2>
              <p className="modal-description-shadcn">Configure debt account, installments, and payment due dates.</p>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="input-shadcn"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +250792958752"
                  className="input-shadcn"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                />
              </div>

              {/* Vehicle Financing Section */}
              <div className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FaCoins className="text-orange-500" /> Apply Vehicle Financing
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={useFinancing}
                      onChange={(e) => setUseFinancing(e.target.checked)}
                    />
                    <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                
                {useFinancing && (
                  <div className="space-y-3 pt-2 border-t border-slate-100/80 animate-fadeIn">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Car Value (RWF)</label>
                      <input
                        type="number"
                        className="input-shadcn !h-8 text-xs font-bold"
                        value={carValue}
                        onChange={(e) => setCarValue(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Down Payment</label>
                      <div className="flex gap-2">
                        {[10, 20].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setDownPaymentPercent(pct)}
                            className={`flex-1 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider border transition-all ${
                              downPaymentPercent === pct
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {pct}% Down
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Calculation breakdown */}
                    <div className="bg-white rounded-lg border border-slate-200 p-2.5 space-y-1.5 text-[10px]">
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>Down Payment:</span>
                        <span className="font-semibold text-slate-700">{financingDetails.downPayment.toLocaleString()} RWF</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>Loan Principal:</span>
                        <span className="font-semibold text-slate-700">{financingDetails.loanPrincipal.toLocaleString()} RWF</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>Total 5-Yr Interest (15%):</span>
                        <span className="font-semibold text-slate-700">{financingDetails.totalInterest.toLocaleString()} RWF</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-medium border-b border-slate-100 pb-1 mb-1">
                        <span>Total Outstanding:</span>
                        <span className="font-bold text-slate-900">{financingDetails.totalCredit.toLocaleString()} RWF</span>
                      </div>
                      
                      {/* Fixed costs */}
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pt-0.5">Daily Fixed Costs Breakdown:</div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-500 text-[9px] pl-1">
                        <div>• Insurance: ~{financingDetails.insuranceDaily} RWF</div>
                        <div>• RURA Fee: ~{financingDetails.ruraDaily} RWF</div>
                        <div>• RRA Tax: ~{financingDetails.rraDaily} RWF</div>
                        <div>• Road Levy: ~{financingDetails.roadLevyDaily} RWF</div>
                      </div>
                      <div className="flex justify-between text-[9px] font-semibold text-slate-600 border-t border-slate-100 pt-1 mt-1 pl-1">
                        <span>Total Daily Fixed:</span>
                        <span>~{financingDetails.totalFixedDaily.toLocaleString()} RWF</span>
                      </div>
                      
                      {/* Expected Daily Repayment */}
                      <div className="flex justify-between text-slate-500 font-medium border-t border-slate-100 pt-1 mt-1">
                        <span>Daily Loan Installment:</span>
                        <span>{financingDetails.dailyLoanRepayment.toLocaleString()} RWF</span>
                      </div>
                      <div className="flex justify-between text-orange-600 font-black border-t border-orange-100 pt-1.5 mt-1 text-[11px]">
                        <span>Expected Daily Collection:</span>
                        <span>{financingDetails.dailyPayment.toLocaleString()} RWF</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Total Credit (RWF)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500000"
                    className={`input-shadcn ${useFinancing ? "bg-slate-50/80 text-slate-500 font-semibold cursor-not-allowed border-slate-200" : ""}`}
                    value={form.totalCredit}
                    readOnly={useFinancing}
                    onChange={(e) => setForm({ ...form, totalCredit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Daily Due (RWF)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 25000"
                    className={`input-shadcn ${useFinancing ? "bg-slate-50/80 text-slate-500 font-semibold cursor-not-allowed border-slate-200" : ""}`}
                    value={form.dailyPayment}
                    readOnly={useFinancing}
                    onChange={(e) => setForm({ ...form, dailyPayment: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Next Payment Date</label>
                <input
                  type="date"
                  required
                  className="input-shadcn"
                  value={form.nextPaymentDate}
                  onChange={(e) => setForm({ ...form, nextPaymentDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Notes / Reason</label>
                <textarea
                  placeholder="Optional details..."
                  className="input-shadcn h-16 resize-none py-2"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                ></textarea>
              </div>
              <div className="modal-footer-shadcn">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-shadcn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-shadcn-primary"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT RECORD MODAL - Shadcn-UI Dialog */}
      {isEditModalOpen && (
        <div className="modal-overlay-shadcn">
          <div className="modal-content-shadcn">
            <button onClick={() => { setIsEditModalOpen(false); setSelectedRecord(null); }} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-lg transition-colors">
              <FaTimes />
            </button>
            <div className="modal-header-shadcn">
              <h2 className="modal-title-shadcn flex items-center gap-2">
                <FaEdit className="text-orange-500" /> Modify Credit Record
              </h2>
              <p className="modal-description-shadcn">Edit information, paid amount, and payment dates.</p>
            </div>
            <form onSubmit={handleUpdateSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Client Name</label>
                <input
                  type="text"
                  required
                  className="input-shadcn"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  className="input-shadcn"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                />
              </div>

              {/* Vehicle Financing Section for Editing */}
              <div className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FaCoins className="text-orange-500" /> Apply Vehicle Financing
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={useFinancing}
                      onChange={(e) => setUseFinancing(e.target.checked)}
                    />
                    <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                
                {useFinancing && (
                  <div className="space-y-3 pt-2 border-t border-slate-100/80 animate-fadeIn">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Car Value (RWF)</label>
                      <input
                        type="number"
                        className="input-shadcn !h-8 text-xs font-bold"
                        value={carValue}
                        onChange={(e) => setCarValue(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Down Payment</label>
                      <div className="flex gap-2">
                        {[10, 20].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setDownPaymentPercent(pct)}
                            className={`flex-1 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider border transition-all ${
                              downPaymentPercent === pct
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {pct}% Down
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Calculation breakdown */}
                    <div className="bg-white rounded-lg border border-slate-200 p-2.5 space-y-1.5 text-[10px]">
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>Down Payment:</span>
                        <span className="font-semibold text-slate-700">{financingDetails.downPayment.toLocaleString()} RWF</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>Loan Principal:</span>
                        <span className="font-semibold text-slate-700">{financingDetails.loanPrincipal.toLocaleString()} RWF</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-medium">
                        <span>Total 5-Yr Interest (15%):</span>
                        <span className="font-semibold text-slate-700">{financingDetails.totalInterest.toLocaleString()} RWF</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-medium border-b border-slate-100 pb-1 mb-1">
                        <span>Total Outstanding:</span>
                        <span className="font-bold text-slate-900">{financingDetails.totalCredit.toLocaleString()} RWF</span>
                      </div>
                      
                      {/* Fixed costs */}
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pt-0.5">Daily Fixed Costs Breakdown:</div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-500 text-[9px] pl-1">
                        <div>• Insurance: ~{financingDetails.insuranceDaily} RWF</div>
                        <div>• RURA Fee: ~{financingDetails.ruraDaily} RWF</div>
                        <div>• RRA Tax: ~{financingDetails.rraDaily} RWF</div>
                        <div>• Road Levy: ~{financingDetails.roadLevyDaily} RWF</div>
                      </div>
                      <div className="flex justify-between text-[9px] font-semibold text-slate-600 border-t border-slate-100 pt-1 mt-1 pl-1">
                        <span>Total Daily Fixed:</span>
                        <span>~{financingDetails.totalFixedDaily.toLocaleString()} RWF</span>
                      </div>
                      
                      {/* Expected Daily Repayment */}
                      <div className="flex justify-between text-slate-500 font-medium border-t border-slate-100 pt-1 mt-1">
                        <span>Daily Loan Installment:</span>
                        <span>{financingDetails.dailyLoanRepayment.toLocaleString()} RWF</span>
                      </div>
                      <div className="flex justify-between text-orange-600 font-black border-t border-orange-100 pt-1.5 mt-1 text-[11px]">
                        <span>Expected Daily Collection:</span>
                        <span>{financingDetails.dailyPayment.toLocaleString()} RWF</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Total Credit (RWF)</label>
                  <input
                    type="number"
                    required
                    className={`input-shadcn ${useFinancing ? "bg-slate-50/80 text-slate-500 font-semibold cursor-not-allowed border-slate-200" : ""}`}
                    value={form.totalCredit}
                    readOnly={useFinancing}
                    onChange={(e) => setForm({ ...form, totalCredit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Paid Amount (RWF)</label>
                  <input
                    type="number"
                    required
                    className="input-shadcn"
                    value={form.paidAmount}
                    onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Daily Due (RWF)</label>
                  <input
                    type="number"
                    required
                    className={`input-shadcn ${useFinancing ? "bg-slate-50/80 text-slate-500 font-semibold cursor-not-allowed border-slate-200" : ""}`}
                    value={form.dailyPayment}
                    readOnly={useFinancing}
                    onChange={(e) => setForm({ ...form, dailyPayment: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Next Payment Date</label>
                  <input
                    type="date"
                    required
                    className="input-shadcn"
                    value={form.nextPaymentDate}
                    onChange={(e) => setForm({ ...form, nextPaymentDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Notes / Reason</label>
                <textarea
                  className="input-shadcn h-16 resize-none py-2"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                ></textarea>
              </div>
              <div className="modal-footer-shadcn">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setSelectedRecord(null); }}
                  className="btn-shadcn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-shadcn-primary"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAY DUE MODAL - Shadcn-UI Dialog */}
      {isPaymentModalOpen && selectedRecord && (
        <div className="modal-overlay-shadcn">
          <div className="modal-content-shadcn max-w-sm">
            <button onClick={() => { setIsPaymentModalOpen(false); setSelectedRecord(null); setPaymentAmount(""); }} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-lg transition-colors">
              <FaTimes />
            </button>
            <div className="modal-header-shadcn">
              <h2 className="modal-title-shadcn flex items-center gap-2">
                <FaMoneyBillWave className="text-emerald-600" /> Log Client Payment
              </h2>
              <p className="modal-description-shadcn">Record installment for {selectedRecord.clientName}.</p>
            </div>
            <form onSubmit={handlePaymentSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Payment Amount (RWF)</label>
                <input
                  type="number"
                  required
                  className="input-shadcn text-sm font-bold"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
                <span className="text-[10px] font-medium text-slate-400 block mt-1.5 ml-0.5">
                  Daily expectation: {selectedRecord.dailyPayment.toLocaleString()} RWF
                </span>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Current Outstanding:</span>
                  <span className="font-bold text-slate-800">{(selectedRecord.totalCredit - selectedRecord.paidAmount).toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold border-t border-slate-100 pt-1 mt-1">
                  <span>New Outstanding:</span>
                  <span>{Math.max(0, (selectedRecord.totalCredit - selectedRecord.paidAmount - parseFloat(paymentAmount || "0"))).toLocaleString()} RWF</span>
                </div>
              </div>

              <div className="modal-footer-shadcn">
                <button
                  type="button"
                  onClick={() => { setIsPaymentModalOpen(false); setSelectedRecord(null); setPaymentAmount(""); }}
                  className="btn-shadcn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-shadcn-primary !bg-emerald-600 hover:bg-emerald-700"
                >
                  Log Installment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ title, value, icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    red: "bg-red-50 text-red-600 border-red-100"
  };
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between">
      <div>
        <div className="text-sm font-bold text-slate-400 uppercase tracking-wider leading-none">{title}</div>
        <div className="text-lg font-black text-slate-900 tracking-tight mt-2">{value}</div>
      </div>
      <div className={`p-2.5 rounded-lg border ${colors[color]} text-sm shrink-0`}>
        {icon}
      </div>
    </div>
  );
}
