"use client"

import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaChartPie, FaExclamationTriangle, FaCheckCircle, FaTimes, FaSpinner } from 'react-icons/fa';

interface Budget {
  id: number;
  category: string;
  amount: number;
  period: string;
  year: number;
  month?: number;
  quarter?: number;
  description?: string;
  actualAmount?: number;
  variance?: number;
  variancePercentage?: number;
  status?: string;
}

interface BudgetTrackerProps {
  onBudgetUpdated?: (budget: Budget) => void;
}

const categories = [
  'fuel', 'maintenance', 'insurance', 'salaries', 'wages',
  'utilities', 'office', 'marketing', 'traffic_tickets', 'other'
];

const periods = ['monthly', 'quarterly', 'yearly'];

export default function BudgetTracker({ onBudgetUpdated }: BudgetTrackerProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    quarter: Math.ceil((new Date().getMonth() + 1) / 3),
    description: ''
  });

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('year', selectedYear.toString());
      params.append('period', selectedPeriod);

      if (selectedPeriod === 'monthly') {
        params.append('month', selectedMonth.toString());
      } else if (selectedPeriod === 'quarterly') {
        params.append('quarter', selectedQuarter.toString());
      }

      const response = await fetch(`/api/accounting/budget?${params}`);
      if (response.ok) {
        const data = await response.json();
        setBudgets(data.budgets || []);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedPeriod, selectedMonth, selectedQuarter]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleEditClick = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period,
      year: budget.year,
      month: budget.month || new Date().getMonth() + 1,
      quarter: budget.quarter || Math.ceil((new Date().getMonth() + 1) / 3),
      description: budget.description || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = (budget: Budget) => {
    setDeletingBudget(budget);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const budgetData = {
        ...formData,
        amount: parseFloat(formData.amount),
        year: parseInt(formData.year.toString()),
        month: formData.period === 'monthly' ? parseInt(formData.month.toString()) : undefined,
        quarter: formData.period === 'quarterly' ? parseInt(formData.quarter.toString()) : undefined
      };

      const url = editingBudget
        ? `/api/accounting/budget/${editingBudget.id}`
        : '/api/accounting/budget';

      const method = editingBudget ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData)
      });

      if (response.ok) {
        const savedBudget = await response.json();
        onBudgetUpdated?.(savedBudget);
        resetForm();
        setShowAddModal(false);
        fetchBudgets(); // Refresh list to get updated calculations
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to save budget'}`);
      }
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Failed to save budget. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBudget) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/accounting/budget/${deletingBudget.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setDeletingBudget(null);
        fetchBudgets();
      } else {
        alert('Failed to delete budget');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      period: 'monthly',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      quarter: Math.ceil((new Date().getMonth() + 1) / 3),
      description: ''
    });
    setEditingBudget(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'under_budget':
        return <FaCheckCircle className="text-green-500" />;
      case 'over_budget':
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_budget':
        return 'text-green-600 bg-green-100';
      case 'over_budget':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalActual = budgets.reduce((sum, budget) => sum + (budget.actualAmount || 0), 0);
  const totalVariance = totalBudget - totalActual;
  const overBudgetCount = budgets.filter(budget => budget.status === 'over_budget').length;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaChartPie className="text-blue-600 text-xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Budget Tracker</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
          >
            {periods.map(period => (
              <option key={period} value={period}>{period.charAt(0).toUpperCase() + period.slice(1)}</option>
            ))}
          </select>
          {selectedPeriod === 'monthly' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          )}
          {selectedPeriod === 'quarterly' && (
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
              className="px-3 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
            >
              {Array.from({ length: 4 }, (_, i) => i + 1).map(quarter => (
                <option key={quarter} value={quarter}>Q{quarter}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-medium"
          >
            <FaPlus /> Add Budget
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 font-medium mb-1">Total Budget</div>
          <div className="text-2xl font-bold text-gray-900">
            {totalBudget.toLocaleString()} RWF
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 font-medium mb-1">Total Spent</div>
          <div className="text-2xl font-bold text-gray-900">
            {totalActual.toLocaleString()} RWF
          </div>
        </div>
        <div className={`p-6 rounded-2xl shadow-sm border ${totalVariance >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <div className={`text-sm font-medium mb-1 ${totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Variance
          </div>
          <div className={`text-2xl font-bold ${totalVariance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {totalVariance.toLocaleString()} RWF
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 font-medium mb-1">Over Budget Items</div>
          <div className={`text-2xl font-bold ${overBudgetCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {overBudgetCount}
          </div>
        </div>
      </div>

      {/* Budget Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Budgeted</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actual</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Variance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <FaSpinner className="animate-spin" /> Loading budgets...
                    </div>
                  </td>
                </tr>
              ) : budgets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No budgets found for this period
                  </td>
                </tr>
              ) : (
                budgets.map((budget) => (
                  <tr key={budget.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {budget.category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </div>
                      {budget.description && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {budget.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {budget.amount.toLocaleString()} RWF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {(budget.actualAmount || 0).toLocaleString()} RWF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${(budget.variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(budget.variance || 0).toLocaleString()} RWF
                      </div>
                      <div className="text-xs text-gray-400">
                        {budget.variancePercentage?.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium gap-1.5 ${getStatusColor(budget.status || '')}`}>
                          {getStatusIcon(budget.status || '')}
                          {budget.status?.replace('_', ' ') || 'No data'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(budget)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(budget)}
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
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-12 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all scale-100 my-8">
            {/* Header with Gradient */}
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <FaChartPie className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {editingBudget ? 'Edit Budget' : 'Add New Budget'}
                    </h3>
                    <p className="text-sm text-purple-100 mt-0.5">
                      {editingBudget ? 'Update budget allocation' : 'Create a new business budget'}
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
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  <FaChartPie className="text-purple-600" />
                  Budget Configuration
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all hover:border-gray-300 shadow-sm"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Budget Amount (RWF)</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <FaChartPie className="w-5 h-5" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full pl-12 pr-16 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-semibold text-gray-900 hover:border-gray-300"
                        placeholder="0.00"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">RWF</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Period</label>
                    <select
                      required
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all hover:border-gray-300 shadow-sm"
                    >
                      {periods.map(period => (
                        <option key={period} value={period}>{period.charAt(0).toUpperCase() + period.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                    <input
                      type="number"
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all hover:border-gray-300 shadow-sm"
                    />
                  </div>

                  {(formData.period === 'monthly' || formData.period === 'quarterly') && (
                    <div className="col-span-2">
                      {formData.period === 'monthly' ? (
                        <>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Month</label>
                          <select
                            value={formData.month}
                            onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all hover:border-gray-300 shadow-sm"
                          >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                              <option key={month} value={month}>
                                {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                              </option>
                            ))}
                          </select>
                        </>
                      ) : (
                        <>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Quarter</label>
                          <select
                            value={formData.quarter}
                            onChange={(e) => setFormData({ ...formData, quarter: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all hover:border-gray-300 shadow-sm"
                          >
                            {Array.from({ length: 4 }, (_, i) => i + 1).map(quarter => (
                              <option key={quarter} value={quarter}>Q{quarter}</option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all resize-none hover:border-gray-300"
                      placeholder="Add a note..."
                    />
                  </div>
                </div>
              </div>

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
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                >
                  {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  {editingBudget ? 'Update Budget' : 'Add Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingBudget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-32 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FaTrash className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Delete Budget</h3>
                  <p className="text-red-100 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-100 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium uppercase tracking-wider text-xs">Category</span>
                  <span className="font-bold text-gray-900">{deletingBudget.category.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200/50">
                  <span className="text-gray-500 font-medium uppercase tracking-wider text-xs">Budgeted</span>
                  <span className="font-black text-lg text-gray-900">
                    {deletingBudget.amount.toLocaleString()} RWF
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed text-center px-4">
                Are you sure you want to delete the budget for <span className="font-bold text-gray-900">{deletingBudget.category}</span>? This will affect your budget tracking and variance reports.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingBudget(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl shadow-lg shadow-red-500/30 transition-all transform active:scale-95 font-semibold flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
