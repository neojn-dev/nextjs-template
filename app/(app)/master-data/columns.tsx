"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2 } from "lucide-react"

export interface MasterData {
  id: string
  title: string
  description?: string
  category: "Basic" | "Advanced" | "Specialized"
  isActive: boolean
  sortOrder: number
  fieldType: string
  textField?: string
  emailField?: string
  phoneField?: string
  urlField?: string
  searchField?: string
  textareaField?: string
  richTextField?: string
  numberField?: number
  integerField?: number
  rangeField?: number
  sliderValue?: number
  dateField?: string
  timeField?: string
  dateTimeField?: string
  monthField?: string
  weekField?: string
  singleSelect?: string
  multiSelect?: string
  radioSelection?: string
  checkboxGroup?: string
  switchField?: boolean
  checkboxField?: boolean
  colorField?: string
  ratingField?: number
  tagsField?: string
  createdAt: string
  updatedAt: string
}

export const columns: ColumnDef<MasterData>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {row.getValue("title")}
        </div>
      )
    },
  },
  {
    accessorKey: "fieldType",
    header: "Field Type",
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="w-fit">
          {row.getValue("fieldType")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as string
      return (
        <Badge 
          variant={category === "Basic" ? "default" : category === "Advanced" ? "secondary" : "outline"}
          className="w-fit"
        >
          {category}
        </Badge>
      )
    },
  },
  {
    accessorKey: "sortOrder",
    header: "Sort Order",
    cell: ({ row }) => {
      return (
        <div className="text-sm font-mono">
          {row.getValue("sortOrder")}
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
      const masterData = row.original
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
                onView(masterData.id)
              }
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700 text-green-600 rounded-full transition-colors duration-200"
            title="Edit Master Data"
            onClick={() => {
              if (onEdit) {
                onEdit(masterData.id)
              }
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 text-red-600 rounded-full transition-colors duration-200"
            title="Delete Master Data"
            onClick={() => {
              if (onDelete) {
                onDelete(masterData.id)
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