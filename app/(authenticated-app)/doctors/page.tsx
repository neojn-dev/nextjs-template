"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  Stethoscope,
  Heart,
  Clock,
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building,
  DollarSign,
  Award,
  UserCheck,
  Activity,
  Shield,
  CheckCircle,
  Zap
} from "lucide-react"
import { ErrorBoundary } from "@/components/error-boundary"
import { DataTable } from "@/components/data-table/data-table"
import { columns } from "./columns"

interface Doctor {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  department: string
  specialization: string
  licenseNumber: string
  yearsOfExperience?: number
  salary?: number
  isActive: boolean
  patientSatisfaction?: number
  successRate?: number
  createdAt: string
  employeeId: string
}

export default function DoctorsPage() {
  const { data: session, status } = useSession()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    employeeId: "",
    department: "",
    specialization: "",
    licenseNumber: "",
    yearsOfExperience: "",
    salary: "",
    isActive: true
  })

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDoctors()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchDoctors = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/doctors', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (Array.isArray(data)) {
          setDoctors(data)
        } else {
          setError('Invalid data format received from API')
          setDoctors([])
        }
      } else {
        const errorText = await response.text()
        setError(`API request failed: ${response.status} - ${errorText}`)
        setDoctors([])
      }
    } catch (error) {
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔍 [FORM DEBUG] Submitting doctor form with data:', formData)
    console.log('🔍 [FORM DEBUG] Current session:', session)
    
    try {
      const url = editingDoctor ? `/api/doctors/${editingDoctor.id}` : '/api/doctors'
      const method = editingDoctor ? 'PUT' : 'POST'
      
      console.log('🔍 [FORM DEBUG] Making request to:', url, 'with method:', method)
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      
      console.log('🔍 [FORM DEBUG] Response status:', response.status)
      console.log('🔍 [FORM DEBUG] Response headers:', response.headers)
      
      if (response.ok) {
        const result = await response.json()
        console.log('🔍 [FORM DEBUG] Success response:', result)
        setIsAddDialogOpen(false)
        setEditingDoctor(null)
        resetForm()
        fetchDoctors()
        alert(editingDoctor ? 'Doctor updated successfully!' : 'Doctor added successfully!')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ [FORM ERROR] API error:', errorData)
        alert(`Error: ${errorData.error || 'Failed to save doctor'}`)
      }
    } catch (error) {
      console.error('❌ [FORM ERROR] Network error:', error)
      alert('Network error occurred. Please try again.')
    }
  }

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setFormData({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      employeeId: doctor.employeeId,
      department: doctor.department,
      specialization: doctor.specialization,
      licenseNumber: doctor.licenseNumber,
      yearsOfExperience: doctor.yearsOfExperience?.toString() || "",
      salary: doctor.salary?.toString() || "",
      isActive: doctor.isActive
    })
    setIsAddDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      employeeId: "",
      department: "",
      specialization: "",
      licenseNumber: "",
      yearsOfExperience: "",
      salary: "",
      isActive: true
    })
  }

  const fillDummyData = () => {
    const departments = ["Cardiology", "Neurology", "Pediatrics", "Surgery", "Emergency", "Internal Medicine", "Radiology", "Oncology"]
    const specializations = [
      "Interventional Cardiology", "Cardiac Surgery", "Neurological Surgery", "Pediatric Neurology",
      "General Surgery", "Emergency Medicine", "Internal Medicine", "Diagnostic Radiology"
    ]
    const firstNames = ["Dr. Sarah", "Dr. Michael", "Dr. Emily", "Dr. David", "Dr. Jennifer", "Dr. Robert", "Dr. Lisa", "Dr. James"]
    const lastNames = ["Johnson", "Chen", "Williams", "Brown", "Davis", "Miller", "Wilson", "Taylor"]
    
    setFormData({
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      email: `dr.${Math.random().toString(36).substring(2, 8)}@hospital.com`,
      employeeId: `DOC${Math.floor(Math.random() * 9000) + 1000}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      specialization: specializations[Math.floor(Math.random() * specializations.length)],
      licenseNumber: `MD${Math.floor(Math.random() * 900000) + 100000}`,
      yearsOfExperience: (Math.floor(Math.random() * 25) + 1).toString(),
      salary: (Math.floor(Math.random() * 150000) + 80000).toString(),
      isActive: true
    })
  }

  const handleAddNew = () => {
    setEditingDoctor(null)
    resetForm()
    setIsAddDialogOpen(true)
  }

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "First Name,Last Name,Email,Employee ID,Department,Specialization,License Number,Years of Experience,Salary,Status\n" +
      doctors.map(d => 
        `${d.firstName},${d.lastName},${d.email},${d.employeeId},${d.department},${d.specialization},${d.licenseNumber},${d.yearsOfExperience || ''},${d.salary || ''},${d.isActive ? 'Active' : 'Inactive'}`
      ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "doctors.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctors Management</h1>
            <p className="text-gray-600">Manage your medical staff and their information</p>
          </div>
          <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Doctor
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{doctors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{doctors.filter(d => d.isActive).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(doctors.map(d => d.department)).size}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Specializations</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(doctors.map(d => d.specialization)).size}</div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Doctors Directory</CardTitle>
            <CardDescription>A comprehensive list of all medical staff</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">
                  <h3 className="text-lg font-semibold">Error Loading Data</h3>
                  <p>{error}</p>
                </div>
                <Button onClick={fetchDoctors} variant="outline">
                  Retry
                </Button>
              </div>
            ) : (
              <DataTable
                data={doctors}
                columns={columns}
                isLoading={loading}
                onEdit={handleEdit}
                onDelete={async (id) => {
                  try {
                    await fetch(`/api/doctors/${id}`, { 
                      method: 'DELETE',
                      credentials: 'include'
                    })
                    fetchDoctors()
                  } catch (error) {
                    console.error('Error deleting doctor:', error)
                  }
                }}
                searchPlaceholder="Search doctors..."
                exportData={exportData}
                meta={{ onEdit: handleEdit, onDelete: async (id) => {
                  try {
                    await fetch(`/api/doctors/${id}`, { 
                      method: 'DELETE',
                      credentials: 'include'
                    })
                    fetchDoctors()
                  } catch (error) {
                    console.error('Error deleting doctor:', error)
                  }
                }}}
              />
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
              </DialogTitle>
              <DialogDescription>
                {editingDoctor ? 'Update doctor information' : 'Add a new doctor to the system'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Authentication Status */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <strong>Authentication Status:</strong> {session ? `✅ Authenticated as ${session.user?.email || 'User'}` : '❌ Not authenticated'}
                </div>
                {!session && (
                  <div className="text-xs text-red-600 mt-1">
                    You must be signed in to create or edit doctors.
                  </div>
                )}
              </div>
              
              {/* Fill Dummy Data Button */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fillDummyData}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Zap className="h-4 w-4" />
                  Fill Dummy Data
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="employeeId">Employee ID *</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                      <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
                      <SelectItem value="Radiology">Radiology</SelectItem>
                      <SelectItem value="Oncology">Oncology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Input
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    required
                    placeholder="e.g., Interventional Cardiology"
                  />
                </div>
                <div>
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})}
                    min="0"
                    max="50"
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="isActive">Status</Label>
                  <Select value={formData.isActive ? "true" : "false"} onValueChange={(value) => setFormData({...formData, isActive: value === "true"})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!session}>
                  {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  )
}
