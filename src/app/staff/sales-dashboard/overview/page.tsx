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
    FaArrowDown,
    FaPhone,
    FaEnvelope,
    FaHandshake,
    FaCheckCircle
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
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [pipelineStats, setPipelineStats] = useState<{ stage: string, count: number, value: number }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true);
                // Parallel API calls
                const [leadsResponse, campaignsResponse, activitiesResponse] = await Promise.allSettled([
                    fetch('/api/leads?limit=100'),
                    fetch('/api/campaigns?limit=20'),
                    fetch('/api/activities?limit=5')
                ]);

                let leads = [];
                let campaigns = [];
                let activities = [];

                if (leadsResponse.status === 'fulfilled' && leadsResponse.value.ok) {
                    const data = await leadsResponse.value.json();
                    leads = data.data || data;
                }

                if (campaignsResponse.status === 'fulfilled' && campaignsResponse.value.ok) {
                    const data = await campaignsResponse.value.json();
                    campaigns = data.campaigns || data;
                }

                if (activitiesResponse.status === 'fulfilled' && activitiesResponse.value.ok) {
                    const data = await activitiesResponse.value.json();
                    activities = data.activities || [];
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

                // Process Recent Activities
                setRecentActivities(activities.map((a: any) => ({
                    id: a.id,
                    type: a.type,
                    title: a.activity,
                    date: new Date(a.date).toLocaleDateString(),
                    time: new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    client: a.client
                })));

                // Process Pipeline Stats
                const stages = ["Contacted", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"];
                const pStats = stages.map(stage => {
                    const stageLeads = leads.filter((l: any) => l.stage === stage);
                    return {
                        stage,
                        count: stageLeads.length,
                        value: stageLeads.reduce((sum: number, l: any) => sum + (l.value || 0), 0)
                    };
                });
                setPipelineStats(pStats);

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
                    <div key={index} className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-white/60 hover:shadow-md transition-all duration-200 group">
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

            {/* Recent Activity & Pipeline Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-white/60">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                        <a href="/staff/sales-dashboard/activities" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</a>
                    </div>
                    <div className="space-y-4">
                        {recentActivities.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">No recent activities.</div>
                        ) : (
                            recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50/50 transition-colors transition-colors">
                                    <div className={`p-2 rounded-full flex-shrink-0 
                                        ${activity.type === 'call' ? 'bg-green-100 text-green-600' :
                                            activity.type === 'meeting' ? 'bg-purple-100 text-purple-600' :
                                                activity.type === 'email' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {activity.type === 'call' && <FaPhone className="w-3 h-3" />}
                                        {activity.type === 'meeting' && <FaHandshake className="w-3 h-3" />}
                                        {activity.type === 'email' && <FaEnvelope className="w-3 h-3" />}
                                        {activity.type === 'visit' && <FaCheckCircle className="w-3 h-3" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                                        <p className="text-xs text-gray-500 truncate">With {activity.client}</p>
                                    </div>
                                    <div className="text-xs text-gray-400 whitespace-nowrap">
                                        {activity.date}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pipeline Summary */}
                <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-white/60">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Pipeline Summary</h3>
                        <a href="/staff/sales-dashboard/pipeline" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Pipeline</a>
                    </div>
                    <div className="space-y-4">
                        {pipelineStats.map((stat) => (
                            <div key={stat.stage}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{stat.stage}</span>
                                    <span className="text-gray-500">{stat.count} deals • {stat.value.toLocaleString()} RWF</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${stat.stage === 'Closed Won' ? 'bg-green-500' :
                                                stat.stage === 'Closed Lost' ? 'bg-red-500' :
                                                    'bg-blue-500'
                                            }`}
                                        style={{ width: `${stats.totalLeads > 0 ? (stat.count / stats.totalLeads) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
