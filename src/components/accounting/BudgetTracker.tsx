"use client"

import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaChartPie, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

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
  'fuel', 'maintenance', 'insurance', 'salaries', 
  'utilities', 'office', 'marketing', 'other'
];

const periods = ['monthly', 'quarterly', 'yearly'];

export default function BudgetTracker({ onBudgetUpdated }: BudgetTrackerProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    quarter: Math.ceil((new Date().getMonth() + 1) / 3),
    description: ''
  });

  useEffect(() => {
    fetchBudgets();
  }, [selectedYear, selectedPeriod, selectedMonth, selectedQuarter]);

  const fetchBudgets = async () => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const budgetData = {
        ...formData,
        amount: parseFloat(formData.amount),
        year: parseInt(formData.year.toString()),
        month: formData.period === 'monthly' ? parseInt(formData.month.toString()) : undefined,
        quarter: formData.period === 'quarterly' ? parseInt(formData.quarter.toString()) : undefined
      };

      const response = await fetch('/api/accounting/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budgetData)
      });

      if (response.ok) {
        const newBudget = await response.json();
        setBudgets([...budgets, newBudget]);
        onBudgetUpdated?.(newBudget);
        resetForm();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error creating budget:', error);
    } finally {
      setIsLoading(false);
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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Budget Tracker</h3>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {periods.map(period => (
              <option key={period} value={period}>{period.charAt(0).toUpperCase() + period.slice(1)}</option>
            ))}
          </select>
          {selectedPeriod === 'monthly' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Add Budget
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Total Budget</div>
          <div className="text-2xl font-bold text-blue-700">
            {totalBudget.toLocaleString()} RWF
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Total Spent</div>
          <div className="text-2xl font-bold text-green-700">
            {totalActual.toLocaleString()} RWF
          </div>
        </div>
        <div className={`p-4 rounded-lg ${totalVariance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`text-sm font-medium ${totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Variance
          </div>
          <div className={`text-2xl font-bold ${totalVariance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {totalVariance.toLocaleString()} RWF
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-sm text-yellow-600 font-medium">Over Budget</div>
          <div className="text-2xl font-bold text-yellow-700">{overBudgetCount}</div>
        </div>
      </div>

      {/* Budget Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budgeted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading budgets...
                </td>
              </tr>
            ) : budgets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No budgets found for this period
                </td>
              </tr>
            ) : (
              budgets.map((budget) => (
                <tr key={budget.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {budget.category.charAt(0).toUpperCase() + budget.category.slice(1)}
                    </div>
                    {budget.description && (
                      <div className="text-sm text-gray-500">
                        {budget.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {budget.amount.toLocaleString()} RWF
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(budget.actualAmount || 0).toLocaleString()} RWF
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className={`${(budget.variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(budget.variance || 0).toLocaleString()} RWF
                    </div>
                    <div className="text-xs text-gray-500">
                      {budget.variancePercentage?.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(budget.status || '')}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(budget.status || '')}`}>
                        {budget.status?.replace('_', ' ') || 'No data'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setEditingBudget(budget)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <FaEdit />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBudget ? 'Edit Budget' : 'Add New Budget'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount (RWF)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Period</label>
                  <select
                    required
                    value={formData.period}
                    onChange={(e) => setFormData({...formData, period: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {periods.map(period => (
                      <option key={period} value={period}>{period.charAt(0).toUpperCase() + period.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <input
                      type="number"
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  {formData.period === 'monthly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Month</label>
                      <select
                        value={formData.month}
                        onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <option key={month} value={month}>
                            {new Date(0, month - 1).toLocaleString('default', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {formData.period === 'quarterly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quarter</label>
                      <select
                        value={formData.quarter}
                        onChange={(e) => setFormData({...formData, quarter: parseInt(e.target.value)})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        {Array.from({ length: 4 }, (_, i) => i + 1).map(quarter => (
                          <option key={quarter} value={quarter}>Q{quarter}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : (editingBudget ? 'Update' : 'Add')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
