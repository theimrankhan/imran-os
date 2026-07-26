import { useMemo } from "react"
import { cn } from "../../lib/utils"

interface WeekViewProps {
  currentDate: Date
  weekStartsOn: number
  timetable: {
    dayOfWeek: number
    startTime: string
    endTime: string
    subjectName: string
    color: string
    room?: string
    type: string
    id: string
  }[]
  onEventClick: (event: any) => void
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
}

const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getWeekDays(date: Date, weekStartsOn: 0 | 1) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day - weekStartsOn + 7) % 7
  d.setDate(d.getDate() - diff)

  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8)
const HOUR_HEIGHT = 64

function getMinutesFromMidnight(time: string) {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export default function WeekView({
  currentDate,
  weekStartsOn,
  timetable,
  onEventClick,
  selectedDate,
  onSelectDate,
}: WeekViewProps) {
  const days = useMemo(() => getWeekDays(currentDate, weekStartsOn), [currentDate, weekStartsOn])

  const today = new Date()

  const nowMinutes = today.getHours() * 60 + today.getMinutes()
  const currentTimeTop = ((nowMinutes - 8 * 60) / 60) * HOUR_HEIGHT

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="grid grid-cols-[60px_repeat(7,1fr)]">
        <div className="sticky top-0 z-10 bg-card border-b border-border/50" />

        {days.map((day, i) => {
          const isToday =
            day.getFullYear() === today.getFullYear() &&
            day.getMonth() === today.getMonth() &&
            day.getDate() === today.getDate()
          const isSelected = selectedDate
            ? day.getFullYear() === selectedDate.getFullYear() &&
              day.getMonth() === selectedDate.getMonth() &&
              day.getDate() === selectedDate.getDate()
            : false

          const dayName = dayHeaders[(day.getDay() - weekStartsOn + 7) % 7]

          return (
            <button
              key={i}
              onClick={() => onSelectDate(day)}
              className={cn(
                "sticky top-0 z-10 flex flex-col items-center py-2 border-b border-border/50 bg-card transition-colors",
                isSelected && "bg-primary/5",
                !isSelected && "hover:bg-muted/30"
              )}
            >
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {dayName}
              </span>
              <span
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold mt-0.5",
                  isToday && "bg-primary text-primary-foreground shadow-sm",
                  !isToday && "text-foreground"
                )}
              >
                {day.getDate()}
              </span>
            </button>
          )
        })}

        {HOURS.map((hour) => (
          <div
            key={hour}
            className="col-span-8 grid grid-cols-subgrid"
            style={{ height: HOUR_HEIGHT }}
          >
            <div className="relative border-b border-border/20">
              <span className="absolute -top-2.5 right-2 text-[10px] font-medium text-muted-foreground/60">
                {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
              </span>
            </div>
            {days.map((_, di) => {
              const dayOfWeek = days[di].getDay()
              const cellEvents = timetable.filter((e) => {
                const startMin = getMinutesFromMidnight(e.startTime)
                const endMin = getMinutesFromMidnight(e.endTime)
                const cellStart = hour * 60
                const cellEnd = cellStart + 60
                return e.dayOfWeek === dayOfWeek && startMin < cellEnd && endMin > cellStart
              })

              return (
                <div key={di} className="relative border-b border-r border-border/20 last:border-r-0 min-h-[64px]">
                  {cellEvents.map((ev) => {
                    const startMin = getMinutesFromMidnight(ev.startTime)
                    const endMin = getMinutesFromMidnight(ev.endTime)
                    const top = ((startMin - hour * 60) / 60) * HOUR_HEIGHT
                    const height = ((endMin - startMin) / 60) * HOUR_HEIGHT

                    return (
                      <button
                        key={ev.id}
                        onClick={() => onEventClick(ev)}
                        className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-1 overflow-hidden text-left transition-opacity hover:opacity-80 z-20"
                        style={{
                          top,
                          height: Math.max(height - 1, 20),
                          backgroundColor: `${ev.color}20`,
                          borderLeft: `3px solid ${ev.color}`,
                        }}
                      >
                        <span className="text-[10px] font-semibold leading-tight block truncate text-foreground">
                          {ev.subjectName}
                        </span>
                        <span className="text-[9px] text-muted-foreground leading-tight block">
                          {ev.startTime} - {ev.endTime}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}

        {currentTimeTop > 0 && currentTimeTop < HOURS.length * HOUR_HEIGHT && (
          <div
            className="absolute left-0 right-0 z-30 pointer-events-none"
            style={{ top: `calc(60px + ${currentTimeTop}px)` }}
          >
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-destructive ml-1" />
              <div className="flex-1 h-px bg-destructive/70" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}