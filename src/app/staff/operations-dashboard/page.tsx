"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "../../UserContext";
import {
  FaCar, FaCalendarCheck, FaPlane, FaExclamationTriangle,
  FaHardHat, FaUserTie, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt,
  FaGasPump, FaStar, FaTimes, FaBell
} from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function OperationsDashboardPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ bookings: [], vehicles: [], drivers: [] });

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  
  // Fleet Availability filtering & editing state
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState("all");
  const [vehicleEditState, setVehicleEditState] = useState<any>({
    status: "",
    isAvailable: true,
    mileage: "",
    maintenanceNotes: "",
    maintenanceDate: ""
  });
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Assignment Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningBooking, setAssigningBooking] = useState<any>(null);
  const [assignForm, setAssignForm] = useState({ vehiclePlate: "", driverUsername: "", status: "" });

  useEffect(() => {
    if (selectedVehicle) {
      setVehicleEditState({
        status: selectedVehicle.status || "available",
        isAvailable: selectedVehicle.isAvailable ?? true,
        mileage: selectedVehicle.mileage || "",
        maintenanceNotes: selectedVehicle.maintenanceNotes || "",
        maintenanceDate: selectedVehicle.maintenanceDate
          ? new Date(selectedVehicle.maintenanceDate).toISOString().split('T')[0]
          : ""
      });
      setSaveError(null);
    }
  }, [selectedVehicle]);

  const getNormalizedVehicleStatus = (status: string) => {
    const norm = (status || "").toLowerCase().replace(/[-_\s]/g, "");
    if (norm === "available") return "available";
    if (["inuse", "rented", "inprogress", "active"].includes(norm)) return "inuse";
    if (norm === "maintenance") return "maintenance";
    if (["outofservice", "out-of-service"].includes(norm)) return "outofservice";
    return "available";
  };

  const vehicleStatusMap = {
    available: {
      dotColor: "bg-emerald-500 ring-emerald-500/10",
      badgeClass: "badge-shadcn-success",
      label: "Available"
    },
    inuse: {
      dotColor: "bg-blue-500 ring-blue-500/10",
      badgeClass: "badge-shadcn-default",
      label: "In Use"
    },
    maintenance: {
      dotColor: "bg-amber-500 ring-amber-500/10",
      badgeClass: "badge-shadcn-warning",
      label: "Maintenance"
    },
    outofservice: {
      dotColor: "bg-rose-500 ring-rose-500/10",
      badgeClass: "badge-shadcn-destructive",
      label: "Out of Service"
    }
  };

  const handleVehicleStatusChange = (newStatus: string) => {
    const isAvail = newStatus.toLowerCase().replace(/[-_\s]/g, '') === 'available';
    setVehicleEditState((prev: any) => ({
      ...prev,
      status: newStatus,
      isAvailable: isAvail
    }));
  };

  const handleSaveVehicleChanges = async () => {
    if (!selectedVehicle) return;
    setIsSavingVehicle(true);
    setSaveError(null);
    try {
      let finalStatus = "Available";
      const currentVal = vehicleEditState.status.toLowerCase().replace(/[-_\s]/g, "");
      if (currentVal === "available") finalStatus = "Available";
      else if (currentVal === "inuse") finalStatus = "Rented";
      else if (currentVal === "maintenance") finalStatus = "Maintenance";
      else if (currentVal === "outofservice") finalStatus = "Out of Service";

      const response = await fetch(`/api/vehicles/${selectedVehicle.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-username": user?.username || ""
        },
        body: JSON.stringify({
          ...selectedVehicle,
          status: finalStatus,
          isAvailable: vehicleEditState.isAvailable,
          mileage: vehicleEditState.mileage,
          maintenanceNotes: vehicleEditState.maintenanceNotes || null,
          maintenanceDate: vehicleEditState.maintenanceDate ? new Date(vehicleEditState.maintenanceDate).toISOString() : null
        })
      });

      if (response.ok) {
        await fetchOpsData();
        setSelectedVehicle(null);
      } else {
        const err = await response.json();
        setSaveError(err.error || "Failed to save vehicle details.");
      }
    } catch (err) {
      console.error(err);
      setSaveError("Network error occurred during update.");
    } finally {
      setIsSavingVehicle(false);
    }
  };

  const filteredVehicles = useMemo(() => {
    return data.vehicles.filter((v: any) => {
      const plate = v.licensePlate || v.plateNumber || "";
      const name = v.name || v.make || "";
      const matchesSearch =
        plate.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
        name.toLowerCase().includes(vehicleSearch.toLowerCase());

      const norm = getNormalizedVehicleStatus(v.status);
      const matchesFilter =
        vehicleStatusFilter === "all" ||
        (vehicleStatusFilter === "available" && norm === "available") ||
        (vehicleStatusFilter === "inuse" && norm === "inuse") ||
        (vehicleStatusFilter === "maintenance" && norm === "maintenance") ||
        (vehicleStatusFilter === "outofservice" && norm === "outofservice");

      return matchesSearch && matchesFilter;
    });
  }, [data.vehicles, vehicleSearch, vehicleStatusFilter]);

  const vehicleBookings = useMemo(() => {
    if (!selectedVehicle) return [];
    const plate = (selectedVehicle.licensePlate || selectedVehicle.plateNumber || "").toUpperCase().replace(/\s/g, "");
    return data.bookings.filter((b: any) => {
      const bookingVehicle = (b.vehicle || b.vehicleAssigned || "").toUpperCase().replace(/\s/g, "");
      return bookingVehicle !== "" && bookingVehicle === plate;
    });
  }, [selectedVehicle, data.bookings]);

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
        drivers: Array.isArray(u) ? u.filter((usr: any) => usr.role === "driver") : []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchOpsData();
  }, [user]);

  const handleAssignSubmit = async () => {
    if (!assigningBooking) return;
    try {
      const response = await fetch(`/api/bookings/${assigningBooking.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-username": user?.username || ""
        },
        body: JSON.stringify({
          vehicle: assignForm.vehiclePlate || null,
          driver: assignForm.driverUsername || null,
          status: assignForm.status || undefined
        })
      });

      if (response.ok) {
        await fetchOpsData();
        setIsAssignModalOpen(false);
        setAssigningBooking(null);
        setAssignForm({ vehiclePlate: "", driverUsername: "", status: "" });
      } else {
        const err = await response.json();
        alert(`Failed to assign: ${err.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred during dispatch confirmation.");
    }
  };

  const normalizeStatus = (status: string) => (status || "").toLowerCase().replace(/[-_\s]/g, "");

  const todayStr = new Date().toISOString().split("T")[0];
  const bookingsToday = data.bookings.filter((b: any) => (b.createdAt && b.createdAt.startsWith(todayStr)) || (b.pickupDate && b.pickupDate.startsWith(todayStr))).length;
  const activeRentals = data.bookings.filter((b: any) => b.type === "Car Rental" && ["active", "inprogress", "confirmed"].includes(normalizeStatus(b.status))).length;
  const airportTransfersToday = data.bookings.filter((b: any) => b.type === "Airport Transfer" && b.pickupDate && b.pickupDate.startsWith(todayStr)).length;
  const availableVehicles = data.vehicles.filter((v: any) => normalizeStatus(v.status) === "available").length;
  const pendingRequests = data.bookings.filter((b: any) => ["pending", "new", ""].includes(normalizeStatus(b.status))).length;
  const overdueReturns = data.bookings.filter((b: any) => ["active", "inprogress", "confirmed"].includes(normalizeStatus(b.status)) && b.returnDate && new Date(b.returnDate) < new Date()).length;
  const driversOnDuty = data.drivers.filter((d: any) => normalizeStatus(d.status) !== "offduty").length;
  const vehiclesInMaintenance = data.vehicles.filter((v: any) => normalizeStatus(v.status) === "maintenance").length;

  // Dynamic live alert feed based on real operational states
  const alerts = useMemo(() => {
    const list: Array<{ type: 'urgent' | 'warning' | 'critical' | 'info'; text: string }> = [];
    
    if (overdueReturns > 0) {
      list.push({
        type: 'critical',
        text: `${overdueReturns} vehicle return${overdueReturns > 1 ? 's' : ''} overdue.`
      });
    }

    const missingDriverTransfers = data.bookings.filter((b: any) => 
      b.type === "Airport Transfer" && 
      !b.driver && 
      !b.driverAssigned &&
      ["active", "inprogress", "confirmed", "pending", "new", ""].includes(normalizeStatus(b.status))
    ).length;
    
    if (missingDriverTransfers > 0) {
      list.push({
        type: 'urgent',
        text: `${missingDriverTransfers} Airport Pickup${missingDriverTransfers > 1 ? 's' : ''} missing driver.`
      });
    }

    if (vehiclesInMaintenance > 0) {
      list.push({
        type: 'info',
        text: `${vehiclesInMaintenance} vehicle${vehiclesInMaintenance > 1 ? 's' : ''} currently in maintenance.`
      });
    }

    if (pendingRequests > 0) {
      list.push({
        type: 'warning',
        text: `${pendingRequests} pending booking request${pendingRequests > 1 ? 's' : ''} require review.`
      });
    }

    if (list.length === 0) {
      list.push({
        type: 'info',
        text: "All clear! Fleet operations running smoothly."
      });
    }

    return list;
  }, [overdueReturns, pendingRequests, vehiclesInMaintenance, data.bookings]);

  if (loading) return <LoadingSpinner message="Loading Operations Dispatch..." size="lg" fullScreen />;

  return (
    <div className="space-y-6 pb-12 relative px-8 pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Operations & Dispatch</h1>
          <p className="text-xs text-slate-500 font-medium tracking-wide mt-0.5">Live fleet tracking and service coordination center</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <KpiCard title="Bookings Today" value={bookingsToday} icon={<FaCalendarCheck />} color="blue" />
        <KpiCard title="Active Rentals" value={activeRentals} icon={<FaCar />} color="emerald" />
        <KpiCard title="Airport Pickups" value={airportTransfersToday} icon={<FaPlane />} color="sky" />
        <KpiCard title="Available Cars" value={availableVehicles} icon={<FaCar />} color="green" />
        <KpiCard title="Pending Reqs" value={pendingRequests} icon={<FaExclamationTriangle />} color="orange" />
        <KpiCard title="Overdue Returns" value={overdueReturns} icon={<FaExclamationTriangle />} color="red" />
        <KpiCard title="Drivers on Duty" value={driversOnDuty} icon={<FaUserTie />} color="indigo" />
        <KpiCard title="In Maintenance" value={vehiclesInMaintenance} icon={<FaHardHat />} color="stone" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          
          {/* Live Trip Queue Table - Shadcn-UI Table Style */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex flex-col h-[480px] shadow-sm">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4 shrink-0">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Trip Queue
            </h2>
            <div className="flex-1 overflow-auto custom-scrollbar table-container-shadcn border-slate-100">
              <table className="table-shadcn">
                <thead className="table-header-shadcn sticky top-0 z-10">
                  <tr>
                    <th className="table-header-cell-shadcn">ID / Service</th>
                    <th className="table-header-cell-shadcn">Customer</th>
                    <th className="table-header-cell-shadcn">Vehicle/Driver</th>
                    <th className="table-header-cell-shadcn">Timeline</th>
                    <th className="table-header-cell-shadcn">Status</th>
                    <th className="table-header-cell-shadcn text-right">Dispatch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.bookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-xs font-semibold text-slate-400">
                        No active dispatches found in the database.
                      </td>
                    </tr>
                  ) : (
                    data.bookings.slice(0, 20).map((b: any, i: number) => (
                      <tr key={i} className="table-row-shadcn cursor-pointer" onClick={() => setSelectedBooking(b)}>
                        <td className="table-cell-shadcn">
                          <div className="font-bold text-slate-900">#{b.id?.toString().slice(-4) || 'N/A'}</div>
                          <div className="text-[9px] font-black text-blue-600 mt-0.5 uppercase tracking-wider">{b.type || 'Booking'}</div>
                        </td>
                        <td className="table-cell-shadcn">
                          <div className="font-bold text-slate-800">{b.name || b.guestName || 'Unknown'}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">{b.phone || ''}</div>
                        </td>
                        <td className="table-cell-shadcn">
                          <div className="font-bold text-slate-800 uppercase">{b.vehicle || b.vehicleAssigned || 'Unassigned'}</div>
                          <div className={`text-[10px] font-bold mt-0.5 ${b.driver || b.driverAssigned ? 'text-slate-500' : 'text-orange-500'}`}>
                            {b.driver || b.driverAssigned || 'Pending Driver'}
                          </div>
                        </td>
                        <td className="table-cell-shadcn font-medium text-slate-500">
                          IN: {new Date(b.pickupDate || Date.now()).toLocaleString([], {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}
                        </td>
                        <td className="table-cell-shadcn">
                          <span className={`badge-shadcn ${
                            normalizeStatus(b.status) === 'pending' ? 'badge-shadcn-warning' :
                            ['inprogress', 'active', 'confirmed'].includes(normalizeStatus(b.status)) ? 'badge-shadcn-success' : 'badge-shadcn-secondary'
                          }`}>
                            {b.status || 'New'}
                          </span>
                        </td>
                        <td className="table-cell-shadcn text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setAssigningBooking(b);
                              setAssignForm({
                                vehiclePlate: b.vehicle || b.vehicleAssigned || "",
                                driverUsername: b.driver || b.driverAssigned || "",
                                status: b.status || "Confirmed"
                              });
                              setIsAssignModalOpen(true);
                            }}
                            className="btn-shadcn-outline !h-7 !px-2.5 !text-[10px]"
                          >
                            Assign
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fleet Availability - Clean Border Grid layout */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 h-[380px] flex flex-col shadow-sm">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4 shrink-0">
              <FaCar className="text-orange-500" /> Fleet Availability
            </h2>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto pr-1 custom-scrollbar">
               {data.vehicles.length === 0 ? (
                 <div className="col-span-full py-8 text-center text-xs font-semibold text-slate-400">
                   No vehicle assets found in the database.
                 </div>
               ) : (
                 data.vehicles.map((v: any, i: number) => (
                   <div key={i} onClick={() => setSelectedVehicle(v)} className="cursor-pointer border border-slate-200/75 rounded-xl p-3.5 hover:border-orange-300 hover:bg-slate-50/20 transition-all bg-white relative overflow-hidden group">
                     <div className="flex justify-between items-start">
                       <div>
                         <div className="text-xs font-black text-slate-900 tracking-tight">{v.licensePlate || v.plateNumber || 'N/A'}</div>
                         <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{v.name || v.make} {v.model || ''}</div>
                       </div>
                       <span className={`w-2 h-2 rounded-full ${normalizeStatus(v.status) === 'available' ? 'bg-emerald-500 ring-4 ring-emerald-500/10' : 'bg-blue-500 ring-4 ring-blue-500/10'}`}></span>
                     </div>
                     <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-[9px] font-bold text-slate-500">
                       <div className="flex items-center gap-1.5"><FaGasPump className="text-slate-400" /> {v.fuelLevel || v.fuel || 'Full'}</div>
                       <div className="flex items-center gap-1.5 text-right justify-end"><FaMapMarkerAlt className="text-slate-400" /> HQ</div>
                     </div>
                   </div>
                 ))
               )}
            </div>
          </div>
          
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          {/* Action Required alerts */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
              <FaBell className="text-red-500 animate-bounce" /> Action Required
            </h2>
            <div className="space-y-2.5">
              {alerts.map((alert, i) => (
                <AlertItem key={i} type={alert.type} text={alert.text} />
              ))}
            </div>
          </div>

          {/* Driver Roster */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
              <FaUserTie className="text-blue-500" /> Driver Roster
            </h2>
            <div className="space-y-2.5">
              {data.drivers.slice(0, 10).map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/30">
                   <div className="flex items-center gap-2.5">
                     <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">{d.fullName?.[0] || d.username?.[0] || 'D'}</div>
                     <div>
                       <div className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{d.fullName || d.username}</div>
                       <div className="flex items-center gap-0.5 text-[8px] text-yellow-500 font-bold mt-0.5"><FaStar /> {d.rating || '4.8'}</div>
                     </div>
                   </div>
                   <span className={`badge-shadcn ${
                     normalizeStatus(d.status) === 'ontrip' ? 'badge-shadcn-outline' : 'badge-shadcn-success'
                   }`}>
                     {d.status || 'Available'}
                   </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FULL SCREEN MODALS - Shadcn-UI Dialog style */}
      {selectedBooking && !isAssignModalOpen && (
        <div className="modal-overlay-shadcn">
          <div className="modal-content-shadcn max-w-md">
            <button onClick={() => setSelectedBooking(null)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-lg transition-colors">
              <FaTimes />
            </button>
            <div className="modal-header-shadcn">
              <h2 className="modal-title-shadcn">Trip Dispatch Details</h2>
              <p className="modal-description-shadcn">
                {selectedBooking.type || 'Booking'} #{selectedBooking.id}
              </p>
            </div>
            
            <div className="space-y-4 mt-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Customer</p>
                  <p className="font-bold text-slate-800">{selectedBooking.name || selectedBooking.guestName || 'N/A'}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{selectedBooking.phone || 'No phone'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Dispatch State</p>
                  <span className={`badge-shadcn mt-1 inline-block ${
                    ['inprogress', 'active', 'confirmed'].includes(normalizeStatus(selectedBooking.status)) ? 'badge-shadcn-success' : 'badge-shadcn-warning'
                  }`}>
                    {selectedBooking.status || 'New'}
                  </span>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2">Assigned Logistics</p>
                <div className="flex justify-between items-center text-[10px]">
                  <div><span className="text-slate-400 font-bold">VEHICLE:</span> <span className="font-bold text-slate-800 uppercase ml-1">{selectedBooking.vehicle || selectedBooking.vehicleAssigned || 'None'}</span></div>
                  <div><span className="text-slate-400 font-bold">DRIVER:</span> <span className="font-bold text-slate-800 uppercase ml-1">{selectedBooking.driver || selectedBooking.driverAssigned || 'None'}</span></div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer-shadcn">
              <button
                onClick={() => setSelectedBooking(null)}
                className="btn-shadcn-primary w-full sm:w-auto"
              >
                Close Overview
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedVehicle && !isAssignModalOpen && (
        <div className="modal-overlay-shadcn">
          <div className="modal-content-shadcn" style={{ maxWidth: '44rem' }}>
            <button onClick={() => setSelectedVehicle(null)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-lg transition-colors">
              <FaTimes />
            </button>
            <div className="modal-header-shadcn border-b border-slate-100 pb-3">
              <h2 className="modal-title-shadcn flex items-center gap-2">
                <FaCar className="text-blue-600" /> Fleet Asset Manager
              </h2>
              <p className="modal-description-shadcn mt-1">
                Plate Number: <span className="font-bold text-slate-950 uppercase">{selectedVehicle.licensePlate || selectedVehicle.plateNumber}</span>
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* Left Column: Details & Edit */}
              <div className="space-y-4">
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex gap-3 items-center">
                  <div className="relative w-16 h-12 bg-white rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    <img 
                      src={selectedVehicle.image || '/vehicles/land-cruiser.jpg'} 
                      alt={selectedVehicle.name} 
                      className="object-contain w-full h-full p-1" 
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase">{selectedVehicle.name || selectedVehicle.make + ' ' + selectedVehicle.model}</h3>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{selectedVehicle.type || selectedVehicle.category || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Vehicle Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { val: "available", label: "Available", color: "hover:border-emerald-300 active:bg-emerald-50", activeClass: "border-emerald-500 bg-emerald-50/50 text-emerald-700" },
                        { val: "inuse", label: "In Use / Rented", color: "hover:border-blue-300 active:bg-blue-50", activeClass: "border-blue-500 bg-blue-50/50 text-blue-700" },
                        { val: "maintenance", label: "Maintenance", color: "hover:border-amber-300 active:bg-amber-50", activeClass: "border-amber-500 bg-amber-50/50 text-amber-700" },
                        { val: "outofservice", label: "Out of Service", color: "hover:border-rose-300 active:bg-rose-50", activeClass: "border-rose-500 bg-rose-50/50 text-rose-700" }
                      ].map((opt) => {
                        const isSelected = vehicleEditState.status.toLowerCase().replace(/[-_\s]/g, "") === opt.val;
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => handleVehicleStatusChange(opt.val)}
                            className={`px-3 py-2 border rounded-lg text-[10px] font-bold text-center transition-all ${
                              isSelected ? opt.activeClass : "border-slate-200 bg-white text-slate-600 " + opt.color
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Current Mileage</label>
                    <input 
                      type="text" 
                      className="input-shadcn"
                      placeholder="e.g. 50,000km"
                      value={vehicleEditState.mileage}
                      onChange={(e) => setVehicleEditState({ ...vehicleEditState, mileage: e.target.value })}
                    />
                  </div>

                  {vehicleEditState.status.toLowerCase().replace(/[-_\s]/g, "") === "maintenance" && (
                    <>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Maintenance Date</label>
                        <input 
                          type="date" 
                          className="input-shadcn"
                          value={vehicleEditState.maintenanceDate}
                          onChange={(e) => setVehicleEditState({ ...vehicleEditState, maintenanceDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Maintenance Notes</label>
                        <textarea 
                          className="input-shadcn !h-16 py-1.5"
                          placeholder="Describe the issues or maintenance done..."
                          value={vehicleEditState.maintenanceNotes}
                          onChange={(e) => setVehicleEditState({ ...vehicleEditState, maintenanceNotes: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column: Bookings Timeline */}
              <div className="border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-col">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 shrink-0">
                  <FaCalendarCheck className="text-slate-400" /> Dispatch Timeline
                </h3>
                <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] pr-1 custom-scrollbar">
                  {vehicleBookings.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-2">
                        <FaCalendarCheck />
                      </div>
                      <p className="text-[10px] font-semibold text-slate-400">No active or upcoming trips assigned to this vehicle.</p>
                    </div>
                  ) : (
                    vehicleBookings.map((b: any, index: number) => (
                      <div key={index} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-[10px] font-bold text-slate-800">#{b.id?.toString().slice(-4) || 'N/A'} - {b.name || b.guestName || 'Unknown'}</div>
                            <div className="text-[9px] text-slate-400 font-medium mt-0.5">
                              {new Date(b.pickupDate || Date.now()).toLocaleDateString([], {day:'2-digit', month:'short'})} - {new Date(b.returnDate || Date.now()).toLocaleDateString([], {day:'2-digit', month:'short'})}
                            </div>
                          </div>
                          <span className={`badge-shadcn !text-[8px] !px-1.5 !py-0.5 ${
                            normalizeStatus(b.status) === 'pending' ? 'badge-shadcn-warning' :
                            ['inprogress', 'active', 'confirmed'].includes(normalizeStatus(b.status)) ? 'badge-shadcn-success' : 'badge-shadcn-secondary'
                          }`}>
                            {b.status || 'New'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {saveError && (
              <div className="mt-4 p-2 bg-red-50 border border-red-100 text-red-700 text-[10px] font-bold rounded-lg">
                ⚠️ {saveError}
              </div>
            )}

            <div className="modal-footer-shadcn border-t border-slate-100 pt-3 flex justify-between items-center w-full">
              <span className="text-[9px] text-slate-400 font-semibold uppercase">ID: {selectedVehicle.id}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedVehicle(null)}
                  className="btn-shadcn-secondary"
                  disabled={isSavingVehicle}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveVehicleChanges}
                  className="btn-shadcn-primary flex items-center gap-1.5"
                  disabled={isSavingVehicle}
                >
                  {isSavingVehicle ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAssignModalOpen && assigningBooking && (
        <div className="modal-overlay-shadcn">
          <div className="modal-content-shadcn">
            <button onClick={() => setIsAssignModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 bg-slate-100 rounded-lg transition-colors">
              <FaTimes />
            </button>
            <div className="modal-header-shadcn">
              <h2 className="modal-title-shadcn">Master Dispatch</h2>
              <p className="modal-description-shadcn">Assign logistics for Booking #{assigningBooking.id}</p>
            </div>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Assign Vehicle</label>
                <select className="input-shadcn" value={assignForm.vehiclePlate} onChange={(e) => setAssignForm({...assignForm, vehiclePlate: e.target.value})}>
                  <option value="">-- Select Available Vehicle --</option>
                  {data.vehicles.filter((v:any) => normalizeStatus(v.status) === "available").map((v:any, i:number) => (
                     <option key={i} value={v.licensePlate || v.plateNumber}>{v.licensePlate || v.plateNumber} - {v.name || v.make}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Assign Driver</label>
                <select className="input-shadcn" value={assignForm.driverUsername} onChange={(e) => setAssignForm({...assignForm, driverUsername: e.target.value})}>
                  <option value="">-- Select Duty Driver --</option>
                  <option value="none">Self Drive (No Driver)</option>
                  {data.drivers.map((d:any, i:number) => (
                     <option key={i} value={d.username}>{d.fullName || d.username} ({d.status || 'Available'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Update Status</label>
                <select className="input-shadcn" value={assignForm.status} onChange={(e) => setAssignForm({...assignForm, status: e.target.value})}>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer-shadcn">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="btn-shadcn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                className="btn-shadcn-primary"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function KpiCard({ title, value, icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  const colors: Record<string, string> = { blue: "bg-blue-50 text-blue-600 border-blue-100", emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", sky: "bg-sky-50 text-sky-600 border-sky-100", green: "bg-green-50 text-green-600 border-green-100", orange: "bg-orange-50 text-orange-600 border-orange-100", red: "bg-red-50 text-red-600 border-red-100", indigo: "bg-indigo-50 text-indigo-600 border-indigo-100", stone: "bg-stone-50 text-stone-600 border-stone-100" };
  return (
    <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-sm flex flex-col justify-between h-24">
      <div className="flex justify-between items-start">
        <div className={`p-1.5 rounded-lg border ${colors[color]} text-xs shrink-0`}>{icon}</div>
      </div>
      <div>
        <div className="text-base font-black text-slate-900 tracking-tight leading-none">{value}</div>
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 truncate">{title}</div>
      </div>
    </div>
  );
}

function AlertItem({ type, text }: { type: 'urgent' | 'warning' | 'critical' | 'info', text: string }) {
  const styles = { urgent: "border-red-100 bg-red-50 text-red-700", warning: "border-orange-100 bg-orange-50 text-orange-700", critical: "border-rose-100 bg-rose-50 text-rose-700 font-bold", info: "border-blue-100 bg-blue-50 text-blue-700" };
  const icons = { urgent: <FaExclamationTriangle className="text-red-500 shrink-0 text-xs" />, warning: <FaExclamationTriangle className="text-orange-500 shrink-0 text-xs" />, critical: <FaTimesCircle className="text-rose-500 shrink-0 text-xs" />, info: <FaCheckCircle className="text-blue-500 shrink-0 text-xs" /> };
  return (
    <div className={`p-2.5 rounded-lg border flex items-start gap-2 ${styles[type]} text-[10px] font-semibold leading-snug`}>
      <div className="mt-0.5">{icons[type]}</div>
      <div>{text}</div>
    </div>
  );
}
