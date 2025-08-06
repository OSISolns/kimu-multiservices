"use client";
import { useState } from 'react';
import Link from 'next/link';
import ExcelJS from 'exceljs';
import { useUser } from '../../UserContext';
import { useRouter } from 'next/navigation';

// Mock data
const salesSummary = {
  leads: 42,
  conversions: 18,
  revenue: 1200000,
  campaignReach: 35000,
  feedback: 4.6,
};
const recentLeads = [
  { name: 'John Doe', fullName: 'John Doe', source: 'Facebook', status: 'Converted', revenue: 200000, date: '2024-07-10' },
  { name: 'Jane Smith', fullName: 'Jane Smith', source: 'Google Ads', status: 'Pending', revenue: 0, date: '2024-07-09' },
  { name: 'Paul Mugisha', fullName: 'Paul Mugisha', source: 'Referral', status: 'Converted', revenue: 150000, date: '2024-07-08' },
  { name: 'Alice Uwimana', fullName: 'Alice Uwimana', source: 'Instagram', status: 'Lost', revenue: 0, date: '2024-07-07' },
];
const campaigns = [
  { name: 'July Promo', reach: 12000, engagement: 800, leads: 15, conversions: 7 },
  { name: 'Airport Transfer Ad', reach: 9000, engagement: 600, leads: 10, conversions: 5 },
  { name: 'Hotel Push', reach: 14000, engagement: 950, leads: 17, conversions: 6 },
];

function exportSalesToExcel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sales Dashboard');
  sheet.columns = [
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Source', key: 'source', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Revenue', key: 'revenue', width: 14 },
    { header: 'Date', key: 'date', width: 14 },
  ];
  recentLeads.forEach(l => {
    sheet.addRow({
      name: l.name,
      source: l.source,
      status: l.status,
      revenue: l.revenue,
      date: l.date,
    });
  });
  // Style header
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
  // Add totals row
  const lastRow = sheet.lastRow ? sheet.lastRow.number + 1 : recentLeads.length + 2;
  sheet.getCell(`A${lastRow}`).value = 'Totals';
  sheet.getCell(`D${lastRow}`).value = { formula: `SUM(D2:D${lastRow-1})` };
  sheet.getRow(lastRow).font = { bold: true };
  // Download
  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-dashboard-${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  });
}

export default function SalesDashboardPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  if (!isLoading && user && !['sales', 'admin'].includes(user.role)) {
    if (typeof window !== 'undefined') router.push('/staff/dashboard');
    return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-red-600">Not Authorized</div>;
  }
  return (
    <div className="min-h-screen bg-blue-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/staff/dashboard" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">&larr; Back to Dashboard</Link>
          <button onClick={exportSalesToExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors">Export to Excel</button>
        </div>
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">Sales & Marketing Dashboard</h1>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-blue-700">Leads</div>
            <div className="text-2xl font-extrabold text-blue-900">{salesSummary.leads}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-green-700">Conversions</div>
            <div className="text-2xl font-extrabold text-green-900">{salesSummary.conversions}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-yellow-700">Revenue</div>
            <div className="text-2xl font-extrabold text-yellow-900">{salesSummary.revenue.toLocaleString()} RWF</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-purple-700">Campaign Reach</div>
            <div className="text-2xl font-extrabold text-purple-900">{salesSummary.campaignReach.toLocaleString()}</div>
          </div>
          <div className="bg-pink-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-pink-700">Feedback</div>
            <div className="text-2xl font-extrabold text-pink-900">{salesSummary.feedback} ⭐</div>
          </div>
        </div>
        {/* Recent Leads/Deals Table */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2">Recent Leads & Deals</h2>
          <table className="min-w-full text-sm mb-4">
            <thead>
              <tr className="text-gray-500 text-left">
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Full Name</th>
                <th className="py-2 px-4">Source</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Revenue</th>
                <th className="py-2 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((l, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 px-4">{l.name}</td>
                  <td className="py-2 px-4">{l.fullName}</td>
                  <td className="py-2 px-4">{l.source}</td>
                  <td className="py-2 px-4">{l.status}</td>
                  <td className="py-2 px-4">{l.revenue ? l.revenue.toLocaleString() : '-'} RWF</td>
                  <td className="py-2 px-4">{l.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Campaign Analytics */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2">Campaign Analytics</h2>
          <table className="min-w-full text-sm mb-4">
            <thead>
              <tr className="text-gray-500 text-left">
                <th className="py-2 px-4">Campaign</th>
                <th className="py-2 px-4">Reach</th>
                <th className="py-2 px-4">Engagement</th>
                <th className="py-2 px-4">Leads</th>
                <th className="py-2 px-4">Conversions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 px-4">{c.name}</td>
                  <td className="py-2 px-4">{c.reach.toLocaleString()}</td>
                  <td className="py-2 px-4">{c.engagement}</td>
                  <td className="py-2 px-4">{c.leads}</td>
                  <td className="py-2 px-4">{c.conversions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 