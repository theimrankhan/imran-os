import { useMemo } from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"

interface MonthViewProps {
  currentDate: Date
  weekStartsOn: 0 | 1
  events: { date: string; color: string; title: string; id: string }[]
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
}

const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getMonthGrid(year: number, month: number, weekStartsOn: 0 | 1) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = getDaysInMonth(year, month)
  const daysInPrevMonth = getDaysInMonth(year, month - 1)

  const offset = (firstDay - weekStartsOn + 7) % 7
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7

  const grid: { day: number; month: number; year: number; current: boolean }[] = []

  for (let i = 0; i < totalCells; i++) {
    if (i < offset) {
      const day = daysInPrevMonth - offset + i + 1
      const prevMonth = month - 1
      const prevYear = prevMonth < 0 ? year - 1 : year
      grid.push({ day, month: (prevMonth + 12) % 12, year: prevYear, current: false })
    } else if (i >= offset + daysInMonth) {
      const day = i - offset - daysInMonth + 1
      const nextMonth = month + 1
      const nextYear = nextMonth > 11 ? year + 1 : year
      grid.push({ day, month: nextMonth % 12, year: nextYear, current: false })
    } else {
      grid.push({ day: i - offset + 1, month, year, current: true })
    }
  }

  return grid
}

function getEventsForDay(events: MonthViewProps["events"], year: number, month: number, day: number) {
  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  return events.filter((e) => e.date.startsWith(dateStr)).slice(0, 3)
}

export default function MonthView({
  currentDate,
  weekStartsOn,
  events,
  selectedDate,
  onSelectDate,
}: MonthViewProps) {
  const grid = useMemo(
    () => getMonthGrid(currentDate.getFullYear(), currentDate.getMonth(), weekStartsOn),
    [currentDate, weekStartsOn]
  )

  const today = new Date()

  const rows = []
  for (let i = 0; i < grid.length; i += 7) {
    rows.push(grid.slice(i, i + 7))
  }

  return (
    <div className="select-none">
      <div className="grid grid-cols-7 mb-2">
        {(weekStartsOn === 1
          ? [...dayHeaders.slice(1), dayHeaders[0]]
          : dayHeaders
        ).map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-muted-foreground/70 py-2 tracking-wider uppercase"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {rows.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((cell, ci) => {
              const cellDate = new Date(cell.year, cell.month, cell.day)
              const isToday = isSameDay(cellDate, today)
              const isSelected = selectedDate ? isSameDay(cellDate, selectedDate) : false
              const dayEvents = getEventsForDay(events, cell.year, cell.month, cell.day)

              return (
                <motion.button
                  key={`${wi}-${ci}`}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectDate(cellDate)}
                  className={cn(
                    "relative flex flex-col items-start justify-start p-2 min-h-[90px] border-r border-b border-border/50 last:border-r-0 transition-colors duration-150",
                    !cell.current && "bg-muted/20",
                    isSelected && "bg-primary/5",
                    isToday && !isSelected && "ring-2 ring-primary/40 ring-inset",
                    cell.current && !isSelected && "hover:bg-muted/40"
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium",
                      isToday && "bg-primary text-primary-foreground shadow-sm",
                      isSelected && !isToday && "bg-primary/20 text-primary",
                      !cell.current && "text-muted-foreground/40",
                      cell.current && !isToday && !isSelected && "text-foreground"
                    )}
                  >
                    {cell.day}
                  </span>

                  <div className="flex flex-col gap-0.5 mt-1 w-full">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center gap-1 px-1 py-0.5 rounded"
                        style={{ backgroundColor: `${ev.color}18` }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: ev.color }}
                        />
                        <span className="text-[10px] font-medium truncate text-foreground/80">
                          {ev.title}
                        </span>
                      </div>
                    ))}
                    {dayEvents.length >= 3 && (
                      <span className="text-[10px] text-muted-foreground px-1">
                        +{getEventsForDay(events, cell.year, cell.month, cell.day).length - 3} more
                      </span>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}