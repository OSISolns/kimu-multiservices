'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/UserContext'
import { FaCar, FaChartBar, FaDownload, FaFilter, FaCalendar, FaUsers, FaRoad, FaGasPump } from 'react-icons/fa'

interface TransportReport {
  totalVehicles: number
  availableVehicles: number
  inUseVehicles: number
  maintenanceVehicles: number
  totalMileage: number
  averageFuelEfficiency: number
  mostUsedVehicle: string
  leastUsedVehicle: string
  maintenanceDue: number
  upcomingMaintenance: Array<{
    vehicleName: string
    maintenanceDate: string
    type: string
  }>
}

export default function TransportReportsPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reportData, setReportData] = useState<TransportReport | null>(null)
  const [dateRange, setDateRange] = useState('30') // days
  const [reportType, setReportType] = useState('overview')

  const fetchTransportReport = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/reports/transport?days=${dateRange}&type=${reportType}`)
      if (!response.ok) {
        throw new Error('Failed to fetch transport report')
      }
      const data = await response.json()
      setReportData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [dateRange, reportType])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/staff/login')
    } else if (!isLoading && user && !['admin', 'transport-officer'].includes(user.role)) {
      router.push('/staff/sales-dashboard')
    } else if (user && ['admin', 'transport-officer'].includes(user.role)) {
      fetchTransportReport()
    }
  }, [user, isLoading, router, dateRange, reportType, fetchTransportReport])

  const exportReport = () => {
    // TODO: Implement report export functionality
    console.log('Exporting transport report...')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transport report...</p>
        </div>
      </div>
    )
  }

  if (!user || !['admin', 'transport-officer'].includes(user.role)) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaChartBar className="text-blue-600 text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Transport Reports</h1>
                <p className="text-gray-600">Vehicle fleet analytics and insights</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={exportReport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="overview">Overview</option>
                <option value="maintenance">Maintenance</option>
                <option value="utilization">Utilization</option>
                <option value="performance">Performance</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Generating report...</p>
            </div>
          </div>
        ) : reportData ? (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                    <p className="text-3xl font-bold text-gray-900">{reportData.totalVehicles}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FaCar className="text-blue-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available</p>
                    <p className="text-3xl font-bold text-green-600">{reportData.availableVehicles}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FaRoad className="text-green-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">In Use</p>
                    <p className="text-3xl font-bold text-orange-600">{reportData.inUseVehicles}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <FaUsers className="text-orange-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Maintenance</p>
                    <p className="text-3xl font-bold text-red-600">{reportData.maintenanceVehicles}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <FaGasPump className="text-red-600 text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fleet Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Mileage</span>
                    <span className="font-semibold">{reportData.totalMileage.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Fuel Efficiency</span>
                    <span className="font-semibold">{reportData.averageFuelEfficiency} L/100km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Most Used Vehicle</span>
                    <span className="font-semibold">{reportData.mostUsedVehicle}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Least Used Vehicle</span>
                    <span className="font-semibold">{reportData.leastUsedVehicle}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Status</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Due for Maintenance</span>
                    <span className="font-semibold text-red-600">{reportData.maintenanceDue}</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Upcoming Maintenance:</p>
                    {reportData.upcomingMaintenance.length > 0 ? (
                      <div className="space-y-2">
                        {reportData.upcomingMaintenance.slice(0, 3).map((item, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            <span className="font-medium">{item.vehicleName}</span> - {item.type}
                            <br />
                            <span className="text-xs text-gray-500">{item.maintenanceDate}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No upcoming maintenance</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Utilization Chart Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Utilization Trend</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Chart visualization would go here</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <p className="text-gray-600">No data available for the selected period</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
