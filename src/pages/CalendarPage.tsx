import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useStore } from "../stores/appStore"
import { PageContainer } from "../components/layout/PageContainer"
import MonthView from "../components/calendar/MonthView"
import WeekView from "../components/calendar/WeekView"
import DayView from "../components/calendar/DayView"
import CalendarHeader from "../components/calendar/CalendarHeader"
import { EventDetail } from "../components/calendar/EventDetail"
import LectureWorkspace from "../components/timetable/LectureWorkspace"
import type { Timetable } from "../types"

function getDateOfWeekDay(weekStart: Date, targetDayOfWeek: number): string {
  const d = new Date(weekStart)
  const currentDay = d.getDay()
  const diff = targetDayOfWeek - currentDay
  d.setDate(d.getDate() + diff)
  return d.toISOString().split("T")[0]
}

function getWeekStart(date: Date, weekStartsOn: number) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day - weekStartsOn + 7) % 7
  d.setDate(d.getDate() - diff)
  return d
}


export function CalendarPage() {
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [eventDetailOpen, setEventDetailOpen] = useState(false)
  const [workspaceEntry, setWorkspaceEntry] = useState<Timetable | null>(null)

  const { timetable, settings } = useStore()
  const weekStartsOn = settings.calendar.weekStartsOn

  const lectureEntryMap = useMemo(() => {
    const map = new Map<string, Timetable>()
    timetable.forEach((t) => map.set(t.id, t))
    return map
  }, [timetable])

  const navigate = (direction: "prev" | "next" | "today") => {
    const d = new Date(currentDate)
    if (direction === "today") {
      setCurrentDate(new Date())
      return
    }
    const dir = direction === "next" ? 1 : -1
    if (view === "month") d.setMonth(d.getMonth() + dir)
    else if (view === "week") d.setDate(d.getDate() + 7 * dir)
    else d.setDate(d.getDate() + dir)
    setCurrentDate(d)
  }

  const handleEventClick = (event: any) => {
    if (event.type === "lecture" || event.typeLabel === "lecture") {
      const entry = lectureEntryMap.get(event.id)
      if (entry) {
        setWorkspaceEntry(entry)
        return
      }
    }
    setSelectedEvent(event)
    setEventDetailOpen(true)
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setCurrentDate(date)
    setView("day")
  }

  const monthEvents = timetable.map((t) => {
    const weekS = getWeekStart(new Date(), weekStartsOn)
    const dateStr = getDateOfWeekDay(weekS, t.dayOfWeek)
    return {
      id: t.id,
      title: t.subjectName,
      date: dateStr,
      startTime: t.startTime,
      endTime: t.endTime,
      color: t.color,
      type: "lecture" as const,
      subjectName: t.subjectName,
      room: t.room,
      typeLabel: t.type,
    }
  })

  return (
    <PageContainer title="Calendar" description="Manage your academic schedule">
      <CalendarHeader
        currentDate={currentDate}
        onPrev={() => navigate("prev")}
        onNext={() => navigate("next")}
        onToday={() => navigate("today")}
        view={view}
        onViewChange={setView}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={view + currentDate.toISOString().slice(0, 7)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {view === "month" && (
            <MonthView
              currentDate={currentDate}
              weekStartsOn={weekStartsOn}
              events={monthEvents}
              selectedDate={selectedDate}
              onSelectDate={handleDayClick}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              weekStartsOn={weekStartsOn}
              timetable={timetable}
              onEventClick={handleEventClick}
              selectedDate={selectedDate}
              onSelectDate={handleDayClick}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              timetable={timetable}
              onEventClick={handleEventClick}
            />
          )}
        </motion.div>
      </AnimatePresence>
      <EventDetail
        event={selectedEvent}
        open={eventDetailOpen}
        onOpenChange={setEventDetailOpen}
      />
      <LectureWorkspace
        entry={workspaceEntry}
        open={workspaceEntry !== null}
        onClose={() => setWorkspaceEntry(null)}
      />
    </PageContainer>
  )
}
