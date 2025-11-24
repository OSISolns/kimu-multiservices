"use client";

import { useState } from "react";
import { useUser } from "../../../UserContext";
import {
    FaFileInvoiceDollar,
    FaFileAlt,
    FaPlus,
    FaDownload,
    FaSearch,
    FaEllipsisV,
    FaTimes
} from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

interface FinancialDoc {
    id: string;
    type: 'Invoice' | 'Quote';
    number: string;
    client: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue' | 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
    date: string;
    dueDate?: string;
}

const MOCK_DOCS: FinancialDoc[] = [
    {
        id: '1',
        type: 'Invoice',
        number: 'INV-2025-001',
        client: 'John Doe',
        amount: 1500,
        status: 'Paid',
        date: '2025-05-01',
        dueDate: '2025-05-15'
    },
    {
        id: '2',
        type: 'Quote',
        number: 'QT-2025-042',
        client: 'ABC Corp',
        amount: 45000,
        status: 'Sent',
        date: '2025-05-10',
        dueDate: '2025-06-10'
    },
    {
        id: '3',
        type: 'Invoice',
        number: 'INV-2025-002',
        client: 'XYZ Ltd',
        amount: 2800,
        status: 'Overdue',
        date: '2025-04-20',
        dueDate: '2025-05-04'
    },
    {
        id: '4',
        type: 'Quote',
        number: 'QT-2025-043',
        client: 'Jane Smith',
        amount: 1200,
        status: 'Draft',
        date: '2025-05-12',
        dueDate: '2025-05-26'
    }
];

export default function FinancialsPage() {
    const { user, isLoading } = useUser();
    const [docs, setDocs] = useState<FinancialDoc[]>(MOCK_DOCS);
    const [filterType, setFilterType] = useState<'All' | 'Invoice' | 'Quote'>('All');
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'Invoice' | 'Quote'>('Invoice');
    const [newDoc, setNewDoc] = useState<Partial<FinancialDoc>>({
        client: '',
        amount: 0
    });

    const filteredDocs = docs.filter(doc => {
        const matchesType = filterType === 'All' || doc.type === filterType;
        const matchesSearch = doc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.number.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    const handleCreateDoc = () => {
        if (!newDoc.client) return;

        const doc: FinancialDoc = {
            id: Math.random().toString(36).substr(2, 9),
            type: modalType,
            number: `${modalType === 'Invoice' ? 'INV' : 'QT'}-2025-${Math.floor(Math.random() * 1000)}`,
            client: newDoc.client!,
            amount: newDoc.amount || 0,
            status: 'Draft',
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
        };

        setDocs([doc, ...docs]);
        setIsModalOpen(false);
        setNewDoc({ client: '', amount: 0 });
    };

    const openModal = (type: 'Invoice' | 'Quote') => {
        setModalType(type);
        setIsModalOpen(true);
    };

    if (isLoading) {
        return <LoadingSpinner size="lg" message="Loading Financials..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Financials</h2>
                    <p className="text-gray-500">Manage quotes, invoices, and payments.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => openModal('Quote')}
                        className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium shadow-sm"
                    >
                        <FaFileAlt className="text-gray-500" />
                        <span>Create Quote</span>
                    </button>
                    <button
                        onClick={() => openModal('Invoice')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
                    >
                        <FaPlus className="w-4 h-4" />
                        <span>Create Invoice</span>
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex gap-2">
                    {['All', 'Invoice', 'Quote'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${filterType === type
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {type}s
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-64">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search client or number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredDocs.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className={`p-2 rounded-lg mr-3 
                                            ${doc.type === 'Invoice' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                            {doc.type === 'Invoice' ? <FaFileInvoiceDollar /> : <FaFileAlt />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{doc.number}</div>
                                            <div className="text-xs text-gray-500">{doc.type}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {doc.client}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    RWF {doc.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${doc.status === 'Paid' || doc.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                            doc.status === 'Overdue' || doc.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                doc.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                        {doc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {doc.date}
                                    <div className="text-xs text-gray-400">Due: {doc.dueDate}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-gray-400 hover:text-gray-600 mx-2"><FaDownload /></button>
                                    <button className="text-gray-400 hover:text-gray-600"><FaEllipsisV /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Create {modalType}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., John Doe"
                                    value={newDoc.client || ''}
                                    onChange={e => setNewDoc({ ...newDoc, client: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RWF)</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                    value={newDoc.amount || ''}
                                    onChange={e => setNewDoc({ ...newDoc, amount: parseFloat(e.target.value) })}
                                />
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500">
                                <p>Document number and dates will be generated automatically.</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateDoc}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Create {modalType}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
