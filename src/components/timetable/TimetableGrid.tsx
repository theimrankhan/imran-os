import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import { ScrollArea } from "../ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import TimetableEntry from "./TimetableEntry"
import { useStore } from "../../stores/appStore"
import { cn } from "../../lib/utils"
import type { Timetable } from "../../types"

interface TimetableGridProps {
  entries: Timetable[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  semesterFilter: string
  typeFilter: string
  compact?: boolean
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAY_LABELS_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
]

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8)

function getTimeToY(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return (h - 8) * 60 + m
}

function getDurationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  return (eh - sh) * 60 + (em - sm)
}

function findConflicts(entries: Timetable[]): Set<string> {
  const conflictIds = new Set<string>()
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i]
      const b = entries[j]
      if (
        a.dayOfWeek === b.dayOfWeek &&
        a.startTime < b.endTime &&
        a.endTime > b.startTime
      ) {
        conflictIds.add(a.id)
        conflictIds.add(b.id)
      }
    }
  }
  return conflictIds
}

function MobileListView({
  entries,
  onEdit,
  onDelete,
}: {
  entries: Timetable[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  const grouped: Record<string, Timetable[]> = {}
  DAY_LABELS_FULL.forEach((label, i) => {
    const dayEntries = entries.filter((e) => e.dayOfWeek === i)
    if (dayEntries.length > 0) grouped[label] = dayEntries
  })

  return (
    <div className="space-y-4 lg:hidden">
      {Object.entries(grouped).map(([day, dayEntries]) => (
        <div key={day}>
          <h3 className="text-sm font-semibold text-foreground mb-2 px-1">
            {day}
          </h3>
          <div className="space-y-2">
            {dayEntries
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((entry) => (
                <TimetableEntry
                  key={entry.id}
                  entry={entry}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  compact
                />
              ))}
          </div>
        </div>
      ))}
      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No lectures scheduled for this view
        </div>
      )}
    </div>
  )
}

export default function TimetableGrid({
  entries,
  onEdit,
  onDelete,
  semesterFilter,
  typeFilter,
  compact: _compact = false,
}: TimetableGridProps) {
  const { settings } = useStore()
  const showWeekends = settings.timetable?.showWeekends ?? false
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (semesterFilter !== "all" && String(e.semester) !== semesterFilter) return false
      if (typeFilter !== "all" && e.type !== typeFilter) return false
      return true
    })
  }, [entries, semesterFilter, typeFilter])

  const conflictIds = useMemo(() => findConflicts(filteredEntries), [filteredEntries])

  const days = useMemo(() => {
    if (showWeekends) return [0, 1, 2, 3, 4, 5, 6]
    return [1, 2, 3, 4, 5]
  }, [showWeekends])

  const entriesByDay = useMemo(() => {
    const map: Record<number, Timetable[]> = {}
    days.forEach((d) => (map[d] = []))
    filteredEntries.forEach((e) => {
      if (map[e.dayOfWeek]) map[e.dayOfWeek].push(e)
    })
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.startTime.localeCompare(b.startTime)))
    return map
  }, [filteredEntries, days])

  const hasConflicts = conflictIds.size > 0

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.setData("text/plain", id)
    e.dataTransfer.effectAllowed = "move"
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedId(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, targetDay: number) => {
      e.preventDefault()
      const id = e.dataTransfer.getData("text/plain")
      if (!id) return
      const entry = entries.find((en) => en.id === id)
      if (entry && entry.dayOfWeek !== targetDay) {
        onEdit(id)
      }
      setDraggedId(null)
    },
    [entries, onEdit]
  )

  return (
    <div>
      {/* Conflict warning */}
      <AnimatePresence>
        {hasConflicts && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/20 px-4 py-2.5 text-sm text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                <strong>Scheduling conflict detected:</strong> Some lectures
                overlap in time. Hover over highlighted cards for details.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile list */}
      <MobileListView
        entries={filteredEntries}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Desktop grid */}
      <div className="hidden lg:block rounded-xl border bg-card shadow-sm overflow-hidden">
        <ScrollArea className="h-[600px]">
          <div className="min-w-[700px]">
            {/* Header row */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] sticky top-0 z-10 bg-card border-b">
              <div className="h-10 flex items-center justify-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider border-r">
                Time
              </div>
              {days.map((dayIdx) => (
                <div
                  key={dayIdx}
                  className={cn(
                    "h-10 flex flex-col items-center justify-center border-r last:border-r-0",
                    "bg-muted/30"
                  )}
                >
                  <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">
                    {DAY_LABELS[dayIdx]}
                  </span>
                </div>
              ))}
            </div>

            {/* Time rows */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] relative">
              {/* Time labels */}
              <div className="relative col-span-1">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] flex items-start justify-center pt-0.5 border-b border-r"
                  >
                    <span className="text-[10px] font-medium text-muted-foreground/60 tabular-nums">
                      {hour > 12 ? hour - 12 : hour}{hour >= 12 ? "p" : "a"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {days.map((dayIdx) => (
                <div
                  key={dayIdx}
                  className="relative border-r last:border-r-0"
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = "move"
                  }}
                  onDrop={(e) => handleDrop(e, dayIdx)}
                >
                  {/* Hour grid lines */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className={cn(
                        "h-[60px] border-b",
                        hour % 2 === 0 ? "border-border" : "border-border/40"
                      )}
                    />
                  ))}

                  {/* Lecture cards */}
                  {entriesByDay[dayIdx]?.map((entry) => {
                    const top = getTimeToY(entry.startTime)
                    const duration = getDurationMinutes(entry.startTime, entry.endTime)
                    const height = Math.max((duration / 60) * 60 - 4, 24)
                    const isConflict = conflictIds.has(entry.id)

                    return (
                      <Tooltip key={entry.id}>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute left-0.5 right-0.5 z-[5]"
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                            }}
                          >
                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, entry.id)}
                              onDragEnd={handleDragEnd}
                            >
                              <TimetableEntry
                                entry={entry}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                compact={height < 50}
                                isDragging={draggedId === entry.id}
                                dragHandleProps={{}}
                              />
                            </div>
                          </div>
                        </TooltipTrigger>
                        {isConflict && (
                          <TooltipContent side="top" className="text-xs bg-destructive text-destructive-foreground border-destructive/50">
                            Time conflict — this lecture overlaps with another
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}