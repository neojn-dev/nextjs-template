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
import { toast } from "@/components/ui/toast-container"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { ExportButton } from "@/components/ui/export-button"
import { AdvancedFilters, FilterField, FilterValue } from "@/components/ui/advanced-filters"

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
  updatedAt: string
  employeeId: string
}

export default function DoctorsPage() {
  const { data: session, status } = useSession()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null)
  const [filters, setFilters] = useState<FilterValue[]>([])
  
  // Pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    total: 0,
    pages: 0
  })
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  
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
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; doctor: Doctor | null }>({ open: false, doctor: null })

  // Filter configuration for doctors
  const filterFields: FilterField[] = [
    { key: 'firstName', label: 'First Name', type: 'text', placeholder: 'Enter first name...' },
    { key: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Enter last name...' },
    { key: 'email', label: 'Email', type: 'text', placeholder: 'Enter email...' },
    { key: 'employeeId', label: 'Employee ID', type: 'text', placeholder: 'Enter employee ID...' },
    { 
      key: 'department', 
      label: 'Department', 
      type: 'select',
      options: [
        { value: 'Cardiology', label: 'Cardiology' },
        { value: 'Neurology', label: 'Neurology' },
        { value: 'Pediatrics', label: 'Pediatrics' },
        { value: 'Orthopedics', label: 'Orthopedics' },
        { value: 'Emergency', label: 'Emergency' },
        { value: 'Surgery', label: 'Surgery' },
        { value: 'Internal Medicine', label: 'Internal Medicine' },
        { value: 'Radiology', label: 'Radiology' }
      ]
    },
    { 
      key: 'specialization', 
      label: 'Specialization', 
      type: 'select',
      options: [
        { value: 'Cardiologist', label: 'Cardiologist' },
        { value: 'Neurologist', label: 'Neurologist' },
        { value: 'Pediatrician', label: 'Pediatrician' },
        { value: 'Orthopedic Surgeon', label: 'Orthopedic Surgeon' },
        { value: 'Emergency Physician', label: 'Emergency Physician' },
        { value: 'General Surgeon', label: 'General Surgeon' },
        { value: 'Internist', label: 'Internist' },
        { value: 'Radiologist', label: 'Radiologist' }
      ]
    },
    { key: 'licenseNumber', label: 'License Number', type: 'text', placeholder: 'Enter license number...' },
    { key: 'yearsOfExperience', label: 'Years of Experience', type: 'number', placeholder: 'Enter years...' },
    { key: 'salary', label: 'Salary', type: 'number', placeholder: 'Enter salary...' },
    { 
      key: 'isActive', 
      label: 'Status', 
      type: 'boolean'
    }
  ]

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDoctors()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, pagination.pageIndex, pagination.pageSize, searchQuery, departmentFilter, specializationFilter, statusFilter, sortBy, sortOrder])

  const fetchDoctors = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: (pagination.pageIndex + 1).toString(),
        limit: pagination.pageSize.toString(),
        sortBy,
        sortOrder,
      })
      
      if (searchQuery) params.set('search', searchQuery)
      if (departmentFilter) params.set('department', departmentFilter)
      if (specializationFilter) params.set('specialization', specializationFilter)
      if (statusFilter) params.set('isActive', statusFilter)
      
      const response = await fetch(`/api/doctors?${params.toString()}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.data && Array.isArray(result.data)) {
          setDoctors(result.data)
          setPagination(prev => ({
            ...prev,
            total: result.pagination.total,
            pages: result.pagination.pages
          }))
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

  // Pagination handlers
  const handlePaginationChange = (newPagination: { pageIndex: number; pageSize: number }) => {
    setPagination(prev => ({
      ...prev,
      pageIndex: newPagination.pageIndex,
      pageSize: newPagination.pageSize
    }))
  }

  // Search and filter handlers
  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
    setPagination(prev => ({ ...prev, pageIndex: 0 })) // Reset to first page
  }

  const handleDepartmentChange = (department: string) => {
    setDepartmentFilter(department)
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }

  const handleSpecializationChange = (specialization: string) => {
    setSpecializationFilter(specialization)
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }

  const handleStatusChange = (status: string) => {
    setStatusFilter(status)
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }

  // Legacy filter handler for compatibility
  const handleFiltersChange = (newFilters: FilterValue[]) => {
    setFilters(newFilters)
    
    // Map advanced filters to server-side filter parameters
    let newSearchQuery = ''
    let newDepartmentFilter = ''
    let newSpecializationFilter = ''
    let newStatusFilter = ''
    
    newFilters.forEach(filter => {
      switch (filter.field) {
        case 'firstName':
        case 'lastName':
        case 'email':
        case 'employeeId':
        case 'licenseNumber':
          // For text fields, use as search query
          if (filter.operator === 'contains' && filter.value) {
            newSearchQuery = filter.value
          }
          break
        case 'department':
          if (filter.operator === 'equals' && filter.value) {
            newDepartmentFilter = filter.value
          } else if (filter.operator === 'notEquals' && filter.value) {
            newDepartmentFilter = `!${filter.value}`
          }
          break
        case 'specialization':
          if (filter.operator === 'equals' && filter.value) {
            newSpecializationFilter = filter.value
          } else if (filter.operator === 'notEquals' && filter.value) {
            newSpecializationFilter = `!${filter.value}`
          }
          break
        case 'isActive':
          if (filter.operator === 'equals' && filter.value !== undefined) {
            newStatusFilter = filter.value === true ? 'true' : 'false'
          } else if (filter.operator === 'notEquals' && filter.value !== undefined) {
            newStatusFilter = filter.value === true ? 'false' : 'true'
          }
          break
      }
    })
    
    // Update filter state (this will trigger useEffect to refetch data)
    setSearchQuery(newSearchQuery)
    setDepartmentFilter(newDepartmentFilter)
    setSpecializationFilter(newSpecializationFilter)
    setStatusFilter(newStatusFilter)
    
    // Reset pagination to first page when filters change
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
            // Submitting doctor form
    
    try {
      const url = editingDoctor ? `/api/doctors/${editingDoctor.id}` : '/api/doctors'
      const method = editingDoctor ? 'PUT' : 'POST'
      
              // Making request to API
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      
              // Response received
      
      if (response.ok) {
        const result = await response.json()
        // Success response received
        setIsAddDialogOpen(false)
        setEditingDoctor(null)
        resetForm()
        fetchDoctors()
        toast.success(editingDoctor ? 'Doctor updated successfully!' : 'Doctor added successfully!')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ [FORM ERROR] API error:', errorData)
        toast.error(`Error: ${errorData.error || 'Failed to save doctor'}`)
      }
    } catch (error) {
      console.error('❌ [FORM ERROR] Network error:', error)
      toast.error('Network error occurred. Please try again.')
    }
  }

  const handleView = (id: string) => {
    const doctor = doctors.find(d => d.id === id)
    if (doctor) {
      setViewingDoctor(doctor)
    }
  }

  const handleDelete = (id: string) => {
    const doctor = doctors.find(d => d.id === id)
    if (doctor) {
      setDeleteConfirmation({ open: true, doctor })
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirmation.doctor) return
    
    try {
      const response = await fetch(`/api/doctors/${deleteConfirmation.doctor.id}`, { 
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        fetchDoctors()
        toast.error('Doctor deleted successfully!', {
          style: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626'
          }
        })
      } else {
        toast.error('Failed to delete doctor', {
          style: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626'
          }
        })
      }
    } catch (error) {
      console.error('Error deleting doctor:', error)
      toast.error('Failed to delete doctor', {
        style: {
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626'
        }
      })
    }
  }

  const handleEdit = (id: string) => {
    const doctor = doctors.find(d => d.id === id)
    if (doctor) {
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
              <>
                {/* Filters and Export Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <AdvancedFilters 
                    fields={filterFields}
                    onFiltersChange={handleFiltersChange}
                    className="flex-1"
                  />
                  <ExportButton 
                    data={doctors}
                    filename="doctors-export"
                    className="shrink-0"
                  />
                </div>

                <DataTable
                  data={doctors}
                  columns={columns}
                  isLoading={loading}
                  searchPlaceholder="Search doctors..."
                  pagination={{
                    pageIndex: pagination.pageIndex,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    pageCount: pagination.pages
                  }}
                  onPaginationChange={handlePaginationChange}
                  meta={{ onView: handleView, onEdit: handleEdit, onDelete: handleDelete }}
                />
              </>
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

        {/* View Doctor Dialog */}
        <Dialog open={!!viewingDoctor} onOpenChange={(open) => !open && setViewingDoctor(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Doctor Details</DialogTitle>
              <DialogDescription>
                View complete information for Dr. {viewingDoctor?.firstName} {viewingDoctor?.lastName}
              </DialogDescription>
            </DialogHeader>
            
            {viewingDoctor && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                        <p className="text-gray-900">Dr. {viewingDoctor.firstName} {viewingDoctor.lastName}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        <p className="text-gray-900">{viewingDoctor.email}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Employee ID</Label>
                        <p className="text-gray-900 font-mono">{viewingDoctor.employeeId}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Status</Label>
                        <Badge variant={viewingDoctor.isActive ? "default" : "secondary"}>
                          {viewingDoctor.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Details</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Department</Label>
                        <p className="text-gray-900">{viewingDoctor.department}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Specialization</Label>
                        <p className="text-gray-900">{viewingDoctor.specialization}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">License Number</Label>
                        <p className="text-gray-900 font-mono">{viewingDoctor.licenseNumber}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Years of Experience</Label>
                        <p className="text-gray-900">{viewingDoctor.yearsOfExperience || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Salary</Label>
                        <p className="text-gray-900">
                          {viewingDoctor.salary ? `$${viewingDoctor.salary.toLocaleString()}` : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* System Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">System Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Created</Label>
                      <p className="text-gray-900">
                        {new Date(viewingDoctor.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                      <p className="text-gray-900">
                        {new Date(viewingDoctor.updatedAt || viewingDoctor.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setViewingDoctor(null)}
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setViewingDoctor(null)
                  handleEdit(viewingDoctor!.id)
                }}
              >
                Edit Doctor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmation.open}
        onOpenChange={(open) => setDeleteConfirmation({ open, doctor: null })}
        title="Delete Doctor"
        description="Are you sure you want to delete this doctor? This action cannot be undone."
        confirmText="Delete Doctor"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        type="danger"
        itemName={deleteConfirmation.doctor ? `Dr. ${deleteConfirmation.doctor.firstName} ${deleteConfirmation.doctor.lastName}` : undefined}
      />
    </ErrorBoundary>
  )
}
