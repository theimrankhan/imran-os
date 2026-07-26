import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ChevronLeft, ChevronRight, Plus, LayoutGrid, CalendarDays,
  GraduationCap, Calendar, Target, Clock
} from "lucide-react"
import { Button } from "../components/ui/button"
import { useStore } from "../stores/appStore"
import { cn } from "../lib/utils"
import SubjectSidebar from "../components/timetable/SubjectSidebar"
import SmartLectureCard from "../components/timetable/SmartLectureCard"
import EmptySlot from "../components/timetable/EmptySlot"
import StatsBar from "../components/timetable/StatsBar"
import LectureWorkspace from "../components/timetable/LectureWorkspace"
import AddLectureDialog from "../components/timetable/AddLectureDialog"
import type { Timetable } from "../types"

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8)
const HOUR_HEIGHT = 72

function getWeekStart(date: Date, startDay = 1): Date {
  const d = new Date(date)
  const day = d.getDay()
  const offset = ((day - startDay) % 7 + 7) % 7
  d.setDate(d.getDate() - offset)
  d.setHours(0, 0, 0, 0)
  return d
}

function getMinutesFromMidnight(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function getTimeToY(time: string): number {
  return ((getMinutesFromMidnight(time) - 8 * 60) / 60) * HOUR_HEIGHT
}

function getDurationMinutes(start: string, end: string): number {
  return getMinutesFromMidnight(end) - getMinutesFromMidnight(start)
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good Morning"
  if (h < 17) return "Good Afternoon"
  return "Good Evening"
}

function getDaysRemaining(weekStart: Date): number {
  const now = new Date()
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function TimetablePage() {
  const { timetable, settings, attendance, subjects } = useStore()
  const weekStartsOn = settings.calendar?.weekStartsOn ?? 1

  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date(), weekStartsOn))
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [view, setView] = useState<"week" | "day">("week")
  const [workspaceEntry, setWorkspaceEntry] = useState<Timetable | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Timetable | null>(null)
  const [showWeekends, setShowWeekends] = useState(settings.timetable?.showWeekends ?? false)

  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const dayColumns = showWeekends ? 7 : 5

  const columnDates = useMemo(() => {
    return Array.from({ length: dayColumns }, (_, i) => {
      const d = new Date(currentWeekStart)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [currentWeekStart, dayColumns])

  const filteredEntries = useMemo(() => {
    return timetable.filter((e) => {
      if (selectedSubject && e.subjectId !== selectedSubject) return false
      return true
    })
  }, [timetable, selectedSubject])

  const entriesByDay = useMemo(() => {
    const map: Record<number, Timetable[]> = {}
    columnDates.forEach((date) => {
      const day = date.getDay()
      map[day] = []
    })
    filteredEntries.forEach((e) => {
      if (map[e.dayOfWeek] !== undefined) map[e.dayOfWeek].push(e)
    })
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.startTime.localeCompare(b.startTime)))
    return map
  }, [filteredEntries, columnDates])

  const todayDay = now.getDay()
  const nowMinutes = getMinutesFromMidnight(`${now.getHours()}:${now.getMinutes()}`)
  const nowTop = ((nowMinutes - 8 * 60) / 60) * HOUR_HEIGHT
  const isTodayVisible = columnDates.some((d) => d.getDay() === todayDay)

  const ongoingEntry = filteredEntries.find((e) => {
    if (e.dayOfWeek !== todayDay) return false
    const start = getMinutesFromMidnight(e.startTime)
    const end = getMinutesFromMidnight(e.endTime)
    return nowMinutes >= start && nowMinutes < end
  })

  const totalPct = attendance.length > 0
    ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length)
    : 0
  const semester = subjects.length > 0 ? subjects[0].semester : null
  const greeting = getGreeting()
  const daysRemaining = getDaysRemaining(currentWeekStart)

  const todayLectures = timetable.filter((t) => t.dayOfWeek === todayDay)
  const lecturesToday = todayLectures.length

  function handlePrev() {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 7)
      return d
    })
  }

  function handleNext() {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 7)
      return d
    })
  }

  function handleToday() {
    setCurrentWeekStart(getWeekStart(new Date(), weekStartsOn))
  }

  function handleCardClick(entry: Timetable) {
    setWorkspaceEntry(entry)
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <SubjectSidebar
        selectedSubject={selectedSubject}
        onSelectSubject={setSelectedSubject}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="shrink-0 border-b bg-card">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-sm font-bold">
                  {greeting}, Imran
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  {semester && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      Semester {semester}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {currentWeekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {' – '}
                    {new Date(currentWeekStart.getTime() + 6 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3 ml-4 pl-4 border-l">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{daysRemaining}d remaining</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Target className={cn("h-3 w-3", totalPct >= 75 ? "text-green-600" : "text-red-500")} />
                  <span className={cn(totalPct >= 75 ? "text-green-600" : "text-red-500")}>
                    {totalPct}% attendance
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <CalendarDays className="h-3 w-3 text-primary" />
                  <span className="text-muted-foreground">{lecturesToday} today</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border bg-card p-0.5 shadow-sm">
                <Button variant="ghost" size="icon-sm" onClick={handlePrev} className="rounded-md h-7 w-7">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <button onClick={handleToday} className="px-2 text-xs font-medium hover:text-primary transition-colors">
                  Today
                </button>
                <Button variant="ghost" size="icon-sm" onClick={handleNext} className="rounded-md h-7 w-7">
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex rounded-lg border bg-card p-0.5">
                <button
                  onClick={() => setView("week")}
                  className={cn("px-2 py-1 rounded-md text-[10px] font-medium transition-colors", view === "week" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
                >
                  <LayoutGrid className="h-3 w-3 inline mr-1" />
                  Week
                </button>
                <button
                  onClick={() => setView("day")}
                  className={cn("px-2 py-1 rounded-md text-[10px] font-medium transition-colors", view === "day" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
                >
                  <CalendarDays className="h-3 w-3 inline mr-1" />
                  Day
                </button>
              </div>

              <div className="h-4 w-px bg-border" />

              <Button variant="outline" size="icon-sm" onClick={() => setShowWeekends(!showWeekends)} className="h-7 text-[10px] px-2">
                {showWeekends ? "5-day" : "7-day"}
              </Button>

              <Button size="sm" onClick={() => { setEditingEntry(null); setDialogOpen(true) }} className="h-7 text-xs gap-1">
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-b bg-muted/5">
          <div className="px-5 py-2">
            <StatsBar />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
          {view === "week" ? (
            <div className="p-4">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border bg-card shadow-sm overflow-hidden"
              >
                <div className="min-w-[700px]">
                  <div
                    className="grid sticky top-0 z-10 bg-card border-b"
                    style={{ gridTemplateColumns: `56px repeat(${dayColumns},1fr)` }}
                  >
                    <div className="h-10 flex items-center justify-center text-[9px] font-medium text-muted-foreground uppercase tracking-widest border-r bg-muted/30">
                      GMT
                    </div>
                    {columnDates.map((date, idx) => {
                      const dayOfWeek = date.getDay()
                      const isToday = dayOfWeek === todayDay
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "h-10 flex flex-col items-center justify-center border-r last:border-r-0 bg-muted/30",
                            isToday && "bg-primary/5"
                          )}
                        >
                          <span className={cn(
                            "text-[10px] font-semibold uppercase tracking-wider",
                            isToday && "text-primary"
                          )}>
                            {DAY_LABELS[dayOfWeek]}
                          </span>
                          <span className={cn(
                            "text-[10px] tabular-nums leading-none",
                            isToday ? "text-primary font-bold" : "text-muted-foreground"
                          )}>
                            {date.getDate()}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div
                    className="grid relative"
                    style={{ gridTemplateColumns: `56px repeat(${dayColumns},1fr)` }}
                  >
                    <div className="col-span-1">
                      {HOURS.map((hour) => (
                        <div key={hour} className="h-[72px] flex items-start justify-center pt-1 border-b border-r bg-muted/[0.02]">
                          <span className="text-[9px] font-medium text-muted-foreground/50 tabular-nums">
                            {hour > 12 ? hour - 12 : hour}{hour >= 12 ? "p" : "a"}
                          </span>
                        </div>
                      ))}
                    </div>

                    {columnDates.map((date, idx) => {
                      const dayOfWeek = date.getDay()
                      const isToday = dayOfWeek === todayDay
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "relative border-r last:border-r-0",
                            isToday && "bg-primary/[0.015]"
                          )}
                        >
                          {HOURS.map((hour) => (
                            <div
                              key={hour}
                              className={cn(
                                "h-[72px] border-b relative group",
                                hour % 2 === 0 ? "border-border" : "border-border/20",
                                isToday && "border-primary/5"
                              )}
                            >
                              {!entriesByDay[dayOfWeek]?.some((e) => {
                                const h = parseInt(e.startTime)
                                return h === hour
                              }) && <EmptySlot hour={hour} dayOfWeek={dayOfWeek} />}
                            </div>
                          ))}

                          {entriesByDay[dayOfWeek]?.map((entry) => {
                            const top = getTimeToY(entry.startTime)
                            const duration = getDurationMinutes(entry.startTime, entry.endTime)
                            const height = Math.max((duration / 60) * HOUR_HEIGHT - 4, 24)
                            const isCompact = height < 80
                            const isOngoing = entry.id === ongoingEntry?.id

                            return (
                              <div
                                key={entry.id}
                                className="absolute left-0.5 right-0.5 z-[5]"
                                style={{ top: `${top}px`, height: `${height}px` }}
                              >
                                <SmartLectureCard
                                  entry={entry}
                                  compact={isCompact}
                                  isOngoing={isOngoing}
                                  onClick={() => handleCardClick(entry)}
                                />
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}

                    {isTodayVisible && nowTop > 0 && nowTop < HOURS.length * HOUR_HEIGHT && (
                      <div
                        className="absolute left-[56px] right-0 z-30 pointer-events-none"
                        style={{ top: `${nowTop}px` }}
                      >
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
                          <div className="flex-1 h-px bg-red-500/70" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="p-4">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border bg-card shadow-sm"
              >
                <div className="p-3 border-b bg-muted/20">
                  <h3 className="text-sm font-semibold">
                    {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </h3>
                </div>
                <div className="divide-y">
                  {HOURS.map((hour) => {
                    const entries = entriesByDay[todayDay]?.filter((e) => {
                      const h = parseInt(e.startTime)
                      return h === hour
                    }) || []
                    return (
                      <div key={hour} className="flex min-h-[60px]">
                        <div className="w-16 shrink-0 flex items-start justify-end pr-3 pt-2 border-r bg-muted/[0.02]">
                          <span className="text-[10px] font-medium text-muted-foreground/60 tabular-nums">
                            {hour > 12 ? hour - 12 : hour}{hour >= 12 ? "p" : "a"}
                          </span>
                        </div>
                        <div className="flex-1 p-1 space-y-1">
                          {entries.length > 0 ? entries.map((entry) => (
                            <SmartLectureCard
                              key={entry.id}
                              entry={entry}
                              onClick={() => handleCardClick(entry)}
                              isOngoing={entry.id === ongoingEntry?.id}
                            />
                          )) : (
                            <div className="h-full flex items-center justify-center py-3">
                              <EmptySlot hour={hour} dayOfWeek={todayDay} />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      <LectureWorkspace
        entry={workspaceEntry}
        open={workspaceEntry !== null}
        onClose={() => setWorkspaceEntry(null)}
      />

      <AddLectureDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editEntry={editingEntry}
        onClose={() => { setDialogOpen(false); setEditingEntry(null) }}
      />
    </div>
  )
}
