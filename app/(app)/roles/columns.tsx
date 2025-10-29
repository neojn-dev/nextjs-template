"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Edit, 
  Trash2, 
  Eye,
  Shield,
  Users
} from "lucide-react"
import { format } from "date-fns"

export interface Role {
  id: string
  name: string
  description?: string
  permissions?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    users: number
  }
}

export const columns: ColumnDef<Role>[] = [
  {
    accessorKey: "name",
    header: "Role Name",
    cell: ({ row }) => {
      const role = row.original
      return (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-600" />
          <div className="font-medium">
            {role.name}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string
      return (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {description || "No description"}
        </div>
      )
    },
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const permissions = row.getValue("permissions") as string
      let permissionArray: string[] = []
      
      try {
        if (permissions) {
          permissionArray = JSON.parse(permissions)
        }
      } catch {
        permissionArray = []
      }

      return (
        <div className="flex flex-wrap gap-1">
          {permissionArray.length > 0 ? (
            permissionArray.slice(0, 3).map((permission, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {permission}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-gray-400">No permissions</span>
          )}
          {permissionArray.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{permissionArray.length - 3} more
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "_count.users",
    header: "Users",
    cell: ({ row }) => {
      const userCount = row.original._count.users
      return (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">{userCount}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive")
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return (
        <div className="text-sm text-gray-600">
          {format(date, "MMM dd, yyyy")}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const role = row.original
      const { onView, onEdit, onDelete } = table.options.meta as { 
        onView?: (id: string) => void; 
        onEdit?: (id: string) => void; 
        onDelete?: (id: string) => Promise<void> 
      }
      
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700 text-blue-600 rounded-full"
            title="View Details"
            onClick={() => {
              if (onView) {
                onView(role.id)
              }
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 text-green-600 rounded-full"
            title="Edit Role"
            onClick={() => {
              if (onEdit) {
                onEdit(role.id)
              }
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 text-red-600 rounded-full"
            title="Delete Role"
            onClick={() => {
              if (onDelete) {
                onDelete(role.id)
              }
            }}
            disabled={role._count.users > 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
