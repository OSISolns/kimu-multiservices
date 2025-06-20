"use client"
import { useState } from 'react';
import { FaBell, FaWhatsapp, FaTestTube } from 'react-icons/fa';

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const testNotification = async (type: 'booking' | 'urgent') => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type,
          message: type === 'urgent' ? 'This is a test urgent notification from the agent panel' : undefined
        })
      });
      
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to send test notification'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <FaBell className="text-3xl text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">WhatsApp Notifications</h1>
              <p className="text-gray-600">Test and manage your notification system</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaWhatsapp className="text-green-600" />
                Test Booking Notification
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Send a test booking notification to verify your WhatsApp integration
              </p>
              <button
                onClick={() => testNotification('booking')}
                disabled={isLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FaTestTube className="text-sm" />
                {isLoading ? 'Sending...' : 'Test Booking Notification'}
              </button>
            </div>

            <div className="p-6 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaBell className="text-red-600" />
                Test Urgent Notification
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Send a test urgent notification to verify urgent alerts
              </p>
              <button
                onClick={() => testNotification('urgent')}
                disabled={isLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <FaTestTube className="text-sm" />
                {isLoading ? 'Sending...' : 'Test Urgent Notification'}
              </button>
            </div>
          </div>

          {testResult && (
            <div className={`mt-8 p-4 rounded-lg ${
              testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.success ? '✅ Success' : '❌ Error'}
              </h4>
              <p className={`text-sm ${
                testResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {testResult.message}
              </p>
            </div>
          )}

          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">1. New Bookings</h4>
                <p>When a customer submits a booking, all agents receive an immediate WhatsApp notification with booking details.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">2. Status Updates</h4>
                <p>When you update a booking status (confirm, complete, etc.), other agents are notified of the change.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">3. Urgent Alerts</h4>
                <p>For critical situations, urgent notifications are sent to all agents immediately.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 