import { useMemo } from "react"
import { cn } from "../../lib/utils"

interface DayViewProps {
  currentDate: Date
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
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7)
const HOUR_HEIGHT = 72

function getMinutesFromMidnight(time: string) {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export default function DayView({ currentDate, timetable, onEventClick }: DayViewProps) {
  const dayOfWeek = currentDate.getDay()

  const dayEvents = useMemo(
    () =>
      timetable
        .filter((e) => e.dayOfWeek === dayOfWeek)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [timetable, dayOfWeek]
  )

  const today = new Date()
  const nowMinutes = today.getHours() * 60 + today.getMinutes()
  const currentTimeTop = ((nowMinutes - 7 * 60) / 60) * HOUR_HEIGHT

  const isToday =
    currentDate.getFullYear() === today.getFullYear() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getDate() === today.getDate()

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="p-4 border-b border-border/50">
        <h3 className="text-base font-semibold text-foreground">
          {currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
        </p>
      </div>

      <div className="relative">
        {HOURS.map((hour) => {
          const cellStart = hour * 60
          const cellEnd = cellStart + 60

          const slotEvents = dayEvents.filter((e) => {
            const startMin = getMinutesFromMidnight(e.startTime)
            const endMin = getMinutesFromMidnight(e.endTime)
            return startMin < cellEnd && endMin > cellStart
          })

          return (
            <div
              key={hour}
              className="relative flex border-b border-border/20 last:border-b-0"
              style={{ minHeight: HOUR_HEIGHT }}
            >
              <div className="w-16 shrink-0 flex items-start justify-end pr-3 pt-1 border-r border-border/20">
                <span className="text-[11px] font-medium text-muted-foreground/60">
                  {hour === 0
                    ? "12 AM"
                    : hour < 12
                      ? `${hour} AM`
                      : hour === 12
                        ? "12 PM"
                        : `${hour - 12} PM`}
                </span>
              </div>

              <div className="flex-1 relative min-h-[72px] p-1">
                {slotEvents.map((ev) => {
                  const startMin = getMinutesFromMidnight(ev.startTime)
                  const endMin = getMinutesFromMidnight(ev.endTime)
                  const top = ((startMin - hour * 60) / 60) * HOUR_HEIGHT
                  const height = ((endMin - startMin) / 60) * HOUR_HEIGHT

                  return (
                    <button
                      key={ev.id}
                      onClick={() => onEventClick(ev)}
                      className="absolute left-1 right-1 rounded-lg p-3 overflow-hidden text-left transition-all hover:scale-[1.01] hover:shadow-md z-20"
                      style={{
                        top,
                        height: Math.max(height - 2, 28),
                        backgroundColor: `${ev.color}15`,
                        borderLeft: `4px solid ${ev.color}`,
                      }}
                    >
                      <span className="text-sm font-semibold text-foreground block">
                        {ev.subjectName}
                      </span>
                      <span className="text-xs text-muted-foreground block mt-0.5">
                        {ev.startTime} - {ev.endTime}
                      </span>
                      {ev.room && (
                        <span className="text-xs text-muted-foreground/70 block mt-0.5">
                          {ev.room}
                        </span>
                      )}
                      {ev.type && (
                        <span
                          className={cn(
                            "inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide",
                            ev.type === "lab"
                              ? "bg-accent/10 text-accent"
                              : ev.type === "tutorial"
                                ? "bg-warning/10 text-warning"
                                : "bg-primary/10 text-primary"
                          )}
                        >
                          {ev.type}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {isToday && currentTimeTop > 0 && currentTimeTop < HOURS.length * HOUR_HEIGHT && (
          <div
            className="absolute left-0 right-0 z-30 pointer-events-none"
            style={{ top: currentTimeTop }}
          >
            <div className="flex items-center ml-16">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive shadow-sm" />
              <div className="flex-1 h-0.5 bg-destructive/60" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}