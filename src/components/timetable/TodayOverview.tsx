import { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Clock, MapPin, ChevronRight, AlertTriangle, NotebookPen, Play,
  ListChecks, CalendarDays, User, FileText, Brain, CheckCircle2,
  Target, GraduationCap, BookOpen,
} from "lucide-react"
import { useStore } from "../../stores/appStore"
import { cn } from "../../lib/utils"
import ProgressRing from "./ProgressRing"

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export default function TodayOverview() {
  const { timetable, attendance, notes, events, subjects } = useStore()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const today = now.getDay()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const todayLectures = useMemo(
    () =>
      timetable
        .filter((t) => t.dayOfWeek === today)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [timetable, today],
  )

  const currentLecture = todayLectures.find((l) => {
    const [sh, sm] = l.startTime.split(":").map(Number)
    const [eh, em] = l.endTime.split(":").map(Number)
    const start = sh * 60 + sm
    const end = eh * 60 + em
    return nowMinutes >= start && nowMinutes < end
  })

  const nextLecture = todayLectures.find((l) => {
    const [sh, sm] = l.startTime.split(":").map(Number)
    return sh * 60 + sm > nowMinutes
  })

  const currentSubject = currentLecture
    ? subjects.find((s) => s.id === currentLecture.subjectId)
    : undefined

  const pendingNotes = useMemo(
    () =>
      notes
        .filter((n) => !n.completed)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [notes],
  )

  const lastSession = pendingNotes[0]

  const atRisk = attendance.filter((a) => a.percentage < 75)

  const upcomingAssignments = useMemo(
    () =>
      events
        .filter((e) => e.type === "assignment" && new Date(e.date).getTime() >= now.getTime())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [events, now],
  )

  const upcomingExam = useMemo(
    () =>
      events
        .filter((e) => e.type === "exam" && new Date(e.date).getTime() >= now.getTime())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 1)[0],
    [events, now],
  )

  const countdown = useMemo(() => {
    if (!nextLecture) return ""
    const [h, m] = nextLecture.startTime.split(":").map(Number)
    const diff = h * 60 + m - nowMinutes
    if (diff <= 0) return "Now"
    const hours = Math.floor(diff / 60)
    const mins = diff % 60
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }, [nextLecture, nowMinutes])

  const aiTip = useMemo(() => {
    if (currentLecture)
      return `Review ${currentLecture.subjectName} notes and focus on key concepts.`
    if (nextLecture)
      return `Prepare for ${nextLecture.subjectName} — skim the material beforehand.`
    const nextEvent = upcomingExam || upcomingAssignments[0]
    if (nextEvent) return `Plan your study schedule for "${nextEvent.title}".`
    return "Organise your notes and review pending tasks."
  }, [currentLecture, nextLecture, upcomingExam, upcomingAssignments])

  return (
    <div className="w-72 shrink-0 border-l bg-card overflow-y-auto">
      <div className="p-4 border-b border-border/50">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
          Overview
        </h2>
        <p className="text-sm font-medium">
          {now.toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
        }}
        initial="hidden"
        animate="visible"
        className="p-3 space-y-2.5"
      >
        {/* Current Lecture */}
        <motion.div variants={fadeIn}>
          {currentLecture ? (
            <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3.5 shadow-sm">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">
                  Current Lecture
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: currentLecture.color }}
                />
                <h3
                  className="text-sm font-bold truncate"
                  style={{ color: currentLecture.color }}
                >
                  {currentLecture.subjectName}
                </h3>
              </div>
              <div className="space-y-1 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{currentLecture.startTime} – {currentLecture.endTime}</span>
                </div>
                {currentLecture.room && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{currentLecture.room}</span>
                  </div>
                )}
                {currentSubject?.professor && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3 shrink-0" />
                    <span>{currentSubject.professor}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground/40" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Current Lecture
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground/60">
                {todayLectures.length > 0 ? "Between classes" : "No classes scheduled today"}
              </p>
            </div>
          )}
        </motion.div>

        {/* Next Lecture */}
        <motion.div variants={fadeIn}>
          {nextLecture ? (
            <div className="rounded-xl border border-border/50 bg-card p-3.5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Next Lecture
                </span>
                <span className="ml-auto text-[10px] font-mono font-medium tabular-nums text-primary">
                  in {countdown}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: nextLecture.color }}
                />
                <span className="text-sm font-semibold truncate">{nextLecture.subjectName}</span>
                <span className="text-[11px] text-muted-foreground ml-auto tabular-nums">
                  {nextLecture.startTime}
                </span>
              </div>
              {nextLecture.room && (
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground/70">
                  <MapPin className="h-2.5 w-2.5" />
                  <span>{nextLecture.room}</span>
                </div>
              )}
            </div>
          ) : currentLecture && todayLectures.length > 1 ? (
            <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Next Lecture
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground/60">No more classes today</p>
            </div>
          ) : null}
        </motion.div>

        {/* Pending Notes */}
        <motion.div variants={fadeIn}>
          <div className="rounded-xl border border-border/50 bg-card p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <NotebookPen className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Notes
              </span>
              {pendingNotes.length > 0 && (
                <span className="ml-auto text-[10px] font-medium tabular-nums text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  {pendingNotes.length}
                </span>
              )}
            </div>
            {pendingNotes.length > 0 ? (
              <div className="space-y-1">
                {pendingNotes.slice(0, 3).map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate">{note.title}</p>
                      <p className="text-[9px] text-muted-foreground/70">{note.subjectName}</p>
                    </div>
                    <span className="text-[8px] px-1.5 py-0.5 rounded font-medium bg-amber-500/10 text-amber-600 shrink-0">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                All notes completed
              </div>
            )}
          </div>
        </motion.div>

        {/* Assignments */}
        <motion.div variants={fadeIn}>
          <div className="rounded-xl border border-border/50 bg-card p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <ListChecks className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Assignments
              </span>
              {upcomingAssignments.length > 0 && (
                <span className="ml-auto text-[10px] font-medium tabular-nums text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded">
                  {upcomingAssignments.length}
                </span>
              )}
            </div>
            {upcomingAssignments.length > 0 ? (
              <div className="space-y-1">
                {upcomingAssignments.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate">{a.title}</p>
                      <p className="text-[9px] text-muted-foreground/70">
                        Due {new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <CalendarDays className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                No pending assignments
              </div>
            )}
          </div>
        </motion.div>

        {/* Continue Last Session */}
        <motion.div variants={fadeIn}>
          <div className="rounded-xl border border-border/50 bg-card p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <Play className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Continue Last Session
              </span>
            </div>
            {lastSession ? (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 cursor-pointer hover:bg-indigo-500/10 transition-colors">
                <BookOpen className="h-4 w-4 text-indigo-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium truncate">{lastSession.title}</p>
                  <p className="text-[9px] text-muted-foreground/70">{lastSession.subjectName}</p>
                </div>
                <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                <FileText className="h-3 w-3 text-muted-foreground/40" />
                No saved sessions
              </div>
            )}
          </div>
        </motion.div>

        {/* Attendance Alerts */}
        <motion.div variants={fadeIn}>
          {atRisk.length > 0 ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-3.5 shadow-sm">
              <div className="flex items-center gap-2 mb-2.5">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                <span className="text-[10px] font-semibold text-red-600 uppercase tracking-wider">
                  Attendance Alert
                </span>
                <span className="ml-auto text-[10px] font-medium tabular-nums text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded">
                  {atRisk.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {atRisk.slice(0, 3).map((sub) => (
                  <div key={sub.subjectId} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-red-500/5">
                    <ProgressRing percentage={sub.percentage} size={24} strokeWidth={2.5} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate">{sub.subjectName}</p>
                      <p className="text-[9px] text-muted-foreground/70">
                        {sub.percentage.toFixed(1)}% – Need {Math.ceil((75 * sub.total - 100 * sub.present) / (100 - 75))} more
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : attendance.length > 0 ? (
            <div className="rounded-xl border border-green-500/20 bg-green-500/[0.02] p-3.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">
                  Attendance
                </span>
                <span className="ml-auto text-[10px] text-green-600/70">All above 75%</span>
              </div>
            </div>
          ) : null}
        </motion.div>

        {/* AI Suggestion */}
        <motion.div variants={fadeIn}>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">
                AI Suggestion
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              {aiTip}
            </p>
          </div>
        </motion.div>

        {/* Upcoming Exam */}
        <motion.div variants={fadeIn}>
          {upcomingExam ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.03] p-3.5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-3.5 w-3.5 text-rose-500" />
                <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider">
                  Upcoming Exam
                </span>
                <span className="ml-auto text-[10px] font-medium tabular-nums text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded">
                  {Math.ceil(
                    (new Date(upcomingExam.date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
                  )}d
                </span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-rose-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{upcomingExam.title}</p>
                  <p className="text-[10px] text-muted-foreground/70">
                    {new Date(upcomingExam.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {upcomingExam.startTime && ` · ${upcomingExam.startTime}`}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-3.5 w-3.5 text-muted-foreground/40" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Upcoming Exam
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground/60">No exams scheduled</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
