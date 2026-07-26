import { motion } from "framer-motion"
import { Clock, MapPin, FileText, ClipboardList } from "lucide-react"
import { useStore } from "../../stores/appStore"
import { cn } from "../../lib/utils"
import ProgressRing from "./ProgressRing"
import type { Timetable } from "../../types"

interface SmartLectureCardProps {
  entry: Timetable
  compact?: boolean
  onClick?: () => void
  isOngoing?: boolean
  isDragging?: boolean
  dragHandleProps?: Record<string, unknown>
}

export default function SmartLectureCard({
  entry,
  compact = false,
  onClick,
  isOngoing,
  isDragging,
  dragHandleProps,
}: SmartLectureCardProps) {
  const { attendance, notes } = useStore()

  const att = attendance.find((a) => a.subjectId === entry.subjectId)
  const pct = att?.percentage ?? 0
  const target = 75

  const borderColor =
    pct >= target ? "#16a34a"
    : pct >= target - 10 ? "#eab308"
    : "#dc2626"

  const subjectNotes = notes.filter((n) => n.subjectId === entry.subjectId)
  const hasNotes = subjectNotes.length > 0
  const pendingAssignments = subjectNotes.filter((n) => !n.completed).length
  const completedNotes = subjectNotes.filter((n) => n.completed).length
  const studyProgress = subjectNotes.length > 0 ? Math.round((completedNotes / subjectNotes.length) * 100) : 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "relative cursor-pointer select-none rounded-xl border-l-[3px] bg-card transition-shadow",
        isDragging && "opacity-50 ring-2 ring-primary/30",
        isOngoing ? "shadow-lg" : "shadow-sm hover:shadow-md",
        compact ? "p-3" : "p-4"
      )}
      style={{
        backgroundColor: `${entry.color}06`,
        borderLeftColor: borderColor,
        boxShadow: isOngoing
          ? `0 4px 24px ${entry.color}18, 0 1px 4px ${entry.color}10`
          : undefined,
      }}
      onClick={onClick}
      {...dragHandleProps}
    >
      {isOngoing && (
        <motion.div
          className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
          style={{
            backgroundColor: entry.color,
            boxShadow: `0 0 6px ${entry.color}80, 0 0 12px ${entry.color}40`,
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span
              className={cn("font-semibold truncate leading-tight", compact ? "text-sm" : "text-base")}
              style={{ color: entry.color }}
            >
              {entry.subjectName}
            </span>
          </div>

          <div className={cn("flex flex-wrap gap-x-3 gap-y-1 items-center", compact ? "text-xs" : "text-sm")}>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Clock className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
              {entry.startTime}
            </span>
            {entry.room && (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <MapPin className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
                {entry.room}
              </span>
            )}
          </div>

          {!compact && (
            <div className="flex items-center gap-3 mt-3">
              <ProgressRing percentage={pct} size={32} strokeWidth={3} />
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border",
                    pct >= target
                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                      : pct >= target - 10
                        ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                        : "bg-red-500/10 text-red-600 border-red-500/20"
                  )}
                >
                  {Math.round(pct)}%
                </span>
                {hasNotes && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border bg-primary/5 text-primary border-primary/10">
                    <FileText className="h-3 w-3" />
                    {studyProgress}%
                  </span>
                )}
                {pendingAssignments > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border bg-amber-500/10 text-amber-600 border-amber-500/20">
                    <ClipboardList className="h-3 w-3" />
                    {pendingAssignments}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {compact && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium shrink-0 border",
              pct >= target
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-red-500/10 text-red-600 border-red-500/20"
            )}
          >
            {Math.round(pct)}%
          </span>
        )}
      </div>
    </motion.div>
  )
}
