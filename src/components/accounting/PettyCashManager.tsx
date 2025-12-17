
"use client";

import { useState, useEffect } from 'react';
import {
    FaPlus, FaMinus, FaHistory, FaFileInvoiceDollar, FaSearch,
    FaFilter, FaDownload, FaEllipsisV, FaCheckCircle, FaTimesCircle,
    FaMoneyBillWave, FaCoins, FaEdit, FaTrash
} from 'react-icons/fa';

type PettyCashTransaction = {
    id: number;
    date: string;
    description: string;
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    category?: string;
    requestedBy?: string;
    approvedBy?: string;
    status: string;
    balanceAfter?: number;
};

export default function PettyCashManager() {
    const [transactions, setTransactions] = useState<PettyCashTransaction[]>([]);
    const [balance, setBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<PettyCashTransaction | null>(null);
    const [transactionType, setTransactionType] = useState<'CREDIT' | 'DEBIT'>('DEBIT');

    // Form state
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: '',
        requestedBy: '',
        date: '',
    });

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/accounting/petty-cash');
            if (response.ok) {
                const data = await response.json();
                setTransactions(data.transactions);
                setBalance(data.balance);
            }
        } catch (error) {
            console.error('Error fetching petty cash data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate amount
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            alert('Please enter a valid amount greater than 0');
            return;
        }

        try {
            const response = await fetch('/api/accounting/petty-cash', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: formData.description,
                    amount: parseFloat(formData.amount),
                    type: transactionType,
                    category: formData.category || 'other',
                    requestedBy: formData.requestedBy || 'Unknown',
                    status: 'completed',
                }),
            });

            if (response.ok) {
                // Show success feedback
                setShowAddModal(false);
                setFormData({ description: '', amount: '', category: '', requestedBy: '', date: '' });
                fetchTransactions();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to save transaction'}`);
            }
        } catch (error) {
            console.error('Error submitting transaction:', error);
            alert('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (transaction: PettyCashTransaction) => {
        setSelectedTransaction(transaction);
        setTransactionType(transaction.type);
        setFormData({
            description: transaction.description,
            amount: transaction.amount.toString(),
            category: transaction.category || '',
            requestedBy: transaction.requestedBy || '',
            date: new Date(transaction.date).toISOString().split('T')[0], // Format as YYYY-MM-DD
        });
        setShowEditModal(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTransaction) return;

        // Validate amount
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            alert('Please enter a valid amount greater than 0');
            return;
        }

        try {
            const response = await fetch(`/api/accounting/petty-cash/${selectedTransaction.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: formData.description,
                    amount: parseFloat(formData.amount),
                    type: transactionType,
                    category: formData.category || 'other',
                    requestedBy: formData.requestedBy || 'Unknown',
                    status: selectedTransaction.status,
                    date: formData.date ? new Date(formData.date).toISOString() : undefined,
                }),
            });

            if (response.ok) {
                alert('Transaction updated successfully!');
                setShowEditModal(false);
                setSelectedTransaction(null);
                setFormData({ description: '', amount: '', category: '', requestedBy: '', date: '' });
                fetchTransactions();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to update transaction'}`);
            }
        } catch (error) {
            console.error('Error updating transaction:', error);
            alert('Network error. Please check your connection and try again.');
        }
    };

    const handleDeleteClick = (transaction: PettyCashTransaction) => {
        setSelectedTransaction(transaction);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!selectedTransaction) return;

        try {
            const response = await fetch(`/api/accounting/petty-cash/${selectedTransaction.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('Transaction deleted successfully!');
                setShowDeleteModal(false);
                setSelectedTransaction(null);
                fetchTransactions();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Failed to delete transaction'}`);
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Network error. Please check your connection and try again.');
        }
    };

    const formatRWF = (amount: number) => {
        return amount.toLocaleString('en-RW') + ' RWF';
    };

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-3xl p-6 text-white shadow-xl shadow-orange-500/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <FaMoneyBillWave className="text-2xl" />
                        </div>
                        <span className="text-[10px] font-black bg-white/30 px-3 py-1 rounded-full uppercase tracking-widest">Current Balance</span>
                    </div>
                    <h3 className="text-3xl font-black mb-1 relative z-10">{formatRWF(balance)}</h3>
                    <p className="text-orange-100 text-xs font-bold uppercase tracking-wider relative z-10">Available Petty Cash</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border-2 border-gray-50 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl">
                            <FaPlus className="text-2xl text-emerald-600" />
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Total In</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-1">
                        {formatRWF(transactions.filter(t => t.type === 'CREDIT').reduce((acc, curr) => acc + curr.amount, 0))}
                    </h3>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Replenishments</p>
                </div>

                <div className="bg-white rounded-3xl p-6 border-2 border-gray-50 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-rose-50 rounded-2xl">
                            <FaMinus className="text-2xl text-rose-600" />
                        </div>
                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-widest">Total Out</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-1">
                        {formatRWF(transactions.filter(t => t.type === 'DEBIT').reduce((acc, curr) => acc + curr.amount, 0))}
                    </h3>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Expenses</p>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-3xl border-2 border-white/50 shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all text-sm font-medium"
                        />
                    </div>
                    <button className="p-3 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all">
                        <FaFilter />
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setTransactionType('CREDIT');
                            setShowAddModal(true);
                        }}
                        className="px-6 py-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-emerald-100"
                    >
                        <FaPlus /> Replenish
                    </button>
                    <button
                        onClick={() => {
                            setTransactionType('DEBIT');
                            setShowAddModal(true);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-700 hover:to-amber-700 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/30 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <FaMinus /> New Expense
                    </button>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Requested By</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No transactions found
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {transaction.description}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs">
                                                {transaction.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {transaction.requestedBy || '-'}
                                        </td>
                                        <td className={`px-6 py-4 text-sm font-bold text-right ${transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {transaction.type === 'CREDIT' ? '+' : '-'}{formatRWF(transaction.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {transaction.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(transaction)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit transaction"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(transaction)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete transaction"
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

            {/* Add Transaction Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-12 animate-fadeIn overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all scale-100 my-8">
                        {/* Header with Gradient */}
                        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-orange-600 to-amber-600">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        {transactionType === 'CREDIT' ? (
                                            <FaPlus className="text-white text-lg" />
                                        ) : (
                                            <FaMinus className="text-white text-lg" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                            {transactionType === 'CREDIT' ? 'Replenish Petty Cash' : 'Record Expense'}
                                        </h3>
                                        <p className="text-sm text-orange-100 font-medium">
                                            {transactionType === 'CREDIT' ? 'Add funds to petty cash' : 'Record a new petty cash expense'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                                >
                                    <FaTimesCircle className="text-2xl" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-black text-orange-600 uppercase tracking-widest">
                                    <FaMoneyBillWave className="text-lg" />
                                    Transaction Details
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Amount (RWF)</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                <FaMoneyBillWave className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="number"
                                                required
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                className="w-full pl-12 pr-16 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-black text-gray-900 text-lg hover:border-gray-200"
                                                placeholder="0.00"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-black">RWF</span>
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-semibold text-gray-900 hover:border-gray-200"
                                            placeholder="What is this for?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-semibold text-gray-900 appearance-none cursor-pointer hover:border-gray-200"
                                        >
                                            <option value="">Select Category...</option>
                                            <option value="office">Office Supplies</option>
                                            <option value="transport">Transport</option>
                                            <option value="food">Food & Meals</option>
                                            <option value="utilities">Utilities</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Requested By</label>
                                        <input
                                            type="text"
                                            value={formData.requestedBy}
                                            onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-500 focus:bg-white outline-none transition-all font-semibold text-gray-900 hover:border-gray-200"
                                            placeholder="Name"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-500 rounded-2xl hover:bg-gray-50 font-black uppercase tracking-widest transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`flex-[2] px-6 py-4 text-white rounded-2xl shadow-xl transition-all transform active:scale-95 font-black uppercase tracking-widest flex items-center justify-center gap-3 ${transactionType === 'CREDIT'
                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/30'
                                        : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-orange-500/30'
                                        }`}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <FaCheckCircle className="text-lg" />
                                    )}
                                    {transactionType === 'CREDIT' ? 'Add Funds' : 'Record Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Transaction Modal */}
            {showEditModal && selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-12 animate-fadeIn overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all scale-100 my-8">
                        {/* Header with Gradient */}
                        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <FaEdit className="text-white text-lg" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Edit Transaction</h3>
                                        <p className="text-sm text-blue-100 mt-0.5">Update transaction information</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedTransaction(null);
                                        setFormData({ description: '', amount: '', category: '', requestedBy: '', date: '' });
                                    }}
                                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                                >
                                    <FaTimesCircle className="text-xl" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    <FaHistory className="text-blue-600" />
                                    Transaction Details
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction Type</label>
                                        <select
                                            value={transactionType}
                                            onChange={(e) => setTransactionType(e.target.value as 'CREDIT' | 'DEBIT')}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                                        >
                                            <option value="CREDIT">Credit (Add Funds)</option>
                                            <option value="DEBIT">Debit (Expense)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (RWF)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                required
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                className="w-full pl-4 pr-16 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold text-gray-900 hover:border-gray-300"
                                                placeholder="0.00"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">RWF</span>
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                                            placeholder="What is this for?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                                        >
                                            <option value="">Select...</option>
                                            <option value="office">Office Supplies</option>
                                            <option value="transport">Transport</option>
                                            <option value="food">Food & Meals</option>
                                            <option value="utilities">Utilities</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Requested By</label>
                                        <input
                                            type="text"
                                            value={formData.requestedBy}
                                            onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                                            placeholder="Name"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedTransaction(null);
                                        setFormData({ description: '', amount: '', category: '', requestedBy: '', date: '' });
                                    }}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 font-semibold flex items-center justify-center gap-2"
                                >
                                    <FaCheckCircle />
                                    Update Transaction
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-32 animate-fadeIn overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-red-500 to-red-600">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <FaTrash className="text-white text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Delete Transaction</h3>
                                    <p className="text-red-100 text-sm">This action cannot be undone</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-100 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium uppercase tracking-wider text-xs">Description</span>
                                    <span className="font-bold text-gray-900">{selectedTransaction.description}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200/50">
                                    <span className="text-gray-500 font-medium uppercase tracking-wider text-xs">Amount</span>
                                    <span className={`font-black text-lg ${selectedTransaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedTransaction.type === 'CREDIT' ? '+' : '-'}{formatRWF(selectedTransaction.amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200/50">
                                    <span className="text-gray-500 font-medium uppercase tracking-wider text-xs">Date</span>
                                    <span className="font-bold text-gray-900">
                                        {new Date(selectedTransaction.date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed text-center px-4">
                                Are you sure you want to delete this transaction? This will permanently affect your <span className="font-bold text-gray-900">Petty Cash balance</span>.
                            </p>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedTransaction(null);
                                    }}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl shadow-lg shadow-red-500/30 transition-all transform active:scale-95 font-semibold flex items-center justify-center gap-2"
                                >
                                    <FaTrash />
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
