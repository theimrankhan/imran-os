import { useMemo } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, BookOpen, FileText, ClipboardList, ShieldCheck } from "lucide-react"
import { useStore } from "../../stores/appStore"
import { cn } from "../../lib/utils"
import ProgressRing from "./ProgressRing"
import type { Timetable } from "../../types"

interface SubjectSidebarProps {
  selectedSubject: string | null
  onSelectSubject: (id: string | null) => void
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getNextLecture(entries: Timetable[]): Timetable | null {
  const now = new Date()
  const currentDay = now.getDay()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  let best: Timetable | null = null
  let bestDiff = Infinity

  for (const entry of entries) {
    const [h, m] = entry.startTime.split(":").map(Number)
    const entryMinutes = h * 60 + m
    let diff = (entry.dayOfWeek - currentDay) * 1440 + (entryMinutes - currentMinutes)
    if (diff <= 0) diff += 7 * 1440
    if (diff < bestDiff) {
      bestDiff = diff
      best = entry
    }
  }

  return best
}

function formatLectureTime(entry: Timetable): string {
  const [h, m] = entry.startTime.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const hour = h % 12 || 12
  return `${DAY_LABELS[entry.dayOfWeek]} ${hour}:${m.toString().padStart(2, "0")} ${period}`
}

export default function SubjectSidebar({ selectedSubject, onSelectSubject }: SubjectSidebarProps) {
  const { subjects, attendance, timetable, notes, events } = useStore()

  const subjectData = useMemo(() => {
    return subjects
      .map((sub) => {
        const att = attendance.find((a) => a.subjectId === sub.id)
        const total = att?.total ?? 0
        const present = att?.present ?? 0
        const percentage = att?.percentage ?? 0
        const canMiss = total > 0 ? Math.max(0, Math.floor((present - 0.75 * total) / 0.75)) : 0
        const lectures = timetable.filter((t) => t.subjectId === sub.id)
        const nextLecture = getNextLecture(lectures)
        const noteCount = notes.filter((n) => n.subjectId === sub.id).length
        const assignmentCount = events.filter(
          (e) => e.subjectId === sub.id && e.type === "assignment"
        ).length

        return {
          ...sub,
          percentage,
          canMiss,
          nextLecture,
          noteCount,
          assignmentCount,
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [subjects, attendance, timetable, notes, events])

  return (
    <div className="w-64 shrink-0 border-r bg-card overflow-y-auto">
      <div className="p-3 border-b">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Subjects
        </h2>
      </div>
      <div className="p-2 space-y-1">
        <button
          onClick={() => onSelectSubject(null)}
          className={cn(
            "w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors",
            selectedSubject === null
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted/50"
          )}
        >
          All Subjects
        </button>
        {subjectData.map((sub) => (
          <motion.button
            key={sub.id}
            layout
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => onSelectSubject(sub.id === selectedSubject ? null : sub.id)}
            className={cn(
              "w-full text-left px-3 py-3 rounded-lg transition-colors group relative",
              selectedSubject === sub.id
                ? "bg-muted/80 ring-1 ring-border"
                : "hover:bg-muted/30"
            )}
          >
            <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-opacity"
              style={{
                backgroundColor: sub.color,
                opacity: selectedSubject === sub.id ? 1 : 0,
              }}
            />
            <div className="flex items-start gap-3 pl-1">
              <div
                className="h-2.5 w-2.5 rounded-full shrink-0 mt-1.5"
                style={{ backgroundColor: sub.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold truncate">{sub.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <ProgressRing percentage={sub.percentage} size={24} strokeWidth={2.5} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectSubject(sub.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted-foreground/10"
                    >
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                {sub.professor && (
                  <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">
                    {sub.professor}
                  </p>
                )}
                {sub.nextLecture && (
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                    Next {formatLectureTime(sub.nextLecture)}
                    {sub.nextLecture.room && ` · ${sub.nextLecture.room}`}
                  </p>
                )}
                <div className="flex items-center gap-2.5 mt-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    {sub.noteCount}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <ClipboardList className="h-3 w-3" />
                    {sub.assignmentCount}
                  </span>
                  {sub.canMiss > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                      <ShieldCheck className="h-3 w-3" />
                      {sub.canMiss}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
        {subjectData.length === 0 && (
          <div className="text-center py-10 text-xs text-muted-foreground">
            <BookOpen className="h-6 w-6 mx-auto mb-2 opacity-30" />
            No subjects yet
          </div>
        )}
      </div>
    </div>
  )
}
