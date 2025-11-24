"use client";

import { useState, useEffect } from "react";
import { useUser } from "../../../UserContext";
import {
    FaCalendarAlt,
    FaList,
    FaPlus,
    FaPhone,
    FaEnvelope,
    FaHandshake,
    FaClock,
    FaCheckCircle,
    FaTimes
} from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Activity {
    id: string;
    type: 'Call' | 'Meeting' | 'Email' | 'Task';
    title: string;
    description: string;
    date: string;
    time: string;
    status: 'Pending' | 'Completed' | 'Overdue';
    relatedTo?: string; // e.g., Lead Name
}

// Dummy data
const MOCK_ACTIVITIES: Activity[] = [
    {
        id: '1',
        type: 'Call',
        title: 'Follow up with John Doe',
        description: 'Discuss the new proposal regarding fleet management.',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        status: 'Pending',
        relatedTo: 'John Doe'
    },
    {
        id: '2',
        type: 'Meeting',
        title: 'Product Demo with ABC Corp',
        description: 'Showcase the new vehicle tracking features.',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        status: 'Pending',
        relatedTo: 'ABC Corp'
    },
    {
        id: '3',
        type: 'Email',
        title: 'Send contract to XYZ Ltd',
        description: 'Final version of the lease agreement.',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        time: '09:00',
        status: 'Pending',
        relatedTo: 'XYZ Ltd'
    }
];

export default function ActivitiesPage() {
    const { user, isLoading } = useUser();
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newActivity, setNewActivity] = useState<Partial<Activity>>({
        type: 'Call',
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
    });

    // Calendar state
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth());
    const [year, setYear] = useState(now.getFullYear());

    const handleSaveActivity = () => {
        if (!newActivity.title || !newActivity.date) return;

        const activity: Activity = {
            id: Math.random().toString(36).substr(2, 9),
            type: newActivity.type as any,
            title: newActivity.title!,
            description: newActivity.description || '',
            date: newActivity.date!,
            time: newActivity.time || '12:00',
            status: 'Pending',
            relatedTo: newActivity.relatedTo
        };

        setActivities([...activities, activity]);
        setIsModalOpen(false);
        setNewActivity({ type: 'Call', date: new Date().toISOString().split('T')[0], status: 'Pending' });
    };

    const getMonthDays = (year: number, month: number) => {
        const days = [];
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= lastDate; d++) days.push(d);
        return days;
    };

    const days = getMonthDays(year, month);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    if (isLoading) {
        return <LoadingSpinner size="lg" message="Loading Activities..." />;
    }

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center flex-shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Activities</h2>
                    <p className="text-gray-500">Manage your schedule and tasks.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-1 rounded-lg flex">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <FaList /> List
                            </div>
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <FaCalendarAlt /> Calendar
                            </div>
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
                    >
                        <FaPlus className="w-4 h-4" />
                        <span>New Activity</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {viewMode === 'list' ? (
                    <div className="h-full overflow-y-auto custom-scrollbar space-y-4">
                        {activities.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                <p>No activities found.</p>
                            </div>
                        ) : (
                            activities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
                                    <div className={`p-3 rounded-full flex-shrink-0 
                                        ${activity.type === 'Call' ? 'bg-green-100 text-green-600' :
                                            activity.type === 'Meeting' ? 'bg-purple-100 text-purple-600' :
                                                activity.type === 'Email' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                        {activity.type === 'Call' && <FaPhone />}
                                        {activity.type === 'Meeting' && <FaHandshake />}
                                        {activity.type === 'Email' && <FaEnvelope />}
                                        {activity.type === 'Task' && <FaCheckCircle />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium
                                                ${activity.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                    activity.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {activity.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><FaCalendarAlt /> {activity.date}</span>
                                            <span className="flex items-center gap-1"><FaClock /> {activity.time}</span>
                                            {activity.relatedTo && <span className="font-medium text-blue-600">@ {activity.relatedTo}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <button onClick={() => setMonth(m => m === 0 ? 11 : m - 1)} className="p-2 hover:bg-gray-100 rounded-full">&lt;</button>
                            <h3 className="font-bold text-lg">{monthNames[month]} {year}</h3>
                            <button onClick={() => setMonth(m => m === 11 ? 0 : m + 1)} className="p-2 hover:bg-gray-100 rounded-full">&gt;</button>
                        </div>
                        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden flex-1">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase">
                                    {d}
                                </div>
                            ))}
                            {days.map((d, i) => {
                                const dateStr = d ? new Date(year, month, d).toISOString().split('T')[0] : '';
                                const dayActivities = activities.filter(a => a.date === dateStr);

                                return (
                                    <div key={i} className={`bg-white p-2 min-h-[80px] ${!d ? 'bg-gray-50' : ''}`}>
                                        {d && (
                                            <>
                                                <div className={`text-sm font-medium mb-1 ${dateStr === new Date().toISOString().split('T')[0] ? 'text-blue-600' : 'text-gray-700'}`}>
                                                    {d}
                                                </div>
                                                <div className="space-y-1">
                                                    {dayActivities.map((act, idx) => (
                                                        <div key={idx} className={`text-[10px] px-1.5 py-0.5 rounded truncate
                                                            ${act.type === 'Call' ? 'bg-green-50 text-green-700' :
                                                                act.type === 'Meeting' ? 'bg-purple-50 text-purple-700' :
                                                                    'bg-blue-50 text-blue-700'}`}
                                                            title={act.title}
                                                        >
                                                            {act.time} {act.title}
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* New Activity Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">New Activity</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['Call', 'Meeting', 'Email', 'Task'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewActivity({ ...newActivity, type: type as any })}
                                            className={`py-2 text-sm rounded-lg border transition-all
                                                ${newActivity.type === type
                                                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Follow up call"
                                    value={newActivity.title || ''}
                                    onChange={e => setNewActivity({ ...newActivity, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={newActivity.date || ''}
                                        onChange={e => setNewActivity({ ...newActivity, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={newActivity.time || ''}
                                        onChange={e => setNewActivity({ ...newActivity, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Related To</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Client Name"
                                    value={newActivity.relatedTo || ''}
                                    onChange={e => setNewActivity({ ...newActivity, relatedTo: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Add details..."
                                    value={newActivity.description || ''}
                                    onChange={e => setNewActivity({ ...newActivity, description: e.target.value })}
                                />
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
                                onClick={handleSaveActivity}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Save Activity
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
