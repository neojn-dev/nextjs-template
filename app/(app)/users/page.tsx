"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { RoleSelect } from "@/components/ui/role-select"
import { 
  Plus, 
  Users, 
  UserCheck,
  UserX,
  Shield,
  Eye,
  Edit,
  Trash2,
  Mail,
  User,
  Zap
} from "lucide-react"
import { ErrorBoundary } from "@/components/error-boundary"
import { DataTable } from "@/components/data-table/data-table"
import { columns, User as UserType } from "./columns"
import { createSelectionColumn } from "@/components/data-table/selection-column"
import { toast } from "@/components/ui/toast-container"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { ExportButton } from "@/components/ui/export-button"
import { AdvancedFilters, FilterField, FilterValue } from "@/components/ui/advanced-filters"

export default function UsersPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<UserType[]>([])
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
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [viewingUser, setViewingUser] = useState<UserType | null>(null)
  const [filters, setFilters] = useState<FilterValue[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    roleId: "", // Will be set to User role ID when creating
    isActive: true
  })
  
  const [userRoleId, setUserRoleId] = useState<string | null>(null)
  
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean; user: UserType | null }>({ 
    open: false, 
    user: null 
  })

  // Filter configuration for users
  const filterFields: FilterField[] = [
    { key: 'username', label: 'Username', type: 'text', placeholder: 'Enter username...' },
    { key: 'email', label: 'Email', type: 'text', placeholder: 'Enter email...' },
    { key: 'firstName', label: 'First Name', type: 'text', placeholder: 'Enter first name...' },
    { key: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Enter last name...' },
    { 
      key: 'isActive', 
      label: 'Status', 
      type: 'boolean'
    }
  ]

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers()
      fetchUserRoleId()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, pagination.pageIndex, pagination.pageSize, searchQuery, roleFilter, statusFilter, sortBy, sortOrder])
  
  // Fetch the User role ID for defaulting new users
  const fetchUserRoleId = async () => {
    try {
      const response = await fetch('/api/roles?page=1&limit=100&sortBy=name&sortOrder=asc', {
        credentials: 'include'
      })
      if (response.ok) {
        const result = await response.json()
        const userRole = result.data?.find((role: any) => role.name === 'User')
        if (userRole) {
          setUserRoleId(userRole.id)
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }

  const fetchUsers = async () => {
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
      if (roleFilter) params.set('roleId', roleFilter)
      if (statusFilter) params.set('isActive', statusFilter)
      
      const response = await fetch(`/api/users?${params.toString()}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.data && Array.isArray(result.data)) {
          setUsers(result.data)
          setPagination(prev => ({
            ...prev,
            total: result.pagination.total,
            pages: result.pagination.pages
          }))
        } else {
          setError('Invalid data format received from API')
          setUsers([])
        }
      } else {
        const errorText = await response.text()
        setError(`API request failed: ${response.status} - ${errorText}`)
        setUsers([])
      }
    } catch (error) {
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setUsers([])
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
        case 'username':
        case 'email':
        case 'firstName':
        case 'lastName':
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
    
    // No password validation needed - admin-created users get auto-generated passwords
    // Editing users don't have password fields either
    
    setIsSubmitting(true)
    
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
      const method = editingUser ? 'PUT' : 'POST'
      
      // Prepare data - exclude password fields (auto-generated for new users, not editable for existing users)
      const submitData = { ...formData }
      delete (submitData as any).password
      delete (submitData as any).confirmPassword
      
      // For new users, default to User role if no role is selected and userRoleId is available
      if (!editingUser && (!submitData.roleId || submitData.roleId === 'none') && userRoleId) {
        submitData.roleId = userRoleId
      }
      
      // Handle "none" role selection (convert to empty string for API)
      if (submitData.roleId === 'none') {
        submitData.roleId = ''
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData)
      })
      
      if (response.ok) {
        const result = await response.json()
        setIsAddDialogOpen(false)
        setEditingUser(null)
        resetForm()
        fetchUsers()
        toast.success(editingUser ? 'User updated successfully!' : 'User created successfully! An email with login credentials has been sent.')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ [FORM ERROR] API error:', errorData)
        toast.error(`Error: ${errorData.error || 'Failed to save user'}`)
      }
    } catch (error) {
      console.error('❌ [FORM ERROR] Network error:', error)
      toast.error('Network error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleView = (id: string) => {
    const user = users.find(u => u.id === id)
    if (user) {
      setViewingUser(user)
    }
  }

  const handleDelete = (id: string) => {
    const user = users.find(u => u.id === id)
    if (user) {
      setDeleteConfirmation({ open: true, user })
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirmation.user) return
    
    try {
      const response = await fetch(`/api/users/${deleteConfirmation.user.id}`, { 
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        fetchUsers()
        toast.success('User deleted successfully!')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete user' }))
        toast.error(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    } finally {
      setDeleteConfirmation({ open: false, user: null })
    }
  }

  const handleEdit = (id: string) => {
    const user = users.find(u => u.id === id)
    if (user) {
      setEditingUser(user)
      setFormData({
        username: user.username,
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        roleId: user.roleId || "none", // Use "none" for empty role
        isActive: user.isActive
      })
      setIsAddDialogOpen(true)
    }
  }

  const handleBulkDelete = async (ids: string[], password?: string) => {
    try {
      const response = await fetch('/api/users/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ids,
          password,
          deleteAll: false
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        fetchUsers() // Refresh the list
      } else {
        toast.error(result.error || 'Failed to delete selected users')
      }
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast.error('Failed to delete selected users')
    }
  }

  const handleDeleteAll = async (password: string) => {
    try {
      const response = await fetch('/api/users/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          password,
          deleteAll: true
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message)
        fetchUsers() // Refresh the list
      } else {
        toast.error(result.error || 'Failed to delete all users')
      }
    } catch (error) {
      console.error('Delete all error:', error)
      toast.error('Failed to delete all users')
    }
  }

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      roleId: userRoleId || "none", // Default to User role for new users
      isActive: true
    })
  }

  const fillDummyData = () => {
    const firstNames = ["John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Lisa"]
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
    const domains = ["example.com", "test.com", "demo.org", "sample.net"]
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const domain = domains[Math.floor(Math.random() * domains.length)]
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`
    
    setFormData({
      username,
      email,
      firstName,
      lastName,
      roleId: userRoleId || "none", // Default to User role for new users
      isActive: true
    })
  }

  const handleAddNew = () => {
    setEditingUser(null)
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
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600">Manage system users and their roles</p>
          </div>
          <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.isActive).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => !u.isActive).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.emailVerified).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users Directory</CardTitle>
            <CardDescription>A comprehensive list of all system users</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">
                  <h3 className="text-lg font-semibold">Error Loading Data</h3>
                  <p>{error}</p>
                </div>
                <Button onClick={fetchUsers} variant="outline">
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
                    data={users}
                    filename="users-export"
                    className="shrink-0"
                  />
                </div>

                <DataTable
                  data={users}
                  columns={session?.user?.role === 'Admin' ? [createSelectionColumn<UserType>(), ...columns] : columns}
                  isLoading={loading}
                  searchPlaceholder="Search users..."
                  pagination={{
                    pageIndex: pagination.pageIndex,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    pageCount: pagination.pages
                  }}
                  onPaginationChange={handlePaginationChange}
                  meta={{ onView: handleView, onEdit: handleEdit, onDelete: handleDelete }}
                  enableBulkActions={session?.user?.role === 'Admin'}
                  entityName="Users"
                  onBulkDelete={handleBulkDelete}
                  onDeleteAll={handleDeleteAll}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={!isSubmitting ? setIsAddDialogOpen : undefined}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Loading Overlay */}
            {isSubmitting && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4 max-w-sm mx-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-1">Creating User Account</h3>
                    <p className="text-sm text-gray-600">Generating credentials and sending email...</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                  </div>
                </div>
              </div>
            )}
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Create New User Account'}
              </DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Update user information and role. Passwords cannot be changed here.' 
                  : 'Create a new user account. A secure password will be automatically generated and sent via email.'}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                    placeholder="e.g., john_doe"
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
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="John"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Doe"
                  />
                </div>

                {/* Password fields removed - admin-created users get auto-generated passwords */}
                {!editingUser && (
                  <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Automatic Password Generation</span>
                    </div>
                    <p className="text-blue-700 text-sm mt-1">
                      A secure password will be automatically generated and sent to the user via email along with account verification instructions.
                    </p>
                  </div>
                )}

                {/* Role field - only show for editing users, new users get User role by default */}
                {editingUser && (
                  <div className="md:col-span-2">
                    <Label htmlFor="roleId">Role</Label>
                    <RoleSelect
                      value={formData.roleId}
                      onValueChange={(value) => setFormData({...formData, roleId: value})}
                      placeholder="Select a role (optional)"
                    />
                  </div>
                )}
                
                {/* Info about default role for new users */}
                {!editingUser && (
                  <div className="md:col-span-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">Default Role Assignment</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      New users will be automatically assigned the "User" role for standard system access. You can change their role later if needed.
                    </p>
                  </div>
                )}

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                    />
                    <Label htmlFor="isActive">Active User</Label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!session || isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    editingUser ? 'Update User' : 'Create User'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View User Details Dialog */}
        <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                User Details
              </DialogTitle>
              <DialogDescription>
                View detailed information about the user
              </DialogDescription>
            </DialogHeader>
            
            {viewingUser && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Username</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{viewingUser.username}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{viewingUser.email}</span>
                      {viewingUser.emailVerified && (
                        <Badge variant="outline" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span>
                        {[viewingUser.firstName, viewingUser.lastName].filter(Boolean).join(' ') || "Not provided"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Badge variant={viewingUser.isActive ? "default" : "secondary"}>
                        {viewingUser.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Role Information */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Role</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {viewingUser.role ? (
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">{viewingUser.role.name}</span>
                        {viewingUser.role.description && (
                          <span className="text-sm text-gray-500">- {viewingUser.role.description}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">No role assigned</span>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Created At</Label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span>{new Date(viewingUser.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span>{new Date(viewingUser.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingUser(null)}>
                Close
              </Button>
              <Button 
                onClick={() => {
                  if (viewingUser) {
                    setViewingUser(null)
                    handleEdit(viewingUser.id)
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteConfirmation.open}
          onOpenChange={(open) => setDeleteConfirmation({ open, user: null })}
          title="Delete User"
          description="Are you sure you want to delete this user? This action cannot be undone and will remove all associated data."
          confirmText="Delete User"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          type="danger"
          itemName={deleteConfirmation.user ? deleteConfirmation.user.username : undefined}
        />
      </div>
    </ErrorBoundary>
  )
}
