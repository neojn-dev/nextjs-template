"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Plus, 
  Shield, 
  Users,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Zap
} from "lucide-react"
import { ErrorBoundary } from "@/components/error-boundary"
import { DataTable } from "@/components/data-table/data-table"
import { columns, Role } from "./columns"
import { toast } from "@/components/ui/toast-container"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { ExportButton } from "@/components/ui/export-button"
import { AdvancedFilters, FilterField, FilterValue } from "@/components/ui/advanced-filters"

export default function RolesPage() {
  const { data: session, status } = useSession()
  const [roles, setRoles] = useState<Role[]>([])
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
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [viewingRole, setViewingRole] = useState<Role | null>(null)
  const [filters, setFilters] = useState<FilterValue[]>([])
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true
  })
  
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; role: Role | null }>({ 
    open: false, 
    role: null 
  })

  // Filter configuration for roles
  const filterFields: FilterField[] = [
    { key: 'name', label: 'Role Name', type: 'text', placeholder: 'Enter role name...' },
    { key: 'description', label: 'Description', type: 'text', placeholder: 'Enter description...' },
    { 
      key: 'isActive', 
      label: 'Status', 
      type: 'boolean'
    }
  ]

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRoles()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, pagination.pageIndex, pagination.pageSize, searchQuery, statusFilter, sortBy, sortOrder])

  const fetchRoles = async () => {
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
      if (statusFilter) params.set('isActive', statusFilter)
      
      const response = await fetch(`/api/roles?${params.toString()}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.data && Array.isArray(result.data)) {
          setRoles(result.data)
          setPagination(prev => ({
            ...prev,
            total: result.pagination.total,
            pages: result.pagination.pages
          }))
        } else {
          setError('Invalid data format received from API')
          setRoles([])
        }
      } else {
        const errorText = await response.text()
        setError(`API request failed: ${response.status} - ${errorText}`)
        setRoles([])
      }
    } catch (error) {
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setRoles([])
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

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterValue[]) => {
    setFilters(newFilters)
    
    // Map advanced filters to server-side filter parameters
    let newSearchQuery = ''
    let newStatusFilter = ''
    
    newFilters.forEach(filter => {
      switch (filter.field) {
        case 'name':
        case 'description':
          if (filter.operator === 'contains' && filter.value) {
            newSearchQuery = filter.value
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
    setStatusFilter(newStatusFilter)
    
    // Reset pagination to first page when filters change
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles'
      const method = editingRole ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const result = await response.json()
        setIsAddDialogOpen(false)
        setEditingRole(null)
        resetForm()
        fetchRoles()
        toast.success(editingRole ? 'Role updated successfully!' : 'Role added successfully!')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ [FORM ERROR] API error:', errorData)
        toast.error(`Error: ${errorData.error || 'Failed to save role'}`)
      }
    } catch (error) {
      console.error('❌ [FORM ERROR] Network error:', error)
      toast.error('Network error occurred. Please try again.')
    }
  }

  const handleView = (id: string) => {
    const role = roles.find(r => r.id === id)
    if (role) {
      setViewingRole(role)
    }
  }

  const handleDelete = (id: string) => {
    const role = roles.find(r => r.id === id)
    if (role) {
      setDeleteConfirmation({ open: true, role })
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirmation.role) return
    
    try {
      const response = await fetch(`/api/roles/${deleteConfirmation.role.id}`, { 
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        fetchRoles()
        toast.success('Role deleted successfully!')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete role' }))
        toast.error(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      toast.error('Failed to delete role')
    } finally {
      setDeleteConfirmation({ open: false, role: null })
    }
  }

  const handleEdit = (id: string) => {
    const role = roles.find(r => r.id === id)
    if (role) {
      setEditingRole(role)
      
      setFormData({
        name: role.name,
        description: role.description || "",
        isActive: role.isActive
      })
      setIsAddDialogOpen(true)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      isActive: true
    })
  }

  const fillDummyData = () => {
    const roleNames = ["Content Manager", "Support Agent", "Data Analyst", "Team Lead", "Moderator"]
    const descriptions = [
      "Manages content creation and publishing",
      "Provides customer support and assistance", 
      "Analyzes data and generates reports",
      "Leads team operations and coordination",
      "Moderates community and content"
    ]
    
    const randomIndex = Math.floor(Math.random() * roleNames.length)
    
    setFormData({
      name: roleNames[randomIndex],
      description: descriptions[randomIndex],
      isActive: true
    })
  }

  const handleAddNew = () => {
    setEditingRole(null)
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

  // Check if user has admin role
  const userRole = session?.user?.role
  if (userRole !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="mb-4">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need administrator privileges to access this page.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Roles Management</h1>
            <p className="text-gray-600">Manage user roles and permissions</p>
          </div>
          <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.filter(r => r.isActive).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Roles</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.filter(r => !r.isActive).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {roles.reduce((sum, role) => sum + role._count.users, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Roles Directory</CardTitle>
            <CardDescription>A comprehensive list of all user roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">
                  <h3 className="text-lg font-semibold">Error Loading Data</h3>
                  <p>{error}</p>
                </div>
                <Button onClick={fetchRoles} variant="outline">
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
                    data={roles}
                    filename="roles-export"
                    className="shrink-0"
                  />
                </div>

                <DataTable
                  data={roles}
                  columns={columns}
                  isLoading={loading}
                  searchPlaceholder="Search roles..."
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRole ? 'Edit Role' : 'Add New Role'}
              </DialogTitle>
              <DialogDescription>
                {editingRole ? 'Update role information and permissions' : 'Create a new role with specific permissions'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Role Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    placeholder="e.g., Content Manager, Admin"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the role's responsibilities..."
                    rows={3}
                  />
                </div>


              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!session}>
                  {editingRole ? 'Update Role' : 'Create Role'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Role Details Dialog */}
        <Dialog open={!!viewingRole} onOpenChange={() => setViewingRole(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Role Details
              </DialogTitle>
              <DialogDescription>
                View detailed information about the role
              </DialogDescription>
            </DialogHeader>
            
            {viewingRole && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Role Name</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{viewingRole.name}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Badge variant={viewingRole.isActive ? "default" : "secondary"}>
                        {viewingRole.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span>{viewingRole.description || "No description provided"}</span>
                    </div>
                  </div>
                </div>



                {/* User Count */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Assigned Users</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{viewingRole._count.users} users assigned to this role</span>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingRole(null)}>
                Close
              </Button>
              <Button 
                onClick={() => {
                  if (viewingRole) {
                    setViewingRole(null)
                    handleEdit(viewingRole.id)
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteConfirmation.open}
          onOpenChange={(open) => setDeleteConfirmation({ open, role: null })}
          title="Delete Role"
          description="Are you sure you want to delete this role? This action cannot be undone."
          confirmText="Delete Role"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          type="danger"
          itemName={deleteConfirmation.role ? deleteConfirmation.role.name : undefined}
        />
      </div>
    </ErrorBoundary>
  )
}
