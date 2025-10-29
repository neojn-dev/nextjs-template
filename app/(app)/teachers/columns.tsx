"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  MapPin,
  Building,
  GraduationCap,
  Star,
  Clock,
  DollarSign
} from "lucide-react"
import { format } from "date-fns"


export interface Teacher {
  id: string
  firstName: string
  lastName: string
  email: string
  employeeId: string
  department: string
  subject: string
  yearsOfExperience?: number
  salary?: number
  hireDate?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<Teacher>[] = [
  {
    accessorKey: "employeeId",
    header: "Employee ID",
    cell: ({ row }) => {
      const teacher = row.original
      return (
        <div className="font-mono text-sm text-gray-600">
          {teacher.employeeId}
        </div>
      )
    },
  },
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => {
      const teacher = row.original
      return (
        <div className="font-medium">
          {teacher.firstName} {teacher.lastName}
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {row.getValue("email")}
        </div>
      )
    },
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="w-fit">
          {row.getValue("department")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {row.getValue("subject")}
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
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const teacher = row.original
      const { onView, onEdit, onDelete } = table.options.meta as { onView?: (id: string) => void; onEdit?: (id: string) => void; onDelete?: (id: string) => Promise<void> }
      
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700 text-blue-600 rounded-full"
            title="View Details"
            onClick={() => {
              if (onView) {
                onView(teacher.id)
              }
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 text-green-600 rounded-full"
            title="Edit Teacher"
            onClick={() => {
              if (onEdit) {
                onEdit(teacher.id)
              }
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 text-red-600 rounded-full"
            title="Delete Teacher"
            onClick={() => {
              if (onDelete) {
                onDelete(teacher.id)
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
