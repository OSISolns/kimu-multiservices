'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { 
  FaCar, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaTools,
  FaGasPump,
  FaCog,
  FaCalendar,
  FaRoad,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaImage,
  FaShieldAlt
} from 'react-icons/fa'

interface Vehicle {
  id: number
  name: string
  image: string
  type: string
  category: string
  price: string
  year: number
  engine: string
  mileage: string
  transmission: string
  fuel: string
  capacity: string
  doors: number
  description: string
  isAvailable: boolean
  power: string
  fuelEfficiency: string
  quantity: number
  status: string
  licensePlate?: string
  vehicleId?: string
  maintenanceNotes?: string
  maintenanceDate?: string
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'view' | 'edit' | 'add'>('view')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Partial<Vehicle>>({})

  // Fetch vehicles
  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      console.log('Fetching vehicles...')
      setLoading(true)
      const response = await fetch('/api/vehicles')
      console.log('Response status:', response.status)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('Vehicles data:', data)
      setVehicles(data)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort vehicles
  const filteredVehicles = useMemo(() => {
    let filtered = vehicles || []

    if (searchTerm) {
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.licensePlate && v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedCategory) filtered = filtered.filter(v => v.category === selectedCategory)
    if (selectedStatus) filtered = filtered.filter(v => v.status === selectedStatus)

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case 'price': 
          aValue = parseInt(a.price.replace(/[^\d]/g, '')) || 0
          bValue = parseInt(b.price.replace(/[^\d]/g, '')) || 0
          break
        case 'year': aValue = a.year; bValue = b.year; break
        case 'mileage': aValue = parseInt(a.mileage.replace(/[^\d]/g, '')) || 0; bValue = parseInt(b.mileage.replace(/[^\d]/g, '')) || 0; break
        case 'quantity': aValue = a.quantity; bValue = b.quantity; break
        default: aValue = a.name.toLowerCase(); bValue = b.name.toLowerCase()
      }
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1)
    })

    return filtered
  }, [vehicles, searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedStatus('')
    setSortBy('name')
    setSortOrder('asc')
  }, [])

  // Check if this is the first vehicle of its brand (used for brand representation)
  const isFirstVehicleOfBrand = (vehicle: Vehicle): boolean => {
    // Find the first vehicle with the same brand name (assuming brand is in the name)
    const brandName = vehicle.name.split(' ')[0] // Extract brand from vehicle name
    const firstVehicleOfBrand = vehicles.find(v => 
      v.name.startsWith(brandName) && v.id !== vehicle.id
    )
    
    // If no other vehicle with same brand exists, or this one has a lower ID, it's the first
    return !firstVehicleOfBrand || vehicle.id <= firstVehicleOfBrand.id
  }

  // Validate Rwandan license plate format
  const validateLicensePlate = (plate: string): boolean => {
    if (!plate) return false // Empty is not valid (required field)
    
    // Rwandan format: RA + Alphabet + 3 digits + Alphabet
    // Examples: RAI 123 C, RAH 456 A, RAK 789 B
    const plateRegex = /^RA[A-Z]\s?\d{3}\s?[A-Z]$/
    return plateRegex.test(plate.toUpperCase())
  }

  const openModal = useCallback((vehicle: Vehicle | null, type: 'view' | 'edit' | 'add') => {
    setSelectedVehicle(vehicle)
    setModalType(type)
    setShowModal(true)
    if (vehicle) {
      setImagePreview(vehicle.image)
      setEditingVehicle(vehicle)
    } else {
      // Set default values for new vehicle
      setEditingVehicle({
        name: '',
        category: 'Economy',
        price: '',
        year: new Date().getFullYear(),
        engine: '',
        transmission: 'Manual',
        fuel: 'Petrol',
        capacity: '5',
        doors: 4,
        description: '',
        status: 'Available',
        quantity: 1,
        power: '',
        fuelEfficiency: '',
        licensePlate: ''
      })
      setImagePreview('')
    }
  }, [])

  const closeModal = useCallback(() => {
    setShowModal(false)
    setSelectedVehicle(null)
    setImageFile(null)
    setImagePreview('')
    setUploading(false)
    setEditingVehicle({})
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'rented': return 'bg-blue-100 text-blue-800'
      case 'out of service': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return <FaCheckCircle className="text-green-500" />
      case 'maintenance': return <FaTools className="text-yellow-500" />
      case 'rented': return <FaCar className="text-blue-500" />
      case 'out of service': return <FaTimesCircle className="text-red-500" />
      default: return <FaCar className="text-gray-500" />
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPG, PNG, etc.)')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size must be less than 5MB')
        return
      }
      
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)
    
    // Debug: Log what's being sent
    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type)
    console.log('FormData entries:')
    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log(key, value)
    })
    
    try {
      const response = await fetch('/api/vehicles/upload', {
        method: 'POST',
        body: formData,
      })
      
      console.log('Upload response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Upload error response:', errorData)
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Upload success response:', data)
      
      if (!data.imageUrl) {
        throw new Error('No image URL returned from server')
      }
      
      return data.imageUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const handleDelete = async (vehicle: Vehicle) => {
    if (!confirm(`Are you sure you want to delete "${vehicle.name}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete vehicle')
      }
      
      // Remove vehicle from local state
      setVehicles(prev => prev.filter(v => v.id !== vehicle.id))
      alert('Vehicle deleted successfully!')
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      alert(`Failed to delete vehicle: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleSave = async () => {
    if (modalType === 'edit' && !selectedVehicle) return
    
    // Validate required fields for add mode
    if (modalType === 'add') {
      const requiredFields = ['name', 'category', 'price', 'year', 'transmission', 'fuel', 'licensePlate']
      const missingFields = requiredFields.filter(field => !editingVehicle[field as keyof typeof editingVehicle])
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`)
        return
      }
      
      // Validate license plate format
      if (!validateLicensePlate(editingVehicle.licensePlate || '')) {
        alert('Invalid license plate format. Please use Rwandan format: RA + Alphabet + 3 digits + Alphabet (e.g., RAI 123 C)')
        return
      }
    }
    
    try {
      setUploading(true)
      let imageUrl = '/vehicles/land-cruiser.jpg' // Use an existing image as default
      
      // Upload new image if one was selected (but not for first vehicle of brand)
      if (imageFile && (!selectedVehicle || !isFirstVehicleOfBrand(selectedVehicle))) {
        imageUrl = await uploadImage(imageFile)
      } else if (modalType === 'edit' && selectedVehicle) {
        imageUrl = selectedVehicle.image
      }
      
      if (modalType === 'add') {
        // Create new vehicle
        const createData = {
          ...editingVehicle,
          image: imageUrl,
          type: editingVehicle.category || 'Car', // Default type
          engine: editingVehicle.engine || 'Standard',
          capacity: editingVehicle.capacity || '5',
          doors: editingVehicle.doors || 4,
          mileage: '0km',
          power: editingVehicle.power || '',
          fuelEfficiency: editingVehicle.fuelEfficiency || '',
          transmission: editingVehicle.transmission || 'Manual',
          fuel: editingVehicle.fuel || 'Petrol',
          customPlateNumber: editingVehicle.licensePlate, // License plate is required
        }
        
        console.log('Sending vehicle creation data:', createData)
        
        const response = await fetch('/api/vehicles/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createData),
        })
        
        console.log('Vehicle creation response status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Vehicle creation error response:', errorData)
          throw new Error(errorData.error || 'Failed to create vehicle')
        }
        
        const result = await response.json()
        console.log('Vehicle creation success response:', result)
        
        // Add new vehicle to local state
        setVehicles(prev => [result.vehicle, ...prev])
        
        // Refresh the vehicle list to ensure UI is up to date
        await fetchVehicles()
        
        alert('Vehicle created successfully!')
      } else {
        // Update existing vehicle
        const updateData = {
          ...editingVehicle,
          image: imageUrl,
        }
        
        console.log('Sending vehicle update data:', updateData)
        console.log('Selected vehicle ID:', selectedVehicle!.id)
        
        const response = await fetch(`/api/vehicles/${selectedVehicle!.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        })
        
        console.log('Vehicle update response status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Vehicle update error response:', errorData)
          throw new Error(errorData.error || 'Failed to update vehicle')
        }
        
        const result = await response.json()
        console.log('Vehicle update success response:', result)
        
        // Update local state with the response from the API
        setVehicles(prev => {
          const updated = prev.map(v => v.id === selectedVehicle!.id ? result.vehicle : v)
          console.log('Updated vehicles state:', updated)
          return updated
        })
        
        // Refresh the vehicle list to ensure UI is up to date
        await fetchVehicles()
        
        alert('Vehicle updated successfully!')
      }
      
      closeModal()
    } catch (error) {
      console.error('Error saving vehicle:', error)
      alert(`Failed to save vehicle: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        .image-container img {
          object-fit: cover !important;
          object-position: center !important;
          width: 100% !important;
          height: 100% !important;
        }
        .image-container {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
      `}</style>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-soft border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="animate-slide-down">
              <h1 className="text-4xl font-bold text-gradient mb-1">Vehicle Management</h1>
              <p className="text-lg text-gray-600">Manage your fleet of vehicles with style</p>
            </div>
            <button
              onClick={() => openModal(null, 'add')}
              className="btn-primary hover-lift animate-bounce-gentle"
            >
              <FaPlus className="text-sm" />
              Add Vehicle
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card card-hover animate-slide-up animation-delay-200">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-soft">
                <FaCar className="text-blue-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                <p className="text-3xl font-bold text-gradient">{vehicles.length}</p>
              </div>
            </div>
          </div>

          <div className="card card-hover animate-slide-up animation-delay-400">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl shadow-soft">
                <FaCheckCircle className="text-green-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-3xl font-bold text-gradient">
                  {vehicles.filter(v => v.isAvailable).length}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-hover animate-slide-up animation-delay-2000">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl shadow-soft">
                <FaTools className="text-yellow-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Maintenance</p>
                <p className="text-3xl font-bold text-gradient">
                  {vehicles.filter(v => v.status === 'Maintenance').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card card-hover animate-slide-up animation-delay-4000">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-soft">
                <FaCar className="text-blue-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Currently Rented</p>
                <p className="text-3xl font-bold text-gradient">
                  {vehicles.filter(v => v.status === 'Rented').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card card-hover mb-8 animate-slide-up animation-delay-600">
          <div className="p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gradient">Vehicle Inventory</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn-secondary hover-lift"
                >
                  <FaFilter className="text-sm" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-enhanced px-4 py-2 text-sm"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="year">Year</option>
                  <option value="mileage">Mileage</option>
                  <option value="quantity">Quantity</option>
                </select>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-3 text-gray-400 hover:text-blue-600 hover:scale-110 transition-all duration-300 rounded-2xl hover:bg-blue-50"
                >
                  {sortOrder === 'asc' ? <FaSortUp className="text-xl" /> : <FaSortDown className="text-xl" />}
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 text-lg" />
              <input
                type="text"
                placeholder="Search vehicles by name, description, or license plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-enhanced pl-12 pr-4 py-4 text-lg hover-glow focus:scale-[1.02]"
              />
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 animate-scale-in">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-enhanced text-sm hover-glow"
                >
                  <option value="">All Categories</option>
                  <option value="Economy">Economy</option>
                  <option value="Compact">Compact</option>
                  <option value="SUV">SUV</option>
                  <option value="Luxury">Luxury</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input-enhanced text-sm hover-glow"
                >
                  <option value="">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Rented">Rented</option>
                  <option value="Out of Service">Out of Service</option>
                </select>

                <button
                  onClick={clearFilters}
                  className="btn-danger hover-lift"
                >
                  Clear Filters
                </button>
              </div>
            )}

            <div className="text-center text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredVehicles.length)} of {filteredVehicles.length} vehicles
            </div>
          </div>
        </div>

        {/* Vehicles Grid */}
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-20 animate-slide-up">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-soft animate-pulse-soft">
              <FaCar className="text-6xl text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gradient mb-3">No vehicles found</h3>
            <p className="text-lg text-gray-600 mb-8">Try adjusting your search criteria</p>
            <button
              onClick={clearFilters}
              className="btn-primary hover-lift animate-bounce-gentle"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {currentVehicles.map((vehicle, index) => (
              <div 
                key={vehicle.id} 
                className="card card-hover animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 bg-gradient-to-br from-gray-50 to-white rounded-t-3xl overflow-hidden">
                  <Image
                    src={vehicle.image}
                    alt={vehicle.name}
                    fill
                    className="object-contain p-4 hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className={`status-badge ${vehicle.status.toLowerCase().replace(' ', '-')} hover-bounce`}>
                      {vehicle.status}
                    </span>
                    {isFirstVehicleOfBrand(vehicle) && (
                      <span className="status-badge warning hover-bounce">
                        🛡️ Brand Rep
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="p-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft">
                      {getStatusIcon(vehicle.status)}
                    </div>
                  </div>
                  {/* Image overlay - show lock icon for first vehicle of brand */}
                  {isFirstVehicleOfBrand(vehicle) && (
                    <div className="absolute bottom-3 right-3">
                      <div className="p-3 bg-yellow-100/90 backdrop-blur-sm border border-yellow-300 rounded-2xl shadow-soft hover:scale-110 transition-transform duration-300" title="Brand representative image - cannot be changed">
                        <FaShieldAlt className="text-yellow-600 text-lg" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gradient mb-3 line-clamp-1 hover:scale-105 transition-transform duration-300">{vehicle.name}</h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-gradient">{vehicle.price}</span>
                    <span className="text-sm text-gray-500 font-medium">per day</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
                      <FaCalendar className="text-blue-500" />
                      <span className="font-medium">{vehicle.year}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
                      <FaRoad className="text-green-500" />
                      <span className="font-medium">{vehicle.mileage}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
                      <FaGasPump className="text-yellow-500" />
                      <span className="font-medium">{vehicle.fuel}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
                      <FaCog className="text-purple-500" />
                      <span className="font-medium">{vehicle.transmission}</span>
                    </div>
                  </div>

                  {vehicle.licensePlate && (
                    <div className="text-sm text-gray-600 mb-4 p-2 bg-blue-50 rounded-xl border border-blue-100">
                      <span className="font-semibold text-blue-700">Plate:</span> {vehicle.licensePlate}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => openModal(vehicle, 'view')}
                      className="flex-1 btn-secondary hover-lift text-sm py-3"
                    >
                      <FaEye className="text-sm" />
                      View
                    </button>
                    <button
                      onClick={() => openModal(vehicle, 'edit')}
                      className="flex-1 btn-primary hover-lift text-sm py-3"
                    >
                      <FaEdit className="text-sm" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle)}
                      className="flex-1 btn-danger hover-lift text-sm py-3"
                    >
                      <FaTrash className="text-sm" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-gray-100">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FaCar className="text-2xl text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {modalType === 'add' ? 'Add New Vehicle' : 
                       modalType === 'edit' ? 'Edit Vehicle' : 'Vehicle Details'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {modalType === 'add' ? 'Fill in the details below to add a new vehicle to your fleet' :
                       modalType === 'edit' ? 'Update the vehicle information below' :
                       'View detailed information about this vehicle'}
                    </p>
                    {modalType === 'edit' && selectedVehicle && isFirstVehicleOfBrand(selectedVehicle) && (
                      <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                        <p className="text-xs text-yellow-800 font-medium">
                          ⚠️ Brand Image Protected: This vehicle&apos;s image represents the brand and cannot be changed
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-3 hover:bg-white hover:shadow-md rounded-full transition-all duration-200"
                >
                  <FaTimesCircle className="text-2xl text-gray-500 hover:text-gray-700" />
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Image Upload Section */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaImage className="text-blue-600" />
                  Vehicle Image
                </label>
                <div className="flex items-start gap-6">
                  {/* Image Preview */}
                  <div className="relative w-48 h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 shadow-lg flex items-center justify-center min-w-[12rem] min-h-[12rem] image-container">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Vehicle preview"
                        fill
                        className="object-cover w-full h-full"
                        sizes="192px"
                        style={{ 
                          objectPosition: 'center',
                          maxWidth: '100%',
                          maxHeight: '100%'
                        }}
                        onError={(e) => {
                          // Fallback to default car icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                        priority
                      />
                    ) : selectedVehicle?.image ? (
                      <Image
                        src={selectedVehicle.image}
                        alt={selectedVehicle.name}
                        fill
                        className="object-cover w-full h-full"
                        sizes="192px"
                        style={{ 
                          objectPosition: 'center',
                          maxWidth: '100%',
                          maxHeight: '100%'
                        }}
                        onError={(e) => {
                          // Fallback to default car icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                        priority
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <FaCar className="text-5xl mb-2" />
                        <p className="text-sm font-medium">No Image</p>
                      </div>
                    )}
                    
                    {/* Fallback icon for when images fail to load */}
                    {((imagePreview && !imagePreview.startsWith('data:')) || (selectedVehicle?.image && !selectedVehicle.image.startsWith('data:'))) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 opacity-0 hover:opacity-100 transition-opacity">
                        <FaCar className="text-4xl text-gray-400" />
                      </div>
                    )}
                    {modalType !== 'view' && !isFirstVehicleOfBrand(selectedVehicle!) && (
                      <div 
                        className="absolute inset-0 bg-black bg-opacity-60 opacity-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center cursor-pointer rounded-2xl"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <div className="text-center text-white">
                          <FaEdit className="text-3xl mx-auto mb-3" />
                          <p className="text-sm font-medium">Click to change</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Show lock overlay for first vehicle of brand */}
                    {modalType !== 'view' && isFirstVehicleOfBrand(selectedVehicle!) && (
                      <div className="absolute inset-0 bg-yellow-500 bg-opacity-80 flex items-center justify-center rounded-2xl">
                        <div className="text-center text-white">
                          <FaShieldAlt className="text-4xl mx-auto mb-3" />
                          <p className="text-sm font-medium">Brand Image Protected</p>
                          <p className="text-xs opacity-90">This image represents the brand</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Image Upload Controls */}
                  {modalType !== 'view' && !isFirstVehicleOfBrand(selectedVehicle!) && (
                    <div className="flex-1">
                      <div className="border-2 border-dashed border-blue-200 rounded-2xl p-6 hover:border-blue-400 transition-all duration-200 bg-blue-50/30">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FaEdit className="text-2xl text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Vehicle Image</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Choose a high-quality image to showcase your vehicle
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm font-semibold inline-flex items-center gap-2"
                          >
                            <FaImage className="text-sm" />
                            Choose Image
                          </label>
                          <div className="mt-4 text-xs text-gray-500 space-y-1">
                            <p>✓ Recommended: 800x600px or higher</p>
                            <p>✓ Formats: JPG, PNG, WebP</p>
                            <p>✓ Max size: 5MB</p>
                            <p>✓ Images will be automatically resized to fit</p>
                          </div>
                          {imageFile && (
                            <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FaCheckCircle className="text-green-500" />
                                  <p className="text-sm font-medium text-green-700">
                                    {imageFile.name}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    setImageFile(null)
                                    setImagePreview(selectedVehicle?.image || '')
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                  title="Remove selected image"
                                >
                                  <FaTimesCircle />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Protected Image Message for First Vehicle of Brand */}
                  {modalType !== 'view' && isFirstVehicleOfBrand(selectedVehicle!) && (
                    <div className="flex-1">
                      <div className="border-2 border-dashed border-yellow-300 rounded-2xl p-6 bg-yellow-50/30">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FaShieldAlt className="text-2xl text-yellow-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Brand Image Protected</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            This vehicle&apos;s image represents the brand and cannot be changed
                          </p>
                          <div className="mt-4 text-xs text-yellow-600 space-y-1">
                            <p>🛡️ This image is used in the Offers page</p>
                            <p>🛡️ It represents the brand to customers</p>
                            <p>🛡️ Only other vehicles of the same brand can have their images changed</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaCar className="text-blue-600 text-sm" />
                    Vehicle Name *
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.name || ''}
                    onChange={(e) => setEditingVehicle(prev => ({ ...prev, name: e.target.value }))}
                    readOnly={modalType === 'view'}
                    placeholder="Enter vehicle name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaCog className="text-blue-600 text-sm" />
                    Category *
                  </label>
                  <select
                    value={editingVehicle.category || ''}
                    onChange={(e) => setEditingVehicle(prev => ({ ...prev, category: e.target.value }))}
                    disabled={modalType === 'view'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  >
                    <option value="">Select category</option>
                    <option value="Economy">Economy</option>
                    <option value="Compact">Compact</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Luxury">Luxury</option>
                    <option value="SUV">SUV</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaCalendar className="text-blue-600 text-sm" />
                    Price per Day *
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.price || ''}
                    onChange={(e) => setEditingVehicle(prev => ({ ...prev, price: e.target.value }))}
                    readOnly={modalType === 'view'}
                    placeholder="e.g., 50000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaCalendar className="text-blue-600 text-sm" />
                    Year *
                  </label>
                  <input
                    type="number"
                    value={editingVehicle.year || ''}
                    onChange={(e) => setEditingVehicle(prev => ({ ...prev, year: parseInt(e.target.value) || 0 }))}
                    readOnly={modalType === 'view'}
                    placeholder="e.g., 2023"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaCheckCircle className="text-blue-600 text-sm" />
                    Status
                  </label>
                  <select
                    value={editingVehicle.status || ''}
                    onChange={(e) => setEditingVehicle(prev => ({ ...prev, status: e.target.value }))}
                    disabled={modalType === 'view'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  >
                    <option value="Available">Available</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Rented">Rented</option>
                    <option value="Out of Service">Out of Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaCheckCircle className="text-blue-600 text-sm" />
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={editingVehicle.quantity || ''}
                    onChange={(e) => setEditingVehicle(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    readOnly={modalType === 'view'}
                    min="1"
                    max="100"
                    placeholder="1-100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaCog className="text-blue-600 text-sm" />
                    Engine
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.engine || ''}
                    onChange={(e) => setEditingVehicle(prev => ({ ...prev, engine: e.target.value }))}
                    readOnly={modalType === 'view'}
                    placeholder="e.g., 2.0L, Electric"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaCar className="text-blue-600 text-sm" />
                    Capacity
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.capacity || ''}
                    onChange={(e) => setEditingVehicle(prev => ({ ...prev, capacity: e.target.value }))}
                    readOnly={modalType === 'view'}
                    placeholder="e.g., 5 passengers"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaCar className="text-blue-600 text-sm" />
                    Doors
                  </label>
                  <input
                    type="number"
                    value={editingVehicle.doors || ''}
                    onChange={(e) => setEditingVehicle(prev => ({ ...prev, doors: parseInt(e.target.value) || 0 }))}
                    readOnly={modalType === 'view'}
                    min="2"
                    max="6"
                    placeholder="2-6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  />
                </div>

                {/* Vehicle Specifications Section */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                    <FaTools className="text-blue-600" />
                    Vehicle Specifications
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaCog className="text-blue-600 text-sm" />
                    Transmission *
                  </label>
                  <select
                    value={editingVehicle.transmission || ''}
                    onChange={(e) => setEditingVehicle(prev => ({ ...prev, transmission: e.target.value }))}
                    disabled={modalType === 'view'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  >
                    <option value="">Select transmission</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="CVT">CVT</option>
                    <option value="Semi-Automatic">Semi-Automatic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaGasPump className="text-blue-600 text-sm" />
                    Fuel Type *
                  </label>
                  <select
                    value={editingVehicle.fuel || ''}
                    onChange={(e) => setEditingVehicle(prev => ({ ...prev, fuel: e.target.value }))}
                    disabled={modalType === 'view'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  >
                    <option value="">Select fuel type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="LPG">LPG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaRoad className="text-blue-600 text-sm" />
                    License Plate Number *
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.licensePlate || ''}
                    onChange={(e) => setEditingVehicle(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                    readOnly={modalType === 'view'}
                    placeholder="e.g., RAI 123 C"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      editingVehicle.licensePlate 
                        ? validateLicensePlate(editingVehicle.licensePlate)
                          ? 'border-green-400 bg-green-50'
                          : 'border-red-400 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  />
                  <p className={`text-xs mt-2 font-medium ${
                    editingVehicle.licensePlate 
                      ? validateLicensePlate(editingVehicle.licensePlate)
                        ? 'text-green-600'
                        : 'text-red-600'
                      : 'text-gray-500'
                  }`}>
                    {editingVehicle.licensePlate 
                      ? validateLicensePlate(editingVehicle.licensePlate)
                        ? '✓ Valid Rwandan format'
                        : '✗ Invalid format. Use: RA + Alphabet + 3 digits + Alphabet'
                      : 'Required: Rwandan format (RA + Alphabet + 3 digits + Alphabet)'
                    }
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <FaEdit className="text-blue-600 text-sm" />
                    Description
                  </label>
                  <textarea
                    value={editingVehicle.description || ''}
                    onChange={(e) => setEditingVehicle(prev => ({ ...prev, description: e.target.value }))}
                    readOnly={modalType === 'view'}
                    rows={4}
                    placeholder="Describe the vehicle features, condition, and any special notes..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                  />
                </div>
              </div>

              {modalType !== 'view' && (
                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        {modalType === 'add' ? <FaPlus className="text-sm" /> : <FaEdit className="text-sm" />}
                        {modalType === 'add' ? 'Add Vehicle' : 'Save Changes'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
