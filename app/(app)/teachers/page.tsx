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
  GraduationCap,
  BookOpen,
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building,
  DollarSign,
  Award,
  Clock,
  UserCheck,
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

interface Teacher {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  department: string
  subject: string
  gradeLevel: string
  yearsOfExperience?: number
  salary?: number
  isActive: boolean
  performanceRating?: number
  studentSatisfaction?: number
  createdAt: string
  updatedAt: string
  employeeId: string
  hireDate: string
}

export default function TeachersPage() {
  const { data: session, status } = useSession()
  const [teachers, setTeachers] = useState<Teacher[]>([])
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
  const [subjectFilter, setSubjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null)
  const [filters, setFilters] = useState<FilterValue[]>([])
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    employeeId: "",
    department: "",
    subject: "",
    yearsOfExperience: "",
    salary: "",
    hireDate: "",
    isActive: true
  })
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; teacher: Teacher | null }>({ open: false, teacher: null })

  // Filter configuration for teachers
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
        { value: 'Mathematics', label: 'Mathematics' },
        { value: 'Science', label: 'Science' },
        { value: 'English', label: 'English' },
        { value: 'History', label: 'History' },
        { value: 'Physical Education', label: 'Physical Education' },
        { value: 'Art', label: 'Art' },
        { value: 'Music', label: 'Music' },
        { value: 'Computer Science', label: 'Computer Science' }
      ]
    },
    { 
      key: 'subject', 
      label: 'Subject', 
      type: 'select',
      options: [
        { value: 'Algebra', label: 'Algebra' },
        { value: 'Biology', label: 'Biology' },
        { value: 'Chemistry', label: 'Chemistry' },
        { value: 'Physics', label: 'Physics' },
        { value: 'Literature', label: 'Literature' },
        { value: 'World History', label: 'World History' },
        { value: 'Geography', label: 'Geography' },
        { value: 'Programming', label: 'Programming' }
      ]
    },
    { key: 'yearsOfExperience', label: 'Years of Experience', type: 'number', placeholder: 'Enter years...' },
    { key: 'salary', label: 'Salary', type: 'number', placeholder: 'Enter salary...' },
    { key: 'hireDate', label: 'Hire Date', type: 'date' },
    { 
      key: 'isActive', 
      label: 'Status', 
      type: 'boolean'
    }
  ]

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTeachers()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, pagination.pageIndex, pagination.pageSize, searchQuery, departmentFilter, subjectFilter, statusFilter, sortBy, sortOrder])

  const fetchTeachers = async () => {
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
      if (subjectFilter) params.set('subject', subjectFilter)
      if (statusFilter) params.set('isActive', statusFilter)
      
      const response = await fetch(`/api/teachers?${params.toString()}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.data && Array.isArray(result.data)) {
          setTeachers(result.data)
          setPagination(prev => ({
            ...prev,
            total: result.pagination.total,
            pages: result.pagination.pages
          }))
        } else {
          setError('Invalid data format received from API')
          setTeachers([])
        }
      } else {
        const errorText = await response.text()
        setError(`API request failed: ${response.status} - ${errorText}`)
        setTeachers([])
      }
    } catch (error) {
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTeachers([])
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
    let newSubjectFilter = ''
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
        case 'subject':
          if (filter.operator === 'equals' && filter.value) {
            newSubjectFilter = filter.value
          } else if (filter.operator === 'notEquals' && filter.value) {
            newSubjectFilter = `!${filter.value}`
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
    setSubjectFilter(newSubjectFilter)
    setStatusFilter(newStatusFilter)
    
    // Reset pagination to first page when filters change
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
            // Submitting teacher form
    
    try {
      const url = editingTeacher ? `/api/teachers/${editingTeacher.id}` : '/api/teachers'
      const method = editingTeacher ? 'PUT' : 'POST'
      
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
        setEditingTeacher(null)
        resetForm()
        fetchTeachers()
        toast.success(editingTeacher ? 'Teacher updated successfully!' : 'Teacher added successfully!')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ [FORM ERROR] API error:', errorData)
        toast.error(`Error: ${errorData.error || 'Failed to save teacher'}`)
      }
    } catch (error) {
      console.error('❌ [FORM ERROR] Network error:', error)
      toast.error('Network error occurred. Please try again.')
    }
  }

  const handleView = (id: string) => {
    const teacher = teachers.find(t => t.id === id)
    if (teacher) {
      setViewingTeacher(teacher)
    }
  }

  const handleDelete = (id: string) => {
    const teacher = teachers.find(t => t.id === id)
    if (teacher) {
      setDeleteConfirmation({ open: true, teacher })
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirmation.teacher) return
    
    try {
      const response = await fetch(`/api/teachers/${deleteConfirmation.teacher.id}`, { 
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        fetchTeachers()
        toast.error('Teacher deleted successfully!', {
          style: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626'
          }
        })
      } else {
        toast.error('Failed to delete teacher', {
          style: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626'
          }
        })
      }
    } catch (error) {
      console.error('Error deleting teacher:', error)
      toast.error('Failed to delete teacher', {
        style: {
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626'
        }
      })
    }
  }

  const handleEdit = (id: string) => {
    const teacher = teachers.find(t => t.id === id)
    if (teacher) {
      setEditingTeacher(teacher)
      setFormData({
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        employeeId: teacher.employeeId,
        department: teacher.department,
        subject: teacher.subject,
        yearsOfExperience: teacher.yearsOfExperience?.toString() || "",
        salary: teacher.salary?.toString() || "",
        hireDate: teacher.hireDate || "",
        isActive: teacher.isActive
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
      subject: "",
      yearsOfExperience: "",
      salary: "",
      hireDate: "",
      isActive: true
    })
  }

  const fillDummyData = () => {
    const departments = ["Mathematics", "Science", "English", "History", "Arts", "Physical Education", "Music", "Computer Science"]
    const subjects = [
      "Algebra & Calculus", "Physics & Chemistry", "Literature & Composition", "World History",
      "Visual Arts & Design", "Physical Education", "Music Theory", "Programming & Web Development"
    ]
    const firstNames = ["Prof. Sarah", "Prof. Michael", "Prof. Emily", "Prof. David", "Prof. Jennifer", "Prof. Robert", "Prof. Lisa", "Prof. James"]
    const lastNames = ["Johnson", "Chen", "Williams", "Brown", "Davis", "Miller", "Wilson", "Taylor"]
    
    // Generate a random hire date within the last 10 years
    const hireDate = new Date()
    hireDate.setFullYear(hireDate.getFullYear() - Math.floor(Math.random() * 10))
    hireDate.setMonth(Math.floor(Math.random() * 12))
    hireDate.setDate(Math.floor(Math.random() * 28) + 1)
    
    setFormData({
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      email: `prof.${Math.random().toString(36).substring(2, 8)}@university.edu`,
      employeeId: `TCH${Math.floor(Math.random() * 9000) + 1000}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      yearsOfExperience: (Math.floor(Math.random() * 20) + 1).toString(),
      salary: (Math.floor(Math.random() * 80000) + 50000).toString(),
      hireDate: hireDate.toISOString().split('T')[0],
      isActive: true
    })
  }

  const handleAddNew = () => {
    setEditingTeacher(null)
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
            <h1 className="text-3xl font-bold text-gray-900">Teachers Management</h1>
            <p className="text-gray-600">Manage your teaching staff and their information</p>
          </div>
          <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.filter(t => t.isActive).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(teachers.map(t => t.department)).size}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(teachers.map(t => t.subject)).size}</div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Teachers Directory</CardTitle>
            <CardDescription>A comprehensive list of all teaching staff</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">
                  <h3 className="text-lg font-semibold">Error Loading Data</h3>
                  <p>{error}</p>
                </div>
                <Button onClick={fetchTeachers} variant="outline">
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
                    data={teachers}
                    filename="teachers-export"
                    className="shrink-0"
                  />
                </div>

                <DataTable
                  data={teachers}
                  columns={columns}
                  isLoading={loading}
                  searchPlaceholder="Search teachers..."
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
                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
              </DialogTitle>
              <DialogDescription>
                {editingTeacher ? 'Update teacher information' : 'Add a new teacher to the system'}
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
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="History">History</SelectItem>
                      <SelectItem value="Arts">Arts</SelectItem>
                      <SelectItem value="Physical Education">Physical Education</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                    placeholder="e.g., Algebra, Physics, Literature"
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
                  <Label htmlFor="hireDate">Hire Date</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
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
                  {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Teacher Details Dialog */}
      <Dialog open={!!viewingTeacher} onOpenChange={() => setViewingTeacher(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Teacher Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about the teacher
            </DialogDescription>
          </DialogHeader>
          
          {viewingTeacher && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{viewingTeacher.firstName} {viewingTeacher.lastName}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Employee ID</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Badge variant="outline" className="font-mono">
                      {viewingTeacher.employeeId}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{viewingTeacher.email}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Badge variant={viewingTeacher.isActive ? "default" : "secondary"}>
                      {viewingTeacher.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Department</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span>{viewingTeacher.department}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Subject</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span>{viewingTeacher.subject}</span>
                  </div>
                </div>
                
                {viewingTeacher.yearsOfExperience && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Years of Experience</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Star className="h-4 w-4 text-gray-500" />
                      <span>{viewingTeacher.yearsOfExperience} years</span>
                    </div>
                  </div>
                )}
                
                {viewingTeacher.salary && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Salary</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>${viewingTeacher.salary.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewingTeacher.hireDate && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Hire Date</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{new Date(viewingTeacher.hireDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Created At</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{new Date(viewingTeacher.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingTeacher(null)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                if (viewingTeacher) {
                  setViewingTeacher(null)
                  setEditingTeacher(viewingTeacher)
                  setFormData({
                    firstName: viewingTeacher.firstName,
                    lastName: viewingTeacher.lastName,
                    email: viewingTeacher.email,
                    employeeId: viewingTeacher.employeeId,
                    department: viewingTeacher.department,
                    subject: viewingTeacher.subject,
                    yearsOfExperience: viewingTeacher.yearsOfExperience?.toString() || "",
                    salary: viewingTeacher.salary?.toString() || "",
                    hireDate: viewingTeacher.hireDate || "",
                    isActive: viewingTeacher.isActive
                  })
                  setIsAddDialogOpen(true)
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmation.open}
        onOpenChange={(open) => setDeleteConfirmation({ open, teacher: null })}
        title="Delete Teacher"
        description="Are you sure you want to delete this teacher? This action cannot be undone."
        confirmText="Delete Teacher"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        type="danger"
        itemName={deleteConfirmation.teacher ? `Prof. ${deleteConfirmation.teacher.firstName} ${deleteConfirmation.teacher.lastName}` : undefined}
      />
    </ErrorBoundary>
  )
}
