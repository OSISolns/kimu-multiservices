"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "../../../UserContext";
import { FaSearch, FaPlus, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
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
            lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
        ), [leads, searchTerm]
    );

    if (isLoading || isLoadingData) {
        return <LoadingSpinner size="lg" message="Loading Customers..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
                    <p className="text-gray-500">View and manage your customer database.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                        />
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm">
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
                        {filteredLeads.map((lead) => (
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
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
