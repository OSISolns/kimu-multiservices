"use client";

import { useState, useEffect } from "react";
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
    FaArrowRight,
    FaEdit,
    FaPause,
    FaPlay,
    FaTrash,
    FaEllipsisV
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

export default function CampaignsPage() {
    const { user, isLoading } = useUser();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
        status: 'Draft',
        type: 'Email',
        budget: 0
    });
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedCampaign, setEditedCampaign] = useState<Partial<Campaign>>({});

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setIsLoadingData(true);
                const response = await fetch('/api/campaigns?limit=100');
                if (response.ok) {
                    const data = await response.json();
                    // API returns data wrapped in { success, timestamp, data: { campaigns, pagination } }
                    const campaigns = data.data?.campaigns || [];
                    const fetchedCampaigns = campaigns.map((c: any) => {
                        const start = new Date(c.startDate);
                        const end = new Date(c.endDate);
                        const now = new Date();

                        let status: 'Active' | 'Draft' | 'Completed' | 'Paused' = 'Draft';
                        if (now > end) status = 'Completed';
                        else if (now >= start && now <= end) status = 'Active';
                        else if (now < start) status = 'Draft';

                        // Extract type from name if present (e.g. "[Email] Summer Sale")
                        let type: 'Email' | 'Social' | 'Ads' | 'Event' = 'Email';
                        let name = c.name;
                        if (c.name.startsWith('[')) {
                            const typeMatch = c.name.match(/^\[(.*?)\]/);
                            if (typeMatch) {
                                type = typeMatch[1] as any;
                                name = c.name.replace(/^\[.*?\]\s*/, '');
                            }
                        }

                        return {
                            id: c.id.toString(),
                            name: name,
                            status: status,
                            type: type,
                            reach: c.reach,
                            engagement: c.engagement,
                            conversion: c.conversions,
                            budget: c.budget,
                            spent: 0, // Not tracked in DB yet
                            startDate: start.toISOString().split('T')[0],
                            endDate: end.toISOString().split('T')[0]
                        };
                    });
                    setCampaigns(fetchedCampaigns);
                }
            } catch (error) {
                console.error('Error fetching campaigns:', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (user && !isLoading) {
            fetchCampaigns();
        }
    }, [user, isLoading]);

    const handleSaveCampaign = async () => {
        if (!newCampaign.name || !newCampaign.startDate || !newCampaign.endDate) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            // Prepend type to name to persist it
            const nameWithType = `[${newCampaign.type}] ${newCampaign.name}`;

            const payload = {
                name: nameWithType,
                budget: newCampaign.budget || 0,
                startDate: new Date(newCampaign.startDate).toISOString(),
                endDate: new Date(newCampaign.endDate).toISOString(),
                createdBy: user?.id,
                reach: 0,
                engagement: 0,
                leads: 0,
                conversions: 0
            };

            const response = await fetch('/api/campaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                const c = data.campaign;

                const createdCampaign: Campaign = {
                    id: c.id.toString(),
                    name: newCampaign.name!,
                    status: 'Draft', // Initially draft/scheduled
                    type: newCampaign.type as any,
                    reach: 0,
                    engagement: 0,
                    conversion: 0,
                    budget: c.budget,
                    spent: 0,
                    startDate: newCampaign.startDate!,
                    endDate: newCampaign.endDate!
                };

                setCampaigns([createdCampaign, ...campaigns]);
                setIsWizardOpen(false);
                setWizardStep(1);
                setNewCampaign({ status: 'Draft', type: 'Email', budget: 0 });
            } else {
                const errorData = await response.json();
                alert(`Failed to create campaign: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating campaign:', error);
            alert('An error occurred while creating the campaign.');
        }
    };

    const handleManageCampaign = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setIsManageModalOpen(true);
        setIsEditMode(false);
        setEditedCampaign(campaign);
    };

    const handleEditCampaign = async () => {
        if (!selectedCampaign || !editedCampaign.name) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            const nameWithType = editedCampaign.type && editedCampaign.name
                ? `[${editedCampaign.type}] ${editedCampaign.name.replace(/^\[.*?\]\s*/, '')}`
                : editedCampaign.name;

            const payload = {
                name: nameWithType,
                budget: editedCampaign.budget,
                startDate: editedCampaign.startDate ? new Date(editedCampaign.startDate).toISOString() : undefined,
                endDate: editedCampaign.endDate ? new Date(editedCampaign.endDate).toISOString() : undefined,
                reach: editedCampaign.reach,
                engagement: editedCampaign.engagement,
                conversions: editedCampaign.conversion,
                userId: user?.id
            };

            const response = await fetch(`/api/campaigns/${selectedCampaign.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                const c = data.data.campaign;

                const updatedCampaign: Campaign = {
                    ...selectedCampaign,
                    name: editedCampaign.name.replace(/^\[.*?\]\s*/, ''),
                    type: editedCampaign.type as any,
                    budget: c.budget,
                    startDate: editedCampaign.startDate!,
                    endDate: editedCampaign.endDate!,
                    reach: c.reach,
                    engagement: c.engagement,
                    conversion: c.conversions
                };

                setCampaigns(campaigns.map(camp =>
                    camp.id === selectedCampaign.id ? updatedCampaign : camp
                ));
                setIsManageModalOpen(false);
                setIsEditMode(false);
            } else {
                const errorData = await response.json();
                alert(`Failed to update campaign: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating campaign:', error);
            alert('An error occurred while updating the campaign.');
        }
    };

    const handlePauseCampaign = async () => {
        if (!selectedCampaign) return;

        const newStatus = selectedCampaign.status === 'Paused' ? 'Active' : 'Paused';

        try {
            const response = await fetch(`/api/campaigns/${selectedCampaign.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, userId: user?.id })
            });

            if (response.ok) {
                setCampaigns(campaigns.map(camp =>
                    camp.id === selectedCampaign.id ? { ...camp, status: newStatus } : camp
                ));
                setSelectedCampaign({ ...selectedCampaign, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating campaign status:', error);
            alert('Failed to update campaign status.');
        }
    };

    const handleDeleteCampaign = async () => {
        if (!selectedCampaign) return;

        if (!confirm(`Are you sure you want to delete "${selectedCampaign.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/campaigns/${selectedCampaign.id}?userId=${user?.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setCampaigns(campaigns.filter(camp => camp.id !== selectedCampaign.id));
                setIsManageModalOpen(false);
            } else {
                const errorData = await response.json();
                alert(`Failed to delete campaign: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting campaign:', error);
            alert('An error occurred while deleting the campaign.');
        }
    };

    if (isLoading || isLoadingData) {
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
                        {campaigns.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                    No campaigns found. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            campaigns.map((campaign) => {
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
                                            <button
                                                onClick={() => handleManageCampaign(campaign)}
                                                className="text-blue-600 hover:text-blue-900 flex items-center gap-1 ml-auto"
                                            >
                                                <FaEllipsisV /> Manage
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
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

            {/* Campaign Management Modal */}
            {isManageModalOpen && selectedCampaign && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">
                                {isEditMode ? 'Edit Campaign' : 'Manage Campaign'}
                            </h3>
                            <button onClick={() => setIsManageModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </div>

                        {isEditMode ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={editedCampaign.name?.replace(/^\[.*?\]\s*/, '') || ''}
                                        onChange={e => setEditedCampaign({ ...editedCampaign, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Email', 'Social', 'Ads', 'Event'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setEditedCampaign({ ...editedCampaign, type: type as any })}
                                                className={`py-2 px-3 text-sm rounded-lg border transition-all
                                                    ${editedCampaign.type === type
                                                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={editedCampaign.startDate || ''}
                                            onChange={e => setEditedCampaign({ ...editedCampaign, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={editedCampaign.endDate || ''}
                                            onChange={e => setEditedCampaign({ ...editedCampaign, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget (RWF)</label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={editedCampaign.budget || ''}
                                        onChange={e => setEditedCampaign({ ...editedCampaign, budget: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setIsEditMode(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEditCampaign}
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
                                        <p className="text-sm text-gray-500">Campaign Name</p>
                                        <p className="font-semibold text-gray-900">{selectedCampaign.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Type</p>
                                        <p className="font-semibold text-gray-900">{selectedCampaign.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${selectedCampaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                selectedCampaign.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                                    selectedCampaign.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                            {selectedCampaign.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Budget</p>
                                        <p className="font-semibold text-gray-900">RWF {selectedCampaign.budget.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Reach</p>
                                        <p className="font-semibold text-gray-900">{selectedCampaign.reach.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Engagement</p>
                                        <p className="font-semibold text-gray-900">{selectedCampaign.engagement.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Conversions</p>
                                        <p className="font-semibold text-gray-900">{selectedCampaign.conversion.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Duration</p>
                                        <p className="font-semibold text-gray-900 text-xs">
                                            {selectedCampaign.startDate} to {selectedCampaign.endDate}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t pt-4 space-y-3">
                                    <button
                                        onClick={() => setIsEditMode(true)}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                                    >
                                        <FaEdit /> Edit Campaign
                                    </button>
                                    <button
                                        onClick={handlePauseCampaign}
                                        className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium flex items-center justify-center gap-2"
                                    >
                                        {selectedCampaign.status === 'Paused' ? <><FaPlay /> Resume Campaign</> : <><FaPause /> Pause Campaign</>}
                                    </button>
                                    <button
                                        onClick={handleDeleteCampaign}
                                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2"
                                    >
                                        <FaTrash /> Delete Campaign
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
