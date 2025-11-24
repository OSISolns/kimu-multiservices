"use client";

import { useState } from "react";
import { useUser } from "../../../UserContext";
import {
    FaBullhorn,
    FaPlus,
    FaChartLine,
    FaMousePointer,
    FaUsers,
    FaMoneyBillWave,
    FaTimes,
    FaCheck,
    FaArrowRight
} from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Campaign {
    id: string;
    name: string;
    status: 'Active' | 'Draft' | 'Completed' | 'Paused';
    type: 'Email' | 'Social' | 'Ads' | 'Event';
    reach: number;
    engagement: number;
    conversion: number;
    budget: number;
    spent: number;
    startDate: string;
    endDate: string;
}

const MOCK_CAMPAIGNS: Campaign[] = [
    {
        id: '1',
        name: 'Summer Sale 2025',
        status: 'Active',
        type: 'Social',
        reach: 15000,
        engagement: 3200,
        conversion: 150,
        budget: 5000,
        spent: 2100,
        startDate: '2025-06-01',
        endDate: '2025-06-30'
    },
    {
        id: '2',
        name: 'New Fleet Launch',
        status: 'Draft',
        type: 'Email',
        reach: 0,
        engagement: 0,
        conversion: 0,
        budget: 1000,
        spent: 0,
        startDate: '2025-07-15',
        endDate: '2025-08-15'
    },
    {
        id: '3',
        name: 'Q1 Clearance',
        status: 'Completed',
        type: 'Ads',
        reach: 45000,
        engagement: 8500,
        conversion: 420,
        budget: 10000,
        spent: 9800,
        startDate: '2025-01-01',
        endDate: '2025-03-31'
    }
];

export default function CampaignsPage() {
    const { user, isLoading } = useUser();
    const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
        status: 'Draft',
        type: 'Email',
        budget: 0
    });

    const handleSaveCampaign = () => {
        if (!newCampaign.name) return;

        const campaign: Campaign = {
            id: Math.random().toString(36).substr(2, 9),
            name: newCampaign.name!,
            status: 'Draft',
            type: newCampaign.type as any,
            reach: 0,
            engagement: 0,
            conversion: 0,
            budget: newCampaign.budget || 0,
            spent: 0,
            startDate: newCampaign.startDate || '',
            endDate: newCampaign.endDate || ''
        };

        setCampaigns([...campaigns, campaign]);
        setIsWizardOpen(false);
        setWizardStep(1);
        setNewCampaign({ status: 'Draft', type: 'Email', budget: 0 });
    };

    if (isLoading) {
        return <LoadingSpinner size="lg" message="Loading Campaigns..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
                    <p className="text-gray-500">Track and manage your marketing efforts.</p>
                </div>
                <button
                    onClick={() => setIsWizardOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
                >
                    <FaPlus className="w-4 h-4" />
                    <span>New Campaign</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FaUsers /></div>
                        <span className="text-sm font-medium text-gray-500">Total Reach</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {campaigns.reduce((acc, c) => acc + c.reach, 0).toLocaleString()}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><FaMousePointer /></div>
                        <span className="text-sm font-medium text-gray-500">Engagement</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {campaigns.reduce((acc, c) => acc + c.engagement, 0).toLocaleString()}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><FaCheck /></div>
                        <span className="text-sm font-medium text-gray-500">Conversions</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {campaigns.reduce((acc, c) => acc + c.conversion, 0).toLocaleString()}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><FaMoneyBillWave /></div>
                        <span className="text-sm font-medium text-gray-500">Total Spend</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        RWF {campaigns.reduce((acc, c) => acc + c.spent, 0).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reach</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget / Spent</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {campaigns.map((campaign) => {
                            const roi = campaign.spent > 0 ? ((campaign.conversion * 100) / campaign.spent).toFixed(1) : '0.0';
                            return (
                                <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-lg mr-3 
                                                ${campaign.type === 'Social' ? 'bg-blue-100 text-blue-600' :
                                                    campaign.type === 'Email' ? 'bg-yellow-100 text-yellow-600' :
                                                        campaign.type === 'Ads' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
                                                <FaBullhorn />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                                                <div className="text-xs text-gray-500">{campaign.type} • {campaign.startDate}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                campaign.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                                    campaign.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {campaign.reach.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">RWF {campaign.budget.toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">RWF {campaign.spent.toLocaleString()} spent</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-1 text-green-600 font-medium">
                                            <FaChartLine /> {roi}x
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900">Manage</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Campaign Wizard Modal */}
            {isWizardOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Create Campaign</h3>
                            <button onClick={() => setIsWizardOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Wizard Steps Indicator */}
                        <div className="flex items-center justify-center mb-8">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold 
                                ${wizardStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                            <div className={`w-16 h-1 bg-gray-200 mx-2 ${wizardStep >= 2 ? 'bg-blue-600' : ''}`}></div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold 
                                ${wizardStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                        </div>

                        {wizardStep === 1 ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Summer Sale"
                                        value={newCampaign.name || ''}
                                        onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Email', 'Social', 'Ads', 'Event'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setNewCampaign({ ...newCampaign, type: type as any })}
                                                className={`py-3 px-4 text-sm rounded-lg border text-left transition-all flex items-center gap-2
                                                    ${newCampaign.type === type
                                                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center
                                                    ${newCampaign.type === type ? 'border-blue-600' : 'border-gray-400'}`}>
                                                    {newCampaign.type === type && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                                                </div>
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={newCampaign.startDate || ''}
                                            onChange={e => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={newCampaign.endDate || ''}
                                            onChange={e => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget (RWF)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="5000"
                                        value={newCampaign.budget || ''}
                                        onChange={e => setNewCampaign({ ...newCampaign, budget: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 mt-8">
                            {wizardStep === 1 ? (
                                <button
                                    onClick={() => setIsWizardOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                            ) : (
                                <button
                                    onClick={() => setWizardStep(1)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Back
                                </button>
                            )}

                            {wizardStep === 1 ? (
                                <button
                                    onClick={() => setWizardStep(2)}
                                    disabled={!newCampaign.name}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    Next <FaArrowRight className="w-3 h-3" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSaveCampaign}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    Create Campaign
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
