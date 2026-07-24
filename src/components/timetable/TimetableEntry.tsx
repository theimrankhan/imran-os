import { motion } from "framer-motion"
import { Clock, MapPin, GripVertical } from "lucide-react"
import { Badge } from "../ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip"
import { cn } from "../../lib/utils"
import type { Timetable } from "../../types"

interface TimetableEntryProps {
  entry: Timetable
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  compact?: boolean
  onClick?: () => void
  isDragging?: boolean
  dragHandleProps?: Record<string, unknown>
}

const typeConfig = {
  theory: { label: "Theory", variant: "default" as const },
  lab: { label: "Lab", variant: "success" as const },
  tutorial: { label: "Tutorial", variant: "secondary" as const },
}

export default function TimetableEntry({
  entry,
  onEdit,
  onDelete,
  compact = false,
  onClick,
  isDragging,
  dragHandleProps,
}: TimetableEntryProps) {
  const typeInfo = typeConfig[entry.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={
        compact ? undefined : { scale: 1.02, y: -1 }
      }
      whileTap={compact ? undefined : { scale: 0.98 }}
      className={cn(
        "group relative cursor-pointer select-none",
        "rounded-lg border border-transparent",
        "transition-shadow duration-200",
        !compact && "hover:shadow-lg",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary/30",
        compact ? "p-2.5" : "p-3"
      )}
      style={{
        backgroundColor: `${entry.color}12`,
        borderLeftColor: entry.color,
        borderLeftWidth: 3,
      }}
      onClick={onClick}
      {...dragHandleProps}
    >
      <div className="flex items-start gap-2">
        {dragHandleProps && (
          <div
            className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            {!compact && (
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
            )}
            <span
              className={cn(
                "font-semibold truncate",
                compact ? "text-xs" : "text-sm"
              )}
              style={{ color: entry.color }}
            >
              {entry.subjectName}
            </span>
            {compact && (
              <Badge
                variant={typeInfo.variant}
                className="ml-auto text-[10px] px-1.5 py-0 leading-none"
              >
                {typeInfo.label}
              </Badge>
            )}
          </div>

          <div className={cn("flex flex-wrap gap-x-3 gap-y-0.5", compact ? "text-[10px]" : "text-xs")}>
            <span className="inline-flex items-center gap-1 text-muted-foreground/70">
              <Clock className="h-3 w-3" />
              {entry.startTime} - {entry.endTime}
            </span>
            {entry.room && (
              <span className="inline-flex items-center gap-1 text-muted-foreground/70">
                <MapPin className="h-3 w-3" />
                {entry.room}
              </span>
            )}
          </div>
        </div>

        {!compact && (
          <div className="flex items-center gap-1 shrink-0">
            <Badge
              variant={typeInfo.variant}
              className="text-[10px] px-1.5 py-0 leading-none"
            >
              {typeInfo.label}
            </Badge>
          </div>
        )}
      </div>

      {!compact && (onEdit || onDelete) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "absolute top-1.5 right-1.5 flex gap-0.5",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              )}
            >
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(entry.id)
                  }}
                  className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-background/80 text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                  <span className="sr-only">Edit</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(entry.id)
                  }}
                  className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive transition-colors"
                >
                  <span className="sr-only">Delete</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {onEdit && onDelete ? "Click to edit or delete" : onEdit ? "Edit lecture" : "Delete lecture"}
          </TooltipContent>
        </Tooltip>
      )}
    </motion.div>
  )
}