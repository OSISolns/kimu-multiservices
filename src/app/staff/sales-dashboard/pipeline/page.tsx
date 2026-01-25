"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useUser } from "../../../UserContext";
import {
    FaPlus,
    FaSearch,
    FaEllipsisH,
    FaTimes,
    FaFilter,
    FaFileExport,
    FaChartPie,
    FaFunnelDollar,
    FaPercentage,
    FaExclamationCircle
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

type SortOption = 'value-desc' | 'value-asc' | 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';

const STAGES = ["Contacted", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"];

export default function PipelinePage() {
    const { user, isLoading } = useUser();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeColumnMenu, setActiveColumnMenu] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>('date-desc');
    const [filterMinValue, setFilterMinValue] = useState<number>(0);
    const [filterMaxValue, setFilterMaxValue] = useState<number>(Infinity);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [newDeal, setNewDeal] = useState<Partial<Lead>>({
        stage: 'Contacted',
        value: 0
    });

    const stats = useMemo(() => {
        const totalValue = leads.reduce((sum: number, l: Lead) => sum + (l.stage === 'Closed Lost' ? 0 : l.value), 0);
        const activeLeads = leads.filter((l: Lead) => !['Closed Won', 'Closed Lost'].includes(l.stage));
        const activeValue = activeLeads.reduce((sum: number, l: Lead) => sum + l.value, 0);
        const winRate = leads.length > 0
            ? (leads.filter((l: Lead) => l.stage === 'Closed Won').length / leads.length) * 100
            : 0;
        const avgDealSize = leads.length > 0 ? totalValue / leads.length : 0;

        return { totalValue, activeValue, winRate, avgDealSize };
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

    const filteredLeads = useMemo(() =>
        leads.filter((lead: Lead) => {
            const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.company.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesValue = lead.value >= filterMinValue && lead.value <= filterMaxValue;
            return matchesSearch && matchesValue;
        }), [leads, searchTerm, filterMinValue, filterMaxValue]
    );

    const sortLeads = (leadsToSort: Lead[]) => {
        const sorted = [...leadsToSort];
        switch (sortBy) {
            case 'value-desc':
                return sorted.sort((a: Lead, b: Lead) => b.value - a.value);
            case 'value-asc':
                return sorted.sort((a: Lead, b: Lead) => a.value - b.value);
            case 'date-desc':
                return sorted.sort((a: Lead, b: Lead) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime());
            case 'date-asc':
                return sorted.sort((a: Lead, b: Lead) => new Date(a.lastContact).getTime() - new Date(b.lastContact).getTime());
            case 'name-asc':
                return sorted.sort((a: Lead, b: Lead) => a.name.localeCompare(b.name));
            case 'name-desc':
                return sorted.sort((a: Lead, b: Lead) => b.name.localeCompare(a.name));
            default:
                return sorted;
        }
    };

    const leadsByStage = useMemo(() => {
        return STAGES.map(stage => ({
            stage,
            leads: sortLeads(filteredLeads.filter((lead: Lead) => lead.stage === stage))
        }));
    }, [filteredLeads, sortBy]);

    const handleAddDeal = async () => {
        if (!newDeal.name || !newDeal.company) {
            alert('Please fill in name and company fields.');
            return;
        }

        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDeal)
            });

            if (response.ok) {
                const createdLead = await response.json();
                setLeads([createdLead, ...leads]);
                setIsAddModalOpen(false);
                setNewDeal({ stage: 'Contacted', value: 0 });
            } else {
                alert('Failed to add deal');
            }
        } catch (error) {
            console.error('Error adding deal:', error);
            alert('An error occurred while adding the deal.');
        }
    };

    const exportStageData = (stage: string) => {
        const stageLeads = leads.filter((lead: Lead) => lead.stage === stage);
        if (stageLeads.length === 0) {
            alert('No deals to export in this stage.');
            return;
        }

        const headers = ['Name', 'Company', 'Email', 'Phone', 'Location', 'Value (RWF)', 'Last Contact', 'Next Follow Up'];
        const csvContent = [
            headers.join(','),
            ...stageLeads.map((lead: Lead) => [
                `"${lead.name}"`,
                `"${lead.company}"`,
                `"${lead.email || 'N/A'}"`,
                `"${lead.contact || 'N/A'}"`,
                `"${lead.location || 'N/A'}"`,
                lead.value,
                `"${new Date(lead.lastContact).toLocaleDateString()}"`,
                `"${lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : 'N/A'}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${stage.replace(/\s+/g, '_')}_deals_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setActiveColumnMenu(null);
    };

    const exportAllData = () => {
        if (filteredLeads.length === 0) {
            alert('No deals to export.');
            return;
        }

        const headers = ['Name', 'Company', 'Stage', 'Email', 'Phone', 'Location', 'Value (RWF)', 'Last Contact', 'Next Follow Up'];
        const csvContent = [
            headers.join(','),
            ...filteredLeads.map((lead: Lead) => [
                `"${lead.name}"`,
                `"${lead.company}"`,
                `"${lead.stage}"`,
                `"${lead.email || 'N/A'}"`,
                `"${lead.contact || 'N/A'}"`,
                `"${lead.location || 'N/A'}"`,
                lead.value,
                `"${new Date(lead.lastContact).toLocaleDateString()}"`,
                `"${lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleDateString() : 'N/A'}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `all_pipeline_deals_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearFilters = () => {
        setFilterMinValue(0);
        setFilterMaxValue(Infinity);
        setShowFilterModal(false);
    };

    if (isLoading || isLoadingData) {
        return <LoadingSpinner size="lg" message="Loading Pipeline..." />;
    }

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm font-medium mb-1">Pipeline Value</p>
                            <h3 className="text-2xl font-bold">RWF {stats.activeValue.toLocaleString()}</h3>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <FaFunnelDollar className="text-2xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-purple-100 text-sm font-medium mb-1">Avg Deal Size</p>
                            <h3 className="text-2xl font-bold">RWF {Math.round(stats.avgDealSize).toLocaleString()}</h3>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <FaChartPie className="text-2xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-green-100 text-sm font-medium mb-1">Win Rate</p>
                            <h3 className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</h3>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <FaPercentage className="text-2xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-orange-100 text-sm font-medium mb-1">At Risk</p>
                            <h3 className="text-2xl font-bold">0</h3>
                        </div>
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <FaExclamationCircle className="text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Sales Pipeline</h2>
                    <p className="text-gray-500">Manage your deals and track progress.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 transition-all"
                        />
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as SortOption)}
                        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                        <option value="date-desc">Latest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="value-desc">Highest Value</option>
                        <option value="value-asc">Lowest Value</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                    </select>

                    <button
                        onClick={() => setShowFilterModal(true)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${filterMinValue > 0 || filterMaxValue < Infinity
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <FaFilter />
                        Filter
                    </button>

                    <button
                        onClick={exportAllData}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
                    >
                        <FaFileExport />
                        Export All
                    </button>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
                    >
                        <FaPlus className="w-4 h-4" />
                        <span>Add Deal</span>
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-max h-full">
                    {leadsByStage.map((column) => (
                        <div key={column.stage} className="w-80 flex flex-col bg-gray-100 rounded-xl p-4 h-full max-h-[calc(100vh-12rem)]">
                            <div className="flex justify-between items-center mb-4 px-1">
                                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                                    {column.stage}
                                    <span className="bg-white text-gray-500 px-2 py-0.5 rounded-full text-xs border border-gray-200">
                                        {column.leads.length}
                                    </span>
                                </h3>
                                <div className="relative">
                                    <button
                                        onClick={() => setActiveColumnMenu(activeColumnMenu === column.stage ? null : column.stage)}
                                        className="text-gray-400 hover:text-gray-600 p-1"
                                    >
                                        <FaEllipsisH />
                                    </button>

                                    {activeColumnMenu === column.stage && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                            <button
                                                onClick={() => exportStageData(column.stage)}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 rounded-t-lg"
                                            >
                                                <FaFileExport className="text-green-600" />
                                                Export Stage Data
                                            </button>
                                            <div className="border-t border-gray-100">
                                                <div className="px-4 py-2 text-xs text-gray-500">
                                                    Total Value: {column.leads.reduce((sum: number, lead: Lead) => sum + lead.value, 0).toLocaleString()} RWF
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {column.leads.map((lead: Lead) => (
                                    <div
                                        key={lead.id}
                                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold text-gray-900 text-sm">{lead.name}</h4>
                                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                {lead.value.toLocaleString()} RWF
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">{lead.company}</p>

                                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                            <div className="text-xs text-gray-400">
                                                {new Date(lead.lastContact).toLocaleDateString()}
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                {/* Actions placeholder */}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {column.leads.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                                        No deals
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Filter Deals</h3>
                            <button onClick={() => setShowFilterModal(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Value (RWF)</label>
                                <input
                                    type="number"
                                    value={filterMinValue}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterMinValue(parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Value (RWF)</label>
                                <input
                                    type="number"
                                    value={filterMaxValue === Infinity ? '' : filterMaxValue}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterMaxValue(parseInt(e.target.value) || Infinity)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="No limit"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={clearFilters}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Clear Filters
                            </button>
                            <button
                                onClick={() => setShowFilterModal(false)}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Deal Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Add New Deal</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="John Doe"
                                        value={newDeal.name || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDeal({ ...newDeal, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Acme Corp"
                                        value={newDeal.company || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDeal({ ...newDeal, company: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="john@acme.com"
                                        value={newDeal.email || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDeal({ ...newDeal, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="+250 XXX XXX XXX"
                                        value={newDeal.contact || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDeal({ ...newDeal, contact: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Kigali, Rwanda"
                                    value={newDeal.location || ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDeal({ ...newDeal, location: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={newDeal.stage || 'Contacted'}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewDeal({ ...newDeal, stage: e.target.value })}
                                    >
                                        {STAGES.map(stage => (
                                            <option key={stage} value={stage}>{stage}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value (RWF)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="0"
                                        value={newDeal.value || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDeal({ ...newDeal, value: parseInt(e.target.value) || 0 })}
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
                                onClick={handleAddDeal}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Add Deal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
