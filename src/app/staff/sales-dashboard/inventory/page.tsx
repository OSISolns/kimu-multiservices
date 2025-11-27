"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "../../../UserContext";
import { FaSearch, FaFilter, FaCar, FaGasPump, FaCog, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
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

export default function InventoryPage() {
    const { user, isLoading } = useUser();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

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

        if (user && !isLoading) {
            fetchVehicles();
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
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Available">Available</option>
                        <option value="Rented">Rented</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group">
                        <div className="relative h-48 bg-gray-100">
                            <Image
                                src={vehicle.image || '/placeholder-car.png'}
                                alt={vehicle.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3">
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
                                onClick={() => alert(`Vehicle Details\n\n${vehicle.name}\nYear: ${vehicle.year}\nPrice: ${vehicle.price}/day\nTransmission: ${vehicle.transmission}\nFuel: ${vehicle.fuel}\nStatus: ${vehicle.status}\n\nFull vehicle details page coming soon!`)}
                                className="w-full bg-gray-50 text-gray-700 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium text-sm"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
