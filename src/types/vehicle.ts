// Vehicle types for KIMU Transport & Multiservices

export interface Vehicle {
  id: number;
  name: string;
  image: string;
  type: VehicleType;
  category: VehicleCategory;
  price: string;
  year: number;
  engine: string;
  mileage: string;
  transmission: TransmissionType;
  fuel: FuelType;
  capacity: string;
  doors: number;
  description: string;
  isAvailable: boolean;
  power: string;
  fuelEfficiency: string;
  quantity: number;
  status: VehicleStatus;
  maintenanceNotes?: string;
  maintenanceDate?: Date;
  quantityUpdateReason?: string;
  quantityUpdateDate?: Date;
  licensePlate?: string;
  vehicleId?: string;
  brand: string;
  model: string;
  color: string;
  features: VehicleFeature[];
  insurance: InsuranceInfo;
  registration: RegistrationInfo;
  createdAt: Date;
  updatedAt: Date;
}

export type VehicleType = 
  | 'sedan' 
  | 'suv' 
  | 'hatchback' 
  | 'wagon' 
  | 'coupe' 
  | 'convertible' 
  | 'pickup' 
  | 'van' 
  | 'minibus' 
  | 'bus' 
  | 'truck' 
  | 'motorcycle';

export type VehicleCategory = 
  | 'economy' 
  | 'compact' 
  | 'mid-size' 
  | 'full-size' 
  | 'luxury' 
  | 'premium' 
  | 'sports' 
  | 'electric' 
  | 'hybrid' 
  | 'commercial';

export type TransmissionType = 
  | 'manual' 
  | 'automatic' 
  | 'cvt' 
  | 'semi-automatic';

export type FuelType = 
  | 'petrol' 
  | 'diesel' 
  | 'electric' 
  | 'hybrid' 
  | 'lpg' 
  | 'cng';

export type VehicleStatus = 
  | 'available' 
  | 'rented' 
  | 'maintenance' 
  | 'sold' 
  | 'reserved' 
  | 'out_of_service';

export interface VehicleFeature {
  id: number;
  name: string;
  description?: string;
  category: 'comfort' | 'safety' | 'entertainment' | 'technology' | 'convenience';
  isStandard: boolean;
}

export interface InsuranceInfo {
  policyNumber: string;
  provider: string;
  startDate: Date;
  endDate: Date;
  coverage: string[];
  premium: number;
  deductible: number;
}

export interface RegistrationInfo {
  registrationNumber: string;
  expiryDate: Date;
  lastRenewal: Date;
  nextRenewal: Date;
  registrationAuthority: string;
}

export interface VehicleFormData {
  name: string;
  brand: string;
  model: string;
  type: VehicleType;
  category: VehicleCategory;
  price: string;
  year: number;
  engine: string;
  mileage: string;
  transmission: TransmissionType;
  fuel: FuelType;
  capacity: string;
  doors: number;
  description: string;
  power: string;
  fuelEfficiency: string;
  quantity: number;
  color: string;
  licensePlate?: string;
  vehicleId?: string;
  features: number[]; // Feature IDs
}

export interface VehicleFilter {
  search?: string;
  type?: VehicleType;
  category?: VehicleCategory;
  brand?: string;
  transmission?: TransmissionType;
  fuel?: FuelType;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  status?: VehicleStatus;
  available?: boolean;
}

export interface VehicleStats {
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  maintenanceVehicles: number;
  totalValue: number;
  averagePrice: number;
  popularBrands: { brand: string; count: number }[];
  popularTypes: { type: VehicleType; count: number }[];
}

export interface VehicleMaintenance {
  id: number;
  vehicleId: number;
  type: 'routine' | 'repair' | 'inspection' | 'emergency';
  description: string;
  cost: number;
  startDate: Date;
  endDate?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  technician?: string;
  notes?: string;
  nextMaintenance?: Date;
}

export interface VehicleImage {
  id: number;
  vehicleId: number;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
  uploadedAt: Date;
}

export interface VehicleDocument {
  id: number;
  vehicleId: number;
  type: 'registration' | 'insurance' | 'inspection' | 'maintenance' | 'other';
  name: string;
  url: string;
  expiryDate?: Date;
  uploadedAt: Date;
}

export interface VehicleRentalHistory {
  id: number;
  vehicleId: number;
  bookingId: number;
  customerName: string;
  startDate: Date;
  endDate: Date;
  duration: number; // days
  revenue: number;
  status: 'completed' | 'cancelled' | 'ongoing';
}

export interface VehicleAvailability {
  vehicleId: number;
  date: Date;
  isAvailable: boolean;
  bookingId?: number;
  customerName?: string;
  pickupTime?: string;
  returnTime?: string;
}
