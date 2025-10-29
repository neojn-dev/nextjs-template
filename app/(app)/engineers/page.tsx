"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Users,
  Zap,
  Star,
  UserCheck,
  Building,
  Rocket,
  Cpu,
  CheckCircle
} from "lucide-react"
import { ErrorBoundary } from "@/components/error-boundary"
import { DataTable } from "@/components/data-table/data-table"
import { columns } from "./columns"
import { toast } from "@/components/ui/toast-container"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { ExportButton } from "@/components/ui/export-button"
import { AdvancedFilters, FilterField, FilterValue } from "@/components/ui/advanced-filters"

interface Engineer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  department: string
  specialization: string
  engineeringType: string
  yearsOfExperience?: number
  salary?: number
  isActive: boolean
  projectSuccessRate?: number
  codeQuality?: number
  innovationScore?: number
  createdAt: string
  updatedAt: string
  employeeId: string
}

export default function EngineersPage() {
  const { data: session, status } = useSession()
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
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
  const [engineeringTypeFilter, setEngineeringTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingEngineer, setEditingEngineer] = useState<Engineer | null>(null)
  const [viewingEngineer, setViewingEngineer] = useState<Engineer | null>(null)
  const [filters, setFilters] = useState<FilterValue[]>([])
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    employeeId: "",
    department: "",
    specialization: "",
    engineeringType: "",
    yearsOfExperience: "",
    salary: "",
    isActive: true
  })
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; engineer: Engineer | null }>({ open: false, engineer: null })

  // Filter configuration for engineers
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
        { value: 'Software Engineering', label: 'Software Engineering' },
        { value: 'Hardware Engineering', label: 'Hardware Engineering' },
        { value: 'Systems Engineering', label: 'Systems Engineering' },
        { value: 'DevOps', label: 'DevOps' },
        { value: 'Quality Assurance', label: 'Quality Assurance' },
        { value: 'Research & Development', label: 'Research & Development' },
        { value: 'Data Engineering', label: 'Data Engineering' },
        { value: 'Network Engineering', label: 'Network Engineering' }
      ]
    },
    { 
      key: 'specialization', 
      label: 'Specialization', 
      type: 'select',
      options: [
        { value: 'Frontend Development', label: 'Frontend Development' },
        { value: 'Backend Development', label: 'Backend Development' },
        { value: 'Full Stack Development', label: 'Full Stack Development' },
        { value: 'Mobile Development', label: 'Mobile Development' },
        { value: 'DevOps Engineering', label: 'DevOps Engineering' },
        { value: 'Data Science', label: 'Data Science' },
        { value: 'Machine Learning', label: 'Machine Learning' },
        { value: 'Cloud Architecture', label: 'Cloud Architecture' }
      ]
    },
    { 
      key: 'engineeringType', 
      label: 'Engineering Type', 
      type: 'select',
      options: [
        { value: 'Software', label: 'Software' },
        { value: 'Hardware', label: 'Hardware' },
        { value: 'Systems', label: 'Systems' },
        { value: 'Network', label: 'Network' },
        { value: 'Security', label: 'Security' },
        { value: 'Data', label: 'Data' }
      ]
    },
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
      fetchEngineers()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, pagination.pageIndex, pagination.pageSize, searchQuery, departmentFilter, specializationFilter, engineeringTypeFilter, statusFilter, sortBy, sortOrder])

  const fetchEngineers = async () => {
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
      if (engineeringTypeFilter) params.set('engineeringType', engineeringTypeFilter)
      if (statusFilter) params.set('isActive', statusFilter)
      
      const response = await fetch(`/api/engineers?${params.toString()}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.data && Array.isArray(result.data)) {
          setEngineers(result.data)
          setPagination(prev => ({
            ...prev,
            total: result.pagination.total,
            pages: result.pagination.pages
          }))
        } else {
          setError('Invalid data format received from API')
          setEngineers([])
        }
      } else {
        const errorText = await response.text()
        setError(`API request failed: ${response.status} - ${errorText}`)
        setEngineers([])
      }
    } catch (error) {
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setEngineers([])
    } finally {
      setLoading(false)
    }
  }

  const handlePaginationChange = (newPagination: { pageIndex: number; pageSize: number }) => {
    setPagination(prev => ({
      ...prev,
      pageIndex: newPagination.pageIndex,
      pageSize: newPagination.pageSize
    }))
  }

  // Handle filter changes (now triggers server-side filtering)
  const handleFiltersChange = (newFilters: FilterValue[]) => {
    setFilters(newFilters)
    
    // Map advanced filters to server-side filter parameters
    let newSearchQuery = ''
    let newDepartmentFilter = ''
    let newSpecializationFilter = ''
    let newEngineeringTypeFilter = ''
    let newStatusFilter = ''
    
    newFilters.forEach(filter => {
      switch (filter.field) {
        case 'firstName':
        case 'lastName':
        case 'email':
        case 'employeeId':
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
        case 'engineeringType':
          if (filter.operator === 'equals' && filter.value) {
            newEngineeringTypeFilter = filter.value
          } else if (filter.operator === 'notEquals' && filter.value) {
            newEngineeringTypeFilter = `!${filter.value}`
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
    setEngineeringTypeFilter(newEngineeringTypeFilter)
    setStatusFilter(newStatusFilter)
    
    // Reset pagination to first page when filters change
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      toast.error('You must be signed in to create or edit engineers.')
      return
    }

    try {
      const url = editingEngineer 
        ? `/api/engineers/${editingEngineer.id}` 
        : '/api/engineers'
      
      const method = editingEngineer ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        // Engineer saved successfully
        
        // Reset form and close dialog
        setIsAddDialogOpen(false)
        setEditingEngineer(null)
        resetForm()
        
        // Refresh the engineers list
        fetchEngineers()
        
        // Show success message
        toast.success(editingEngineer ? 'Engineer updated successfully!' : 'Engineer added successfully!')
      } else {
        const errorData = await response.json()
        console.error('❌ [FORM ERROR] API error:', errorData)
        toast.error(`Error: ${errorData.error || 'Failed to save engineer'}`)
      }
    } catch (error) {
      console.error('❌ [FORM ERROR] Network error:', error)
      toast.error('Network error occurred. Please try again.')
    }
  }

  const handleView = (id: string) => {
    const engineer = engineers.find(e => e.id === id)
    if (engineer) {
      setViewingEngineer(engineer)
    }
  }

  const handleDelete = (id: string) => {
    const engineer = engineers.find(e => e.id === id)
    if (engineer) {
      setDeleteConfirmation({ open: true, engineer })
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirmation.engineer) return
    
    try {
      const response = await fetch(`/api/engineers/${deleteConfirmation.engineer.id}`, { 
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        fetchEngineers()
        toast.error('Engineer deleted successfully!', {
          style: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626'
          }
        })
      } else {
        toast.error('Failed to delete engineer', {
          style: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626'
          }
        })
      }
    } catch (error) {
      console.error('Error deleting engineer:', error)
      toast.error('Failed to delete engineer', {
        style: {
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626'
        }
      })
    }
  }

  const handleEdit = (id: string) => {
    const engineer = engineers.find(e => e.id === id)
    if (engineer) {
      setEditingEngineer(engineer)
      setFormData({
        firstName: engineer.firstName,
        lastName: engineer.lastName,
        email: engineer.email,
        employeeId: engineer.employeeId,
        department: engineer.department,
        specialization: engineer.specialization,
        engineeringType: engineer.engineeringType,
        yearsOfExperience: engineer.yearsOfExperience?.toString() || "",
        salary: engineer.salary?.toString() || "",
        isActive: engineer.isActive
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
      engineeringType: "",
      yearsOfExperience: "",
      salary: "",
      isActive: true
    })
  }

  const fillDummyData = () => {
    const departments = ["Software", "Hardware", "Civil", "Mechanical", "Electrical", "Chemical", "Biomedical", "Industrial"]
    const specializations = [
      "Full Stack Development", "Machine Learning", "Embedded Systems", "Structural Analysis",
      "Robotics", "Power Systems", "Process Engineering", "Medical Devices"
    ]
    const engineeringTypes = ["Software", "Hardware", "Civil", "Mechanical", "Electrical", "Chemical", "Biomedical", "Industrial"]
    const firstNames = ["Eng. Sarah", "Eng. Michael", "Eng. Emily", "Eng. David", "Eng. Jennifer", "Eng. Robert", "Eng. Lisa", "Eng. James"]
    const lastNames = ["Johnson", "Chen", "Williams", "Brown", "Davis", "Miller", "Wilson", "Taylor"]
    
    setFormData({
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      email: `eng.${Math.random().toString(36).substring(2, 8)}@techcompany.com`,
      employeeId: `ENG${Math.floor(Math.random() * 9000) + 1000}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      specialization: specializations[Math.floor(Math.random() * specializations.length)],
      engineeringType: engineeringTypes[Math.floor(Math.random() * engineeringTypes.length)],
      yearsOfExperience: (Math.floor(Math.random() * 20) + 1).toString(),
      salary: (Math.floor(Math.random() * 120000) + 70000).toString(),
      isActive: true
    })
  }

  const handleAddNew = () => {
    setEditingEngineer(null)
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Cpu className="h-8 w-8 text-blue-600" />
              Engineers Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your engineering team, track performance, and maintain professional records
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              Add Engineer
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Engineers</p>
                  <p className="text-3xl font-bold">{engineers.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Engineers</p>
                  <p className="text-3xl font-bold">
                    {engineers.filter(e => e.isActive).length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Departments</p>
                  <p className="text-3xl font-bold">
                    {new Set(engineers.map(e => e.department)).size}
                  </p>
                </div>
                <Building className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Avg Experience</p>
                  <p className="text-3xl font-bold">
                    {engineers.length > 0 
                      ? Math.round(engineers.reduce((sum, e) => sum + (e.yearsOfExperience || 0), 0) / engineers.length)
                      : 0
                    }y
                  </p>
                </div>
                <Star className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engineers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-blue-600" />
              Engineers Directory
            </CardTitle>
            <CardDescription>
              Comprehensive list of all engineers with search, filter, and export capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading engineers...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchEngineers} variant="outline">
                  Try Again
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
                    data={engineers}
                    filename="engineers-export"
                    className="shrink-0"
                  />
                </div>

                <DataTable
                  columns={columns}
                  data={engineers}
                  searchPlaceholder="Search engineers..."
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEngineer ? 'Edit Engineer' : 'Add New Engineer'}
              </DialogTitle>
              <DialogDescription>
                {editingEngineer ? 'Update engineer information' : 'Add a new engineer to the system'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">

              
              {/* Fill Dummy Data Button */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fillDummyData}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
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
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="Civil">Civil</SelectItem>
                      <SelectItem value="Mechanical">Mechanical</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Chemical">Chemical</SelectItem>
                      <SelectItem value="Biomedical">Biomedical</SelectItem>
                      <SelectItem value="Industrial">Industrial</SelectItem>
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
                    placeholder="e.g., Full Stack Development"
                  />
                </div>
                <div>
                  <Label htmlFor="engineeringType">Engineering Type *</Label>
                  <Select value={formData.engineeringType} onValueChange={(value) => setFormData({...formData, engineeringType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select engineering type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="Civil">Civil</SelectItem>
                      <SelectItem value="Mechanical">Mechanical</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Chemical">Chemical</SelectItem>
                      <SelectItem value="Biomedical">Biomedical</SelectItem>
                      <SelectItem value="Industrial">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
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
                  {editingEngineer ? 'Update Engineer' : 'Add Engineer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Engineer Dialog */}
        <Dialog open={!!viewingEngineer} onOpenChange={(open) => !open && setViewingEngineer(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Engineer Details</DialogTitle>
              <DialogDescription>
                View complete information for {viewingEngineer?.firstName} {viewingEngineer?.lastName}
              </DialogDescription>
            </DialogHeader>
            
            {viewingEngineer && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                        <p className="text-gray-900">{viewingEngineer.firstName} {viewingEngineer.lastName}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        <p className="text-gray-900">{viewingEngineer.email}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Employee ID</Label>
                        <p className="text-gray-900 font-mono">{viewingEngineer.employeeId}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Status</Label>
                        <Badge variant={viewingEngineer.isActive ? "default" : "secondary"}>
                          {viewingEngineer.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Details</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Department</Label>
                        <p className="text-gray-900">{viewingEngineer.department}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Specialization</Label>
                        <p className="text-gray-900">{viewingEngineer.specialization}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Engineering Type</Label>
                        <p className="text-gray-900">{viewingEngineer.engineeringType}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Years of Experience</Label>
                        <p className="text-gray-900">{viewingEngineer.yearsOfExperience || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Salary</Label>
                        <p className="text-gray-900">
                          {viewingEngineer.salary ? `$${viewingEngineer.salary.toLocaleString()}` : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Project Success Rate</Label>
                      <p className="text-gray-900">{viewingEngineer.projectSuccessRate || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Code Quality</Label>
                      <p className="text-gray-900">{viewingEngineer.codeQuality || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Innovation Score</Label>
                      <p className="text-gray-900">{viewingEngineer.innovationScore || 'Not specified'}</p>
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
                        {new Date(viewingEngineer.createdAt).toLocaleDateString('en-US', {
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
                        {new Date(viewingEngineer.updatedAt || viewingEngineer.createdAt).toLocaleDateString('en-US', {
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
                onClick={() => setViewingEngineer(null)}
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setViewingEngineer(null)
                  handleEdit(viewingEngineer!.id)
                }}
              >
                Edit Engineer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmation.open}
        onOpenChange={(open) => setDeleteConfirmation({ open, engineer: null })}
        title="Delete Engineer"
        description="Are you sure you want to delete this engineer? This action cannot be undone."
        confirmText="Delete Engineer"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        type="danger"
        itemName={deleteConfirmation.engineer ? `${deleteConfirmation.engineer.firstName} ${deleteConfirmation.engineer.lastName}` : undefined}
      />
    </ErrorBoundary>
  )
}
