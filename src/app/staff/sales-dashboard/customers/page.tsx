"use client";

import React, { useState, useEffect, useMemo, MouseEvent } from "react";
import { useUser } from "../../../UserContext";
import {
    FaSearch,
    FaPlus,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaTimes,
    FaEdit,
    FaTrash,
    FaUsers,
    FaHandshake,
    FaTrophy,
    FaChartLine
} from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Lead {
    id: string;
    name: string;
    company: string;
    stage: string;
    value: number;
    contact: string;
    email: string;
    location: string;
    lastContact: string;
    nextFollowUp: string;
}

export default function CustomersPage() {
    const { user, isLoading } = useUser();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<Lead>>({
        stage: 'Contacted',
        value: 0
    });
    const [selectedStage, setSelectedStage] = useState<string>('All');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

    const stats = useMemo(() => {
        const totalCustomers = leads.length;
        const activeDeals = leads.filter((l: Lead) => ['Contacted', 'Proposal Sent', 'Negotiation'].includes(l.stage)).length;
        const closedWon = leads.filter((l: Lead) => l.stage === 'Closed Won').length;
        const pipelineValue = leads
            .filter((l: Lead) => ['Contacted', 'Proposal Sent', 'Negotiation'].includes(l.stage))
            .reduce((sum: number, l: Lead) => sum + (l.value || 0), 0);

        return { totalCustomers, activeDeals, closedWon, pipelineValue };
    }, [leads]);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                setIsLoadingData(true);
                const response = await fetch('/api/leads?limit=100');
                if (response.ok) {
                    const data = await response.json();
                    setLeads(data.data || data);
                }
            } catch (error) {
                console.error('Error fetching leads:', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (user && !isLoading) {
            fetchLeads();
        }
    }, [user, isLoading]);

    const handleAddCustomer = async () => {
        if (!formData.name || !formData.company) {
            alert('Please fill in name and company fields.');
            return;
        }

        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const newLead = await response.json();
                setLeads([newLead, ...leads]);
                setIsAddModalOpen(false);
                setFormData({ stage: 'Contacted', value: 0 });
            } else {
                alert('Failed to add customer');
            }
        } catch (error) {
            console.error('Error adding customer:', error);
            alert('An error occurred while adding the customer.');
        }
    };

    const handleViewCustomer = (lead: Lead) => {
        setSelectedLead(lead);
        setFormData(lead);
        setIsViewModalOpen(true);
        setIsEditMode(false);
    };

    const handleEditCustomer = async () => {
        if (!selectedLead || !formData.name || !formData.company) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            const response = await fetch(`/api/leads/${selectedLead.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const updatedLead = await response.json();
                setLeads(leads.map((l: Lead) => l.id === selectedLead.id ? updatedLead : l));
                setIsViewModalOpen(false);
                setIsEditMode(false);
            } else {
                alert('Failed to update customer');
            }
        } catch (error) {
            console.error('Error updating customer:', error);
            alert('An error occurred while updating the customer.');
        }
    };

    const handleDeleteCustomer = async () => {
        if (!leadToDelete) return;

        try {
            const response = await fetch(`/api/leads/${leadToDelete.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setLeads(leads.filter((l: Lead) => l.id !== leadToDelete.id));
                setIsDeleteModalOpen(false);
                setLeadToDelete(null);
                setIsViewModalOpen(false);
            } else {
                alert('Failed to delete customer');
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('An error occurred while deleting the customer.');
        }
    };

    const filteredLeads = useMemo(() =>
        leads.filter((lead: Lead) => {
            const matchesSearch =
                lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.email?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStage = selectedStage === 'All' ||
                (selectedStage === 'Active' ? ['Contacted', 'Proposal Sent', 'Negotiation'].includes(lead.stage) :
                    selectedStage === 'Won' ? lead.stage === 'Closed Won' :
                        lead.stage === selectedStage);

            return matchesSearch && matchesStage;
        }), [leads, searchTerm, selectedStage]
    );

    if (isLoading || isLoadingData) {
        return <LoadingSpinner size="lg" message="Loading Customers..." />;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm font-medium mb-1">Total Customers</p>
                            <h3 className="text-3xl font-bold">{stats.totalCustomers}</h3>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <FaUsers className="text-2xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-purple-100 text-sm font-medium mb-1">Active Deals</p>
                            <h3 className="text-3xl font-bold">{stats.activeDeals}</h3>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <FaHandshake className="text-2xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-green-100 text-sm font-medium mb-1">Closed Won</p>
                            <h3 className="text-3xl font-bold">{stats.closedWon}</h3>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <FaTrophy className="text-2xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-orange-100 text-sm font-medium mb-1">Pipeline Value</p>
                            <h3 className="text-3xl font-bold">RWF {stats.pipelineValue.toLocaleString()}</h3>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <FaChartLine className="text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full">
                    {['All', 'Active', 'Won', 'Closed Lost'].map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedStage(type)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap
                                ${selectedStage === type
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            {type === 'All' ? 'All Leads' : type}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search name, company..."
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium shadow-sm whitespace-nowrap"
                    >
                        <FaPlus className="w-4 h-4" />
                        <span>Add Customer</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Company</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLeads.map((lead: Lead) => (
                            <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {lead.name.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                            <div className="text-sm text-gray-500">{lead.company}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 flex items-center gap-2">
                                        <FaEnvelope className="text-gray-400" /> {lead.email}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                        <FaPhone className="text-gray-400" /> {lead.contact}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-gray-400" /> {lead.location}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${lead.stage === 'Closed Won' ? 'bg-green-100 text-green-800' :
                                            lead.stage === 'Closed Lost' ? 'bg-red-100 text-red-800' :
                                                'bg-blue-100 text-blue-800'}`}>
                                        {lead.stage}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(lead.lastContact).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                    <button
                                        onClick={() => handleViewCustomer(lead)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        View
                                    </button>
                                    {(user?.role === 'sales-rep' || user?.role === 'admin' || user?.role === 'manager') && (
                                        <button
                                            onClick={(e: MouseEvent) => {
                                                e.stopPropagation();
                                                setLeadToDelete(lead);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="text-red-600 hover:text-red-900 ml-2"
                                            title="Delete Customer"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Customer Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Add New Customer</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={formData.name || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={formData.company || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, company: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={formData.email || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={formData.contact || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, contact: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.location || ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={formData.stage || 'Contacted'}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, stage: e.target.value })}
                                    >
                                        <option value="Contacted">Contacted</option>
                                        <option value="Proposal Sent">Proposal Sent</option>
                                        <option value="Negotiation">Negotiation</option>
                                        <option value="Closed Won">Closed Won</option>
                                        <option value="Closed Lost">Closed Lost</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value (RWF)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={formData.value || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, value: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCustomer}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Add Customer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View/Edit Customer Modal */}
            {isViewModalOpen && selectedLead && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">
                                {isEditMode ? 'Edit Customer' : 'Customer Details'}
                            </h3>
                            <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </div>

                        {isEditMode ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={formData.name || ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={formData.company || ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, company: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={formData.email || ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={formData.contact || ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, contact: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={formData.location || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={formData.stage || ''}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, stage: e.target.value })}
                                        >
                                            <option value="Contacted">Contacted</option>
                                            <option value="Proposal Sent">Proposal Sent</option>
                                            <option value="Negotiation">Negotiation</option>
                                            <option value="Closed Won">Closed Won</option>
                                            <option value="Closed Lost">Closed Lost</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value (RWF)</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={formData.value || ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, value: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setIsEditMode(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEditCustomer}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-semibold text-gray-900">{selectedLead.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Company</p>
                                        <p className="font-semibold text-gray-900">{selectedLead.company}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-semibold text-gray-900">{selectedLead.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="font-semibold text-gray-900">{selectedLead.contact}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="font-semibold text-gray-900">{selectedLead.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Stage</p>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${selectedLead.stage === 'Closed Won' ? 'bg-green-100 text-green-800' :
                                                selectedLead.stage === 'Closed Lost' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'}`}>
                                            {selectedLead.stage}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Deal Value</p>
                                        <p className="font-semibold text-gray-900">RWF {selectedLead.value.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Last Contact</p>
                                        <p className="font-semibold text-gray-900">{new Date(selectedLead.lastContact).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4 flex gap-3">
                                    {(user?.role === 'sales-rep' || user?.role === 'admin' || user?.role === 'manager') && (
                                        <button
                                            onClick={() => {
                                                setLeadToDelete(selectedLead);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium flex items-center justify-center gap-2"
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsEditMode(true)}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                                    >
                                        <FaEdit /> Edit Customer
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && leadToDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110]">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaTrash className="text-red-600 text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Customer</h3>
                            <p className="text-gray-500 mb-6">
                                Are you sure you want to delete <span className="font-semibold text-gray-900">{leadToDelete.name}</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteCustomer}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                                >
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
