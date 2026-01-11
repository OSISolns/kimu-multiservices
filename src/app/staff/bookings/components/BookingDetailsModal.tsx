
import React from 'react';
import { FaCar, FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCheckCircle, FaTimesCircle, FaIdCard, FaTimes, FaGlobe } from 'react-icons/fa';

interface Booking {
    id: number;
    type: string;
    name: string;
    email: string | null;
    phone: string;
    nationality: string;
    idOrPassport: string;
    carType: string;
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
    rentalDays: number;
    returnConfirmed: boolean;
    fullTank: boolean;
    status: string;
    createdAt: string;
}

interface BookingDetailsModalProps {
    booking: Booking;
    onClose: () => void;
}

export default function BookingDetailsModal({ booking, onClose }: BookingDetailsModalProps) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'in-progress': return 'bg-purple-100 text-purple-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return <FaCheckCircle className="text-blue-600" />;
            case 'completed': return <FaCheckCircle className="text-green-600" />;
            case 'cancelled': return <FaTimesCircle className="text-red-600" />;
            case 'confirmed': return <FaCheckCircle className="text-green-600" />;
            default: return <FaClock className="text-blue-600" />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    {/* Header */}
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-100">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                                    <FaCar className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Booking Details
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        ID: #{booking.id} • Created {new Date(booking.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={onClose}
                            >
                                <span className="sr-only">Close</span>
                                <FaTimes className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="bg-white px-4 py-5 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Customer Information */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Customer Information</h4>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 flex items-center"><FaIdCard className="mr-2 text-gray-400" /> Name</span>
                                        <span className="text-sm font-medium text-gray-900">{booking.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 flex items-center"><FaPhone className="mr-2 text-gray-400" /> Phone</span>
                                        <span className="text-sm font-medium text-gray-900">{booking.phone}</span>
                                    </div>
                                    {booking.email && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 flex items-center"><FaEnvelope className="mr-2 text-gray-400" /> Email</span>
                                            <span className="text-sm font-medium text-gray-900">{booking.email}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 flex items-center"><FaGlobe className="mr-2 text-gray-400" /> Nationality</span>
                                        <span className="text-sm font-medium text-gray-900">{booking.nationality}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 flex items-center"><FaIdCard className="mr-2 text-gray-400" /> ID/Passport</span>
                                        <span className="text-sm font-medium text-gray-900">{booking.idOrPassport}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle & Trip Details */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Trip Details</h4>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 flex items-center"><FaCar className="mr-2 text-gray-400" /> Vehicle Type</span>
                                        <span className="text-sm font-medium text-gray-900">{booking.carType}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 flex items-center"><FaClock className="mr-2 text-gray-400" /> Duration</span>
                                        <span className="text-sm font-medium text-gray-900">{booking.rentalDays} Day(s)</span>
                                    </div>
                                    <div className="border-t border-gray-200 my-2 pt-2">
                                        <p className="text-xs text-gray-500 mb-1">Pickup</p>
                                        <div className="flex items-center text-sm font-medium text-gray-900">
                                            <FaCalendarAlt className="mr-2 text-green-500" />
                                            {new Date(booking.pickupDate).toLocaleDateString()} at {booking.pickupTime}
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200 my-2 pt-2">
                                        <p className="text-xs text-gray-500 mb-1">Return</p>
                                        <div className="flex items-center text-sm font-medium text-gray-900">
                                            <FaCalendarAlt className="mr-2 text-red-500" />
                                            {new Date(booking.returnDate).toLocaleDateString()} at {booking.returnTime}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Section */}
                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Current Status</h4>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                        {getStatusIcon(booking.status)}
                                        <span className="ml-2 capitalize">{booking.status}</span>
                                    </span>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Features</h4>
                                    <div className="flex space-x-4">
                                        <span className={`text-sm flex items-center ${booking.fullTank ? 'text-green-600' : 'text-gray-500'}`}>
                                            <FaCar className="mr-1" /> Full Tank: {booking.fullTank ? 'Yes' : 'No'}
                                        </span>
                                        <span className={`text-sm flex items-center ${booking.returnConfirmed ? 'text-green-600' : 'text-gray-500'}`}>
                                            <FaCheckCircle className="mr-1" /> Returned: {booking.returnConfirmed ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Close
                        </button>
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={() => window.location.href = `/staff/bookings/${booking.id}`}
                        >
                            Full Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
