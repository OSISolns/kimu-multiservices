
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
                alert(`${transactionType === 'CREDIT' ? 'Funds added' : 'Expense recorded'} successfully!`);
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
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                            <FaMoneyBillWave className="text-2xl" />
                        </div>
                        <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-lg">Current Balance</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">{formatRWF(balance)}</h3>
                    <p className="text-blue-100 text-sm">Available Petty Cash</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <FaPlus className="text-2xl text-green-600" />
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">Total In</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {formatRWF(transactions.filter(t => t.type === 'CREDIT').reduce((acc, curr) => acc + curr.amount, 0))}
                    </h3>
                    <p className="text-gray-500 text-sm">Total Replenishments</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-50 rounded-xl">
                            <FaMinus className="text-2xl text-red-600" />
                        </div>
                        <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-lg">Total Out</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {formatRWF(transactions.filter(t => t.type === 'DEBIT').reduce((acc, curr) => acc + curr.amount, 0))}
                    </h3>
                    <p className="text-gray-500 text-sm">Total Expenses</p>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-sm"
                        />
                    </div>
                    <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
                        <FaFilter />
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setTransactionType('CREDIT');
                            setShowAddModal(true);
                        }}
                        className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <FaPlus /> Replenish
                    </button>
                    <button
                        onClick={() => {
                            setTransactionType('DEBIT');
                            setShowAddModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                {transactionType === 'CREDIT' ? 'Replenish Petty Cash' : 'Record Expense'}
                            </h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimesCircle className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RWF)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="What is this for?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
                                    <input
                                        type="text"
                                        value={formData.requestedBy}
                                        onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Name"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`flex-1 px-4 py-2 text-white rounded-xl shadow-lg transition-all transform active:scale-95 font-medium ${transactionType === 'CREDIT'
                                        ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30'
                                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                                        }`}
                                >
                                    {transactionType === 'CREDIT' ? 'Add Funds' : 'Record Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Transaction Modal */}
            {showEditModal && selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">
                                Edit Transaction
                            </h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setSelectedTransaction(null);
                                    setFormData({ description: '', amount: '', category: '', requestedBy: '', date: '' });
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimesCircle className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                                <select
                                    value={transactionType}
                                    onChange={(e) => setTransactionType(e.target.value as 'CREDIT' | 'DEBIT')}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                >
                                    <option value="CREDIT">Credit (Add Funds)</option>
                                    <option value="DEBIT">Debit (Expense)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RWF)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="What is this for?"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
                                    <input
                                        type="text"
                                        value={formData.requestedBy}
                                        onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Name"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedTransaction(null);
                                        setFormData({ description: '', amount: '', category: '', requestedBy: '', date: '' });
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 font-medium"
                                >
                                    Update Transaction
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-100 rounded-xl">
                                    <FaTrash className="text-red-600 text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Delete Transaction</h3>
                                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Description:</span>
                                    <span className="font-medium text-gray-900">{selectedTransaction.description}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Amount:</span>
                                    <span className={`font-bold ${selectedTransaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedTransaction.type === 'CREDIT' ? '+' : '-'}{formatRWF(selectedTransaction.amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Date:</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(selectedTransaction.date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-600">
                                Are you sure you want to delete this transaction? This will affect your petty cash balance.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedTransaction(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/30 transition-all transform active:scale-95 font-medium"
                                >
                                    Delete Transaction
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
