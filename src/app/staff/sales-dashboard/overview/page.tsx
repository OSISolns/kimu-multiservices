"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "../../../UserContext";
import {
    FaChartLine,
    FaUsers,
    FaPercentage,
    FaFileInvoiceDollar,
    FaBullhorn,
    FaArrowUp,
    FaArrowDown
} from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function SalesOverviewPage() {
    const { user, isLoading } = useUser();
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [stats, setStats] = useState({
        totalLeads: 0,
        newLeads: 0,
        conversionRate: 0,
        activeDeals: 0,
        totalPipeline: 0,
        campaignReach: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true);
                // Parallel API calls
                const [leadsResponse, campaignsResponse] = await Promise.allSettled([
                    fetch('/api/leads?limit=100'),
                    fetch('/api/campaigns?limit=20')
                ]);

                let leads = [];
                let campaigns = [];

                if (leadsResponse.status === 'fulfilled' && leadsResponse.value.ok) {
                    const data = await leadsResponse.value.json();
                    leads = data.data || data;
                }

                if (campaignsResponse.status === 'fulfilled' && campaignsResponse.value.ok) {
                    const data = await campaignsResponse.value.json();
                    campaigns = data.campaigns || data;
                }

                // Calculate KPIs
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const newLeadsCount = leads.filter((lead: any) => {
                    const leadDate = new Date(lead.lastContact); // Using lastContact as proxy for creation if createdAt not available
                    return leadDate >= thirtyDaysAgo;
                }).length;

                const closedWon = leads.filter((lead: any) => lead.stage === 'Closed Won').length;
                const conversionRate = leads.length > 0 ? Math.round((closedWon / leads.length) * 100) : 0;
                const activeDeals = leads.filter((lead: any) => !['Closed Won', 'Closed Lost'].includes(lead.stage)).length;
                const totalPipeline = leads.reduce((sum: number, lead: any) => sum + (lead.value || 0), 0);
                const campaignReach = Array.isArray(campaigns) ? campaigns.reduce((sum: number, c: any) => sum + (c.reach || 0), 0) : 0;

                setStats({
                    totalLeads: leads.length,
                    newLeads: newLeadsCount,
                    conversionRate,
                    activeDeals,
                    totalPipeline,
                    campaignReach
                });

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (user && !isLoading) {
            fetchData();
        }
    }, [user, isLoading]);

    if (isLoading || isLoadingData) {
        return <LoadingSpinner size="lg" message="Loading Overview..." />;
    }

    const kpiCards = [
        { label: 'Total Leads', value: stats.totalLeads, icon: FaUsers, color: 'blue', change: '+12%', trend: 'up' },
        { label: 'New Leads (30d)', value: stats.newLeads, icon: FaChartLine, color: 'green', change: '+5%', trend: 'up' },
        { label: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: FaPercentage, color: 'purple', change: '-2%', trend: 'down' },
        { label: 'Active Deals', value: stats.activeDeals, icon: FaFileInvoiceDollar, color: 'orange', change: '+8%', trend: 'up' },
        { label: 'Campaign Reach', value: stats.campaignReach.toLocaleString(), icon: FaBullhorn, color: 'indigo', change: '+15%', trend: 'up' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-500">Welcome back, {user?.fullName || 'Sales Agent'}. Here&apos;s what&apos;s happening today.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {kpiCards.map((card, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl bg-${card.color}-50 text-${card.color}-600 group-hover:scale-110 transition-transform`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center text-xs font-medium ${card.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-full`}>
                                {card.trend === 'up' ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                                {card.change}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity & Pipeline Preview (Placeholder for now) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="text-center py-10 text-gray-400">
                        <p>Activity feed coming soon...</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Pipeline Summary</h3>
                    <div className="text-center py-10 text-gray-400">
                        <p>Pipeline chart coming soon...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
