"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  User,
  Shield
} from "lucide-react"
import { format } from "date-fns"

export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  roleId?: string
  isActive: boolean
  emailVerified?: string
  createdAt: string
  updatedAt: string
  role?: {
    id: string
    name: string
    description?: string
  }
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600" />
          <div className="font-medium">
            {user.username}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "firstName",
    header: "Full Name",
    cell: ({ row }) => {
      const user = row.original
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')
      return (
        <div className="font-medium">
          {fullName || "Not provided"}
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{user.email}</span>
          {user.emailVerified && (
            <Badge variant="outline" className="text-xs">
              Verified
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-2">
          {user.role ? (
            <>
              <Shield className="h-4 w-4 text-purple-600" />
              <Badge variant="secondary" className="text-xs">
                {user.role.name}
              </Badge>
            </>
          ) : (
            <span className="text-xs text-gray-400">No role assigned</span>
          )}
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
      const user = row.original
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
                onView(user.id)
              }
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 text-green-600 rounded-full"
            title="Edit User"
            onClick={() => {
              if (onEdit) {
                onEdit(user.id)
              }
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 text-red-600 rounded-full"
            title="Delete User"
            onClick={() => {
              if (onDelete) {
                onDelete(user.id)
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
