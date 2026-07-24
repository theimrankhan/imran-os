import { motion } from "framer-motion"
import { 
  FileText, 
  PenTool, 
  RefreshCw, 
  Zap, 
  CheckCircle2, 
  Circle, 
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import { cn, formatDate } from "../../lib/utils"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import type { Note } from "../../types"

interface NoteCardProps {
  note: Note
  isActive: boolean
  onClick: () => void
  onDelete: () => void
  onToggleComplete: () => void
}

const typeConfig = {
  normal: { icon: FileText, color: "text-primary", bg: "bg-primary/10", label: "Normal" },
  handwritten: { icon: PenTool, color: "text-accent", bg: "bg-accent/10", label: "Handwritten" },
  revision: { icon: RefreshCw, color: "text-success", bg: "bg-success/10", label: "Revision" },
  quick: { icon: Zap, color: "text-warning", bg: "bg-warning/10", label: "Quick" },
}

export default function NoteCard({ note, isActive, onClick, onDelete, onToggleComplete }: NoteCardProps) {
  const typeInfo = typeConfig[note.type]

  return (
    <motion.button
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "w-full text-left group relative flex items-start gap-3 rounded-xl border p-3.5 transition-all duration-200",
        isActive
          ? "border-primary/30 bg-primary/[0.04] shadow-sm shadow-primary/5"
          : "border-transparent bg-card hover:border-border hover:shadow-sm"
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={cn("rounded-lg p-2 shrink-0", typeInfo.bg)}>
          <typeInfo.icon className={cn("w-4 h-4", typeInfo.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-foreground truncate">
              {note.title || "Untitled Note"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate max-w-[100px]">{note.subjectName}</span>
            <span>·</span>
            <span>L{note.lectureNumber}</span>
            {note.tags.length > 0 && (
              <>
                <span>·</span>
                <span className="truncate max-w-[60px]">{note.tags[0]}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground/60">
              {formatDate(note.updatedAt)}
            </span>
            {note.completed && (
              <span className="text-[10px] font-medium text-success">Completed</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <div
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete()
          }}
          className="cursor-pointer"
        >
          {note.completed ? (
            <CheckCircle2 className="w-4 h-4 text-success" />
          ) : (
            <Circle className="w-4 h-4 text-muted-foreground/40 hover:text-muted-foreground transition-colors" />
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              className="text-destructive gap-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.button>
  )
}