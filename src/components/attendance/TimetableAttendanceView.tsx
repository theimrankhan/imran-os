import { useState, useCallback } from "react"
import { Clock, CheckCircle2 } from "lucide-react"
import { useStore } from "../../stores/appStore"
import { cn } from "../../lib/utils"
import QuickMarkDialog from "./QuickMarkDialog"
import type { Timetable } from "../../types"

interface TimetableAttendanceViewProps {
  onMark: (data: { subjectId: string; date: Date; status: "present" | "absent" }) => void
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getLastOccurrence(dayOfWeek: number): string {
  const today = new Date()
  const currentDay = today.getDay()
  let diff = dayOfWeek - currentDay
  if (diff > 0) diff -= 7
  const d = new Date(today)
  d.setDate(d.getDate() + diff)
  return d.toISOString().split("T")[0]
}

export default function TimetableAttendanceView({ onMark }: TimetableAttendanceViewProps) {
  const [markEntry, setMarkEntry] = useState<Timetable | null>(null)
  const [marked, setMarked] = useState<Set<string>>(new Set())

  const handleMark = useCallback((data: { subjectId: string; date: Date; status: "present" | "absent" }) => {
    const key = `${data.subjectId}-${data.date.toISOString().split("T")[0]}`
    if (marked.has(key)) return
    setMarked((prev) => new Set(prev).add(key))
    onMark(data)
  }, [marked, onMark])

  const { timetable } = useStore()

  const grouped: Record<number, Timetable[]> = {}
  timetable.forEach((e) => {
    if (!grouped[e.dayOfWeek]) grouped[e.dayOfWeek] = []
    grouped[e.dayOfWeek].push(e)
  })
  Object.values(grouped).forEach((arr) => arr.sort((a, b) => a.startTime.localeCompare(b.startTime)))

  function isMarked(entry: Timetable): boolean {
    return marked.has(`${entry.subjectId}-${getLastOccurrence(entry.dayOfWeek)}`)
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="grid grid-cols-[auto_repeat(5,1fr)] text-xs">
        {/* Header */}
        <div className="p-2 font-semibold text-muted-foreground border-b bg-muted/30" />
        {[1, 2, 3, 4, 5].map((d) => (
          <div key={d} className="p-2 text-center font-semibold text-foreground border-b bg-muted/30">
            {DAYS[d]}
          </div>
        ))}

        {/* Hour rows */}
        {Array.from({ length: 10 }, (_, i) => i + 8).map((hour) => (
          <>
            <div key={`time-${hour}`} className="p-2 text-[10px] text-muted-foreground/60 border-b border-r text-right pr-3 tabular-nums">
              {hour > 12 ? hour - 12 : hour}{hour >= 12 ? "p" : "a"}
            </div>
            {[1, 2, 3, 4, 5].map((day) => {
              const entry = grouped[day]?.find((e) => {
                const h = parseInt(e.startTime)
                return h === hour
              })
              const alreadyMarked = entry && isMarked(entry)
              return (
                <div
                  key={`${day}-${hour}`}
                  className={cn(
                    "relative min-h-[52px] border-b border-r p-1 transition-colors",
                    alreadyMarked ? "cursor-default" : "cursor-pointer hover:bg-muted/20"
                  )}
                  onClick={() => { if (entry && !alreadyMarked) setMarkEntry(entry) }}
                >
                  {entry && (
                    <div
                      className="h-full w-full rounded-md p-1.5 flex flex-col justify-center"
                      style={{ backgroundColor: `${entry.color}10` }}
                    >
                      <span className="text-[11px] font-semibold truncate leading-tight flex items-center gap-1" style={{ color: entry.color }}>
                        {alreadyMarked && <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />}
                        {entry.subjectName}
                      </span>
                      <span className="text-[9px] text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {entry.startTime}
                        {alreadyMarked && <span className="text-green-600 font-medium">Done</span>}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        ))}
      </div>

      <QuickMarkDialog
        open={markEntry !== null}
        onOpenChange={(open) => { if (!open) setMarkEntry(null) }}
        subjectId={markEntry?.subjectId || ""}
        subjectName={markEntry?.subjectName || ""}
        color={markEntry?.color || "#888"}
        dayOfWeek={markEntry?.dayOfWeek ?? 0}
        onMark={handleMark}
      />
    </div>
  )
}
