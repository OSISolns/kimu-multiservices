import Image from 'next/image'
import { Vehicle } from '@/types/vehicle'

interface VehicleModalProps {
    vehicle: Vehicle | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function VehicleModal({ vehicle, isOpen, onClose }: VehicleModalProps) {
    if (!isOpen || !vehicle) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                    aria-label="Close"
                >
                    &times;
                </button>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="relative w-full md:w-1/2 h-64 bg-gray-50 rounded-xl overflow-hidden">
                        {vehicle.image ? (
                            <Image
                                src={vehicle.image}
                                alt={vehicle.name || 'Vehicle'}
                                fill
                                className="object-contain p-4"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                        )}
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                        <h2 className="text-2xl font-bold text-blue-900 mb-2">{vehicle.name || 'Vehicle'}</h2>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl font-bold text-orange-500">{vehicle.price || 'N/A'}</span>
                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                                {vehicle.type || 'N/A'}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <div className="text-base font-bold text-blue-600">{vehicle.capacity || 'N/A'}</div>
                                <div className="text-xs text-gray-500">Seats</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <div className="text-sm font-bold text-blue-600">{vehicle.transmission || 'N/A'}</div>
                                <div className="text-xs text-gray-500">Transmission</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <div className="text-sm font-bold text-blue-600">{vehicle.fuel || 'N/A'}</div>
                                <div className="text-xs text-gray-500">Fuel</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <div className="text-sm font-bold text-blue-600">{vehicle.year || 'N/A'}</div>
                                <div className="text-xs text-gray-500">Year</div>
                            </div>
                        </div>
                        <div className="mb-2">
                            <div className="text-sm font-semibold text-gray-700 mb-1">Features:</div>
                            <div className="flex flex-wrap gap-2">
                                {(vehicle.features || []).map((feature: any, idx: number) => (
                                    <span key={idx} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                        {typeof feature === 'string' ? feature : feature.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{vehicle.description || 'No description available.'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
