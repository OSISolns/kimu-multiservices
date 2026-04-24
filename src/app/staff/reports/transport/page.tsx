'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/UserContext'
import { FaCar, FaChartBar, FaDownload, FaFilter, FaCalendar, FaUsers, FaRoad, FaGasPump, FaSpinner, FaTools, FaCheckCircle, FaExclamationTriangle, FaChartLine } from 'react-icons/fa'
import LoadingSpinner from '@/components/LoadingSpinner'

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
    if (!reportData) {
      alert('No report data available to export');
      return;
    }

    // Generate HTML report
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Transport report - KIMU Multi-Services</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; background: #fff; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
          .header h1 { color: #1f2937; font-size: 28px; margin-bottom: 10px; }
          .header p { color: #6b7280; font-size: 14px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 20px; color: #1f2937; margin-bottom: 15px; border-left: 4px solid #2563eb; padding-left: 12px; }
          .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
          .metric-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
          .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 8px; }
          .metric-value { font-size: 28px; font-weight: bold; color: #1f2937; }
          .metric-card.green .metric-value { color: #059669; }
          .metric-card.orange .metric-value { color: #ea580c; }
          .metric-card.red .metric-value { color: #dc2626; }
          .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
          .detail-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
          .detail-row { display: flex; justify-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #6b7280; }
          .detail-value { font-weight: 600; color: #1f2937; }
          .maintenance-item { padding: 10px; background: #f9fafb; border-radius: 6px; margin-bottom: 8px; }
          .maintenance-item strong { color: #1f2937; }
          .maintenance-item small { color: #6b7280; display: block; margin-top: 4px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KIMU Multi-Services</h1>
          <p>Transport Fleet Report</p>
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>Period: Last ${dateRange} days | Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}</p>
        </div>

        <div class="section">
          <h2 class="section-title">Fleet Overview</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-label">Total Vehicles</div>
              <div class="metric-value">${reportData.totalVehicles}</div>
            </div>
            <div class="metric-card green">
              <div class="metric-label">Available</div>
              <div class="metric-value">${reportData.availableVehicles}</div>
            </div>
            <div class="metric-card orange">
              <div class="metric-label">In Use</div>
              <div class="metric-value">${reportData.inUseVehicles}</div>
            </div>
            <div class="metric-card red">
              <div class="metric-label">Maintenance</div>
              <div class="metric-value">${reportData.maintenanceVehicles}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Performance & Maintenance</h2>
          <div class="details-grid">
            <div class="detail-box">
              <h3 style="margin-bottom: 15px; color: #1f2937;">Fleet Performance</h3>
              <div class="detail-row">
                <span class="detail-label">Total Mileage</span>
                <span class="detail-value">${reportData.totalMileage.toLocaleString()} km</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Avg Fuel Efficiency</span>
                <span class="detail-value">${reportData.averageFuelEfficiency} L/100km</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Most Used Vehicle</span>
                <span class="detail-value">${reportData.mostUsedVehicle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Least Used Vehicle</span>
                <span class="detail-value">${reportData.leastUsedVehicle}</span>
              </div>
            </div>

            <div class="detail-box">
              <h3 style="margin-bottom: 15px; color: #1f2937;">Maintenance Status</h3>
              <div class="detail-row">
                <span class="detail-label">Due for Maintenance</span>
                <span class="detail-value" style="color: #dc2626;">${reportData.maintenanceDue}</span>
              </div>
              <div style="margin-top: 15px;">
                <p style="font-weight: 600; margin-bottom: 10px; color: #374151;">Upcoming Maintenance:</p>
                ${reportData.upcomingMaintenance.length > 0 ?
        reportData.upcomingMaintenance.map(item => `
                    <div class="maintenance-item">
                      <strong>${item.vehicleName}</strong> - ${item.type}
                      <small>${item.maintenanceDate}</small>
                    </div>
                  `).join('') :
        '<p style="color: #6b7280; font-size: 14px;">No upcoming maintenance scheduled</p>'
      }
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} KIMU Multi-Services. All rights reserved.</p>
          <p>This report is confidential and intended for internal use only.</p>
        </div>
      </body>
      </html>
    `;

    // Open in new window for printing/saving
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportHTML);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      alert('Please allow popups to export the report');
    }
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user || !['admin', 'transport-officer'].includes(user.role)) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 bg-[url('/subtle-prism.svg')] bg-cover bg-fixed">
      {/* Header with Glassmorphism */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl shadow-lg shadow-orange-500/30">
                <FaCar className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Transport Logistics</h1>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest opacity-60">Fleet Analytics & Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportReport}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 text-xs font-black uppercase tracking-widest active:scale-95"
              >
                <FaDownload />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Filters and Search Bar Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-[32px] shadow-sm border border-white/50 p-6 mb-8 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-100/50 rounded-2xl border border-gray-100">
            <FaFilter className="text-orange-500 text-xs" />
            <span className="text-xs font-black text-gray-700 uppercase tracking-widest">Configuration</span>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Observational Period</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
            >
              <option value="7">Last 7 Calendar Days</option>
              <option value="30">Last 30 Calendar Days</option>
              <option value="90">Fiscal Quarter View</option>
              <option value="365">Annual Fleet Review</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Analysis Perspective</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
            >
              <option value="overview">Executive Overview</option>
              <option value="maintenance">Maintenance Health</option>
              <option value="utilization">Operational Utilization</option>
              <option value="performance">Engine Performance</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border-2 border-rose-100 rounded-2xl p-6 mb-8 animate-shake">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-rose-600 text-xl" />
              <p className="text-rose-700 font-bold uppercase tracking-tight">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-[40px] shadow-sm border border-white/50 p-20">
            <div className="text-center">
              <FaSpinner className="animate-spin h-12 w-12 text-orange-600 mx-auto mb-6" />
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Extracting Fleet Data</h3>
              <p className="text-gray-500 font-medium">Please wait while we synthesize your report...</p>
            </div>
          </div>
        ) : reportData ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Key Fleet Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                label="Total Assets"
                value={reportData.totalVehicles}
                icon={FaCar}
                color="blue"
                subtitle="Active Fleet"
              />
              <MetricCard
                label="Ready Status"
                value={reportData.availableVehicles}
                icon={FaCheckCircle}
                color="emerald"
                subtitle="Immediate Dispatch"
              />
              <MetricCard
                label="Active Missions"
                value={reportData.inUseVehicles}
                icon={FaRoad}
                color="orange"
                subtitle="Field Operations"
              />
              <MetricCard
                label="Grounded Assets"
                value={reportData.maintenanceVehicles}
                icon={FaTools}
                color="rose"
                subtitle="In Maintenance"
              />
            </div>

            {/* In-depth Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Fleet Performance Analytics */}
              <div className="bg-white/80 backdrop-blur-sm rounded-[32px] shadow-sm border border-white/50 p-8 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Fleet Efficiency</h3>
                  <div className="p-2 bg-blue-50 rounded-xl"><FaChartLine className="text-blue-600" /></div>
                </div>
                <div className="space-y-6">
                  <DetailRow label="Total Operational Mileage" value={`${reportData.totalMileage.toLocaleString()} KM`} />
                  <DetailRow label="Avg. Fuel Consumption" value={`${reportData.averageFuelEfficiency} L/100KM`} />
                  <DetailRow label="Highest Utilization asset" value={reportData.mostUsedVehicle} highlight />
                  <DetailRow label="Lowest Utilization asset" value={reportData.leastUsedVehicle} />
                </div>
              </div>

              {/* Maintenance & Engineering Status */}
              <div className="bg-white/80 backdrop-blur-sm rounded-[32px] shadow-sm border border-white/50 p-8 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Technical Readiness</h3>
                  <div className="p-2 bg-rose-50 rounded-xl"><FaTools className="text-rose-600" /></div>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-rose-50 p-4 rounded-2xl border border-rose-100">
                    <span className="text-xs font-black text-rose-800 uppercase tracking-widest">Urgent Maintenance due</span>
                    <span className="text-2xl font-black text-rose-700">{reportData.maintenanceDue}</span>
                  </div>

                  <div className="pt-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Inspection Pipeline</p>
                    {reportData.upcomingMaintenance.length > 0 ? (
                      <div className="space-y-3">
                        {reportData.upcomingMaintenance.slice(0, 3).map((item, index) => (
                          <div key={index} className="group p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100/80 transition-all">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-black text-gray-900 uppercase">{item.vehicleName}</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">{item.type}</p>
                              </div>
                              <div className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                                {item.maintenanceDate}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 text-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No pending inspections</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Graphical Visualization Placeholder */}
            <div className="bg-white/80 backdrop-blur-sm rounded-[40px] shadow-sm border border-white/50 p-10">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Utilization Trajectory</h3>
                <div className="px-4 py-2 bg-gray-100 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Feed Integration</div>
              </div>
              <div className="h-80 bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50/80 to-transparent pointer-events-none"></div>
                <FaChartBar className="text-gray-200 text-6xl mb-6 group-hover:scale-110 group-hover:text-gray-300 transition-all duration-500" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Synthesizing chart visualization...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-[40px] shadow-sm border border-white/50 p-20 text-center">
            <div className="w-24 h-24 bg-orange-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 border-2 border-orange-100/50 shadow-inner">
              <FaChartBar className="h-10 w-10 text-orange-400" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-3">Intelligence Pending</h3>
            <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
              Select fleet parameters above and synthesize data to view analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon: Icon, color, subtitle }: any) {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-[32px] shadow-sm border-2 border-transparent hover:border-white transition-all p-8 group overflow-hidden relative">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className={`p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm ${colorMap[color]}`}>
            <Icon className="text-2xl" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{subtitle}</p>
        </div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1 opacity-60">{label}</p>
        <p className={`text-4xl font-black tracking-tighter ${color === 'rose' ? 'text-rose-600' : 'text-gray-900'}`}>{value}</p>
      </div>
      {/* Decorative pulse */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:scale-150 transition-all duration-700 ${colorMap[color].split(' ')[0]}`}></div>
    </div>
  )
}

function DetailRow({ label, value, highlight }: any) {
  return (
    <div className={`flex justify-between items-center p-4 rounded-2xl border-2 transition-all ${highlight ? 'bg-blue-50 border-blue-100 shadow-sm shadow-blue-500/5' : 'bg-gray-50/30 border-transparent hover:border-gray-100'}`}>
      <span className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-blue-800' : 'text-gray-500'}`}>{label}</span>
      <span className={`text-sm font-black tracking-tight ${highlight ? 'text-blue-900' : 'text-gray-900'}`}>{value}</span>
    </div>
  )
}
