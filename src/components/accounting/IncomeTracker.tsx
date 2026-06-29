"use client"

import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaMoneyBillWave, FaFilter, FaDownload } from 'react-icons/fa';

interface Income {
  id: number;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: string;
  reference?: string;
  notes?: string;
  clientName?: string;
  clientPhone?: string;
  isRefund?: boolean;
  originalIncomeId?: number;
  refunds?: Income[];
}

interface IncomeTrackerProps {
  onIncomeAdded?: (income: Income) => void;
}

const categories = [
  'car_rental', 'taxi_service', 'airport_transfer',
  'hotel', 'car_sales', 'refund', 'other'
];

const paymentMethods = ['MTN Momo', 'Equity Bank', 'BK Bank', 'Bank of Africa', 'Access Bank', 'COPEDU', 'Cash'];

export default function IncomeTracker({ onIncomeAdded }: IncomeTrackerProps) {
  const [income, setIncome] = useState<Income[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    paymentMethod: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
    clientName: '',
    clientPhone: '',
    isRefund: false,
    originalIncomeId: ''
  });

  const fetchIncome = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);

      const response = await fetch(`/api/accounting/income?${params}`);
      if (response.ok) {
        const data = await response.json();
        setIncome(data);
      }
    } catch (error) {
      console.error('Error fetching income:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    fetchIncome();
  }, [fetchIncome]);

  useEffect(() => {
    if (editingIncome) {
      setFormData({
        description: editingIncome.description,
        amount: editingIncome.amount.toString(),
        category: editingIncome.category,
        paymentMethod: editingIncome.paymentMethod,
        date: new Date(editingIncome.date).toISOString().split('T')[0],
        reference: editingIncome.reference || '',
        notes: editingIncome.notes || '',
        clientName: editingIncome.clientName || '',
        clientPhone: editingIncome.clientPhone || '',
        isRefund: editingIncome.isRefund || false,
        originalIncomeId: editingIncome.originalIncomeId?.toString() || ''
      });
      setShowAddModal(true);
    }
  }, [editingIncome]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const incomeData = {
        ...formData,
        amount: parseFloat(formData.amount),
        isRefund: formData.isRefund,
        originalIncomeId: formData.originalIncomeId ? parseInt(formData.originalIncomeId) : undefined
      };

      const url = editingIncome
        ? `/api/accounting/income?id=${editingIncome.id}`
        : '/api/accounting/income';

      const method = editingIncome ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomeData)
      });

      if (response.ok) {
        const savedIncome = await response.json();
        if (editingIncome) {
          setIncome(income.map(i => i.id === savedIncome.id ? savedIncome : i));
        } else {
          setIncome([savedIncome, ...income]);
        }
        onIncomeAdded?.(savedIncome);
        resetForm();
        setShowAddModal(false);
      } else {
        const errorData = await response.json();
        console.error('Error saving income:', errorData);
        alert('Error saving income: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving income:', error);
      alert('Error saving income. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this income record?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/accounting/income?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setIncome(income.filter(i => i.id !== id));
        onIncomeAdded?.({} as Income); // Trigger update
      } else {
        const errorData = await response.json();
        alert('Error deleting income: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting income:', error);
      alert('Error deleting income. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      paymentMethod: '',
      date: new Date().toISOString().split('T')[0],
      reference: '',
      notes: '',
      clientName: '',
      clientPhone: '',
      isRefund: false,
      originalIncomeId: ''
    });
    setEditingIncome(null);
  };

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);

  const handleExcelExport = async () => {
    const { exportToExcel } = await import('@/utils/excelExport');
    
    const columns = [
      { header: 'Date', key: 'date', type: 'date' as const },
      { header: 'ID', key: 'id', type: 'text' as const },
      { header: 'Description', key: 'description', type: 'text' as const },
      { header: 'Category', key: 'category', type: 'text' as const },
      { header: 'Payment Method', key: 'paymentMethod', type: 'text' as const },
      { header: 'Client Name', key: 'clientName', type: 'text' as const },
      { header: 'Client Phone', key: 'clientPhone', type: 'text' as const },
      { header: 'Reference', key: 'reference', type: 'text' as const },
      { header: 'Notes', key: 'notes', type: 'text' as const },
      { header: 'Amount (RWF)', key: 'amount', type: 'number' as const, numFormat: '#,##0" RWF"' }
    ];

    const data = income.map(item => ({
      ...item,
      amount: item.isRefund ? -Math.abs(item.amount) : item.amount,
      category: item.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      clientName: item.clientName || '-',
      clientPhone: item.clientPhone || '-',
      reference: item.reference || '-',
      notes: item.notes || '-'
    }));

    await exportToExcel({
      filename: `Income_Report_${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Income',
      title: 'Income Tracker Report',
      subtitle: `Generated on ${new Date().toLocaleDateString()} | Total Transactions: ${income.length}`,
      columns,
      data,
      summaryRow: {
        description: 'Total',
        amount: { formula: '=SUM(J{start}:J{end})' }
      }
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Income Tracker</h3>
          <p className="text-sm text-gray-500 mt-1">Manage and track your revenue sources</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 shadow-sm transition-all cursor-pointer hover:bg-gray-50"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={handleExcelExport}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-medium whitespace-nowrap"
          >
            <FaDownload /> Export Excel
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-500/30 transition-all active:scale-95 font-medium whitespace-nowrap"
          >
            <FaPlus /> Add Income
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <FaMoneyBillWave />
            </div>
            <div className="text-sm text-green-700 font-semibold">Total Income</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {totalIncome.toLocaleString()} <span className="text-sm font-medium text-gray-500">RWF</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <FaFilter />
            </div>
            <div className="text-sm text-blue-700 font-semibold">This Month</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {income
              .filter(item => new Date(item.date).getMonth() === new Date().getMonth())
              .reduce((sum, item) => sum + item.amount, 0)
              .toLocaleString()} <span className="text-sm font-medium text-gray-500">RWF</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <FaDownload />
            </div>
            <div className="text-sm text-purple-700 font-semibold">Transactions</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{income.length}</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-2xl border border-yellow-100 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
              <FaMoneyBillWave />
            </div>
            <div className="text-sm text-yellow-700 font-semibold">Avg. Transaction</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {income.length > 0 ? Math.round(totalIncome / income.length).toLocaleString() : 0} <span className="text-sm font-medium text-gray-500">RWF</span>
          </div>
        </div>
      </div>

      {/* Income Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading income records...
                    </div>
                  </td>
                </tr>
              ) : income.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No income records found
                  </td>
                </tr>
              ) : (
                income.map((item) => (
                  <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors duration-150 ${item.isRefund ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono">#{item.id}</span>
                        {item.isRefund && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            REFUND
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900 mt-1">{item.description}</div>
                      {item.reference && (
                        <div className="text-xs text-gray-500 mt-0.5">Ref: {item.reference}</div>
                      )}
                      {item.originalIncomeId && (
                        <div className="text-xs text-blue-600 mt-0.5">
                          Original Transaction: #{item.originalIncomeId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg ${item.isRefund
                        ? 'bg-red-50 text-red-700 border border-red-100'
                        : 'bg-green-50 text-green-700 border border-green-100'
                        }`}>
                        {item.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${item.isRefund ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.isRefund ? (
                        <span className="text-red-600">
                          {item.amount > 0 ? '-' : ''}{Math.abs(item.amount).toLocaleString()} RWF
                        </span>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-gray-900">{item.amount.toLocaleString()} RWF</span>
                          {item.refunds && item.refunds.length > 0 && (
                            <div className="text-xs mt-1">
                              <div className="text-red-500">
                                {item.refunds.reduce((sum, r) => sum + r.amount, 0).toLocaleString()} RWF (Refunded)
                              </div>
                              <div className="text-green-600 font-bold border-t border-gray-100 mt-0.5 pt-0.5">
                                = {(item.amount + item.refunds.reduce((sum, r) => sum + r.amount, 0)).toLocaleString()} RWF
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.clientName ? (
                        <div>
                          <div className="font-medium text-gray-900">{item.clientName}</div>
                          {item.clientPhone && <div className="text-xs text-gray-400">{item.clientPhone}</div>}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingIncome(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {
        showAddModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-12 animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden transform transition-all scale-100 my-8">
              {/* Header with Gradient */}
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {editingIncome ? 'Edit Income Record' : 'Record New Income'}
                      </h3>
                      <p className="text-sm text-green-100 mt-0.5">
                        {editingIncome ? 'Update income details' : 'Add a new income transaction'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Main Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Transaction Details
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <input
                        type="text"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all hover:border-gray-300"
                        placeholder="e.g., Car rental payment from John Doe"
                      />
                    </div>

                    {/* Refund Toggle */}
                    <div className="col-span-2">
                      <label className="flex items-center gap-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl cursor-pointer hover:bg-yellow-100 transition-all">
                        <input
                          type="checkbox"
                          checked={formData.isRefund}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData({
                              ...formData,
                              isRefund: checked,
                              category: checked ? 'refund' : formData.category === 'refund' ? '' : formData.category,
                              amount: checked && formData.amount && parseFloat(formData.amount) > 0
                                ? (-Math.abs(parseFloat(formData.amount))).toString()
                                : formData.amount
                            });
                          }}
                          className="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-gray-900">This is a refund</span>
                          <p className="text-xs text-gray-600 mt-0.5">Check this if you're recording a refund for a previous income transaction</p>
                        </div>
                      </label>
                    </div>

                    {/* Original Transaction ID (shown only for refunds) */}
                    {formData.isRefund && (
                      <div className="col-span-2 space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Select Original Transaction
                          <span className="text-gray-400 font-normal ml-2 text-xs">(Choose the transaction to refund)</span>
                        </label>

                        {/* Transaction Selector Dropdown */}
                        <div className="relative">
                          <select
                            value={formData.originalIncomeId}
                            onChange={(e) => {
                              const selectedId = e.target.value;
                              const selectedIncome = income.find(i => i.id === parseInt(selectedId));
                              setFormData({
                                ...formData,
                                originalIncomeId: selectedId,
                                description: selectedIncome ? `Refund: ${selectedIncome.description}` : formData.description
                              });
                            }}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 outline-none transition-all hover:border-gray-300 appearance-none pr-10"
                          >
                            <option value="">-- Select a transaction to refund --</option>
                            {income
                              .filter(item => !item.isRefund)
                              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                              .map((item) => (
                                <option key={item.id} value={item.id}>
                                  #{item.id} - {item.clientName || item.description} - {item.amount.toLocaleString()} RWF ({new Date(item.date).toLocaleDateString()})
                                </option>
                              ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {/* Quick Refund Buttons */}
                        {formData.originalIncomeId && (
                          <div className="flex gap-2">

                            <button
                              type="button"
                              onClick={() => {
                                const originalIncome = income.find(i => i.id === parseInt(formData.originalIncomeId));
                                if (originalIncome) {
                                  const fullRefund = -Math.abs(originalIncome.amount);
                                  setFormData({ ...formData, amount: fullRefund.toString() });
                                }
                              }}
                              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              100% Full Refund
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const originalIncome = income.find(i => i.id === parseInt(formData.originalIncomeId));
                                if (originalIncome) {
                                  const halfRefund = -Math.abs(originalIncome.amount) / 2;
                                  setFormData({ ...formData, amount: halfRefund.toString() });
                                }
                              }}
                              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all text-sm font-semibold flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              50% Partial Refund
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Select a transaction, then click <strong>100%</strong> for full refund or <strong>50%</strong> for partial refund
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (RWF)</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="w-full pl-12 pr-16 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-semibold text-gray-900 hover:border-gray-300"
                          placeholder={formData.isRefund ? "-500000.00" : "0.00"}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">RWF</span>
                      </div>
                      {formData.isRefund && (
                        <p className="text-xs text-yellow-700 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Refund amounts should be negative (e.g., -500000)
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all hover:border-gray-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all hover:border-gray-300"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>
                            {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                      <select
                        required
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all hover:border-gray-300"
                      >
                        <option value="">Select Method</option>
                        {paymentMethods.map(method => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Client Information Section */}
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Client Information
                    <span className="text-xs text-gray-400 normal-case tracking-normal">(Optional)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all hover:border-gray-300"
                        placeholder="Client Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client Phone</label>
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all hover:border-gray-300"
                        placeholder="+250..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
                      <input
                        type="text"
                        value={formData.reference}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all hover:border-gray-300"
                        placeholder="e.g., Booking #12345"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Notes <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all resize-none hover:border-gray-300"
                    placeholder="Additional notes about this income..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                  >
                    {isLoading && (
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isLoading ? 'Saving...' : (editingIncome ? 'Update Income' : 'Save Income')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
}


