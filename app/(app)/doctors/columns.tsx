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
  Stethoscope,
  Star,
  Clock,
  DollarSign,
  Shield,
  Activity,
  Heart
} from "lucide-react"
import { format } from "date-fns"


export interface Doctor {
  id: string
  firstName: string
  lastName: string
  email: string
  employeeId: string
  department: string
  specialization: string
  licenseNumber: string
  yearsOfExperience?: number
  salary?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "employeeId",
    header: "Employee ID",
    cell: ({ row }) => {
      const doctor = row.original
      return (
        <div className="font-mono text-sm text-gray-600">
          {doctor.employeeId}
        </div>
      )
    },
  },
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => {
      const doctor = row.original
      return (
        <div className="font-medium">
          {doctor.firstName} {doctor.lastName}
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
    accessorKey: "specialization",
    header: "Specialization",
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          {row.getValue("specialization")}
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
      const doctor = row.original
      const { onView, onEdit, onDelete } = table.options.meta as { onView?: (id: string) => void; onEdit?: (id: string) => void; onDelete?: (id: string) => Promise<void> }
      
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700 text-blue-600 rounded-full transition-colors duration-200"
            title="View Details"
            onClick={() => {
              if (onView) {
                onView(doctor.id)
              }
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 text-green-600 rounded-full transition-colors duration-200"
            title="Edit Doctor"
            onClick={() => {
              if (onEdit) {
                onEdit(doctor.id)
              }
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 text-red-600 rounded-full transition-colors duration-200"
            title="Delete Doctor"
            onClick={() => {
              if (onDelete) {
                onDelete(doctor.id)
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
