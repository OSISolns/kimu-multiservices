"use client";

import { useState, useEffect } from "react";
import { useUser } from "../../UserContext";
import { useRouter } from "next/navigation";
import { 
  FaSearch, 
  FaBell, 
  FaUser, 
  FaPlus, 
  FaCalendarAlt, 
  FaFileInvoiceDollar,
  FaChartLine,
  FaUsers,
  FaPercentage,
  FaEye,
  FaEdit,
  FaTrash,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaDownload
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

interface Activity {
  id: string;
  date: string;
  client: string;
  activity: string;
  outcome: string;
  type: 'call' | 'meeting' | 'email' | 'visit';
}

export default function SalesManagementPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'pipeline' | 'activities' | 'customers' | 'campaigns'>('pipeline');
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showLogVisitModal, setShowLogVisitModal] = useState(false);
  const [showCreateQuoteModal, setShowCreateQuoteModal] = useState(false);
  const [showScheduleCallModal, setShowScheduleCallModal] = useState(false);
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  
  // Action modal states
  const [showViewCustomerModal, setShowViewCustomerModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [showDeleteCustomerModal, setShowDeleteCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Lead | null>(null);
  
  // Form data for new customer
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    location: ''
  });

  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [campaigns, setCampaigns] = useState<any[]>([]);

  const [activities, setActivities] = useState<Activity[]>([]);

  // Dynamic KPI calculations
  const kpis = {
    totalLeads: leads.length,
    newLeads: leads.filter(lead => {
      const leadDate = new Date(lead.lastContact);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return leadDate >= thirtyDaysAgo;
    }).length,
    conversionRate: leads.length > 0 ? Math.round((leads.filter(lead => lead.stage === 'Closed Won').length / leads.length) * 100) : 0,
    activeDeals: leads.filter(lead => !['Closed Won', 'Closed Lost'].includes(lead.stage)).length,
    totalPipeline: leads.reduce((sum, lead) => sum + lead.value, 0),
    campaignReach: campaigns.reduce((sum, campaign) => sum + (campaign.reach || 0), 0)
  };

  // Fetch data from Prisma database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        
        // Fetch leads from database
        const leadsResponse = await fetch('/api/leads');
        if (leadsResponse.ok) {
          const leadsData = await leadsResponse.json();
          setLeads(leadsData);
        }
        
        // Fetch campaigns from database
        const campaignsResponse = await fetch('/api/campaigns');
        if (campaignsResponse.ok) {
          const campaignsData = await campaignsResponse.json();
          setCampaigns(campaignsData);
        }
        
        // Fetch activities from database
        const activitiesResponse = await fetch('/api/activities');
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          setActivities(activitiesData);
        }
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

  // Filter leads based on search
  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group leads by stage
  const stages = ["Contacted", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"];
  const leadsByStage = stages.map(stage => ({
    stage,
    leads: filteredLeads.filter(lead => lead.stage === stage)
  }));

  // Handle lead stage change
  const moveLead = (leadId: string, newStage: string) => {
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, stage: newStage } : lead
    ));
  };

  // Handle lead deletion
  const deleteLead = (leadId: string) => {
    setLeads(prev => prev.filter(lead => lead.id !== leadId));
  };

  // Handle customer actions
  const handleViewCustomer = (customer: Lead) => {
    setSelectedCustomer(customer);
    setShowViewCustomerModal(true);
  };

  const handleEditCustomer = (customer: Lead) => {
    setSelectedCustomer(customer);
    setShowEditCustomerModal(true);
  };

  const handleDeleteCustomer = (customer: Lead) => {
    setSelectedCustomer(customer);
    setShowDeleteCustomerModal(true);
  };

  const confirmDeleteCustomer = async () => {
    if (selectedCustomer) {
      try {
        const response = await fetch(`/api/leads/${selectedCustomer.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setLeads(prev => prev.filter(lead => lead.id !== selectedCustomer.id));
          setShowDeleteCustomerModal(false);
          setSelectedCustomer(null);
        } else {
          console.error('Failed to delete lead');
        }
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  // Handle new customer creation
  const handleAddCustomer = async () => {
    console.log('handleAddCustomer called', { newCustomer });
    if (newCustomer.name && newCustomer.company) {
      try {
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newCustomer.name,
            company: newCustomer.company,
            contact: newCustomer.phone,
            email: newCustomer.email,
            location: newCustomer.location,
            value: 0,
            stage: 'Contacted',
            lastContact: new Date().toISOString(),
            nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          })
        });

        if (response.ok) {
          const newLead = await response.json();
          setLeads(prev => [newLead, ...prev]);
          
          // Reset form and close modal
          setNewCustomer({
            name: '',
            company: '',
            email: '',
            phone: '',
            location: ''
          });
          setShowAddCustomerModal(false);
        } else {
          console.error('Failed to create lead');
        }
      } catch (error) {
        console.error('Error creating lead:', error);
      }
    }
  };

  // Export functionality
  const exportToExcel = () => {
    // Create CSV content
    const csvContent = [
      ['Name', 'Company', 'Stage', 'Value (RWF)', 'Contact', 'Email', 'Location', 'Last Contact', 'Next Follow-up'],
      ...leads.map(lead => [
        lead.name,
        lead.company,
        lead.stage,
        lead.value.toLocaleString(),
        lead.contact,
        lead.email,
        lead.location,
        lead.lastContact,
        lead.nextFollowUp
      ])
    ].map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales-leads.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Loading state
  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" message={isLoading ? "Loading Sales Management..." : "Loading data..."} />
      </div>
    );
  }

  // Authorization check
  if (!user || !['admin', 'staff', 'sales'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Sales Management Dashboard</h1>
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Sales & Marketing
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads, companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              
              {/* Export Button */}
              <button 
                onClick={exportToExcel}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <FaDownload className="h-4 w-4" />
                <span>Export</span>
              </button>
              
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg">
                <FaBell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <FaUser className="text-white text-sm" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user.fullName || user.username}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaChartLine className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{kpis.totalLeads}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaUsers className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Leads</p>
                <p className="text-2xl font-bold text-gray-900">{kpis.newLeads}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaPercentage className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{kpis.conversionRate}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaFileInvoiceDollar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold text-gray-900">{kpis.activeDeals}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FaChartLine className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Campaign Reach</p>
                <p className="text-2xl font-bold text-gray-900">{kpis.campaignReach.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'pipeline', label: 'Sales Pipeline', count: leads.length },
                { id: 'activities', label: 'Recent Activities', count: activities.length },
                { id: 'customers', label: 'Customer Database', count: leads.length },
                { id: 'campaigns', label: 'Marketing Campaigns', count: campaigns.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'pipeline' && (
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Sales Pipeline</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <FaPlus className="h-4 w-4" />
                <span>Add Lead</span>
              </button>
            </div>
            
            {leads.length === 0 ? (
              <div className="text-center py-12">
                <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first customer lead.</p>
                <button 
                  onClick={() => setShowAddCustomerModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Lead
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {leadsByStage.map((stageData) => (
                <div key={stageData.stage} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
                    {stageData.stage}
                    <span className="bg-white text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                      {stageData.leads.length}
                    </span>
                  </h3>
                  
                  <div className="space-y-3">
                    {stageData.leads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">{lead.name}</h4>
                          <div className="flex space-x-1">
                            <button className="text-gray-400 hover:text-blue-600 p-1">
                              <FaEye className="h-3 w-3" />
                            </button>
                            <button className="text-gray-400 hover:text-green-600 p-1">
                              <FaEdit className="h-3 w-3" />
                            </button>
                            <button 
                              onClick={() => deleteLead(lead.id)}
                              className="text-gray-400 hover:text-red-600 p-1"
                            >
                              <FaTrash className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2">{lead.company}</p>
                                                 <p className="text-sm font-medium text-green-600 mb-3">{lead.value.toLocaleString()} RWF</p>
                        
                        <div className="space-y-1 text-xs text-gray-500">
                          <div className="flex items-center space-x-2">
                            <FaPhone className="h-3 w-3" />
                            <span>{lead.contact}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaEnvelope className="h-3 w-3" />
                            <span>{lead.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FaMapMarkerAlt className="h-3 w-3" />
                            <span>{lead.location}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">Last Contact: {lead.lastContact}</p>
                          <p className="text-xs text-gray-500">Next Follow-up: {lead.nextFollowUp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'activities' && (
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activities</h2>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                <FaPlus className="h-4 w-4" />
                <span>Log Activity</span>
              </button>
            </div>
            
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
                <p className="text-gray-500 mb-4">Start tracking your sales activities to see them here.</p>
                <button 
                  onClick={() => setShowLogVisitModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Log First Activity
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Outcome</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900">{activity.date}</td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{activity.client}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{activity.activity}</td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {activity.outcome}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">View</button>
                            <button className="text-green-600 hover:text-green-800">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === 'customers' && (
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Customer Database</h2>
              <button 
                onClick={() => setShowAddCustomerModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FaPlus className="h-4 w-4" />
                <span>Add Customer</span>
              </button>
            </div>
            
            {leads.length === 0 ? (
              <div className="text-center py-12">
                <FaUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
                <p className="text-gray-500 mb-4">Start building your customer database by adding your first customer.</p>
                <button 
                  onClick={() => setShowAddCustomerModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Customer
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Company</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                            <div className="text-sm text-gray-500">{lead.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">{lead.company}</td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {lead.stage}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-green-600">{lead.value.toLocaleString()} RWF</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{lead.contact}</td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewCustomer(lead)}
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              View
                            </button>
                            <button 
                              onClick={() => handleEditCustomer(lead)}
                              className="text-green-600 hover:text-green-800 hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteCustomer(lead)}
                              className="text-red-600 hover:text-red-800 hover:underline cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === 'campaigns' && (
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Marketing Campaigns</h2>
              <button 
                onClick={() => setShowAddCampaignModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <FaPlus className="h-4 w-4" />
                <span>Add Campaign</span>
              </button>
            </div>
            
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <FaChartLine className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                <p className="text-gray-500 mb-4">Start tracking your marketing campaigns to see their performance here.</p>
                <button 
                  onClick={() => setShowAddCampaignModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add First Campaign
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Reach</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{campaign.name}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{campaign.reach?.toLocaleString() || '0'}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{campaign.engagement?.toLocaleString() || '0'}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{campaign.leads || '0'}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{campaign.conversions || '0'}</td>
                        <td className="py-4 px-4 text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">View</button>
                            <button className="text-green-600 hover:text-green-800">Edit</button>
                            <button className="text-red-600 hover:text-red-800">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

                 {/* Quick Actions */}
         <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <button 
               onClick={() => {
                 console.log('Add Customer button clicked');
                 setShowAddCustomerModal(true);
               }}
               className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors flex flex-col items-center space-y-2"
             >
               <FaPlus className="h-6 w-6" />
               <span className="font-medium">Add Customer</span>
             </button>
             
             <button 
               onClick={() => setShowLogVisitModal(true)}
               className="bg-yellow-500 text-white p-4 rounded-lg hover:bg-yellow-600 transition-colors flex flex-col items-center space-y-2"
             >
               <FaCalendarAlt className="h-6 w-6" />
               <span className="font-medium">Log Visit</span>
             </button>
             
             <button 
               onClick={() => setShowCreateQuoteModal(true)}
               className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors flex flex-col items-center space-y-2"
             >
               <FaFileInvoiceDollar className="h-6 w-6" />
               <span className="font-medium">Create Quote</span>
             </button>
             
             <button 
               onClick={() => setShowScheduleCallModal(true)}
               className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors flex flex-col items-center space-y-2"
             >
               <FaPhone className="h-6 w-6" />
               <span className="font-medium">Schedule Call</span>
             </button>
           </div>
         </section>

        {/* Add Customer Modal */}
        {showAddCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Customer</h3>
                <button 
                  onClick={() => setShowAddCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input 
                    type="text" 
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                  <input 
                    type="text" 
                    value={newCustomer.company}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input 
                    type="text" 
                    value={newCustomer.location}
                    onChange={(e) => setNewCustomer(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter location"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={() => setShowAddCustomerModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddCustomer}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Log Visit Modal */}
        {showLogVisitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Log Site Visit</h3>
                <button 
                  onClick={() => setShowLogVisitModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Select Customer</option>
                    {leads.map(lead => (
                      <option key={lead.id} value={lead.id}>{lead.name} - {lead.company}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3}></textarea>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={() => setShowLogVisitModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Log Visit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Quote Modal */}
        {showCreateQuoteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create Quote</h3>
                <button 
                  onClick={() => setShowCreateQuoteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Select Customer</option>
                    {leads.map(lead => (
                      <option key={lead.id} value={lead.id}>{lead.name} - {lead.company}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Car Rental</option>
                    <option>Airport Transfer</option>
                    <option>Tour Package</option>
                    <option>Custom Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RWF)</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={() => setShowCreateQuoteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Create Quote
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Call Modal */}
        {showScheduleCallModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Schedule Call</h3>
                <button 
                  onClick={() => setShowScheduleCallModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Select Customer</option>
                    {leads.map(lead => (
                      <option key={lead.id} value={lead.id}>{lead.name} - {lead.company}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Call Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Call Time</label>
                  <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3}></textarea>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={() => setShowScheduleCallModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Schedule Call
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Campaign Modal */}
        {showAddCampaignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Campaign</h3>
                <button 
                  onClick={() => setShowAddCampaignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Reach</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget (RWF)</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={() => setShowAddCampaignModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Add Campaign
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Customer Modal */}
        {showViewCustomerModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
                <button 
                  onClick={() => setShowViewCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{selectedCustomer.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <p className="text-gray-900">{selectedCustomer.company}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedCustomer.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{selectedCustomer.contact || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-gray-900">{selectedCustomer.location || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedCustomer.stage}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <p className="text-green-600 font-semibold">{selectedCustomer.value.toLocaleString()} RWF</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Contact</label>
                  <p className="text-gray-900">{selectedCustomer.lastContact}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-up</label>
                  <p className="text-gray-900">{selectedCustomer.nextFollowUp}</p>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={() => setShowViewCustomerModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      setShowViewCustomerModal(false);
                      handleEditCustomer(selectedCustomer);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Edit Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {showEditCustomerModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Customer</h3>
                <button 
                  onClick={() => setShowEditCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input 
                    type="text" 
                    value={selectedCustomer.name}
                    onChange={(e) => setSelectedCustomer(prev => prev ? {...prev, name: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                  <input 
                    type="text" 
                    value={selectedCustomer.company}
                    onChange={(e) => setSelectedCustomer(prev => prev ? {...prev, company: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={selectedCustomer.email || ''}
                    onChange={(e) => setSelectedCustomer(prev => prev ? {...prev, email: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    value={selectedCustomer.contact || ''}
                    onChange={(e) => setSelectedCustomer(prev => prev ? {...prev, contact: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input 
                    type="text" 
                    value={selectedCustomer.location || ''}
                    onChange={(e) => setSelectedCustomer(prev => prev ? {...prev, location: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <select 
                    value={selectedCustomer.stage}
                    onChange={(e) => setSelectedCustomer(prev => prev ? {...prev, stage: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Contacted">Contacted</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value (RWF)</label>
                  <input 
                    type="number" 
                    value={selectedCustomer.value}
                    onChange={(e) => setSelectedCustomer(prev => prev ? {...prev, value: parseInt(e.target.value) || 0} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Enter value"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={() => setShowEditCustomerModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={async () => {
                      if (selectedCustomer) {
                        try {
                          const response = await fetch(`/api/leads/${selectedCustomer.id}`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(selectedCustomer)
                          });

                          if (response.ok) {
                            const updatedLead = await response.json();
                            setLeads(prev => prev.map(lead => 
                              lead.id === selectedCustomer.id ? updatedLead : lead
                            ));
                            setShowEditCustomerModal(false);
                            setSelectedCustomer(null);
                          } else {
                            console.error('Failed to update lead');
                          }
                        } catch (error) {
                          console.error('Error updating lead:', error);
                        }
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Customer Confirmation Modal */}
        {showDeleteCustomerModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Delete Customer</h3>
                <button 
                  onClick={() => setShowDeleteCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Are you sure?</h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone. This will permanently delete the customer &quot;{selectedCustomer.name}&quot; from {selectedCustomer.company}.
                  </p>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button 
                    onClick={() => setShowDeleteCustomerModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDeleteCustomer}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
