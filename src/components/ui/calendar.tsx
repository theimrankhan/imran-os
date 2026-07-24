import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"
import { buttonVariants } from "./button"

export type CalendarProps = {
  mode?: "single" | "range" | "multiple"
  selected?: Date | Date[] | { from: Date; to: Date } | undefined
  onSelect?: (date: Date | undefined) => void
  className?: string
  initialFocus?: boolean
  disabled?: boolean
}

function getMonthDays(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const weeks: (number | null)[][] = []
  let week: (number | null)[] = []

  for (let i = 0; i < firstDay; i++) {
    week.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null)
    }
    weeks.push(week)
  }

  return weeks
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

const Calendar: React.FC<CalendarProps> = ({ className, selected, onSelect, disabled }) => {
  const today = new Date()
  const [viewMonth, setViewMonth] = React.useState(today.getMonth())
  const [viewYear, setViewYear] = React.useState(today.getFullYear())

  const weeks = getMonthDays(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const handleDayClick = (day: number | null) => {
    if (day === null || disabled) return
    const date = new Date(viewYear, viewMonth, day)
    onSelect?.(date)
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    if (selected instanceof Date) {
      return isSameDay(selected, new Date(viewYear, viewMonth, day))
    }
    return false
  }

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-medium">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
        {DAY_NAMES.map((name) => (
          <div key={name} className="h-8 flex items-center justify-center font-medium">
            {name}
          </div>
        ))}
      </div>
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-1">
          {week.map((day, dayIndex) => {
            if (day === null) {
              return <div key={`empty-${dayIndex}`} className="h-8" />
            }
            const date = new Date(viewYear, viewMonth, day)
            const selected = isSelected(day)
            const today = isToday(date)

            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDayClick(day)}
                disabled={disabled}
                className={cn(
                  "h-8 w-full rounded-lg text-sm font-normal ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  !selected && "hover:bg-secondary hover:text-secondary-foreground",
                  today && !selected && "border border-primary/50",
                  disabled && "opacity-50 cursor-not-allowed",
                  "aria-selected:opacity-100"
                )}
                aria-selected={selected}
              >
                {day}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }