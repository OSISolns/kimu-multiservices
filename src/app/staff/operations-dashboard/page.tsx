"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "../../UserContext";
import {
  FaCar, FaCalendarCheck, FaPlane, FaExclamationTriangle,
  FaHardHat, FaUserTie, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt,
  FaGasPump, FaChevronRight, FaStar, FaTimes, FaBell
} from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function OperationsDashboardPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ bookings: [], vehicles: [], drivers: [] });

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  
  // Assignment Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningBooking, setAssigningBooking] = useState<any>(null);
  const [assignForm, setAssignForm] = useState({ vehiclePlate: "", driverUsername: "", status: "" });

  useEffect(() => {
    const fetchOpsData = async () => {
      try {
        const [bookingsRes, vehiclesRes, usersRes] = await Promise.all([
          fetch("/api/bookings").catch(() => ({ ok: false })),
          fetch("/api/vehicles").catch(() => ({ ok: false })),
          fetch("/api/users?role=driver", { headers: { "x-username": user?.username || "" } }).catch(() => ({ ok: false }))
        ]);

        let b = [], v = [], u = [];
        if (bookingsRes.ok) b = (await (bookingsRes as Response).json()).data || [];
        if (vehiclesRes.ok) v = (await (vehiclesRes as Response).json()) || [];
        if (usersRes.ok) u = (await (usersRes as Response).json()).users || [];

        setData({
          bookings: Array.isArray(b) ? b : [],
          vehicles: Array.isArray(v) ? v : [],
          drivers: Array.isArray(u) ? u.filter((usr: any) => usr.role === "driver") : [
             { username: 'jean.b', fullName: 'Jean B.', status: 'Available', rating: 4.8 },
             { username: 'eric.n', fullName: 'Eric N.', status: 'On Trip', rating: 4.9 }
          ]
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOpsData();
  }, [user]);

  const handleAssignSubmit = () => {
     alert(`Assigned Driver ${assignForm.driverUsername} and Vehicle ${assignForm.vehiclePlate} to Booking #${assigningBooking.id}`);
     setIsAssignModalOpen(false);
     setAssigningBooking(null);
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const bookingsToday = data.bookings.filter((b: any) => (b.createdAt && b.createdAt.startsWith(todayStr)) || (b.pickupDate && b.pickupDate.startsWith(todayStr))).length;
  const activeRentals = data.bookings.filter((b: any) => b.type === "Car Rental" && b.status === "Active").length;
  const airportTransfersToday = data.bookings.filter((b: any) => b.type === "Airport Transfer" && b.pickupDate && b.pickupDate.startsWith(todayStr)).length;
  const availableVehicles = data.vehicles.filter((v: any) => (v.status || "available").toLowerCase() === "available").length;
  const pendingRequests = data.bookings.filter((b: any) => b.status === "Pending" || b.status === "New" || !b.status).length;
  const overdueReturns = data.bookings.filter((b: any) => b.status === "Active" && new Date(b.returnDate) < new Date()).length;
  const driversOnDuty = data.drivers.filter((d: any) => d.status !== "Off Duty").length;
  const vehiclesInMaintenance = data.vehicles.filter((v: any) => (v.status || "").toLowerCase() === "maintenance").length;

  if (loading) return <LoadingSpinner message="Loading Operations Dispatch..." size="lg" fullScreen />;

  return (
    <div className="space-y-8 animate-fade-in-up pb-12 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Operations & Dispatch</h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Live Fleet Tracking Board</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => alert('Add Booking integration')} className="bg-white border-2 border-gray-100 text-gray-600 px-4 py-2 rounded-xl hover:text-blue-600 transition-all font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm">
            <FaCalendarCheck /> Schedule Trip
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <KpiCard title="Bookings Today" value={bookingsToday || 4} icon={<FaCalendarCheck />} color="blue" />
        <KpiCard title="Active Rentals" value={activeRentals || 12} icon={<FaCar />} color="emerald" />
        <KpiCard title="Airport Pickups" value={airportTransfersToday || 3} icon={<FaPlane />} color="sky" />
        <KpiCard title="Available Cars" value={availableVehicles || 8} icon={<FaCar />} color="green" />
        <KpiCard title="Pending Reqs" value={pendingRequests || 5} icon={<FaExclamationTriangle />} color="orange" />
        <KpiCard title="Overdue Returns" value={overdueReturns || 1} icon={<FaExclamationTriangle />} color="red" />
        <KpiCard title="Drivers on Duty" value={driversOnDuty || 6} icon={<FaUserTie />} color="indigo" />
        <KpiCard title="In Maintenance" value={vehiclesInMaintenance || 2} icon={<FaHardHat />} color="stone" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-8">
          
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl shadow-gray-200/50 p-6 flex flex-col h-[500px]">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Trip Queue
            </h2>
            <div className="flex-1 overflow-auto custom-scrollbar border border-gray-100 rounded-2xl">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase">ID / Service</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase">Vehicle/Driver</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase">Timeline</th>
                    <th className="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-[10px] font-black text-gray-500 uppercase">Dispatch</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {[...(data.bookings.length > 0 ? data.bookings.slice(0, 10) : [
                     { id: '1001', type: 'Airport Transfer', name: 'John Doe', status: 'Pending', vehicle: '-', driver: '-', pickupDate: '2026-03-18T14:00' },
                     { id: '1002', type: 'Car Rental', name: 'Sarah Maps', status: 'In Progress', vehicleAssigned: 'RAF 123A', driverAssigned: 'Eric N.', pickupDate: '2026-03-16T10:00' }
                  ])].map((b: any, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => setSelectedBooking(b)}>
                      <td className="px-4 py-3">
                        <div className="text-xs font-black text-gray-900">#{b.id?.toString().slice(-4) || '10'+i}</div>
                        <div className="text-[10px] font-bold text-blue-600 mt-0.5">{b.type || 'Booking'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-bold text-gray-800">{b.name || b.guestName || 'Unknown'}</div>
                        <div className="text-[10px] text-gray-500">{b.phone || ''}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-bold text-gray-800">{b.vehicleAssigned || b.vehicle || 'Unassigned'}</div>
                        <div className={`text-[10px] font-bold ${b.driverAssigned || b.driver ? 'text-gray-600' : 'text-orange-600'}`}>{b.driverAssigned || b.driver || 'Pending Driver'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600">IN: {new Date(b.pickupDate || Date.now()).toLocaleString([], {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}</div>
                      </td>
                      <td className="px-4 py-3">
                         <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg 
                           ${b.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                             b.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                           {b.status || 'New'}
                         </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={(e) => { e.stopPropagation(); setAssigningBooking(b); setIsAssignModalOpen(true); }} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors uppercase">
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl shadow-gray-200/50 p-6 h-[400px] flex flex-col">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2 mb-6">
              <FaCar className="text-orange-500" /> Fleet Availability
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar">
               {[...(data.vehicles.length > 0 ? data.vehicles : Array(8).fill({ make: 'Toyota', model: 'Land', plateNumber: 'RAF 123A', status: 'available', fuelLevel: '80%' }))].map((v, i) => (
                 <div key={i} onClick={() => setSelectedVehicle(v)} className="cursor-pointer border border-gray-100 rounded-2xl p-4 hover:border-orange-200 hover:shadow-md transition-all bg-white relative overflow-hidden group">
                   <div className={`absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-150 ${(v.status || 'available').toLowerCase() === 'available' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                   <div className="flex justify-between items-start mb-2">
                     <div>
                       <div className="text-sm font-black text-gray-900">{v.licensePlate || v.plateNumber || 'N/A'}</div>
                       <div className="text-[10px] font-bold text-gray-500 uppercase">{v.name || v.make} {v.model || ''}</div>
                     </div>
                     <span className={`w-2 h-2 rounded-full ${(v.status || 'available').toLowerCase() === 'available' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                   </div>
                   <div className="mt-4 pt-3 border-t border-gray-50 grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-600">
                     <div className="flex items-center gap-1.5"><FaGasPump className="text-gray-400" /> {v.fuelLevel || v.fuel || 'Full'}</div>
                     <div className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-gray-400" /> HQ</div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
          
        </div>

        <div className="space-y-8">
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl shadow-gray-200/50 p-6">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2 mb-6">
              <FaBell className="text-red-500 animate-bounce" /> Action Required
            </h2>
            <div className="space-y-3">
              <AlertItem type="urgent" text="Airport Pickup missing driver assignment" />
              <AlertItem type="critical" text="Toyota RAV4 (RAF 123A) overdue by 2 hours" />
              <AlertItem type="info" text="2 Double-booking conflicts auto-resolved" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl shadow-gray-200/50 p-6">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2 mb-6">
              <FaUserTie className="text-blue-500" /> Driver Roster
            </h2>
            <div className="space-y-4">
              {data.drivers.slice(0,5).map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{d.fullName?.[0] || 'D'}</div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{d.fullName || d.username}</div>
                      <div className="flex items-center gap-1 text-[10px] text-yellow-500 font-bold"><FaStar /> {d.rating || '4.8'}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${d.status === 'On Trip' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{d.status || 'Available'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FULL SCREEN MODALS */}
      {selectedBooking && !isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl relative animate-fade-in-up">
            <button onClick={() => setSelectedBooking(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-100 rounded-full transition-colors"><FaTimes /></button>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Trip Dispatch Details</h2>
            <div className="text-sm font-bold text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-lg mb-6">{selectedBooking.type || 'Booking'} #{selectedBooking.id}</div>
            
            <div className="space-y-4 text-sm font-medium">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Customer</p>
                  <p className="font-bold text-gray-900">{selectedBooking.name || selectedBooking.guestName || 'N/A'}</p>
                  <p className="text-gray-500 text-xs mt-1">{selectedBooking.phone || 'No phone'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Dispatch State</p>
                  <p className="font-black text-orange-600 uppercase">{selectedBooking.status || 'New'}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Assigned Fleet</p>
                <div className="flex justify-between items-center text-xs">
                  <div><span className="text-gray-400 font-bold">CAR:</span> <span className="font-bold text-gray-900">{selectedBooking.vehicleAssigned || 'None'}</span></div>
                  <div><span className="text-gray-400 font-bold">DRIVER:</span> <span className="font-bold text-gray-900">{selectedBooking.driverAssigned || 'None'}</span></div>
                </div>
              </div>
            </div>
            
            <button onClick={() => setSelectedBooking(null)} className="w-full mt-6 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors">Close Overview</button>
          </div>
        </div>
      )}

      {selectedVehicle && !isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-fade-in-up">
            <button onClick={() => setSelectedVehicle(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-100 rounded-full transition-colors"><FaTimes /></button>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Fleet Asset</h2>
            <div className="text-sm font-bold text-gray-600 bg-gray-100 inline-block px-3 py-1 rounded-lg mb-6">{selectedVehicle.licensePlate || selectedVehicle.plateNumber}</div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Model</span>
                <span className="font-bold text-gray-900">{selectedVehicle.name || selectedVehicle.make + ' ' + selectedVehicle.model}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Type</span>
                <span className="font-bold text-gray-900">{selectedVehicle.type || selectedVehicle.category || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</span>
                <span className={`font-black uppercase tracking-wider ${(selectedVehicle.status || 'available').toLowerCase() === 'available' ? 'text-green-600' : 'text-blue-600'}`}>{selectedVehicle.status || 'Available'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fuel</span>
                <span className="font-bold text-gray-900">{selectedVehicle.fuel || selectedVehicle.fuelLevel || 'Full'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAssignModalOpen && assigningBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-fade-in-up">
            <button onClick={() => setIsAssignModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 bg-gray-100 rounded-full transition-colors"><FaTimes /></button>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-4">Master Dispatch</h2>
            <p className="text-sm text-gray-500 font-medium mb-6">Assigning logistics for Booking #{assigningBooking.id}</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Assign Vehicle</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-800 outline-none focus:border-blue-500 transition-colors" value={assignForm.vehiclePlate} onChange={(e) => setAssignForm({...assignForm, vehiclePlate: e.target.value})}>
                  <option value="">-- Select Available Vehicle --</option>
                  {data.vehicles.filter((v:any) => (v.status || "available").toLowerCase() === "available").map((v:any, i:number) => (
                     <option key={i} value={v.licensePlate || v.plateNumber}>{v.licensePlate || v.plateNumber} - {v.name || v.make}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Assign Driver</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-800 outline-none focus:border-blue-500 transition-colors" value={assignForm.driverUsername} onChange={(e) => setAssignForm({...assignForm, driverUsername: e.target.value})}>
                  <option value="">-- Select Duty Driver --</option>
                  <option value="none">Self Drive (No Driver)</option>
                  {data.drivers.map((d:any, i:number) => (
                     <option key={i} value={d.username}>{d.fullName || d.username} ({d.status || 'Available'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Update Status</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-800 outline-none focus:border-blue-500 transition-colors" value={assignForm.status} onChange={(e) => setAssignForm({...assignForm, status: e.target.value})}>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            
            <button onClick={handleAssignSubmit} className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-wider py-4 rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95">Confirm Dispatch</button>
          </div>
        </div>
      )}

    </div>
  );
}

function KpiCard({ title, value, icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  const colors: Record<string, string> = { blue: "bg-blue-50 text-blue-600", emerald: "bg-emerald-50 text-emerald-600", sky: "bg-sky-50 text-sky-600", green: "bg-green-50 text-green-600", orange: "bg-orange-50 text-orange-600", red: "bg-red-50 text-red-600", indigo: "bg-indigo-50 text-indigo-600", stone: "bg-stone-50 text-stone-600" };
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-2"><div className={`p-2 rounded-xl ${colors[color]} group-hover:scale-110 transition-transform`}>{icon}</div></div>
      <div className="text-2xl font-black text-gray-900 tracking-tighter">{value}</div>
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-tight mt-1">{title}</div>
    </div>
  );
}

function AlertItem({ type, text }: { type: 'urgent' | 'warning' | 'critical' | 'info', text: string }) {
  const styles = { urgent: "border-red-200 bg-red-50 text-red-800", warning: "border-orange-200 bg-orange-50 text-orange-800", critical: "border-rose-200 bg-rose-50 text-rose-800 font-bold", info: "border-blue-200 bg-blue-50 text-blue-800" };
  const icons = { urgent: <FaExclamationTriangle className="text-red-500" />, warning: <FaExclamationTriangle className="text-orange-500" />, critical: <FaTimesCircle className="text-rose-500" />, info: <FaCheckCircle className="text-blue-500" /> };
  return (
    <div className={`p-3 rounded-xl border flex items-start gap-3 ${styles[type]}`}>
      <div className="mt-0.5">{icons[type]}</div><div className="text-xs">{text}</div>
    </div>
  );
}
