"use client"

import { useState, useEffect } from 'react';
import { FaDownload, FaFilter, FaSearch, FaBalanceScale, FaChartLine } from 'react-icons/fa';

interface LedgerEntry {
  id: string;
  date: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  runningBalance: number;
  type: string;
  reference: string;
  status?: string;
  category?: string;
  dueDate?: string;
}

interface AccountSummary {
  account: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  transactionCount: number;
}

interface GeneralLedgerProps {
  onDataExport?: (data: any) => void;
}

export default function GeneralLedger({ onDataExport }: GeneralLedgerProps) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [accountSummaries, setAccountSummaries] = useState<AccountSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    account: '',
    type: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLedgerData();
  }, [filters.startDate, filters.endDate, filters.account, filters.type]);

  const fetchLedgerData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.account) params.append('account', filters.account);
      
      const response = await fetch(`/api/accounting/ledger?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
        setAccountSummaries(data.accountSummaries || []);
      }
    } catch (error) {
      console.error('Error fetching ledger data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        entry.description.toLowerCase().includes(searchTerm) ||
        entry.account.toLowerCase().includes(searchTerm) ||
        entry.reference.toLowerCase().includes(searchTerm)
      );
    }
    if (filters.type && entry.type !== filters.type) return false;
    return true;
  });

  const exportToExcel = () => {
    const data = {
      entries: filteredEntries,
      accountSummaries,
      period: filters.startDate && filters.endDate ? 
        `${filters.startDate} to ${filters.endDate}` : 'All Time',
      generatedAt: new Date().toISOString()
    };
    onDataExport?.(data);
  };

  const getAccountTypeColor = (account: string) => {
    if (account.includes('Bank') || account.includes('Momo')) return 'text-blue-600 bg-blue-100';
    if (account.includes('Receivable')) return 'text-green-600 bg-green-100';
    if (account.includes('Payable')) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'text-green-600 bg-green-100';
      case 'expense': return 'text-red-600 bg-red-100';
      case 'receivable': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const totalDebits = filteredEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredits = filteredEntries.reduce((sum, entry) => sum + entry.credit, 0);
  const netBalance = totalCredits - totalDebits;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FaBalanceScale /> General Ledger
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <FaFilter /> Filters
          </button>
          <button
            onClick={exportToExcel}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
              <select
                value={filters.account}
                onChange={(e) => setFilters({...filters, account: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Accounts</option>
                {Array.from(new Set(entries.map(e => e.account))).map(account => (
                  <option key={account} value={account}>{account}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="receivable">Receivable</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search descriptions, accounts, or references..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 pl-10 text-sm"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Total Debits</div>
          <div className="text-2xl font-bold text-blue-700">
            {totalDebits.toLocaleString()} RWF
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Total Credits</div>
          <div className="text-2xl font-bold text-green-700">
            {totalCredits.toLocaleString()} RWF
          </div>
        </div>
        <div className={`p-4 rounded-lg ${netBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`text-sm font-medium ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Net Balance
          </div>
          <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {netBalance.toLocaleString()} RWF
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-sm text-yellow-600 font-medium">Transactions</div>
          <div className="text-2xl font-bold text-yellow-700">{filteredEntries.length}</div>
        </div>
      </div>

      {/* Account Summaries */}
      {accountSummaries.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Account Summaries</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accountSummaries.map((summary, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">{summary.account}</h5>
                  <span className={`px-2 py-1 rounded-full text-xs ${getAccountTypeColor(summary.account)}`}>
                    {summary.balance >= 0 ? 'Credit' : 'Debit'}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Debits:</span>
                    <span className="font-medium">{summary.totalDebit.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credits:</span>
                    <span className="font-medium">{summary.totalCredit.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-gray-600">Balance:</span>
                    <span className={`font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {summary.balance.toLocaleString()} RWF
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {summary.transactionCount} transactions
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ledger Entries Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Debit
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credit
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Loading ledger entries...
                </td>
              </tr>
            ) : filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No ledger entries found
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getAccountTypeColor(entry.account)}`}>
                      {entry.account}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate">{entry.description}</div>
                    {entry.category && (
                      <div className="text-xs text-gray-500">{entry.category}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {entry.debit > 0 ? entry.debit.toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {entry.credit > 0 ? entry.credit.toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    <span className={`font-medium ${entry.runningBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.runningBalance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getTransactionTypeColor(entry.type)}`}>
                      {entry.type}
                    </span>
                    {entry.status && (
                      <div className="text-xs text-gray-500 mt-1">{entry.status}</div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination would go here if needed */}
      {filteredEntries.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {filteredEntries.length} of {entries.length} entries
        </div>
      )}
    </div>
  );
}
