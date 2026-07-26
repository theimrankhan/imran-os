import { useState } from "react"
import { motion } from "framer-motion"
import {
  GraduationCap, BookOpen, Clock, Sparkles, ArrowRight,
  CheckCircle2, AlertTriangle, Target, PenLine, Calendar,
  ChevronRight, Brain, FileText, RefreshCw, Sun, Moon
} from "lucide-react"
import { useStore } from "../stores/appStore"
import { cn } from "../lib/utils"
import ProgressRing from "../components/timetable/ProgressRing"

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 17) return "Good Afternoon"
  return "Good Evening"
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "numeric"
  }).format(date)
}

function getTimePeriod(hour: number): string {
  if (hour < 12) return "Morning"
  if (hour < 17) return "Afternoon"
  return "Evening"
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return days === 1 ? "Yesterday" : `${days}d ago`
}

export default function Dashboard() {
  const { attendance, timetable, notes, subjects, events, theme, setTheme } = useStore()

  const today = new Date()
  const todayDay = today.getDay()
  const nowMinutes = today.getHours() * 60 + today.getMinutes()
  const currentHour = today.getHours()

  const todayClasses = timetable
    .filter((e) => e.dayOfWeek === todayDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const currentLecture = todayClasses.find((l) => {
    const [sh, sm] = l.startTime.split(":").map(Number)
    const [eh, em] = l.endTime.split(":").map(Number)
    return nowMinutes >= sh * 60 + sm && nowMinutes < eh * 60 + em
  })

  const nextLecture = todayClasses.find((l) => {
    const [h, m] = l.startTime.split(":").map(Number)
    return h * 60 + m > nowMinutes
  })

  const completedClasses = todayClasses.filter((l) => {
    const [eh, em] = l.endTime.split(":").map(Number)
    return eh * 60 + em < nowMinutes
  }).length

  const pendingNotes = notes.filter((n) => !n.completed).length
  const recentNotes = [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  const atRisk = attendance.filter((a) => a.percentage < 75)
  const overallPct = attendance.length > 0
    ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length)
    : 0

  const upcomingExams = events
    .filter((e) => (e.type === "exam" || e.type === "assignment") && new Date(e.date) > today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  // Find last session (most recently updated incomplete note)
  const lastSession = [...notes]
    .filter((n) => !n.completed)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]

  // Build today's timeline
  const timelineSlots = [
    { period: "Morning", hours: "8–12", icon: Sun },
    { period: "Afternoon", hours: "12–5", icon: Sun },
    { period: "Evening", hours: "5–10", icon: Moon },
  ].map((slot) => {
    const periodClasses = todayClasses.filter((l) => {
      const h = parseInt(l.startTime)
      if (slot.period === "Morning") return h >= 8 && h < 12
      if (slot.period === "Afternoon") return h >= 12 && h < 17
      return h >= 17 && h < 22
    })
    return { ...slot, classes: periodClasses }
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-8 lg:px-8 lg:py-10">
        {/* Greeting */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{getGreeting()}, Imran</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{formatDate(today)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <span className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full",
              overallPct >= 75 ? "bg-green-500/10 text-green-600" : overallPct >= 60 ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"
            )}>
              {overallPct}% attendance
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Main Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Last Session */}
            {lastSession && (
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-1.5 mb-3">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold">Continue Last Session</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: subjects.find((s) => s.id === lastSession.subjectId)?.color || "#888" }}>
                      {lastSession.subjectName.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{lastSession.subjectName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Lecture {lastSession.lectureNumber} · {timeAgo(lastSession.updatedAt)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <ProgressRing percentage={lastSession.content ? Math.min(Math.round(lastSession.content.length / 200 * 100), 100) : 0} size={20} strokeWidth={2.5} />
                        <span className="text-[10px] text-muted-foreground">{lastSession.title}</span>
                      </div>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors shrink-0">
                      Continue
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Today's Timeline */}
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Today's Timeline</h2>
              </div>
              <div className="space-y-3">
                {timelineSlots.map((slot) => {
                  const Icon = slot.icon
                  const isActive = getTimePeriod(currentHour) === slot.period
                  return (
                    <div key={slot.period} className={cn("rounded-lg p-3 transition-all", isActive ? "bg-primary/[0.03] ring-1 ring-primary/10" : "bg-muted/10")}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground/40")} />
                          <span className={cn("text-xs font-semibold", isActive ? "text-primary" : "text-muted-foreground")}>
                            {slot.period}
                          </span>
                          <span className="text-[9px] text-muted-foreground/50">({slot.hours})</span>
                        </div>
                        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                      </div>
                      {slot.classes.length > 0 ? (
                        <div className="space-y-1.5">
                          {slot.classes.map((lec) => {
                            const lecNotes = notes.filter((n) => n.subjectId === lec.subjectId)
                            const isOngoing = currentLecture?.id === lec.id
                            const isPast = (() => {
                              const [eh, em] = lec.endTime.split(":").map(Number)
                              return eh * 60 + em < nowMinutes
                            })()
                            return (
                              <div key={lec.id} className={cn(
                                "flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all",
                                isOngoing ? "bg-primary/5" : "hover:bg-muted/20"
                              )}>
                                <div className={cn(
                                  "h-2 w-2 rounded-full shrink-0",
                                  isOngoing ? "bg-primary animate-pulse" : isPast ? "bg-green-500" : "bg-muted-foreground/30"
                                )} />
                                <span className="text-xs font-medium flex-1 truncate" style={{ color: lec.color }}>
                                  {lec.subjectName}
                                </span>
                                <span className="text-[9px] text-muted-foreground">{lec.startTime}</span>
                                {isPast && (
                                  <span className="text-[8px] px-1 py-0.5 rounded bg-green-500/10 text-green-600 font-medium">Done</span>
                                )}
                                {isOngoing && (
                                  <span className="text-[8px] px-1 py-0.5 rounded bg-primary/10 text-primary font-medium">Live</span>
                                )}
                                {lecNotes.length === 0 && !isPast && (
                                  <span className="text-[8px] px-1 py-0.5 rounded bg-amber-500/10 text-amber-600 font-medium">Notes</span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground/50 italic">Free period</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Today's Progress */}
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Today's Progress
                </h2>
                <span className="text-xs text-muted-foreground">
                  {completedClasses}/{todayClasses.length} classes done
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${todayClasses.length > 0 ? (completedClasses / todayClasses.length) * 100 : 0}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { label: "Classes", value: todayClasses.length, icon: GraduationCap, color: "text-primary" },
                  { label: "Completed", value: completedClasses, icon: CheckCircle2, color: "text-green-600" },
                  { label: "Pending Notes", value: pendingNotes, icon: PenLine, color: pendingNotes > 0 ? "text-amber-600" : "text-green-600" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-muted/30 p-3 text-center">
                    <s.icon className={cn("h-4 w-4 mx-auto mb-1", s.color)} />
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Current / Next Lecture */}
            {(currentLecture || nextLecture) && (
              <div className="rounded-xl border bg-card overflow-hidden">
                {currentLecture && (
                  <div className="p-5 border-b border-border/50">
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Current Lecture</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: currentLecture.color }}>
                        {currentLecture.subjectName.slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold" style={{ color: currentLecture.color }}>{currentLecture.subjectName}</h3>
                        <p className="text-xs text-muted-foreground">
                          {currentLecture.startTime} – {currentLecture.endTime}
                          {currentLecture.room && ` · ${currentLecture.room}`}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <span className="text-[9px] px-2 py-1 rounded-full bg-green-500/10 text-green-600 font-medium">Take Notes</span>
                        <span className="text-[9px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">Mark ✓</span>
                      </div>
                    </div>
                  </div>
                )}
                {nextLecture && !currentLecture && (
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Next Class</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: nextLecture.color }}>
                        {nextLecture.subjectName.slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold" style={{ color: nextLecture.color }}>{nextLecture.subjectName}</h3>
                        <p className="text-xs text-muted-foreground">
                          {nextLecture.startTime} · {nextLecture.room || "No room"}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                        {nextLecture.startTime}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recent Notes */}
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Recent Notes
                </h2>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
              </div>
              {recentNotes.length > 0 ? (
                <div className="space-y-1">
                  {recentNotes.map((note) => (
                    <div key={note.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group">
                      <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{note.title}</p>
                        <p className="text-[10px] text-muted-foreground">{note.subjectName}</p>
                      </div>
                      <span className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded font-medium",
                        note.completed ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                      )}>
                        {note.completed ? "Done" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground/60">
                  No notes yet. Start writing!
                </div>
              )}
            </div>

            {/* At Risk Subjects */}
            {atRisk.length > 0 && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.02] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <h2 className="text-sm font-semibold">Attendance Alert</h2>
                </div>
                <div className="space-y-2">
                  {atRisk.slice(0, 3).map((sub) => (
                    <div key={sub.subjectId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/5 transition-colors">
                      <ProgressRing percentage={sub.percentage} size={28} strokeWidth={3} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{sub.subjectName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {sub.percentage.toFixed(1)}% — Need {Math.ceil((75 * sub.total / 100 - sub.present) / (1 - 75/100))} more classes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Exams */}
            {upcomingExams.length > 0 && (
              <div className="rounded-xl border bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-destructive" />
                  <h2 className="text-sm font-semibold">Upcoming Exams & Assignments</h2>
                </div>
                <div className="space-y-2">
                  {upcomingExams.map((exam) => {
                    const daysLeft = Math.ceil((new Date(exam.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                    return (
                      <div key={exam.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="h-8 w-8 rounded-lg bg-destructive/5 flex items-center justify-center shrink-0">
                          <Calendar className="h-3.5 w-3.5 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{exam.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(exam.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            {exam.startTime && ` at ${exam.startTime}`}
                          </p>
                        </div>
                        <span className={cn(
                          "text-[10px] font-semibold tabular-nums",
                          daysLeft <= 3 ? "text-red-500" : daysLeft <= 7 ? "text-amber-500" : "text-muted-foreground"
                        )}>
                          {daysLeft === 0 ? "Today" : daysLeft === 1 ? "Tomorrow" : `${daysLeft}d`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* AI Suggestion */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.02] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-semibold">AI Suggestion</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentLecture
                  ? `Review ${currentLecture.subjectName} — focus on key concepts from today's lecture. Open notes to generate a summary and practice questions.`
                  : nextLecture
                    ? `Prepare for ${nextLecture.subjectName}. Check previous notes and review pending topics.`
                    : "Free time! Catch up on pending notes or revise weak subjects."}
              </p>
              <div className="flex gap-2 mt-3">
                {["Generate Summary", "Practice MCQs", "Revision Notes"].map((action) => (
                  <button key={action} className="text-[10px] px-2.5 py-1 rounded-full border bg-card hover:bg-muted transition-colors font-medium text-muted-foreground hover:text-foreground">
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Quick Actions & Stats */}
          <div className="space-y-4">
            {/* Overall Attendance */}
            <div className="rounded-xl border bg-card p-5 text-center">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Overall Attendance</h2>
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <ProgressRing percentage={overallPct} size={80} strokeWidth={6} showTarget />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-green-500/5 p-2">
                  <p className="font-bold text-green-600">{attendance.reduce((s, a) => s + a.present, 0)}</p>
                  <p className="text-[9px] text-muted-foreground">Present</p>
                </div>
                <div className="rounded-lg bg-red-500/5 p-2">
                  <p className="font-bold text-red-600">{attendance.reduce((s, a) => s + a.absent, 0)}</p>
                  <p className="text-[9px] text-muted-foreground">Absent</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: PenLine, label: "New Note", color: "text-primary", bg: "bg-primary/5" },
                  { icon: Calendar, label: "Calendar", color: "text-blue-500", bg: "bg-blue-500/5" },
                  { icon: Target, label: "Attendance", color: "text-green-600", bg: "bg-green-500/5" },
                  { icon: Brain, label: "AI Study", color: "text-amber-500", bg: "bg-amber-500/5" },
                ].map((action) => (
                  <button key={action.label} className={cn("rounded-lg p-3 text-center transition-colors hover:shadow-sm border", action.bg)}>
                    <action.icon className={cn("h-4 w-4 mx-auto mb-1", action.color)} />
                    <span className="text-[10px] font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Quick Stats */}
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Subjects</h2>
              <div className="space-y-2">
                {subjects.slice(0, 5).map((sub) => {
                  const att = attendance.find((a) => a.subjectId === sub.id)
                  const pct = att?.percentage ?? 0
                  return (
                    <div key={sub.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                      <span className="text-xs font-medium flex-1 truncate">{sub.name}</span>
                      <span className={cn(
                        "text-[10px] font-semibold tabular-nums",
                        pct >= 75 ? "text-green-600" : pct >= 65 ? "text-amber-600" : "text-red-600"
                      )}>
                        {Math.round(pct)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
