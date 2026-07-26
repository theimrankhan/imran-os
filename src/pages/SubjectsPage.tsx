import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  BookOpen, Plus, GraduationCap, User, Hash, FileText,
  Clock, ArrowRight, TrendingUp, AlertTriangle
} from "lucide-react"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { ScrollArea } from "../components/ui/scroll-area"
import AddSubjectDialog from "../components/subjects/AddSubjectDialog"
import ProgressRing from "../components/timetable/ProgressRing"
import { useStore } from "../stores/appStore"
import { cn } from "../lib/utils"

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getLectureStatus(lec: { id: string; startTime: string; endTime: string }, nowMinutes: number): "completed" | "ongoing" | "upcoming" {
  const [sh, sm] = lec.startTime.split(":").map(Number)
  const [eh, em] = lec.endTime.split(":").map(Number)
  const start = sh * 60 + sm
  const end = eh * 60 + em
  if (nowMinutes >= end) return "completed"
  if (nowMinutes >= start) return "ongoing"
  return "upcoming"
}

export default function SubjectsPage() {
  const { subjects, attendance, notes, timetable } = useStore()
  const [dialogOpen, setDialogOpen] = useState(false)

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => {
      const aAtt = attendance.find((at) => at.subjectId === a.id)
      const bAtt = attendance.find((at) => at.subjectId === b.id)
      return (aAtt?.percentage ?? 100) - (bAtt?.percentage ?? 100)
    })
  }, [subjects, attendance])

  const today = new Date()
  const todayDay = today.getDay()
  const nowMinutes = today.getHours() * 60 + today.getMinutes()

  function getNextLecture(subjectId: string) {
    return timetable
      .filter((t) => t.subjectId === subjectId && t.dayOfWeek >= todayDay)
      .sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek
        return a.startTime.localeCompare(b.startTime)
      })[0] || null
  }

  function getLectureTimeline(subjectId: string) {
    return timetable
      .filter((t) => t.subjectId === subjectId)
      .sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek
        return a.startTime.localeCompare(b.startTime)
      })
      .slice(-5)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8 lg:py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{subjects.length} subjects · Semester overview</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Subject
          </Button>
        </div>

        <AddSubjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />

        {subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No subjects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your first subject to get started</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Subject
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sortedSubjects.map((subject, i) => {
              const att = attendance.find((a) => a.subjectId === subject.id)
              const pct = att?.percentage ?? 0
              const noteCount = notes.filter((n) => n.subjectId === subject.id).length
              const nextLecture = getNextLecture(subject.id)

              return (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border bg-card overflow-hidden hover:shadow-sm transition-shadow"
                >
                  {/* Header */}
                  <div className="h-1.5" style={{ backgroundColor: subject.color }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: subject.color }}>
                          {subject.code?.slice(0, 2) || subject.name.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{subject.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {subject.code} · Sem {subject.semester}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1.5">
                        <ProgressRing percentage={pct} size={32} strokeWidth={3} />
                        <div>
                          <p className={cn(
                            "text-xs font-semibold tabular-nums",
                            pct >= 75 ? "text-green-600" : pct >= 65 ? "text-amber-600" : "text-red-600"
                          )}>
                            {Math.round(pct)}%
                          </p>
                          <p className="text-[9px] text-muted-foreground">Attendance</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold">{noteCount}</p>
                        <p className="text-[9px] text-muted-foreground">Notes</p>
                      </div>
                      {subject.credits && (
                        <div className="text-center">
                          <p className="text-sm font-semibold">{subject.credits}</p>
                          <p className="text-[9px] text-muted-foreground">Credits</p>
                        </div>
                      )}
                    </div>

                    {/* Attendance Status */}
                    {pct < 75 && (
                      <div className="flex items-center gap-1.5 text-[10px] text-red-600 bg-red-500/5 rounded-lg px-2.5 py-1.5 mb-3">
                        <AlertTriangle className="h-3 w-3" />
                        At risk — Need {Math.ceil((75 * (att?.total || 0) / 100 - (att?.present || 0)) / (1 - 75/100))} more classes
                      </div>
                    )}

                    {/* Next Lecture */}
                    {nextLecture && (
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/30 rounded-lg px-2.5 py-1.5 mb-3">
                        <Clock className="h-3 w-3" />
                        Next: {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][nextLecture.dayOfWeek]} · {nextLecture.startTime}
                        {nextLecture.room && ` · ${nextLecture.room}`}
                      </div>
                    )}

                    {/* Professor */}
                    {subject.professor && (
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-3">
                        <User className="h-3 w-3" />
                        {subject.professor}
                      </div>
                    )}

                    {/* Lecture Timeline */}
                    {(() => {
                      const timeline = getLectureTimeline(subject.id)
                      if (timeline.length === 0) return null
                      return (
                        <div className="mb-3">
                          <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Recent Lectures</p>
                          <div className="space-y-0.5">
                            {timeline.map((lec) => {
                              const status = getLectureStatus(lec, nowMinutes)
                              const lecNotes = notes.filter((n) => n.subjectId === lec.subjectId)
                              return (
                                <div key={lec.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/20 transition-colors">
                                  <div className={cn(
                                    "h-1.5 w-1.5 rounded-full shrink-0",
                                    status === "completed" ? "bg-green-500" :
                                    status === "ongoing" ? "bg-primary animate-pulse" :
                                    lec.dayOfWeek < todayDay ? "bg-muted-foreground/30" : "bg-muted-foreground/20"
                                  )} />
                                  <span className="text-[10px] text-muted-foreground flex-1">
                                    {DAY_LABELS[lec.dayOfWeek]} · {lec.startTime}
                                  </span>
                                  <span className={cn(
                                    "text-[8px] px-1 py-0.5 rounded font-medium",
                                    status === "completed" && lecNotes.length > 0 ? "bg-green-500/10 text-green-600" :
                                    status === "completed" && lecNotes.length === 0 ? "bg-amber-500/10 text-amber-600" :
                                    status === "ongoing" ? "bg-primary/10 text-primary" :
                                    "text-muted-foreground/40"
                                  )}>
                                    {status === "completed" && lecNotes.length > 0 ? "Done" :
                                     status === "completed" && lecNotes.length === 0 ? "No notes" :
                                     status === "ongoing" ? "Live" : "—"}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}

                    {/* Actions */}
                    <div className="flex gap-1.5 pt-2 border-t">
                      <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1">
                        <FileText className="h-3 w-3" />
                        View Notes
                      </Button>
                      <Button variant="outline" size="sm" className="text-[10px] h-7 gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Attendance
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
