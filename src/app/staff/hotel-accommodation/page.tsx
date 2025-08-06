import { FaWhatsapp, FaPhone, FaCheck } from 'react-icons/fa';

const hotels = [
  { name: 'Claudine Ingabire', phone: '+250788222333', hotel: 'Kigali Marriott', checkin: '2024-06-14', checkout: '2024-06-16', status: 'Pending' },
  { name: 'David Habimana', phone: '+250788444555', hotel: 'Radisson Blu', checkin: '2024-06-15', checkout: '2024-06-18', status: 'Completed' },
];

export default function HotelAccommodationAgentPage() {
  return (
    <div className="min-h-screen bg-blue-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-4">
        <h1 className="text-2xl font-bold mb-6">Hotel Accommodation</h1>
        <table className="min-w-full text-sm mb-4">
          <thead>
            <tr className="text-gray-500 text-left">
              <th className="py-2 pr-4">Client</th>
              <th className="py-2 pr-4">Hotel</th>
              <th className="py-2 pr-4">Check-in</th>
              <th className="py-2 pr-4">Check-out</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((b, i) => (
              <tr key={i} className={`border-b last:border-0 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <td className="py-2 pr-4 font-semibold">{b.name}</td>
                <td className="py-2 pr-4">{b.hotel}</td>
                <td className="py-2 pr-4">{b.checkin}</td>
                <td className="py-2 pr-4">{b.checkout}</td>
                <td className="py-2 pr-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${b.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{b.status}</span>
                </td>
                <td className="py-2 pr-4 flex gap-2">
                  <a title="WhatsApp" href={`https://wa.me/${b.phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs"><FaWhatsapp /></a>
                  <a title="Call" href={`tel:${b.phone}`} className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs"><FaPhone /></a>
                  {b.status !== 'Completed' && <button title="Mark as Complete" className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"><FaCheck /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 