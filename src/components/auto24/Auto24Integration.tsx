"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
import { 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaTimes,
  FaCar,
  FaCheckCircle,
  FaCalendarAlt,
  FaTag,
  FaHandshake,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaImages,
  FaPhone,
  FaShieldAlt,
  FaCertificate,
  FaTh,
  FaList,
  FaBolt,
  FaLeaf,
  FaChartLine,
  FaCalculator
} from 'react-icons/fa';

// R2 Storage base URL
const R2_BASE_URL = 'https://fcea86c8543e01f387dc6840916f203c.r2.cloudflarestorage.com/kimutransport';

interface Vehicle {
  id: string;
  name: string;
  year: number;
  price: number;
  deposit: number;
  image: string;
  images?: string[];
  features: string[];
  description: string;
  transmission?: string;
  fuelType?: string;
  drive?: string;
  seats?: number;
  color?: string;
  hasWarranty?: boolean;
  inspected?: boolean;
  verifiedDocs?: boolean;
  fastDelivery?: boolean;
}

const FALLBACK_VEHICLES: Vehicle[] = [
  {
    id: '1',
    name: 'Toyota Corolla Levin',
    year: 2019,
    price: 21500000,
    deposit: 4300000,
    image: '/vehicles/LEVIN.png',
    images: ['/vehicles/LEVIN.png'],
    features: ['Automatic', 'Fuel Efficient', 'Low Mileage', 'Well Maintained'],
    description: 'Excellent condition Toyota Corolla Levin with low mileage and comprehensive service history.',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    drive: 'FWD',
    seats: 5,
    color: 'White',
    hasWarranty: true,
    inspected: true,
    verifiedDocs: true,
    fastDelivery: true,
  },
  {
    id: '2',
    name: 'Toyota Corolla Levin',
    year: 2020,
    price: 22500000,
    deposit: 4500000,
    image: '/vehicles/Levin_2020.png',
    images: ['/vehicles/Levin_2020.png'],
    features: ['Automatic', 'Fuel Efficient', 'Low Mileage', 'Well Maintained'],
    description: 'Impeccably maintained Toyota Corolla Levin 2020 with original features.',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    drive: 'FWD',
    seats: 5,
    color: 'Black',
    hasWarranty: true,
    inspected: true,
    verifiedDocs: true,
    fastDelivery: true,
  },
  {
    id: '3',
    name: 'Toyota Corolla Levin',
    year: 2021,
    price: 24190000,
    deposit: 4838000,
    image: '/vehicles/Levin_2021.png?v=2',
    images: ['/vehicles/Levin_2021.png?v=2'],
    features: ['Automatic', 'Fuel Efficient', 'Low Mileage', 'Well Maintained'],
    description: 'Latest model Toyota Corolla Levin with modern features and excellent fuel economy.',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    drive: 'FWD',
    seats: 5,
    color: 'Silver',
    hasWarranty: true,
    inspected: true,
    verifiedDocs: true,
    fastDelivery: true,
  },
  {
    id: '4',
    name: 'BYD Full Electric',
    year: 2025,
    price: 32000000,
    deposit: 6400000,
    image: '/vehicles/BYD.png?v=2',
    images: ['/vehicles/BYD.png?v=2'],
    features: ['Electric', 'Zero Emissions', 'Fast Charging', 'Modern Tech'],
    description: 'Brand new BYD electric vehicle with cutting-edge technology and zero emissions.',
    transmission: 'Automatic',
    fuelType: 'Electric',
    drive: 'FWD',
    seats: 5,
    color: 'Blue',
    hasWarranty: true,
    inspected: true,
    verifiedDocs: true,
    fastDelivery: true,
  }
];

const ENABLE_LIVE_INVENTORY = false;

const FALLBACK_PRICE_RANGE = (() => {
  const prices = FALLBACK_VEHICLES.map(v => v.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
})();

const normaliseVehicle = (vehicle: any): Vehicle => {
  // Handle price - database stores as String, convert to number
  const priceStr = vehicle.price?.toString() || '0';
  const basePrice = Number(priceStr.replace(/[^\d.]/g, '')) || 0;
  
  const primaryImage = vehicle.image ?? '/vehicles/placeholder.png';
  const galleryImages = Array.isArray(vehicle.images) && vehicle.images.length > 0
    ? vehicle.images
    : [primaryImage];

  // Build features array from available data
  const features: string[] = [];
  if (Array.isArray(vehicle.features) && vehicle.features.length > 0) {
    features.push(...vehicle.features);
  } else {
    // Build features from vehicle properties
    if (vehicle.transmission) features.push(vehicle.transmission);
    if (vehicle.fuel || vehicle.fuelType) {
      const fuel = (vehicle.fuel || vehicle.fuelType || '').toLowerCase();
      if (fuel.includes('electric')) features.push('Electric');
      else if (fuel.includes('hybrid')) features.push('Hybrid');
      else features.push('Fuel Efficient');
    }
    if (vehicle.mileage && Number(vehicle.mileage) < 50000) features.push('Low Mileage');
    if (!features.length) features.push('Well Maintained');
  }

  const fallbackId = vehicle.id ?? vehicle.name ?? `vehicle-${Date.now()}`;

  // Map database fields to component interface
  return {
    id: String(fallbackId),
    name: vehicle.name ?? 'Unknown Vehicle',
    year: Number(vehicle.year ?? new Date().getFullYear()),
    price: basePrice,
    deposit: Number(vehicle.deposit ?? Math.round(basePrice * 0.2)),
    image: primaryImage,
    images: galleryImages,
    features,
    description: vehicle.description ?? 'Contact us for more details.',
    transmission: vehicle.transmission,
    fuelType: vehicle.fuelType || vehicle.fuel, // Map database 'fuel' to 'fuelType'
    drive: vehicle.drive,
    seats: vehicle.seats ? Number(vehicle.seats) : (vehicle.capacity ? Number(vehicle.capacity) : undefined),
    color: vehicle.color,
    hasWarranty: vehicle.hasWarranty ?? true, // Default to true for sales vehicles
    inspected: vehicle.inspected ?? true,
    verifiedDocs: vehicle.verifiedDocs ?? true,
    fastDelivery: vehicle.fastDelivery ?? true,
  };
};

const buildWhatsAppLink = (vehicle: Vehicle, message?: string) => {
  const composedMessage =
    message ??
    `Hello, I'm interested in ${vehicle.name} ${vehicle.year}. Could you share the application details?`;

  return `https://wa.me/250798284312?text=${encodeURIComponent(composedMessage)}`;
};

// Vehicle Detail Modal Component with Image Gallery
function VehicleDetailModal({ 
  vehicle, 
  onClose,
  formatPrice
}: { 
  vehicle: Vehicle; 
  onClose: () => void;
  formatPrice: (price: number) => string;
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const allImages = vehicle.images || [vehicle.image];

  const isBYD = vehicle.name.toLowerCase().includes('byd');
  const isElectric = (vehicle.features || []).some(f => /electric/i.test(f));
  const isHybrid = (vehicle.features || []).some(f => /hybrid/i.test(f));
  const isAutomatic = (vehicle.features || []).some(f => /automatic/i.test(f));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl animate-scale-in">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {vehicle.name} {vehicle.year}
              </h2>
              <p className="text-blue-600 font-medium mt-1">Auto24 Rwanda Partnership</p>
              {allImages.length > 1 && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <FaImages className="text-xs" />
                  {allImages.length} images available
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>

          {/* Specs Strip */}
          {(() => {
            const specs = [
              { label: 'Transmission', value: vehicle.transmission ?? (isAutomatic ? 'Automatic' : 'Manual') },
              { label: 'Fuel', value: vehicle.fuelType ?? (isElectric ? 'Electric' : (isHybrid ? 'Hybrid' : 'Petrol')) },
              { label: 'Drive', value: vehicle.drive ?? 'FWD' },
              { label: 'Seats', value: vehicle.seats ? String(vehicle.seats) : '5' },
              { label: 'Color', value: vehicle.color ?? 'White' },
              { label: 'Year', value: String(vehicle.year) },
            ].filter(spec => !!spec.value);

            if (!specs.length) return null;

            return (
            <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {specs.map((spec, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-center">
                  <div className="text-[11px] text-gray-500">{spec.label}</div>
                  <div className="text-sm font-semibold text-gray-800">{spec.value}</div>
                </div>
              ))}
            </div>
            );
          })()}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Main Image Gallery */}
            <div>
              <div className="relative h-96 bg-gray-100 rounded-xl overflow-hidden mb-4">
                <Image
                  src={allImages[selectedImageIndex]}
                  alt={`${vehicle.name} ${vehicle.year} - Image ${selectedImageIndex + 1}`}
                  fill
                  className={`object-contain p-4 drop-shadow-2xl${vehicle.name.includes('BYD') ? ' mix-blend-multiply' : ''}`}
                  priority
                />
              </div>
              
              {/* Image Thumbnail Grid */}
              {allImages.length > 1 && (
                <>
                  <div className="grid grid-cols-5 gap-2">
                    {allImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative h-20 bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index
                            ? 'border-blue-600 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${vehicle.name} ${vehicle.year} - Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  
                  {/* Image Counter */}
                  <div className="text-center mt-2 text-sm text-gray-600">
                    Image {selectedImageIndex + 1} of {allImages.length}
                  </div>
                </>
              )}
            </div>
            
            {/* Vehicle Details */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Vehicle Details</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{vehicle.description}</p>
              
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium border border-blue-100 flex items-center gap-2"
                    >
                      <FaCheckCircle className="text-xs" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Full Price:</span>
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(vehicle.price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-600">20% Deposit:</span>
                  <span className="text-2xl font-bold text-green-600">{formatPrice(vehicle.deposit)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-medium text-gray-700">Remaining Balance:</span>
                  <span className="text-xl font-bold text-gray-600">
                    {formatPrice(vehicle.price - vehicle.deposit)}
                  </span>
                </div>
              </div>

              {/* Trust badges */}
              {(() => {
                const trustBadges = [
                  { label: 'Warranty', icon: FaShieldAlt, active: vehicle.hasWarranty },
                  { label: 'Inspected', icon: FaCertificate, active: vehicle.inspected },
                  { label: 'Verified Docs', icon: FaCheckCircle, active: vehicle.verifiedDocs },
                  { label: 'Fast Delivery', icon: FaCar, active: vehicle.fastDelivery },
                ].filter(badge => badge.active);

                if (!trustBadges.length) return null;

                return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-sm">
                  {trustBadges.map(badge => (
                    <div key={badge.label} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                      <badge.icon className="text-blue-600" /> <span>{badge.label}</span>
                    </div>
                  ))}
                </div>
                );
              })()}
            </div>
          </div>

          {/* Sticky CTA Bar */}
          <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 -mx-6 px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600">
                Have questions? Chat or call now.
              </div>
              <div className="flex gap-3">
                <a
                  href={buildWhatsAppLink(vehicle, `Hello, I'm interested in ${vehicle.name} ${vehicle.year}. Please guide me through the application.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg ring-1 ring-orange-300"
                >
                  <FaHandshake className="text-sm" />
                  Apply Now
                </a>
                <a
                  href="tel:+250798284312"
                  className="inline-flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 px-5 py-3 rounded-xl hover:bg-blue-50 font-semibold"
                >
                  <FaPhone className="text-sm" />
                  Call
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Auto24Integration() {
  const [vehicleInventory, setVehicleInventoryState] = useState<Vehicle[]>(FALLBACK_VEHICLES);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Wrapper to prevent empty arrays from ever being set
  const setVehicleInventory = useCallback((value: Vehicle[] | ((prev: Vehicle[]) => Vehicle[])) => {
    setVehicleInventoryState(prev => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      // Never allow empty array - always fallback to FALLBACK_VEHICLES
      if (newValue.length === 0 && prev.length > 0) {
        console.warn('Attempted to set empty vehicle inventory! Preserving existing vehicles.');
        return prev;
      }
      if (newValue.length === 0) {
        console.warn('Setting empty vehicle inventory! Using fallback vehicles.');
        return FALLBACK_VEHICLES;
      }
      return newValue;
    });
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [priceRange, setPriceRange] = useState(FALLBACK_PRICE_RANGE);
  const [sortBy, setSortBy] = useState<'price' | 'year' | 'name'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [calcPrice, setCalcPrice] = useState(25000000);
  const itemsPerPage = 9;

  const hasLoadedRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (!ENABLE_LIVE_INVENTORY) {
      setVehicleInventoryState(FALLBACK_VEHICLES);
      setIsLoading(false);
      setLoadError(null);
      return;
    }

    isMountedRef.current = true;
    let active = true;

    const fetchVehicles = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetch('/api/vehicles', { cache: 'no-store' });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.details || `HTTP ${response.status}: Failed to load vehicles`);
        }
        const payload = await response.json();
        if (!Array.isArray(payload)) throw new Error('Unexpected vehicle payload');
        const normalised = payload.map(normaliseVehicle);
        
        if (!active || !isMountedRef.current) return;
        
        // Always use functional update to check previous state
        setVehicleInventory(prev => {
          // If we got vehicles from API, use them
          if (normalised.length > 0) {
            hasLoadedRef.current = true;
            return normalised;
          }
          
          // If API returned empty:
          // - If we haven't loaded before, use fallback
          // - If we already have vehicles, keep them (don't overwrite with empty)
          if (!hasLoadedRef.current) {
            setLoadError('No vehicles available in inventory. Showing sample vehicles.');
            hasLoadedRef.current = true;
            return FALLBACK_VEHICLES;
          } else {
            // Keep existing vehicles, don't overwrite with empty
            setLoadError('Inventory refresh returned no vehicles. Keeping current list.');
            return prev.length > 0 ? prev : FALLBACK_VEHICLES;
          }
        });
      } catch (error) {
        console.error('Vehicle load failed', error);
        if (!active || !isMountedRef.current) return;
        
        // Always use functional update to preserve existing vehicles
        setVehicleInventory(prev => {
          if (prev.length === 0) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setLoadError(`Live inventory is unavailable (${errorMessage}). Showing sample vehicles.`);
            return FALLBACK_VEHICLES;
          }
          // Keep existing vehicles, just show error
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setLoadError(`Failed to refresh inventory (${errorMessage}). Showing cached vehicles.`);
          return prev;
        });
      } finally {
        if (active && isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchVehicles();

    return () => {
      active = false;
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Critical safety net: If inventory becomes empty for any reason, restore fallback
  useEffect(() => {
    if (vehicleInventory.length === 0) {
      console.warn('Vehicle inventory became empty! Restoring fallback vehicles.');
      setVehicleInventoryState(FALLBACK_VEHICLES);
    }
  }, [vehicleInventory.length]);

  // Ensure we always have vehicles (safeguard against empty inventory)
  // This is a critical safety net - never allow empty inventory to be used
  const safeVehicleInventory = useMemo(() => {
    if (vehicleInventory.length === 0) {
      console.warn('Vehicle inventory is empty, using fallback vehicles');
      return FALLBACK_VEHICLES;
    }
    return vehicleInventory;
  }, [vehicleInventory]);

  const priceBounds = useMemo(() => {
    const prices = safeVehicleInventory.map(v => v.price);
    if (!prices.length) {
      return FALLBACK_PRICE_RANGE;
    }
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [safeVehicleInventory]);

  useEffect(() => {
    setPriceRange(prev => {
      const nextMin = Math.min(Math.max(prev.min, priceBounds.min), priceBounds.max);
      const nextMax = Math.max(Math.min(prev.max, priceBounds.max), priceBounds.min);
      if (nextMin === prev.min && nextMax === prev.max) {
        return prev;
      }
      return { min: nextMin, max: nextMax };
    });
  }, [priceBounds.min, priceBounds.max]);

  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    let filtered = [...safeVehicleInventory];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Year filter
    if (selectedYear) {
      filtered = filtered.filter(v => v.year === parseInt(selectedYear));
    }

    // Price filter
    filtered = filtered.filter(v => 
      v.price >= priceRange.min && v.price <= priceRange.max
    );

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'year':
          aValue = a.year;
          bValue = b.year;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      return sortOrder === 'asc' 
        ? (aValue > bValue ? 1 : -1) 
        : (aValue < bValue ? 1 : -1);
    });

    return filtered;
  }, [safeVehicleInventory, searchTerm, selectedYear, priceRange, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex);

  // Get unique years for filter
  const availableYears = useMemo(() => {
    const years = safeVehicleInventory.map(v => v.year);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [safeVehicleInventory]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedYear, priceRange, sortBy, sortOrder]);

  // Calculate financing values
  const calcDeposit = useMemo(() => Math.round(calcPrice * 0.2), [calcPrice]);
  const calcLoan = useMemo(() => Math.round(calcPrice - calcDeposit), [calcPrice, calcDeposit]);
  const calcMonthly = useMemo(() => Math.round(calcLoan / 36), [calcLoan]); // 36 months estimate

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedYear('');
    setPriceRange({
      min: priceBounds.min,
      max: priceBounds.max,
    });
    setSortBy('price');
    setSortOrder('asc');
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const vehicles = safeVehicleInventory;
    const prices = vehicles.map(v => v.price);
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const electricCount = vehicles.filter(v => v.fuelType?.toLowerCase().includes('electric')).length;
    const hybridCount = vehicles.filter(v => v.fuelType?.toLowerCase().includes('hybrid')).length;
    
    return {
      total: vehicles.length,
      avgPrice,
      minPrice,
      maxPrice,
      electricCount,
      hybridCount,
    };
  }, [safeVehicleInventory]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      currencyDisplay: 'code',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 py-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6">
            <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <FaHandshake className="text-lg" />
              Partnership with Auto24 Rwanda
            </span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Drive Now, Pay Later
          </h1>
          <p className="text-xl lg:text-2xl text-blue-100 mb-6 max-w-3xl mx-auto leading-relaxed">
            Start your car ownership journey with just <span className="font-bold text-white">20% deposit</span>. 
            Quality vehicles from Auto24 Rwanda, delivered by Kimu Transport.
          </p>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 mb-10 max-w-2xl mx-auto">
            <p className="text-white text-lg font-medium">
              <span className="font-bold">Important:</span> Vehicles must be used for transport services (taxi, car rental, or other commercial transport activities).
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#vehicles" 
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <FaCar className="text-xl" />
              Browse Vehicles
            </a>
            <a 
              href="#requirements" 
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12 -mt-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stats.total}</div>
              <div className="text-blue-100 text-sm md:text-base">Total Vehicles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{formatPrice(stats.avgPrice).split(' ')[0]}</div>
              <div className="text-blue-100 text-sm md:text-base">Avg Price</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-1">
                <FaBolt className="text-2xl" />
                {stats.electricCount}
              </div>
              <div className="text-blue-100 text-sm md:text-base">Electric</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-1">
                <FaLeaf className="text-2xl" />
                {stats.hybridCount}
              </div>
              <div className="text-blue-100 text-sm md:text-base">Hybrid</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div id="vehicles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
          {/* Search Bar */}
          <div className="relative mb-6">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search vehicles by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Filter Toggle and View Mode */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
            >
              <FaFilter className="text-sm" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid View"
                >
                  <FaTh />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List View"
                >
                  <FaList />
                </button>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'year' | 'name')}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="price">Sort by Price</option>
                <option value="year">Sort by Year</option>
                <option value="name">Sort by Name</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                <FaSort className={sortOrder === 'asc' ? 'transform rotate-180' : ''} />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Years</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price: {formatPrice(priceRange.min)}
                </label>
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  step="1000000"
                  value={priceRange.min}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    setPriceRange(prev => ({
                      ...prev,
                      min: Math.min(value, prev.max),
                    }));
                  }}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price: {formatPrice(priceRange.max)}
                </label>
                <input
                  type="range"
                  min={priceBounds.min}
                  max={priceBounds.max}
                  step="1000000"
                  value={priceRange.max}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    setPriceRange(prev => ({
                      ...prev,
                      max: Math.max(value, prev.min),
                    }));
                  }}
                  className="w-full"
                />
              </div>

              <div className="md:col-span-3">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="text-center text-sm text-gray-600 mt-4">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredVehicles.length)} of {filteredVehicles.length} vehicles
          </div>
          {(isLoading || loadError) && (
            <div className="mt-4 text-sm">
              {isLoading && <p className="text-gray-500">Refreshing live inventory…</p>}
              {loadError && (
                <p className="mt-1 rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-orange-700">
                  {loadError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Vehicle Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCar className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
              : "space-y-6 mb-12"
            }>
              {currentVehicles.map((vehicle, index) => (
                viewMode === 'grid' ? (
                <div
                  key={vehicle.id}
                  className={`group relative rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                    index % 3 === 0 ? 'ring-1 ring-blue-50' : ''
                  } hover:ring-2 hover:ring-orange-200`}
                  style={{ animationDelay: `${(index % 6) * 80}ms` }}
                >
                  {/* Decorative background blobs */}
                  <div className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 bg-blue-300/15 rounded-full blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-300/10 rounded-full blur-3xl" />

                  {/* Vehicle Image */}
                  <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <Image
                      src={vehicle.image}
                      alt={vehicle.name}
                      fill
                      className={`object-contain p-4 transition-transform duration-700 ease-out drop-shadow-lg ${
                        index % 2 === 0 ? 'group-hover:rotate-1 group-hover:scale-[1.03]' : 'group-hover:-rotate-1 group-hover:scale-[1.03]'
                      }${vehicle.name.includes('BYD') ? ' mix-blend-multiply' : ''}`}
                    />

                    {/* Top badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-white/90 backdrop-blur text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                        {vehicle.year}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        Auto24 Rwanda
                      </span>
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <FaTag className="text-xs" />
                        20% Deposit
                      </span>
                    </div>

                    {/* Bottom gradient overlay */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
                  </div>

                  {/* Vehicle Details */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {vehicle.name}
                      </h3>
                      <span className="text-lg font-extrabold text-gray-900 whitespace-nowrap">
                        {formatPrice(vehicle.price)}
                      </span>
                    </div>
                    <div className="h-1 w-12 bg-orange-500 rounded-full mb-3" />

                    <p className="text-gray-600 mb-4 text-sm line-clamp-2 min-h-[2.5rem]">
                      {vehicle.description}
                    </p>

                    {/* Features */}
                    <div className="mb-5">
                      <div className="flex flex-wrap gap-2">
                        {vehicle.features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100"
                          >
                            {feature}
                          </span>
                        ))}
                        {vehicle.features.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                            +{vehicle.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pricing summary */}
                    <div className="grid grid-cols-2 gap-3 border-t pt-4 mb-5 text-sm">
                      <div className="text-gray-600">Deposit</div>
                      <div className="text-right font-semibold text-green-600">{formatPrice(vehicle.deposit)}</div>
                      <div className="text-gray-600">Remaining</div>
                      <div className="text-right text-gray-700 font-medium">{formatPrice(vehicle.price - vehicle.deposit)}</div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedVehicle(vehicle)}
                        className="col-span-2 md:col-span-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <FaCar className="text-sm" />
                        View Details
                      </button>
                      <a
                        href={buildWhatsAppLink(vehicle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="col-span-2 md:col-span-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold text-center inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ring-1 ring-orange-300"
                      >
                        <FaHandshake className="text-sm" />
                        Apply Now
                      </a>
                    </div>
                  </div>
                </div>
                ) : (
                  // List View
                  <div
                    key={vehicle.id}
                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row gap-6 p-6">
                      <div className="relative w-full md:w-80 h-64 md:h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        <Image
                          src={vehicle.image}
                          alt={vehicle.name}
                          fill
                          className={`object-contain p-4 drop-shadow-lg${vehicle.name.includes('BYD') ? ' mix-blend-multiply' : ''}`}
                        />
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">Auto24</span>
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">20% Deposit</span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-1">{vehicle.name}</h3>
                              <p className="text-gray-600 flex items-center gap-2">
                                <FaCalendarAlt className="text-sm" />
                                {vehicle.year} • {vehicle.transmission || 'Automatic'} • {vehicle.fuelType || 'Petrol'}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-gray-900">{formatPrice(vehicle.price)}</div>
                              <div className="text-sm text-green-600 font-semibold">Deposit: {formatPrice(vehicle.deposit)}</div>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4 line-clamp-2">{vehicle.description}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {vehicle.features.slice(0, 4).map((feature, idx) => (
                              <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setSelectedVehicle(vehicle)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold flex items-center justify-center gap-2"
                          >
                            <FaCar />
                            View Details
                          </button>
                          <a
                            href={buildWhatsAppLink(vehicle)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-center inline-flex items-center justify-center gap-2 ring-1 ring-orange-300"
                          >
                            <FaHandshake />
                            Apply Now
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <FaChevronLeft />
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'border-2 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  Next
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <VehicleDetailModal 
          vehicle={selectedVehicle} 
          onClose={() => setSelectedVehicle(null)} 
          formatPrice={formatPrice}
        />
      )}

      {/* Requirements Section */}
      <div id="requirements" className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple Requirements
            </h2>
            <p className="text-xl text-gray-600">
              Getting started is easier than you think
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaTag className="text-3xl text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">20% Deposit</h3>
              <p className="text-gray-600 leading-relaxed">Start with just 20% of the vehicle price. No hidden fees, transparent pricing.</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Valid ID</h3>
              <p className="text-gray-600 leading-relaxed">National ID or Passport required for verification. Quick and secure process.</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCar className="text-3xl text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Transport Use</h3>
              <p className="text-gray-600 leading-relaxed">Vehicle must be used for transport services (taxi, car rental, or commercial transport).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financing Calculator Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
                <FaCalculator className="text-2xl text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Financing Calculator</h2>
              <p className="text-gray-600">Calculate your monthly payment and see how affordable car ownership can be</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Price (RWF)</label>
                <input
                  type="number"
                  placeholder="Enter vehicle price"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  value={calcPrice}
                  onChange={(e) => setCalcPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Deposit (20%)</label>
                <input
                  type="text"
                  readOnly
                  className="w-full px-4 py-3 border-2 border-green-200 bg-green-50 rounded-xl text-lg font-semibold text-green-700"
                  value={formatPrice(calcDeposit)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Amount</label>
                <input
                  type="text"
                  readOnly
                  className="w-full px-4 py-3 border-2 border-blue-200 bg-blue-50 rounded-xl text-lg font-semibold text-blue-700"
                  value={formatPrice(calcLoan)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Payment (Est.)</label>
                <input
                  type="text"
                  readOnly
                  className="w-full px-4 py-3 border-2 border-orange-200 bg-orange-50 rounded-xl text-lg font-bold text-orange-700"
                  value={formatPrice(calcMonthly)}
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-blue-100">Total Amount</span>
                <span className="text-2xl font-bold">{formatPrice(calcPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-blue-100">
                <span>Payment Period: 36-60 months</span>
                <span>Interest Rate: Competitive rates available</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a
                href="#vehicles"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                <FaCar />
                Browse Available Vehicles
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - replaces customer experiences */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-600">Own your car in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <FaSearch />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Browse & Choose</h3>
              <p className="text-gray-600 text-sm">Pick a vehicle that fits your needs and budget.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <FaHandshake />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Pay 20% Deposit</h3>
              <p className="text-gray-600 text-sm">Secure your car with a small upfront payment.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                <FaCar />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Drive Away</h3>
              <p className="text-gray-600 text-sm">Complete simple paperwork and collect your car for transport services.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Removed Testimonials Carousel section */}

      {/* Legal & Branding Footer */}
      <div className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300 text-sm">
            Vehicles supplied in partnership with Auto24 Rwanda. Photos used with permission.
          </p>
          <p className="text-gray-400 text-xs mt-2">
            © 2024 Kimu Transport & Multiservices. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
