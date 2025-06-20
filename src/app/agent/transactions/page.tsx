"use client";
import { useState } from 'react';
import { FaMoneyBillWave, FaCheck, FaTimes } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Scale,
} from 'chart.js';
import Pagination from '../../../components/Pagination';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const transactions = [
  { date: '2024-06-10', client: 'Jean Uwimana', type: 'Rental', amount: 120000, status: 'Completed' },
  { date: '2024-06-11', client: 'Alice Smith', type: 'Rental', amount: 50000, status: 'Completed' },
  { date: '2024-06-12', client: 'Paul Mugisha', type: 'Taxi', amount: 20000, status: 'Pending' },
  { date: '2024-06-12', client: 'Claudine Ingabire', type: 'Hotel', amount: 80000, status: 'Completed' },
  { date: '2024-06-13', client: 'John Doe', type: 'Rental', amount: 75000, status: 'Completed' },
  { date: '2024-06-14', client: 'Jane Smith', type: 'Taxi', amount: 15000, status: 'Pending' },
  { date: '2024-06-15', client: 'Bob Johnson', type: 'Hotel', amount: 95000, status: 'Completed' },
  { date: '2024-06-16', client: 'Mary Wilson', type: 'Rental', amount: 180000, status: 'Completed' },
  { date: '2024-06-17', client: 'David Brown', type: 'Taxi', amount: 25000, status: 'Completed' },
  { date: '2024-06-18', client: 'Sarah Davis', type: 'Hotel', amount: 120000, status: 'Pending' },
  { date: '2024-06-19', client: 'Mike Miller', type: 'Rental', amount: 90000, status: 'Completed' },
  { date: '2024-06-20', client: 'Lisa Garcia', type: 'Taxi', amount: 30000, status: 'Completed' },
];

const total = transactions.reduce((sum, t) => sum + t.amount, 0);
const completed = transactions.filter(t => t.status === 'Completed').length;
const pending = transactions.filter(t => t.status !== 'Completed').length;

// Group transactions by date for the chart
const turnoverByDate: Record<string, number> = {};
transactions.forEach(t => {
  turnoverByDate[t.date] = (turnoverByDate[t.date] || 0) + t.amount;
});
const chartLabels = Object.keys(turnoverByDate);
const chartData = Object.values(turnoverByDate);

const barData = {
  labels: chartLabels,
  datasets: [
    {
      label: 'Turnover (RWF)',
      data: chartData,
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderRadius: 8,
    },
  ],
};
const barOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Daily Turnover', font: { size: 18 } },
  },
  scales: {
    y: { 
      beginAtZero: true, 
      ticks: { 
        callback(this: Scale, tickValue: number | string): string {
          return 'RWF ' + tickValue;
        } 
      } 
    },
  },
};

export default function TransactionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Pagination logic
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-4">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FaMoneyBillWave className="text-green-500" /> Transactions</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-green-700">Total Turnover</div>
            <div className="text-2xl font-extrabold text-green-900">{total.toLocaleString()} RWF</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-blue-700">Completed</div>
            <div className="text-2xl font-extrabold text-blue-900">{completed}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-yellow-700">Pending</div>
            <div className="text-2xl font-extrabold text-yellow-900">{pending}</div>
          </div>
        </div>
        {/* Bar Chart for daily turnover */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
          <Bar data={barData} options={barOptions} />
        </div>
        <table className="min-w-full text-sm mb-4">
          <thead>
            <tr className="text-gray-500 text-left">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Client</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((t, i) => (
              <tr key={i} className={`border-b last:border-0 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <td className="py-2 pr-4">{t.date}</td>
                <td className="py-2 pr-4">{t.client}</td>
                <td className="py-2 pr-4">{t.type}</td>
                <td className="py-2 pr-4 font-semibold">{t.amount.toLocaleString()} RWF</td>
                <td className="py-2 pr-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold gap-1
                    ${t.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                  >
                    {t.status === 'Completed' ? <FaCheck className="text-green-500" /> : <FaTimes className="text-yellow-500" />}
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={transactions.length}
          itemsPerPage={itemsPerPage}
          showItemsPerPage={true}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
    </div>
  );
} 