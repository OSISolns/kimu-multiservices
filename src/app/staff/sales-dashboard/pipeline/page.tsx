"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "../../../UserContext";
import { FaPlus, FaSearch, FaEllipsisH } from "react-icons/fa";
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

const STAGES = ["Contacted", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"];

export default function PipelinePage() {
    const { user, isLoading } = useUser();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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
        leads.filter(lead =>
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.company.toLowerCase().includes(searchTerm.toLowerCase())
        ), [leads, searchTerm]
    );

    const leadsByStage = useMemo(() => {
        return STAGES.map(stage => ({
            stage,
            leads: filteredLeads.filter(lead => lead.stage === stage)
        }));
    }, [filteredLeads]);

    if (isLoading || isLoadingData) {
        return <LoadingSpinner size="lg" message="Loading Pipeline..." />;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Sales Pipeline</h2>
                    <p className="text-gray-500">Manage your deals and track progress.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                        />
                    </div>
                    <button
                        onClick={() => alert('Add Deal feature coming soon!\n\nThis will allow you to create new deals and add them to your sales pipeline.')}
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
                                <button
                                    onClick={() => alert(`${column.stage} Column Options\n\n• Add Deal to ${column.stage}\n• Sort Deals\n• Filter Deals\n• Export Data\n\nFull pipeline management features coming soon!`)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaEllipsisH />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {column.leads.map((lead) => (
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
        </div>
    );
}
