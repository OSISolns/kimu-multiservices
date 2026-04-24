'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@/app/UserContext'

interface VehicleForm {
  id: number
  name: string
  type: string
  category: string
  year: number
  licensePlate?: string
  status: string
  isAvailable: boolean
  maintenanceDate?: string
  engine?: string
  transmission?: string
  fuel?: string
  power?: string
  fuelEfficiency?: string
  capacity?: string
  doors?: number
  mileage?: string
  quantity?: number
  description?: string
  price?: string
  image?: string
}

export default function EditVehiclePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { user, isLoading } = useUser()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [vehicle, setVehicle] = useState<VehicleForm | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/staff/login')
    }
  }, [isLoading, user, router])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/vehicles/${params.id}`)
        if (!res.ok) throw new Error('Failed to load vehicle')
        const data = await res.json()
        setVehicle({
          ...data,
          maintenanceDate: data.maintenanceDate ? new Date(data.maintenanceDate).toISOString().slice(0, 10) : ''
        })
      } catch (e: any) {
        setError(e.message || 'Failed to load')
      }
    }
    if (params?.id) load()
  }, [params?.id])

  const onChange = (field: keyof VehicleForm, value: any) => {
    setVehicle(v => (v ? { ...v, [field]: value } : v))
  }

  const save = async () => {
    if (!vehicle) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicle)
      })
      if (!res.ok) throw new Error('Failed to save vehicle')
      router.push('/staff/transport_officer-dashboard')
    } catch (e: any) {
      setError(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading vehicle...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 bg-[url('/subtle-prism.svg')] bg-cover bg-fixed ">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Edit Vehicle #{vehicle.id}</h1>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}

        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white/60 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input value={vehicle.name} onChange={e => onChange('name', e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <input value={vehicle.type} onChange={e => onChange('type', e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input value={vehicle.category} onChange={e => onChange('category', e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="number" value={vehicle.year} onChange={e => onChange('year', Number(e.target.value))} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
              <input value={vehicle.licensePlate || ''} onChange={e => onChange('licensePlate', e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={vehicle.status} onChange={e => onChange('status', e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="available">available</option>
                <option value="in_use">in_use</option>
                <option value="maintenance">maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available</label>
              <select value={vehicle.isAvailable ? 'true' : 'false'} onChange={e => onChange('isAvailable', e.target.value === 'true')} className="w-full border rounded px-3 py-2">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Date</label>
              <input type="date" value={vehicle.maintenanceDate || ''} onChange={e => onChange('maintenanceDate', e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Engine</label>
              <input value={vehicle.engine || ''} onChange={e => onChange('engine', e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
              <input value={vehicle.transmission || ''} onChange={e => onChange('transmission', e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel</label>
              <input value={vehicle.fuel || ''} onChange={e => onChange('fuel', e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Power</label>
              <input value={vehicle.power || ''} onChange={e => onChange('power', e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Efficiency</label>
              <input value={vehicle.fuelEfficiency || ''} onChange={e => onChange('fuelEfficiency', e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input value={vehicle.capacity || ''} onChange={e => onChange('capacity', e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doors</label>
              <input type="number" value={vehicle.doors || 0} onChange={e => onChange('doors', Number(e.target.value))} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
              <input value={vehicle.mileage || ''} onChange={e => onChange('mileage', e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={vehicle.description || ''} onChange={e => onChange('description', e.target.value)} className="w-full border rounded px-3 py-2" rows={4} />
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => router.back()} className="px-4 py-2 border rounded">Cancel</button>
            <button disabled={saving} onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


