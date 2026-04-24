"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "../../../UserContext";
import { FaSearch, FaFilter, FaCar, FaGasPump, FaCog, FaCheckCircle, FaTimesCircle, FaTimes, FaCalendar, FaClock, FaBookmark, FaRegBookmark } from "react-icons/fa";
import LoadingSpinner from "@/components/LoadingSpinner";
import Image from "next/image";

interface Vehicle {
    id: number;
    name: string;
    image: string;
    category: string;
    price: string;
    year: number;
    transmission: string;
    fuel: string;
    status: string;
    isAvailable: boolean;
}

interface BookingFormData {
    name: string;
    email: string;
    phone: string;
    nationality: string;
    idOrPassport: string;
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
}

export default function InventoryPage() {
    const { user, isLoading } = useUser();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [savedMap, setSavedMap] = useState<Record<number, number>>({}); // vehicleId -> savedItemId
    const [bookingForm, setBookingForm] = useState<BookingFormData>({
        name: "",
        email: "",
        phone: "",
        nationality: "",
        idOrPassport: "",
        pickupDate: "",
        pickupTime: "09:00",
        returnDate: "",
        returnTime: "17:00",
    });

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setIsLoadingData(true);
                const response = await fetch('/api/vehicles');
                if (response.ok) {
                    const data = await response.json();
                    setVehicles(data);
                }
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        const fetchSavedItems = async () => {
            try {
                const response = await fetch('/api/saved-items');
                if (response.ok) {
                    const data = await response.json();
                    const map: Record<number, number> = {};
                    data.forEach((item: any) => {
                        if (item.itemType === 'vehicle') {
                            map[item.itemId] = item.id;
                        }
                    });
                    setSavedMap(map);
                }
            } catch (error) {
                console.error('Error fetching saved items:', error);
            }
        };

        if (user && !isLoading) {
            fetchVehicles();
            fetchSavedItems();
        }
    }, [user, isLoading]);

    const filteredVehicles = useMemo(() =>
        vehicles.filter(vehicle => {
            const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === "All" ||
                (filterStatus === "Available" && vehicle.isAvailable) ||
                (filterStatus === "Rented" && vehicle.status === "Rented");
            return matchesSearch && matchesStatus;
        }), [vehicles, searchTerm, filterStatus]
    );

    const handleViewDetails = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setIsDetailModalOpen(true);
    };

    const handleBookNow = () => {
        setIsDetailModalOpen(false);
        setIsBookingModalOpen(true);
        // Set default dates (today and tomorrow)
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setBookingForm(prev => ({
            ...prev,
            pickupDate: today.toISOString().split('T')[0],
            returnDate: tomorrow.toISOString().split('T')[0],
        }));
    };

    const handleToggleSave = async (vehicle: Vehicle, e: React.MouseEvent) => {
        e.stopPropagation();

        const savedItemId = savedMap[vehicle.id];

        try {
            if (savedItemId) {
                // Remove
                const response = await fetch(`/api/saved-items/${savedItemId}`, { method: 'DELETE' });
                if (response.ok) {
                    const newMap = { ...savedMap };
                    delete newMap[vehicle.id];
                    setSavedMap(newMap);
                } else {
                    alert("Failed to remove from saved items");
                }
            } else {
                // Save
                const response = await fetch('/api/saved-items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        itemType: 'vehicle',
                        itemId: vehicle.id,
                        itemData: vehicle,
                        notes: `Saved from inventory on ${new Date().toLocaleDateString()}`
                    })
                });

                if (response.ok) {
                    const savedItem = await response.json();
                    setSavedMap({ ...savedMap, [vehicle.id]: savedItem.id });
                } else {
                    const result = await response.json();
                    if (result.error === 'Item already saved') {
                        alert("Item already saved");
                    } else {
                        alert("Failed to save item");
                    }
                }
            }
        } catch (error) {
            console.error('Error toggling save:', error);
            alert("An error occurred");
        }
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVehicle || !user) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-username': user.username,
                },
                body: JSON.stringify({
                    type: 'Car Rental',
                    name: bookingForm.name,
                    email: bookingForm.email,
                    phone: bookingForm.phone,
                    nationality: bookingForm.nationality,
                    idOrPassport: bookingForm.idOrPassport,
                    carType: selectedVehicle.name,
                    pickupDate: bookingForm.pickupDate,
                    pickupTime: bookingForm.pickupTime,
                    returnDate: bookingForm.returnDate,
                    returnTime: bookingForm.returnTime,
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert(`Booking created successfully!\n\nBooking ID: ${result.bookingId}\nVehicle: ${selectedVehicle.name}\nRental Days: ${result.rentalDays || 'N/A'}`);
                setIsBookingModalOpen(false);
                setBookingForm({
                    name: "",
                    email: "",
                    phone: "",
                    nationality: "",
                    idOrPassport: "",
                    pickupDate: "",
                    pickupTime: "09:00",
                    returnDate: "",
                    returnTime: "17:00",
                });
                // Refresh vehicles to update availability
                const vehiclesResponse = await fetch('/api/vehicles');
                if (vehiclesResponse.ok) {
                    const data = await vehiclesResponse.json();
                    setVehicles(data);
                }
            } else {
                alert(`Booking failed: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            alert('Failed to create booking. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || isLoadingData) {
        return <LoadingSpinner size="lg" message="Loading Inventory..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Vehicle Inventory</h2>
                    <p className="text-gray-500">Check availability and vehicle details.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search vehicles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-100/80 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border border-gray-100/80 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Available">Available</option>
                        <option value="Rented">Rented</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 border border-white/60-sm border border-gray-100/80 overflow-hidden hover:shadow-md transition-all group">
                        <div className="relative h-48 bg-gray-100">
                            <Image
                                src={vehicle.image || '/placeholder-car.png'}
                                alt={vehicle.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3 flex gap-2">
                                <button
                                    onClick={(e) => handleToggleSave(vehicle, e)}
                                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors text-blue-600"
                                    title={savedMap[vehicle.id] ? "Remove from saved" : "Save vehicle"}
                                >
                                    {savedMap[vehicle.id] ? <FaBookmark /> : <FaRegBookmark />}
                                </button>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm
                  ${vehicle.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {vehicle.isAvailable ? <FaCheckCircle /> : <FaTimesCircle />}
                                    {vehicle.status}
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 mb-1">{vehicle.name}</h3>
                            <p className="text-blue-600 font-bold mb-3">{vehicle.price} <span className="text-gray-400 text-xs font-normal">/ day</span></p>

                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                                <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded">
                                    <FaCog className="text-gray-400" /> {vehicle.transmission}
                                </div>
                                <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded">
                                    <FaGasPump className="text-gray-400" /> {vehicle.fuel}
                                </div>
                            </div>

                            <button
                                onClick={() => handleViewDetails(vehicle)}
                                className="w-full bg-gray-50 text-gray-700 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium text-sm"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Vehicle Detail Modal */}
            {isDetailModalOpen && selectedVehicle && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 m-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">{selectedVehicle.name}</h3>
                            <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Vehicle Image */}
                            <div className="relative h-64 bg-gray-100 rounded-xl overflow-hidden">
                                <Image
                                    src={selectedVehicle.image || '/placeholder-car.png'}
                                    alt={selectedVehicle.name}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button
                                        onClick={(e) => handleToggleSave(selectedVehicle, e)}
                                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors text-blue-600"
                                        title={savedMap[selectedVehicle.id] ? "Remove from saved" : "Save vehicle"}
                                    >
                                        {savedMap[selectedVehicle.id] ? <FaBookmark className="w-5 h-5" /> : <FaRegBookmark className="w-5 h-5" />}
                                    </button>
                                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg
                                        ${selectedVehicle.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {selectedVehicle.isAvailable ? <FaCheckCircle /> : <FaTimesCircle />}
                                        {selectedVehicle.status}
                                    </span>
                                </div>
                            </div>

                            {/* Vehicle Details */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Category</p>
                                    <p className="font-semibold text-gray-900">{selectedVehicle.category}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Year</p>
                                    <p className="font-semibold text-gray-900">{selectedVehicle.year}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Transmission</p>
                                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                                        <FaCog className="text-gray-400" />
                                        {selectedVehicle.transmission}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Fuel Type</p>
                                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                                        <FaGasPump className="text-gray-400" />
                                        {selectedVehicle.fuel}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500 mb-1">Rental Price</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {selectedVehicle.price} <span className="text-sm text-gray-500 font-normal">/ day</span>
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-blue-50/50 transition-colors font-medium"
                                >
                                    Close
                                </button>
                                {selectedVehicle.isAvailable && (
                                    <button
                                        onClick={handleBookNow}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                    >
                                        Book Now
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {isBookingModalOpen && selectedVehicle && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 m-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Book {selectedVehicle.name}</h3>
                                <p className="text-sm text-gray-500">Complete the form to create your booking</p>
                            </div>
                            <button onClick={() => setIsBookingModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleBookingSubmit} className="space-y-4">
                            {/* Customer Information */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={bookingForm.name}
                                        onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={bookingForm.email}
                                        onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={bookingForm.phone}
                                        onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                        placeholder="+250 792 958 752"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality *</label>
                                    <input
                                        type="text"
                                        required
                                        value={bookingForm.nationality}
                                        onChange={(e) => setBookingForm({ ...bookingForm, nationality: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                        placeholder="Rwanda"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ID/Passport *</label>
                                    <input
                                        type="text"
                                        required
                                        value={bookingForm.idOrPassport}
                                        onChange={(e) => setBookingForm({ ...bookingForm, idOrPassport: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                        placeholder="ID or Passport Number"
                                    />
                                </div>
                            </div>

                            {/* Rental Period */}
                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FaCalendar className="text-blue-600" />
                                    Rental Period
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date *</label>
                                        <input
                                            type="date"
                                            required
                                            value={bookingForm.pickupDate}
                                            onChange={(e) => setBookingForm({ ...bookingForm, pickupDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Time *</label>
                                        <input
                                            type="time"
                                            required
                                            value={bookingForm.pickupTime}
                                            onChange={(e) => setBookingForm({ ...bookingForm, pickupTime: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Return Date *</label>
                                        <input
                                            type="date"
                                            required
                                            value={bookingForm.returnDate}
                                            onChange={(e) => setBookingForm({ ...bookingForm, returnDate: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Return Time *</label>
                                        <input
                                            type="time"
                                            required
                                            value={bookingForm.returnTime}
                                            onChange={(e) => setBookingForm({ ...bookingForm, returnTime: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Summary */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">Booking Summary</h4>
                                <div className="space-y-1 text-sm">
                                    <p><span className="text-gray-600">Vehicle:</span> <span className="font-medium">{selectedVehicle.name}</span></p>
                                    <p><span className="text-gray-600">Daily Rate:</span> <span className="font-medium text-blue-600">{selectedVehicle.price}</span></p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsBookingModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-blue-50/50 transition-colors font-medium"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}



